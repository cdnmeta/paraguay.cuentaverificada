import React from 'react'
export const BASE_URL = 'semaforo-financiero';
export const routes = {
    index: BASE_URL,
    crear: `${BASE_URL}/nuevo`,
    editar: (id = ':id') => `${BASE_URL}/editar/${id}`,

}
