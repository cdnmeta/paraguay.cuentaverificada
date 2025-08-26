// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import SuperHeroeAnimado from "@/components/SuperHeroeAnimado";
import { LogIn, LogInIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
import { getUserByDocumento } from "@/apis/usuarios.api";
import { login } from "@/apis/auth.api";
const Login = () => {
  const [documento, setDocumento] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

const iniciarSesion = async () => {
  try {
    setIsSubmitting(true);

    const dataEnviar = {
      documento,
      password,
    }
    const credentials = await  login(dataEnviar);

    const response = await signInWithCustomToken(auth, credentials.data.token);
    const user = response.user;

    if (!user.emailVerified) {
      setMensaje(
        "⚠️ Tu correo aún no está verificado. Por favor revisá tu bandeja de entrada."
      );
      return;
    }

    // 🔥 Llamar a fetchUser() desde Zustand (trae y guarda el user)
    await useAuthStore.getState().fetchUser();

    toast.success("Bienvenido a Cuenta Verificada.");
    // Redirigir al panel de usuario
    console.log("ir a panel");
    navigate(PUBLIC_ROUTES.panel);
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    if([400].includes(err.response?.status)){
      toast.error("❌ Datos incorrectos. Verificá tu documento y contraseña.",{
        richColors: true,
      });
      return;
    }
    toast.error("❌ Ocurrió un error al iniciar sesión. Verificá tus datos.",{
      richColors: true,
    });
  } finally {
    setIsSubmitting(false);
  }
};


  const iniciarConGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const resultado = await signInWithPopup(auth, provider);
      const user = resultado.user;

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        navigate("/panel");
      } else {
        setMensaje(
          "⚠️ No existe una cuenta vinculada a ese correo en Cuenta Verificada."
        );
      }
    } catch (err) {
      console.error("Error con Google:", err);
      setMensaje("❌ Ocurrió un error al iniciar con Google.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative">
      <div className="z-10">
        <SuperHeroeAnimado />
      </div>
      <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>

      <div className="flex flex-col w-full max-w-sm gap-4 mt-2">
        <input
          type="text"
          placeholder="Ingrese su documento"
          className="p-2 bg-white text-black rounded"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="p-2 bg-white text-black rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={iniciarSesion}
          className="bg-green-500 hover:bg-green-600 p-2 rounded font-bold text-white flex items-center justify-center gap-2"
        >
          <LogInIcon />
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        <button
          onClick={iniciarConGoogle}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold text-white flex items-center justify-center gap-2"
        >
          <img
            src="/img/google-icon.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Iniciar sesión con Google
        </button>

        {mensaje && (
          <p className="text-yellow-300 text-center font-semibold">{mensaje}</p>
        )}

        <div className="text-center mt-4 text-sm">
          <Link to="/recuperar" className="text-blue-300 underline block">
            ¿Olvidaste tu contraseña? Recuperala acá
          </Link>
          <Link to={PUBLIC_ROUTES.solicitarCuentaVerificada} className="text-blue-300 underline block mt-2">
            ¿No tenés cuenta? Crear cuenta ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
