import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RegistrarRecargaDto, RegistrarSolicitudRecargaDto } from './dto/registrar-movimiento.dto';
import { Prisma, PrismaClient, wallet } from '@prisma/client';
import { TipoMovimientoWallet } from './types/tipo-movimeinto';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { EstadosMovimientoWallet } from './types/estados-mivimeintos-wallet';
import { RechazarMovimientoDto } from './dto/rechazar-movimiento.dto';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { WalleMovimientosByUsuarioDto } from './dto/wallet-movimientos.dto';
import { CrearWalletDto } from './dto/crear-wallet.dto';
import { run } from 'node:test';

@Injectable()
export class WalletService {
    constructor(private readonly prismaService: PrismaService,
        private readonly firebaseService: FirebaseService,
        private readonly dbPromiseService: DatabasePromiseService
    ) {}


    async getWalletsByUserId(id_usuario: number) {
        try {
            const sql = `select 
            w.id,
            w.saldo,
            w.id_moneda,
            w.id_estado,
            mo.nombre,
            mo.sigla_iso,
            count(wm.*) filter (where wm.id_estado = 1) as cantidad_mov_pend_verificacion,
            count(wm.*) filter (where wm.id_estado = 2) as cantidad_mov_verificados,
            count(wm.*) filter (where wm.id_estado = 3) as cantidad_mov_rechazados
            from wallet w
            left join wallet_movimientos wm ON wm.id_wallet = w.id and  wm.activo = true
            left join monedas mo on mo.id = w.id_moneda
            where w.id_usuario = $(id_usuario) and w.activo = true
            group by w.id, w.id_moneda, mo.nombre, mo.sigla_iso`
            const walletsByUsuario = await this.dbPromiseService.result(sql, { id_usuario: id_usuario });
            return walletsByUsuario.rows;
        } catch (error) {
            throw error;
        }
    }

    async getWalletMovimientosByUsuario( id_wallet: number,data:WalleMovimientosByUsuarioDto) {
        const sql = `
        WITH params AS (
                 SELECT
                    $(id_usuario) 	::int as p_id_usuario, -- Id del usario a consultar
                    $(id_wallet)             ::int  AS p_id_wallet,   -- ✅ ID de la wallet a consultar (requerido)
                    coalesce($(anio),EXTRACT( year from CURRENT_DATE))             ::int  AS p_anio,        -- usados solo si no das rango explícito
                    coalesce($(mes),EXTRACT( month from CURRENT_DATE))             ::int  AS p_mes,         -- usados solo si no das rango explícito
                    NULL           ::date AS p_rango_ini,   -- opcional: inicio (inclusive)
                    NULL           ::date AS p_rango_fin    -- opcional: fin (exclusivo)
                ),
                limites AS (
                SELECT
                    p.*,
                    COALESCE(p.p_rango_ini, make_date(p.p_anio, p.p_mes, 1))::date                        AS rango_ini,
                    COALESCE(p.p_rango_fin, (make_date(p.p_anio, p.p_mes, 1) + INTERVAL '1 month')::date) AS rango_fin
                FROM params p
                ),
                wallet_sel AS (
                SELECT w.*
                FROM wallet w
                JOIN params p ON p.p_id_wallet = w.id
                WHERE w.activo = TRUE and w.id_usuario = p.p_id_usuario
                ),
                moneda_sel AS (
                SELECT m.id, m.nombre AS moneda, m.sigla_iso
                FROM monedas m
                ),
                movs_base AS (
                SELECT m.*
                FROM wallet_movimientos m
                JOIN wallet_sel w ON w.id = m.id_wallet
                WHERE m.activo = TRUE
                ),
                conteos AS (
                SELECT
                    m.id_wallet,
                    COUNT(*) FILTER (WHERE m.id_estado = 1) AS cantidad_pendientes,
                    COUNT(*) FILTER (WHERE m.id_estado = 2) AS cantidad_verificado
                FROM movs_base m
                GROUP BY m.id_wallet
                ),
                movs_en_rango AS (
                SELECT
                    m.id_wallet,
                    COALESCE(
                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                        'id',                 m.id,
                        'monto',              m.monto,
                        'fecha',              m.fecha_creacion,
                        'id_estado',          m.id_estado,
                        'descripcion_estado', CASE m.id_estado
                                                WHEN 1 THEN 'Pendiente'
                                                WHEN 2 THEN 'Verificado'
                                                WHEN 3 THEN 'Rechazado'
                                                WHEN 4 THEN 'Anulado'
                                                ELSE 'Desconocido'
                                                END,
                        'observacion',        m.observacion,
                        'motivo_rechazo',     m.motivo_rechazo,
                        'fecha_verificacion', m.fecha_verificacion,
                        'fecha_rechazo',      m.fecha_rechazo,
                        'fecha_anulacion',    m.fecha_anulacion,
                        'id_tipo_movimiento', m.id_tipo_movimiento
                        )
                        ORDER BY m.fecha_creacion desc
                    ),
                    '[]'::jsonb
                    ) AS movimientos_en_rango
                FROM movs_base m
                JOIN limites l ON TRUE
                WHERE m.fecha_creacion::date >= l.rango_ini
                    AND m.fecha_creacion::date <  l.rango_fin
                GROUP BY m.id_wallet
                )
                SELECT
                w.id                                      AS id_wallet,
                w.saldo                                   AS saldo,
                w.id_moneda,
                ms.moneda,
                ms.sigla_iso,
                COALESCE(c.cantidad_pendientes, 0)        AS cantidad_pendientes,
                COALESCE(c.cantidad_verificado, 0)        AS cantidad_verificado,
                COALESCE(mr.movimientos_en_rango, '[]'::jsonb)    AS movimientos
                FROM wallet_sel w
                LEFT JOIN moneda_sel ms       ON ms.id = w.id_moneda
                LEFT JOIN conteos c           ON c.id_wallet = w.id
                LEFT JOIN movs_en_rango mr    ON mr.id_wallet = w.id
                `
            try {
                const resultado = await this.dbPromiseService.result(sql, {
                    id_usuario: data.id_usuario,
                    id_wallet: id_wallet,
                    anio: data.anio,
                    mes: data.mes,
                    rango_ini: data.rango_ini,
                    rango_fin: data.rango_fin
                });
                return resultado.rows[0];
            } catch (error) {
                throw error;
            }
    }

    async crearWalletParaUsuario(data:CrearWalletDto,tx?:Prisma.TransactionClient){ 
        try {
            // validar si ya existe una wallet para el usuario con la misma moneda
            const walletExistente = await this.prismaService.wallet.findFirst({
                where: {
                    id_usuario: data.id_usuario,
                    id_moneda: data.id_moneda,
                    activo: true,
                }   
            })
            
            if(walletExistente && walletExistente?.id_estado !== 1) throw new BadRequestException('La billetera del usuario no se encuentra habilitada');
            
            if(walletExistente)  return walletExistente;

            const walletCreada = await this.prismaService.runInTransaction(tx, async (prisma) =>{
                const nuevaWallet = await prisma.wallet.create({
                    data: {
                        id_usuario: data.id_usuario,
                        id_moneda: data.id_moneda,
                        saldo: data.monto_inicial || 0,
                        activo: true,
                        id_estado: 1, // estado habilitada
                    }
                });
                return nuevaWallet;
            });

            return walletCreada;

        } catch (error) {
            throw error;
        }
    }


    
}
