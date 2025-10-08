export const URL_BASE = 'comercio'

export const routes = {
    index: `${URL_BASE}`,
    comercioSlug: (slug=':slug') => `${URL_BASE}/${slug}`,
}