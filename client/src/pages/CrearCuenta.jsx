import SuperHeroeAnimado from "@/components/SuperHeroeAnimado";
import { IdCard, CarFront } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

function CrearCuenta() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 py-10">
      <div className="z-10">
        <SuperHeroeAnimado />
      </div>
      <h1 className="text-xl font-bold mb-2 z-10 text-center">
        ¡Activa tu protección, héroe!
      </h1>
      <p className="text-sm text-green-400 mb-4 z-10 text-center">
        Solo aceptamos documentos oficiales de Paraguay. Cuenta Verificada
        funciona por país.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm z-10">
        <button
          onClick={() => navigate("/subir-cedula")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
        >
          <IdCard className="w-5 h-5" />
          Crear cuenta con Cédula
        </button>
      </div>

      <p className="text-sm text-white mt-6 z-10">
        ¿Ya tenés una cuenta?{" "}
        <a
          href="/login"
          className="underline text-blue-400 hover:text-blue-300"
        >
          Iniciar sesión
        </a>
      </p>
    </div>
  );
}

export default CrearCuenta;
