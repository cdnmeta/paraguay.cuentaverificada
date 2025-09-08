import { List } from "lucide-react";
import React, { useEffect } from "react";
import ListSolicitudComercios from "./AprovacionComercios/ListSolicitudComercios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { doc } from "firebase/firestore";

export default function AprobarcionComerciosPage() {
  const loadSeo = () => {
    document.title = "Aprobación de Comercios";
  }
  useEffect(()=>{
    loadSeo();
  },[])
  return (
    <>
      
      <Card>
        <CardHeader>
          <CardTitle>Listado de comercios a verificar</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1">
            <ListSolicitudComercios />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
