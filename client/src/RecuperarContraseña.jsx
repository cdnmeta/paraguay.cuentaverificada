import { useState, useRef, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { Link } from "react-router-dom";
import SuperHeroeAnimado from "./components/SuperHeroeAnimado";

const RecuperarContraseña = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const mensajeRef = useRef(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMensaje("✅ Te enviamos un correo para restablecer tu contraseña.");
    } catch (err) {
      setError("No pudimos enviar el correo. Revisá el email ingresado.");
    }
  };

  // Scroll al mensaje si existe
  useEffect(() => {
    if (mensajeRef.current) {
      mensajeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensaje, error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-opacity-90 text-white px-4 relative">
      {/* Fondo visual */}
      <div
        className="absolute inset-0 bg-cover opacity-10 z-0"
        style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}
      ></div>

      {/* Superhéroe animado */}
      <div className="z-10">
        <SuperHeroeAnimado />
      </div>

      {/* Frases motivadoras */}
      <h2 className="z-10 text-yellow-400 font-bold text-center mt-6">
        ¡No te preocupes, héroe!
      </h2>
      <h1 className="z-10 text-3xl sm:text-4xl font-extrabold text-center mt-2">
        Recuperaremos tu acceso.
      </h1>
      <p className="z-10 text-center text-sm text-gray-300 mt-2 max-w-md">
        Ingresa tu correo y te enviaremos un enlace para que vuelvas al sistema como el héroe que eres.
      </p>

      {/* Formulario */}
      <form
        onSubmit={handleReset}
        className="z-10 bg-black bg-opacity-80 p-6 mt-6 rounded-lg shadow-xl border border-green-500 w-full max-w-sm relative"
      >
        <img
          src="/img/icono-verde.png"
          alt="escudo"
          className="absolute -top-5 left-5 w-8 animate-pulse"
        />

        <input
          type="email"
          autoFocus
          required
          placeholder="Correo electrónico"
          className="w-full p-2 mb-4 rounded bg-white text-black"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Campo opcional de WhatsApp - si querés activarlo después */}
        {/* 
        <input
          type="tel"
          placeholder="WhatsApp (opcional)"
          className="w-full p-2 mb-4 rounded bg-white text-black"
        />
        */}

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 p-2 rounded font-bold text-white flex items-center justify-center gap-2"
        >
          <span role="img" aria-label="candado">🔓</span> Recuperar acceso
        </button>

        <div ref={mensajeRef}>
          {mensaje && <p className="text-green-400 mt-4 text-sm text-center">{mensaje}</p>}
          {error && <p className="text-red-400 mt-4 text-sm text-center">{error}</p>}
        </div>

        <p className="mt-4 text-sm text-center">
          ¿Ya recordaste tu contraseña?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RecuperarContraseña;
