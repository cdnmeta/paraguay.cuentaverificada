import React, { useEffect, useState } from 'react'
import { getMisFavoritos, eliminarComercioFavoritos } from '@/apis/usuarios.api'
import { getMensajeDelDia } from '@/apis/estados-animos.api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Heart, 
  Store, 
  Package, 
  Trash2, 
  Calendar,
  AlertCircle,
  Loader2,
  StarIcon,
  Search,
  RefreshCw,
  Filter,
  Smile,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mapeo de tipos de favoritos con sus iconos y colores
const TIPOS_FAVORITOS = {
  comercio: {
    label: 'Comercios',
    icon: Store,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  producto: {
    label: 'Productos',
    icon: Package,
    color: 'bg-green-50 border-green-200 text-green-700',
    badgeColor: 'bg-green-100 text-green-800'
  },
  servicio: {
    label: 'Servicios',
    icon: StarIcon,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-800'
  }
}

export default function MisFavoritosPage() {
  const [favoritos, setFavoritos] = useState([])
  const [loading, setLoading] = useState(true)
  const [eliminandoId, setEliminandoId] = useState(null)
  const [favoritoEliminar, setFavoritoEliminar] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('todos')

  // Cargar favoritos
  const fetchFavoritos = async () => {
    try {
      setLoading(true)
      const response = await getMisFavoritos()
      setFavoritos(response.data || [])
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
      toast.error('Error al cargar los favoritos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavoritos()
  }, [])

  // Filtrar favoritos por búsqueda y tipo
  const favoritosFiltrados = favoritos.filter(favorito => {
    const cumpleBusqueda = busqueda === '' || 
      favorito.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    
    const cumpleTipo = tipoFiltro === 'todos' || 
      favorito.tipo_descripcion === tipoFiltro

    return cumpleBusqueda && cumpleTipo
  })

  // Agrupar favoritos filtrados por tipo
  const favoritosAgrupados = favoritosFiltrados.reduce((grupos, favorito) => {
    const tipo = favorito.tipo_descripcion || 'otros'
    if (!grupos[tipo]) {
      grupos[tipo] = []
    }
    grupos[tipo].push(favorito)
    return grupos
  }, {})

  // Obtener tipos únicos para el filtro
  const tiposDisponibles = [...new Set(favoritos.map(f => f.tipo_descripcion))].filter(Boolean)

  // Eliminar favorito
  const handleEliminarFavorito = async (favorito) => {
    setFavoritoEliminar(favorito)
  }

  const confirmarEliminarFavorito = async () => {
    if (!favoritoEliminar) return

    try {
      setEliminandoId(favoritoEliminar.id)
      
      if(favoritoEliminar.tipo == 1){
        await eliminarComercioFavoritos(favoritoEliminar.id)
      }
      
      // Actualizar la lista local
      setFavoritos(prev => prev.filter(fav => fav.id !== favoritoEliminar.id))
      
      toast.success('Favorito eliminado correctamente')
      setFavoritoEliminar(null)
    } catch (error) {
      console.error('Error al eliminar favorito:', error)
      toast.error('Error al eliminar el favorito')
    } finally {
      setEliminandoId(null)
    }
  }

  // Formatear fecha
  const formatearFecha = (fecha) => {
    try {
      return format(parseISO(fecha), 'dd MMM yyyy', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Favoritos</h1>
              {favoritos.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {favoritosFiltrados.length} de {favoritos.length} favoritos
                  {busqueda || tipoFiltro !== 'todos' ? ' (filtrados)' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">
          Gestiona todos tus comercios, productos y servicios favoritos en un solo lugar.
        </p>

        {/* Barra de búsqueda y filtros */}
        {favoritos.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en favoritos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro por tipo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {tipoFiltro === 'todos' ? 'Todos los tipos' : 
                    TIPOS_FAVORITOS[tipoFiltro]?.label || tipoFiltro}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTipoFiltro('todos')}
                  className={tipoFiltro === 'todos' ? 'bg-accent' : ''}
                >
                  Todos los tipos ({favoritos.length})
                </DropdownMenuItem>
                {tiposDisponibles.map(tipo => {
                  const tipoConfig = TIPOS_FAVORITOS[tipo]
                  const count = favoritos.filter(f => f.tipo_descripcion === tipo).length
                  const IconoTipo = tipoConfig?.icon || AlertCircle

                  return (
                    <DropdownMenuItem
                      key={tipo}
                      onClick={() => setTipoFiltro(tipo)}
                      className={tipoFiltro === tipo ? 'bg-accent' : ''}
                    >
                      <IconoTipo className="h-4 w-4 mr-2" />
                      {tipoConfig?.label || tipo} ({count})
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón de recargar */}
            <Button 
              variant="outline" 
              onClick={fetchFavoritos}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        )}
      </div>

      {/* Contenido */}
      {favoritos.length === 0 ? (
        // Estado vacío
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tienes favoritos aún</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Comienza a agregar comercios, productos y servicios a tus favoritos para verlos aquí.
            </p>
          </CardContent>
        </Card>
      ) : Object.keys(favoritosAgrupados).length === 0 ? (
        // Estado sin resultados de búsqueda/filtro
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron favoritos</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              {busqueda || tipoFiltro !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda para ver más resultados.'
                : 'No tienes favoritos que coincidan con los filtros aplicados.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBusqueda('')
                  setTipoFiltro('todos')
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Lista de favoritos agrupados
        <div className="space-y-8">
          {Object.entries(favoritosAgrupados).map(([tipo, items]) => {
            const tipoConfig = TIPOS_FAVORITOS[tipo] || {
              label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
              icon: AlertCircle,
              color: 'bg-gray-50 border-gray-200 text-gray-700',
              badgeColor: 'bg-gray-100 text-gray-800'
            }

            const IconoTipo = tipoConfig.icon

            return (
              <div key={tipo} className="space-y-4">
                {/* Header del grupo */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tipoConfig.color}`}>
                    <IconoTipo className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {tipoConfig.label}
                  </h2>
                  <Badge variant="secondary" className={tipoConfig.badgeColor}>
                    {items.length} {items.length === 1 ? 'elemento' : 'elementos'}
                  </Badge>
                </div>

                {/* Grid de favoritos */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((favorito) => (
                    <Card 
                      key={favorito.id} 
                      className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary hover:scale-[1.02] animate-in fade-in-50 slide-in-from-bottom-2"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {favorito.descripcion}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${tipoConfig.badgeColor}`}
                              >
                                <IconoTipo className="h-3 w-3 mr-1" />
                                {tipoConfig.label.slice(0, -1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Fecha de agregado */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Agregado: {formatearFecha(favorito.fecha_creacion)}</span>
                          </div>

                          <Separator />

                          {/* Acciones */}
                          <div className="flex items-center justify-end pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarFavorito(favorito)}
                              disabled={eliminandoId === favorito.id}
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              {eliminandoId === favorito.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog 
        open={!!favoritoEliminar} 
        onOpenChange={(open) => !open && setFavoritoEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar de favoritos?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{favoritoEliminar?.descripcion}" de tus favoritos? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminarFavorito}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
