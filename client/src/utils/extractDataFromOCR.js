export function detectarNombreApellido(textoOCR) {
  const lineas = textoOCR
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (let linea of lineas) {
    if (linea.includes(',')) {
      const [apellidos, nombres] = linea.split(',');
      return {
        nombre: nombres ? nombres.trim() : '',
        apellido: apellidos ? apellidos.trim() : ''
      };
    }
  }

  return { nombre: '', apellido: '' };
}
