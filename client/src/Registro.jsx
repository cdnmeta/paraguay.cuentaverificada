import { useState, useRef } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import SuperHeroeAnimado from "./components/SuperHeroeAnimado";

const Registro = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();
  const cedulaRef = useRef();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    const cedulaFile = cedulaRef.current?.files[0];

    if (pass !== confirmPass) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!cedulaFile) {
      setError("Debes subir la imagen de tu cédula");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;

      const storageRef = ref(storage, `cedulas/${uid}`);
      await uploadBytes(storageRef, cedulaFile);

      setMensaje("Cuenta creada con éxito ✅");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado.");
      } else {
        setError("Error al crear cuenta: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-opacity-90 text-white px-4 relative">
      
      {/* Fondo actualizado */}
      <div
        className="absolute inset-0 bg-cover opacity-10 z-0"
        style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}
      ></div>

      <div className="z-10">
        <SuperHeroeAnimado />
      </div>

      <h2 className="z-10 text-yellow-400 font-bold text-center mt-6">
        ¡Activá tu protección, héroe!
      </h2>
      <h1 className="z-10 text-3xl sm:text-4xl font-extrabold text-center mt-2">
        Crea tu Cuenta Verificada
      </h1>

      <form
        onSubmit={handleRegistro}
        className="z-10 bg-black bg-opacity-80 p-6 mt-6 rounded-lg shadow-xl border border-green-500 w-full max-w-sm relative mb-6"
      >
        <img
          src="/img/icono-verde.png"
          alt="escudo"
          className="absolute -top-6 left-4 w-10 animate-pulse"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full p-2 mb-4 rounded bg-white text-black"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 mb-4 rounded bg-white text-black"
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="w-full p-2 mb-4 rounded bg-white text-black"
          onChange={(e) => setConfirmPass(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Número de WhatsApp (opcional)"
          className="w-full p-2 mb-4 rounded bg-white text-black"
          onChange={(e) => setWhatsapp(e.target.value)}
        />
        <label className="text-sm mb-1 block">🪪 Subí la foto de tu cédula</label>
        <input
          type="file"
          accept="image/*"
          ref={cedulaRef}
          className="w-full p-2 mb-4 rounded bg-white text-black"
        />

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 p-2 rounded font-bold text-white uppercase"
        >
          CREAR CUENTA
        </button>

        {mensaje && <p className="text-green-400 mt-4 text-sm text-center">{mensaje}</p>}
        {error && <p className="text-red-400 mt-4 text-sm text-center">{error}</p>}

        <p className="mt-4 text-sm text-center">
          ¿Ya tenés una cuenta?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Iniciar sesión
          </Link>
        </p>

        <p className="text-xs text-center text-gray-300 mt-2">
          Al darle clic en <span className="font-bold text-white">CREAR CUENTA</span>, aceptas nuestros{" "}
          <a href="#" className="underline text-blue-400 hover:text-blue-300">
            Términos y Condiciones
          </a>{" "}
          y{" "}
          <a href="#" className="underline text-blue-400 hover:text-blue-300">
            Política de Privacidad
          </a>.
        </p>
      </form>
    </div>
  );
};

export default Registro;
