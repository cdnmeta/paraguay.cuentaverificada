/**
 * Script de prueba para validar las mejoras en el sistema de grupos
 * Ejecutar en consola del navegador para verificar el funcionamiento
 */

// Función para simular datos de prueba
export const testGruposEmpresa = () => {
  console.log('🧪 Iniciando pruebas del sistema de grupos...');
  
  // Test 1: Validar que el store maneja arrays vacíos
  console.log('Test 1: Store con array vacío');
  try {
    const { useGruposEmpresaStore } = require('@/store/useGrupoEmpresaStore');
    const store = useGruposEmpresaStore.getState();
    store.setGruposEmpresa([]);
    console.log('✅ Store maneja array vacío correctamente');
  } catch (error) {
    console.error('❌ Error en Test 1:', error);
  }
  
  // Test 2: Validar selección de grupo válido
  console.log('Test 2: Selección de grupo válido');
  try {
    const { useGruposEmpresaStore } = require('@/store/useGrupoEmpresaStore');
    const store = useGruposEmpresaStore.getState();
    
    // Simular grupos
    const gruposPrueba = [
      { id: 1, descripcion: 'Grupo Test 1' },
      { id: 'admin', descripcion: 'Super Admin' },
      { id: 'protegido', descripcion: 'Usuario Protegido' }
    ];
    
    store.setGruposEmpresa(gruposPrueba);
    const success = store.setGrupoSeleccionado('admin');
    
    if (success) {
      console.log('✅ Selección de grupo válido funciona');
    } else {
      console.log('❌ Selección de grupo válido falló');
    }
  } catch (error) {
    console.error('❌ Error en Test 2:', error);
  }
  
  // Test 3: Validar selección de grupo inválido
  console.log('Test 3: Selección de grupo inválido');
  try {
    const { useGruposEmpresaStore } = require('@/store/useGrupoEmpresaStore');
    const store = useGruposEmpresaStore.getState();
    
    const success = store.setGrupoSeleccionado('grupo_inexistente');
    
    if (!success) {
      console.log('✅ Validación de grupo inválido funciona correctamente');
    } else {
      console.log('❌ Validación de grupo inválido falló');
    }
  } catch (error) {
    console.error('❌ Error en Test 3:', error);
  }
  
  console.log('🏁 Pruebas completadas');
};

// Función para probar el procesamiento de grupos
export const testProcessUserGroups = (grupos, isSuperAdmin) => {
  const processedGroups = [...grupos];
  
  if (isSuperAdmin) {
    processedGroups.push({ id: 'admin', descripcion: "Super Admin" });
  }
  
  processedGroups.push({ id: 'protegido', descripcion: "Usuario Protegido" });
  
  return processedGroups;
};

// Exportar para uso en desarrollo
if (typeof window !== 'undefined') {
  window.testGruposEmpresa = testGruposEmpresa;
  window.testProcessUserGroups = testProcessUserGroups;
}