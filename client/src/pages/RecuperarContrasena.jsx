// src/pages/RecuperarContraseña.jsx
import { useState, useRef, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig"; // ✅ Ruta corregida
import { Link } from "react-router-dom";

const RecuperarContrasena = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleRecuperar = async () => {
    if (!email) {
      setError("⚠️ Por favor ingresá tu correo electrónico.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMensaje(
        "📩 Revisa tu bandeja de entrada para restablecer tu contraseña."
      );
      setError("");
    } catch (err) {
      console.error("Error:", err.message);
      setError(
        "❌ No se pudo enviar el correo. Verificá que esté bien escrito."
      );
      setMensaje("");
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-white"
      style={{
        backgroundImage: "url('/img/fondo-planeta.jpg')",
        backgroundSize: "cover",
      }}
    >
      <img
        src="/img/Superheroe-frontal.png"
        alt="Superhéroe"
        className="w-40 mb-4 animate-pulse"
      />
      <h1 className="text-2xl font-bold mb-2 text-center">
        ¿Olvidaste tu contraseña?
      </h1>
      <p className="mb-4 text-center text-sm text-green-300">
        Ingresá tu correo y te enviaremos un enlace para restablecerla.
      </p>

      <div className="flex flex-col w-full max-w-sm gap-4">
        <input
          ref={inputRef}
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded text-black"
        />

        <button
          onClick={handleRecuperar}
          className="bg-green-600 hover:bg-green-700 p-2 rounded font-bold"
        >
          Enviar enlace de recuperación
        </button>

        {mensaje && <p className="text-green-400 text-center">{mensaje}</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}

        <Link
          to="/login"
          className="text-blue-300 underline text-sm text-center mt-2"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
