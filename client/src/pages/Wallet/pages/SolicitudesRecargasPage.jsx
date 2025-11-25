import React, { useEffect, useState, useCallback } from 'react';
import { obtenerListadoSolicitudesRecargas } from '@/apis/wallets.api';
import ListadoSolicitudesRecargas from '../components/ListadoSolicitudesRecargas';
import LoadingSpinner from '@/components/customs/loaders/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function SolicitudesRecargasPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await obtenerListadoSolicitudesRecargas();
      setSolicitudes(response.data || []);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      toast.error('Error al cargar las solicitudes de recarga');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  const handleRecargarDatos = () => {
    cargarSolicitudes();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Solicitudes de Recarga
                  </CardTitle>
                  <p className="text-sm text-foreground mt-1">
                    Revisa y procesa las solicitudes de recarga pendientes
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleRecargarDatos}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Contenido principal */}
        <Card>
          <CardContent className="p-6">
            <ListadoSolicitudesRecargas 
              solicitudes={solicitudes} 
              onRecargarDatos={handleRecargarDatos}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
