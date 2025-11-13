import { id } from "zod/v4/locales"

export const URL_BASE = "wallet"

export const routes = {
    index: `${URL_BASE}`,
    walletDashboard: (id = ':id') => `${URL_BASE}/${id}`,
    solicitarRecarga: (id = ':id') => `${URL_BASE}/${id}/solicitar-recarga`,
}