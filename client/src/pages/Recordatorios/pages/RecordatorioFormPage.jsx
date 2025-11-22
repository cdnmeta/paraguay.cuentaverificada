import React from 'react';
import { useParams } from 'react-router-dom';
import RecordatorioForm from '../components/RecordatorioForm';

export default function RecordatorioFormPage() {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-background">
      <RecordatorioForm id={id} />
    </div>
  );
}
