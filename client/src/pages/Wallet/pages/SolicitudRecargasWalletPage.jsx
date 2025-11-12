import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, ArrowLeft } from 'lucide-react';
import FormSolicitudRecargas from '../components/FormSolicitudRecargas';
import { routes } from '../config/routes';
const SolicitudRecargasWalletPage = () => {
  const navigate = useNavigate();
  const {id} = useParams();

  const onSuccess = () => {
    navigate(-1);
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-2xl ">
        <Card className="shadow-lg border-0">
          <CardHeader className="rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Upload className="h-6 w-6 mr-3" />
                  Solicitud de Recarga
                </CardTitle>
                <p className="text-green-100 mt-2">
                  Complete el formulario para solicitar una recarga a su cuenta
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <FormSolicitudRecargas
              onCancel={() => navigate(`/${routes.index}`)}
              onSuccess={onSuccess}
              id_wallet={id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolicitudRecargasWalletPage;