import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "./firebaseConfig";

const RestablecerContraseñaNueva = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = params.get("oobCode");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);
  const [validando, setValidando] = useState(true);

  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setEmail(email);
          setValidando(false);
        })
        .catch(() => {
          setError("Este enlace ya no es válido o ha expirado.");
          setValidando(false);
        });
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (nuevaClave !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, nuevaClave);
      setMensaje("✅ Tu contraseña fue cambiada exitosamente.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError("No pudimos cambiar la contraseña. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-opacity-90 text-white px-4 relative">
      {/* Fondo galáctico personalizado */}
      <div
        className="absolute inset-0 bg-cover opacity-10 z-0"
        style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}
      ></div>

      <h1 className="text-3xl sm:text-4xl font-extrabold z-10 text-center mb-6">
        ¡Hora de reforzar tu cuenta, héroe!
      </h1>

      {validando ? (
        <p className="z-10">Validando enlace...</p>
      ) : error ? (
        <p className="z-10 text-red-400">{error}</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="z-10 bg-black bg-opacity-80 p-6 rounded-lg shadow-xl border border-green-500 w-full max-w-md"
        >
          <p className="text-sm text-center mb-4 text-green-400">
            Restableciendo contraseña para: <strong>{email}</strong>
          </p>

          <input
            type="password"
            placeholder="Nueva contraseña"
            className="w-full p-2 mb-4 rounded bg-white text-black"
            onChange={(e) => setNuevaClave(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full p-2 mb-4 rounded bg-white text-black"
            onChange={(e) => setConfirmacion(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 p-2 rounded font-bold text-white"
          >
            Cambiar contraseña
          </button>

          {mensaje && <p className="text-green-400 mt-4 text-sm text-center">{mensaje}</p>}
          {error && <p className="text-red-400 mt-4 text-sm text-center">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default RestablecerContraseñaNueva;
