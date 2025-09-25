import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { Link } from "react-router-dom";
import SuperHeroeAnimado from "./components/SuperHeroeAnimado";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(null);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      alert("Login exitoso ✅");
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-opacity-90 text-white px-4 relative overflow-hidden">
      
      {/* Fondo actualizado */}
      <div
        className="absolute inset-0 bg-cover opacity-10 z-0"
        style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}
      ></div>

      {/* Superhéroe animado */}
      <div className="z-10 mb-4">
        <SuperHeroeAnimado />
      </div>

      {/* Título */}
      <h2 className="z-10 text-yellow-400 font-bold text-center">
        ¡Bienvenido de vuelta, héroe!
      </h2>
      <h1 className="z-10 text-3xl sm:text-4xl font-extrabold text-center mt-2">
        Ingresa para continuar tu misión.
      </h1>

      {/* Formulario */}
      <form
        onSubmit={handleLogin}
        className="glow bg-black bg-opacity-80 p-6 mt-6 rounded-lg shadow-xl w-full max-w-sm relative z-10"
      >
        {/* Escudo flotante */}
        <img
          src="/img/icono-verde.png"
          alt="escudo"
          className="absolute -top-6 left-1 w-11 animate-pulse"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full p-2 mb-4 rounded bg-white text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 mb-4 rounded bg-white text-black"
          onChange={(e) => setPass(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 p-2 rounded font-bold text-white"
        >
          Entrar ahora
        </button>

        {error && <p className="text-red-400 mt-2 text-sm text-center">{error}</p>}

        <p className="mt-4 text-sm text-center">
          ¿Olvidaste tu contraseña?{" "}
          <Link to="/recuperar" className="text-blue-400 hover:underline">
            Recuperar acceso
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
