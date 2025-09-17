import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  getUsersByQuery, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserById 
} from '@/apis/usuarios.api';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // Cargar usuarios con filtros
  const loadUsuarios = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      const response = await getUsersByQuery(filtros);
      setUsuarios(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar usuario por ID
  const loadUsuario = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await getUserById(id);
      setUsuario(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      toast.error('Error al cargar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo usuario
  const crearUsuario = useCallback(async (datosUsuario) => {
    try {
      setLoading(true);
      const response = await createUser(datosUsuario);
      toast.success('Usuario creado exitosamente');
      
      // Actualizar lista de usuarios
      await loadUsuarios();
      
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      const mensaje = error.response?.data?.message || 'Error al crear usuario';
      toast.error(mensaje);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadUsuarios]);

  // Actualizar usuario existente
  const actualizarUsuario = useCallback(async (id, datosUsuario) => {
    try {
      setLoading(true);
      const response = await updateUser(id, datosUsuario);
      toast.success('Usuario actualizado exitosamente');
      
      // Actualizar usuario en estado si está cargado
      if (usuario && usuario.id === id) {
        setUsuario({ ...usuario, ...datosUsuario });
      }
      
      // Actualizar lista de usuarios
      await loadUsuarios();
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      const mensaje = error.response?.data?.message || 'Error al actualizar usuario';
      toast.error(mensaje);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [usuario, loadUsuarios]);

  // Eliminar usuario
  const eliminarUsuario = useCallback(async (id) => {
    try {
      setLoading(true);
      await deleteUser(id);
      toast.success('Usuario eliminado exitosamente');
      
      // Remover usuario de la lista
      setUsuarios(prev => prev.filter(u => u.id !== id));
      
      // Limpiar usuario si es el que está cargado
      if (usuario && usuario.id === id) {
        setUsuario(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const mensaje = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(mensaje);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  // Limpiar estados
  const clearUsuario = useCallback(() => {
    setUsuario(null);
  }, []);

  const clearUsuarios = useCallback(() => {
    setUsuarios([]);
  }, []);

  return {
    // Estados
    usuarios,
    usuario,
    loading,
    
    // Acciones
    loadUsuarios,
    loadUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    
    // Utilidades
    clearUsuario,
    clearUsuarios,
    setUsuarios,
    setUsuario
  };
};