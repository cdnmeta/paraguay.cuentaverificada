import { DataTable } from '@/components/ui/data-tables/data-table';
import React from 'react';

export default function ListUsuariosFiltrados({ data, columns }) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      options={{ ocultar_boton_ver_columnas: true }} 
      pageSize={10} 
      placeholder="Buscar usuarios..."
    />
  );
}