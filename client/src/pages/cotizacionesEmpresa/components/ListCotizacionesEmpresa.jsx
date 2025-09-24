import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Shadcn UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { TrendingUp, ArrowRightLeft } from "lucide-react";
import { getCotizacionesEmpresa } from '@/apis/cotizacion-empresa.api';
import { EVENTS, on } from '@/utils/events';


export default function ListCotizacionesEmpresa({ className = "" }) {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const loadCotizaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCotizacionesEmpresa();
      console.log("general response:", response.data);
      setCotizaciones(response.data || []);
    } catch (err) {
      setError('Error al cargar las cotizaciones');
      console.error('Error al cargar cotizaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCotizaciones();
    const unsubscribe = on(EVENTS.COTIZACIONES_EMPRESA_ACTUALIZADA, () => {
        console.log("recargar cotizaciones");
        loadCotizaciones();

    });
    return () => unsubscribe();
  }, []);

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-PY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    try {
      return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cotizaciones Empresariales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TrendingUp className="h-5 w-5" />
            Error al cargar cotizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Cotizaciones Empresariales Activas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimas cotizaciones por par de monedas
        </p>
      </CardHeader>
      <CardContent>
        {cotizaciones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay cotizaciones disponibles</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Par de Monedas</TableHead>
                  <TableHead className="text-right">Compra</TableHead>
                  <TableHead className="text-right">Venta</TableHead>
                  <TableHead className="text-center">Última Actualización</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizaciones.map((cotizacion) => (
                  <TableRow key={cotizacion.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {cotizacion.moneda_origen_iso}
                        </Badge>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="secondary" className="font-mono">
                          {cotizacion.moneda_destino_iso}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {cotizacion.moneda_origen_nombre} → {cotizacion.moneda_destino_nombre}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono font-medium">
                        {formatearMonto(cotizacion.monto_compra)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cotizacion.moneda_destino_iso}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="font-mono font-medium">
                        {formatearMonto(cotizacion.monto_venta)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cotizacion.moneda_destino_iso}
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">
                        {formatearFecha(cotizacion.fecha)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Activo
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
