import { cn } from '@/lib/utils';
import React from 'react';

const LogoCuentaVerificada = ({ className }) => {
  return (
    <div className={cn("w-[300px]", className)}>
      <img src="/img/logo-cuenta-verificada.png" alt="Logo Cuenta Verificada" />
    </div>
  );
};

export default LogoCuentaVerificada;
