// src/pages/Verificado.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const Verificado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [estado, setEstado] = useState("cargando");

  
  
  useEffect(() => {
    const verificarCorreo = async () => {
      const params = new URLSearchParams(location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");
      console.log(params.get("mode"), params.get("oobCode"));
      if (mode === "verifyEmail" && oobCode) {
        try {
          // Verificamos si el código aún es válido
          await checkActionCode(auth, oobCode);

          // Aplicamos el código si es válido
          await applyActionCode(auth, oobCode);
          setEstado("verificado");
        } catch (error) {
          console.error("Código inválido o ya usado:", error);
          // Revisamos si el usuario actual ya está verificado
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            setEstado("ya_verificado");
          } else {
            setEstado("invalido");
          }
        }
      } else {
        setEstado("invalido");
      }
    };

    verificarCorreo();
  },[]);

  const Mensaje = () => {
    switch (estado) {
      case "verificado":
        return (
          <div className="text-center text-green-400">
            <h2 className="text-2xl font-bold mb-2">¡Tu correo fue verificado con éxito! 🎉</h2>
            <p className="mb-4">Ahora podés iniciar sesión con tu cuenta protegida y disfrutar de un marketplace libre de estafas.</p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
              onClick={() => navigate("/login")}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        );
      case "ya_verificado":
        return (
          <div className="text-center text-green-400">
            <h2 className="text-2xl font-bold mb-2">✅ Correo Verificado</h2>
            <p className="mb-4">Todo listo, podés iniciar sesión sin problemas.</p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
              onClick={() => navigate("/login")}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        );
      case "invalido":
        return (
          <div className="text-center text-red-400">
            <h2 className="text-2xl font-bold mb-2">❌ El enlace de verificación es inválido</h2>
            <p className="mb-4">Probablemente ya fue usado o está mal escrito. Si ya verificaste tu correo, podés iniciar sesión.</p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
              onClick={() => navigate("/login")}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        );
      default:
        return <p className="text-white">⏳ Verificando tu correo...</p>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative px-4 py-10">
      <div className="absolute inset-0 bg-cover opacity-10 z-0" style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}></div>
      <div className="z-10 bg-black bg-opacity-80 p-6 rounded-lg shadow-xl border border-green-500 text-center max-w-lg">
        <img src="/img/Superheroe-frontal.png" alt="Héroe Cuenta Verificada" className="w-28 mx-auto mb-4 animate-pulse" />
        <Mensaje />
      </div>
    </div>
  );
};

export default Verificado;
