/**
 * Comprueba acceso:
 *  - Debe existir user
 *  - Si allowSuperAdmin es true y user.isa es true => acceso
 *  - Si se exigen grupos (por id o slug), pasa si pertenece a cualquiera
 *  - Si no se exigen grupos, alcanza con que exista sesión
 */
export function hasAccess(user, opts = {}) {
  if (!user) return false;

  const {
    allowSuperAdmin = true,
    requiredGroupIds = null,     // p.ej. [1, 3]
    requiredGroupSlugs = null,   // p.ej. ["dpto-legal"]
  } = opts;

  if (allowSuperAdmin && user.isa) return true;

  const grupos = Array.isArray(user && user.grupos) ? user.grupos : [];

  const checkIds = Array.isArray(requiredGroupIds) && requiredGroupIds.length > 0;
  const checkSlugs = Array.isArray(requiredGroupSlugs) && requiredGroupSlugs.length > 0;

  if (!checkIds && !checkSlugs) {
    // Sin requisitos de grupos: solo sesión válida
    return true;
  }

  const passById = checkIds
    ? requiredGroupIds.some((id) => grupos.some((g) => g && g.id === id))
    : false;

  const passBySlug = checkSlugs
    ? requiredGroupSlugs.some((slug) => grupos.some((g) => g && g.slug === slug))
    : false;

  return passById || passBySlug;
}


export function verificarSesionYgrupoAdmitido(user, groupIds = [], allowSuperAdmin = true) {
  return hasAccess(user, { allowSuperAdmin, requiredGroupIds: groupIds });
}

export function generarUrlInicializacionDeCredenciales(data){
  const {token, cedula} = data;
  const url = window.location.origin;
  return `${url}/verificacion-cuenta?token=${encodeURIComponent(token)}&ced=${encodeURIComponent(cedula)}`;
}