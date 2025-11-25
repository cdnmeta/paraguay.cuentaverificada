import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlanForm } from '@/pages/Planes';
import { routes } from '../config/routes';

export default function PlanesFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleSuccess = (planData) => {
    console.log('Plan guardado exitosamente:', planData);
    navigate(`${routes.listadoPlanes}`);
  };

  return (
    <div className="container mx-auto py-6">
      <PlanForm 
        id={id} 
        onSuccess={handleSuccess}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}
