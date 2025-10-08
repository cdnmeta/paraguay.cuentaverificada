import { create } from 'zustand';
import { getComercioInfoBySlug } from '@/apis/comercios.api';

const useComercioStore = create((set, get) => ({
    comercioActual: null,
    loading: false,
    error: null,
    
    setComercioActual: (comercio) => set({ comercioActual: comercio }),
    limpiarComercioActual: () => set({ comercioActual: null, error: null }),
    
    // Función para cargar comercio por slug
    cargarComercio: async (slug, navigate = null) => {
        try {
            set({ loading: true, error: null });
            
            const response = await getComercioInfoBySlug(slug);
            const comercioData = response.data;
            
            set({ 
                comercioActual: comercioData, 
                loading: false 
            });
            
            return comercioData;
        } catch (err) {
            console.error('Error al cargar comercio:', err);
            
            const errorMessage = 'Error al cargar la información del comercio';
            set({ 
                error: errorMessage, 
                loading: false, 
                comercioActual: null 
            });
            
            // Si es error 404 y se proporciona navigate, redirigir
            if (err.response?.status === 404 && navigate) {
                navigate('*'); // Redirige a la página 404
            }
            
            throw err; // Re-lanzar el error para que el componente pueda manejarlo si es necesario
        }
    },
    
    // Función para reintentar la carga
    reintentarCarga: (slug, navigate = null) => {
        const { cargarComercio } = get();
        return cargarComercio(slug, navigate);
    }
}));

export default useComercioStore;