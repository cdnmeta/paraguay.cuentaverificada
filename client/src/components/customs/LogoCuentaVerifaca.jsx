import { cn } from '@/lib/utils';
import React from 'react';

const LogoCuentaVerificada = ({ classname }) => {
  return (
    <div className={cn("w-[300px]", classname)}>
      <img src="/img/logo-cuenta-verificada.png" alt="Logo Cuenta Verificada" />
    </div>
  );
};

export default LogoCuentaVerificada;
