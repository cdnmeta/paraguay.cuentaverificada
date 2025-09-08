import React from 'react'
import { useNavigate } from 'react-router-dom';
import { dtoLegalRoutes } from '../dpto-legal.routes';

export default function useSecciones({user={}}) {
    const navigate = useNavigate();
    console.log(user)
    const secciones = [
    {
      icon: "/icons/2179332.png",
      title: "Solictudes de Pago",
      desc: "Solictudes de pagos hechos por comercios",
      onClick: () => navigate(`${dtoLegalRoutes.aprobacionPagoComercio}`),
      disponible: true
    },
    {
      icon: "/icons/2179332.png",
      title: "Verificacion de Comercio",
      desc: "Verificacion de datos del Comercio",
      onClick: () => navigate(`${dtoLegalRoutes.aprobacionComercio}`),
      disponible: true
    },
    {
      icon: "/icons/2179332.png",
      title: "Aprobación de Cuenta",
      desc: "Aprobación de solicitudes de cuentas",
      onClick: () => navigate(`${dtoLegalRoutes.aprobacionCuenta}`),
      disponible: true
    }
  ]
  return secciones.filter(item => item.disponible);
}
