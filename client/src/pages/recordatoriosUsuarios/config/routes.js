export const URL_BASE = 'donde-lo-guarde';

export const routes = {
    index: URL_BASE,
    crear: `crear`,
    editar: (id = ':id') => `editar/${id}`,
};

export default routes;