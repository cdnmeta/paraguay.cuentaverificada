import React from 'react'
import semaforoDefault from '/img/semaforoDefault.png'
import semaforoRojo from '/img/semaforo_rojo.gif'
import semaforoAmarillo from '/img/semaforo_amarillo.gif'
import semaforoVerde from '/img/semaforo_verde.gif'

export default function SemaforoImg({tipo='default'}) {
  let semanoforMostrar=semaforoDefault;
  switch(tipo.toLocaleLowerCase()){
    case 'rojo':
      semanoforMostrar=semaforoRojo;
      break;
    case 'amarillo':
      semanoforMostrar=semaforoAmarillo;
      break;
    case 'verde':
      semanoforMostrar=semaforoVerde;
      break;
  }
  return <img src={semanoforMostrar} alt="Semaforo" />;
}
