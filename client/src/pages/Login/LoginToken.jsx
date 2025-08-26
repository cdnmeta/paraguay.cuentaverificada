import React from 'react'
import { useParams } from 'react-router-dom';
export default function LoginToken() {
    const params = useParams();
    const paramsSearch = new URLSearchParams(window.location.search);
    console.log(params)
    console.log(paramsSearch.get("destino"))
    console.log(paramsSearch.get("cd"))
  return (
    <div className='bg-white rounded-2xl container p-4'>
        <h1>Restablecer Contraseña</h1>
        <p>Ingresa tu nuevo token de acceso:</p>
    </div>
  )
}
