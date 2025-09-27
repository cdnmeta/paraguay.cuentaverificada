import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FormSemaforoFinancieroMovimiento from '../components/FormSemaforoFinancieroMovimiento';

const SemaforoFinancieroMovimientosPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Regresar al dashboard después de crear/actualizar
    navigate('/semaforo-financiero');
  };

  const handleBack = () => {
    navigate('/semaforo-financiero');
  };

  return (
    <div className=" bg-white border rounded-2xl mt-2 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {id ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            </h1>
            <p className="text-muted-foreground">
              {id 
                ? 'Modifica los datos del movimiento del semáforo financiero'
                : 'Registra un nuevo movimiento en tu semáforo financiero'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <FormSemaforoFinancieroMovimiento 
        id_movimiento={id} 
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default SemaforoFinancieroMovimientosPage;
