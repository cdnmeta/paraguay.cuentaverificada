-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."comercio" (
    "id" SERIAL NOT NULL,
    "ruc" TEXT,
    "razon_social" TEXT,
    "slug" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "urlmaps" TEXT,
    "url_logo_firebase" TEXT,
    "url_comprobante_pago" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "dial_code" TEXT,
    "codigo_pais" TEXT,
    "fecha_eliminacion" TIMESTAMPTZ(6),
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "id_usuario" INTEGER NOT NULL,
    "id_usuario_creacion" INTEGER,
    "id_usuario_actualizacion" INTEGER,
    "id_usuario_eliminacion" INTEGER,
    "estado" INTEGER,
    "activo" BOOLEAN DEFAULT true,
    "eslogan" TEXT,
    "observacion" TEXT,
    "verificado" BOOLEAN DEFAULT false,
    "fecha_actualizacion_estado" TIMESTAMPTZ(6),
    "fecha_verificacion" TIMESTAMPTZ(6),
    "motivo_rechazo" TEXT,

    CONSTRAINT "comercio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cotizacion_empresa" (
    "id" SERIAL NOT NULL,
    "id_moneda_origen" INTEGER NOT NULL,
    "id_moneda_destino" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "id_usuario_creacion" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cotizacion_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."empresa_config" (
    "id" SERIAL NOT NULL,
    "razon_social" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "email" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN DEFAULT true,
    "id_moneda_base" INTEGER NOT NULL,
    "id_plan_verificacion" INTEGER NOT NULL,

    CONSTRAINT "empresa_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estados_comercios" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "estados_comercios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."factura_suscripciones" (
    "id" SERIAL NOT NULL,
    "id_suscripcion" INTEGER NOT NULL,
    "nro_factura" TEXT,
    "condicion" INTEGER,
    "fecha_emision" DATE,
    "fecha_vencimiento" DATE,
    "monto" DOUBLE PRECISION,
    "id_moneda" INTEGER,
    "estado" INTEGER DEFAULT 1,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_anulacion" TIMESTAMPTZ(6),
    "id_usuario_anulacion" INTEGER,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "motivo_anulacion" TEXT,
    "total_factura" DOUBLE PRECISION,
    "total_grav_10" DOUBLE PRECISION,
    "total_grav_5" DOUBLE PRECISION,
    "total_iva_10" DOUBLE PRECISION,
    "total_iva_5" DOUBLE PRECISION,

    CONSTRAINT "factura_suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grupos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monedas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "simbolo" TEXT,
    "sigla_iso" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "monedas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pagos_factura_suscripciones" (
    "id" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "fecha_pago" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION,
    "metodo_pago" INTEGER,
    "nro_comprobante" TEXT,
    "estado" INTEGER,
    "motivo_anulacion" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_eliminacion" TIMESTAMPTZ(6),
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "pagos_factura_suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."planes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION,
    "renovacion_plan" TEXT NOT NULL DEFAULT 'mes',
    "renovacion_valor" INTEGER NOT NULL DEFAULT 1,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_eliminacion" TIMESTAMPTZ(6),
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN DEFAULT true,
    "tipo_iva" INTEGER,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seguimiento_verificacion" (
    "id" SERIAL NOT NULL,
    "id_comercio" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "observacion" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguimiento_verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."suscripciones" (
    "id" SERIAL NOT NULL,
    "id_comercio" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMPTZ(6),
    "fecha_vencimiento" TIMESTAMPTZ(6),
    "id_plan" INTEGER NOT NULL,
    "id_vendedor" INTEGER,
    "estado" INTEGER DEFAULT 1,
    "activo" BOOLEAN DEFAULT true,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_eliminacion" TIMESTAMPTZ(6),
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "monto" DOUBLE PRECISION,

    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "uid_firebase" TEXT,
    "apellido" TEXT,
    "documento" TEXT,
    "email" TEXT,
    "password" TEXT,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN DEFAULT true,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "is_super_admin" BOOLEAN DEFAULT false,
    "cedula_frente" TEXT,
    "cedula_reverso" TEXT,
    "fecha_nacimiento" DATE,
    "metodo_registro" TEXT,
    "sexo" INTEGER,
    "pin" TEXT,
    "codigo_vendedor" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios_grupos" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,

    CONSTRAINT "usuarios_grupos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."comercio" ADD CONSTRAINT "fk_estados_comercios_id_comercios" FOREIGN KEY ("estado") REFERENCES "public"."estados_comercios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."comercio" ADD CONSTRAINT "fk_usuarios_id_comercios" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cotizacion_empresa" ADD CONSTRAINT "fk_cotizacion_empresa_moneda_destino" FOREIGN KEY ("id_moneda_destino") REFERENCES "public"."monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cotizacion_empresa" ADD CONSTRAINT "fk_cotizacion_empresa_moneda_origen" FOREIGN KEY ("id_moneda_origen") REFERENCES "public"."monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."factura_suscripciones" ADD CONSTRAINT "factura_suscripciones_id_moneda_fkey" FOREIGN KEY ("id_moneda") REFERENCES "public"."monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."factura_suscripciones" ADD CONSTRAINT "factura_suscripciones_id_usuario_anulacion_fkey" FOREIGN KEY ("id_usuario_anulacion") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."factura_suscripciones" ADD CONSTRAINT "fk_suscripcion" FOREIGN KEY ("id_suscripcion") REFERENCES "public"."suscripciones"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."pagos_factura_suscripciones" ADD CONSTRAINT "fk_factura" FOREIGN KEY ("id_factura") REFERENCES "public"."factura_suscripciones"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."seguimiento_verificacion" ADD CONSTRAINT "fk_comercio" FOREIGN KEY ("id_comercio") REFERENCES "public"."comercio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."seguimiento_verificacion" ADD CONSTRAINT "seguimiento_verificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."suscripciones" ADD CONSTRAINT "fk_comercio" FOREIGN KEY ("id_comercio") REFERENCES "public"."comercio"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."suscripciones" ADD CONSTRAINT "fk_planes" FOREIGN KEY ("id_plan") REFERENCES "public"."planes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."suscripciones" ADD CONSTRAINT "suscripciones_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios_grupos" ADD CONSTRAINT "fk_grupos_id_usuarios_grupos" FOREIGN KEY ("id_grupo") REFERENCES "public"."grupos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios_grupos" ADD CONSTRAINT "fk_usuarios_id_usuarios_grupos" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

