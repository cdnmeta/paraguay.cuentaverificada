import { getNotificacionesUsuario } from '@/apis/notificaciones.api';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { notificacionesEjemplo } from '../utils/datosEjemplo';

export default function MisNotificacionesPage() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotificaciones = async () => {
            try {
                setLoading(true);
                const response = await getNotificacionesUsuario();
                console.log('Notificaciones:', response);
                setNotificaciones(notificacionesEjemplo || []);
            } catch (error) {
                console.error('Error al cargar notificaciones:', error);
                // En caso de error, usar datos de ejemplo para mostrar el diseño
                setNotificaciones(notificacionesEjemplo);
                toast.error('Error al cargar las notificaciones - Mostrando datos de ejemplo');
            } finally {
                setLoading(false);
            }
        };
        loadNotificaciones();
    }, []);

    const formatFecha = (fechaString) => {
        try {
            return format(new Date(fechaString), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch {
            return 'Fecha inválida';
        }
    };

    const getEstadoBadge = (estado, descripcion_estado) => {
        switch (estado) {
            case 1: // Pendiente
                return {
                    variant: "secondary",
                    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    text: descripcion_estado || "Pendiente"
                };
            case 2: // Leído
                return {
                    variant: "secondary", 
                    className: "bg-green-100 text-green-800 border-green-200",
                    text: descripcion_estado || "Leído"
                };
            default:
                return {
                    variant: "secondary",
                    className: "bg-gray-100 text-gray-800 border-gray-200", 
                    text: descripcion_estado || "Desconocido"
                };
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold text-foreground">Centro de Mensajes</h1>
                    </div>
                    
                    {/* Loading spinner */}
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Cargando notificaciones...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">Centro de Mensajes</h1>
                    {notificaciones.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                            {notificaciones.length}
                        </Badge>
                    )}
                </div>

                {/* Lista de notificaciones */}
                {notificaciones.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                No tienes notificaciones
                            </h3>
                            <p className="text-gray-500">
                                Cuando recibas notificaciones, aparecerán aquí.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notificaciones.map((notificacion) => {
                            const estadoBadge = getEstadoBadge(notificacion.id_estado_notificacion, notificacion.descripcion_estado);
                            
                            return (
                                <Card 
                                    key={notificacion.id} 
                                >
                                    <CardContent>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Icono */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Bell className="h-6 w-6 text-primary" />
                                                </div>
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header con título y estado */}
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                                    <h3 
                                                        className="text-lg font-semibold text-foreground line-clamp-1"
                                                        title={notificacion.titulo}
                                                    >
                                                        {notificacion.titulo}
                                                    </h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <Badge className={estadoBadge.className}>
                                                            {estadoBadge.text}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Cuerpo del mensaje */}
                                                <div className="mb-3">
                                                    <p 
                                                        className="text-foreground text-sm leading-relaxed line-clamp-3"
                                                        title={notificacion.cuerpo}
                                                    >
                                                        {notificacion.cuerpo}
                                                    </p>
                                                </div>

                                                {/* Fecha */}
                                                <div className="flex items-center gap-1 text-xs text-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatFecha(notificacion.fecha_creacion)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
