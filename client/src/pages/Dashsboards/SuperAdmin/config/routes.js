// src/pages/SuperAdmin/config/routes.js

export const ROUTE_BASE = "/admin";

// Configuración de rutas del módulo Admin con rutas absolutas completas
export const routes = {
  // Participantes
  registrarParticipante: `${ROUTE_BASE}/participantes`,
  listadoParticipantes: `${ROUTE_BASE}/participantes/listado`,
  
  // Usuarios - estas rutas se manejan por el módulo usuarios
  listadoUsuarios: `${ROUTE_BASE}/usuarios/listado`, 
  registrarUsuarios: `${ROUTE_BASE}/usuarios`,
  editarUsuario: (id = ":id") => `${ROUTE_BASE}/usuarios/${id}`,
  
  // Comercios
  listadoComercios: `${ROUTE_BASE}/comercios/listado`,
  aprobacionPagosComercio: `${ROUTE_BASE}/solicitudes-pago`,
  aprobacionComercios: `${ROUTE_BASE}/aprobacion-comercios`,
  
  // Solicitudes de Cuentas
  listadoSolicitudesCuentas: `${ROUTE_BASE}/solicitudes-cuentas`,
  
  // Cotización Empresa
  cotizacionEmpresa: `${ROUTE_BASE}/cotizacion-empresa`,
  
  // Facturas Planes - estas rutas se manejan por el módulo FacturaPlanes  
  facturarPlanes: `${ROUTE_BASE}/facturar`,
  gananciasFacturas: `${ROUTE_BASE}/facturas-ganancias`,
  
  // Estados Animos - se maneja por el módulo EstadosAnimos
  estadosAnimos: `${ROUTE_BASE}/estados-animos`,
  
  // Wallet - se maneja por el módulo Wallet
  solicitudesRecargasWallet: `${ROUTE_BASE}/solicitudes-recargas-wallet`,

  // Planes - se maneja por el módulo Planes
  listadoPlanes: `${ROUTE_BASE}/planes`,
  crearPlan: `${ROUTE_BASE}/planes/crear`,
  editarPlan: (id = ":id") => `${ROUTE_BASE}/planes/editar/${id}`,
};
