// hooks/useGruposEmpresa.js
import { useEffect } from "react";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import { getGruposByUsuario } from "@/apis/usuarios.api";

/**
 * Procesa los grupos del usuario agregando grupos especiales según permisos
 * @param {Array} grupos - Grupos base del usuario
 * @param {boolean} isSuperAdmin - Si el usuario es super admin
 * @returns {Array} Grupos procesados con grupos especiales
 */
const processUserGroups = (grupos, isSuperAdmin) => {
  const processedGroups = [...grupos];
  
  // Agregar Super Admin solo si el usuario tiene permisos
  if (isSuperAdmin) {
    processedGroups.push({ id: 'admin', descripcion: "Super Admin" });
  }
  
  // Siempre agregar Usuario Protegido como opción por defecto
  processedGroups.push({ id: 'protegido', descripcion: "Usuario Protegido" });
  
  return processedGroups;
};

export function useGruposEmpresa(userId) {
  const { setGruposEmpresa, setLoading, setError } = useGruposEmpresaStore();

  useEffect(() => {
    const loadGruposEmpresa = async () => {
      try {
        if (!userId) {
          setGruposEmpresa([]);
          return;
        }

        setLoading(true);
        setError(null);

        const responseGrupos = await getGruposByUsuario();
        const userData = responseGrupos.data;
        
        if (!userData) {
          console.warn('No se recibieron datos de grupos del usuario');
          setGruposEmpresa([]);
          return;
        }

        const gruposBase = userData.grupos || [];
        const isSuperAdmin = userData.is_super_admin === true;
        
        const gruposProcesados = processUserGroups(gruposBase, isSuperAdmin);
        setGruposEmpresa(gruposProcesados);
        
      } catch (error) {
        console.error('Error al cargar grupos del usuario:', error);
        setError(error.message || 'Error al cargar grupos');
        // En caso de error, mantener al menos el Usuario Protegido
        setGruposEmpresa([{ id: 'protegido', descripcion: "Usuario Protegido" }]);
      } finally {
        setLoading(false);
      }
    };

    loadGruposEmpresa();
  }, [userId, setGruposEmpresa, setLoading, setError]);
}
