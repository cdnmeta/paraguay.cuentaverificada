// src/pages/SubirLicencia.jsx
import { useState } from "react";
import { auth, storage, db } from "../firebaseConfig";
import { ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const SubirLicencia = () => {
  const [documento, setDocumento] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [numero, setNumero] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [mostrarCampos, setMostrarCampos] = useState(false);
  const [mostrarFinal, setMostrarFinal] = useState(false);
  const [mostrarEmailForm, setMostrarEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const limpiarTodo = () => {
    setNombre("");
    setApellido("");
    setNumero("");
    setFechaNacimiento("");
    setMensaje(null);
    setError(null);
    setMostrarCampos(false);
    setMostrarFinal(false);
    setMostrarEmailForm(false);
    setEmail("");
    setPassword("");
    setRepeatPassword("");
  };

  const manejarLicenciaOCR = async (file) => {
    limpiarTodo();
    setDocumento(file);
    setMensaje("🧠 Analizando licencia...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyD3tGBav-RcXRxOMS_0F7-ujbVui4QyXc0`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requests: [
                {
                  image: { content: base64 },
                  features: [{ type: "TEXT_DETECTION" }],
                },
              ],
            }),
          }
        );
        const data = await response.json();
        const texto =
          data.responses?.[0]?.fullTextAnnotation?.text?.toUpperCase() || "";
        const lineas = texto.split("\n").map((l) => l.trim()).filter(Boolean);

        console.log("🧾 OCR Licencia:", texto);

        if (
          !texto.includes("LICENCIA DE CONDUCIR") ||
          !texto.includes("REPÚBLICA DEL PARAGUAY")
        ) {
          setError("⚠️ No se detectó una licencia paraguaya válida.");
          return;
        }

        let apellidoVal = "";
        let nombreVal = "";
        let numeroVal = "";
        let fechaVal = "";

        const lineaApellido = lineas.find((l) => l.includes("APELLIDO"));
        if (lineaApellido) {
          apellidoVal = lineaApellido.replace("APELLIDO", "").trim();
        }

        const lineaNombre = lineas.find((l) => l.includes("NOMBRE"));
        if (lineaNombre) {
          nombreVal = lineaNombre.replace("NOMBRE", "").trim();
        }

        const lineaCedula = lineas.find((l) => l.includes("C.I") || l.includes("C.L"));
        if (lineaCedula) {
          const match = lineaCedula.match(/\d{6,10}/);
          numeroVal = match ? match[0] : "";
        }

        const lineaNacimiento = lineas.find((l) => l.includes("FECHA DE NAC"));
        if (lineaNacimiento) {
          const match = lineaNacimiento.match(/\d{2}-\d{2}-\d{4}/);
          fechaVal = match ? match[0] : "";
        }

        if (!nombreVal || !apellidoVal || !numeroVal || !fechaVal) {
          setError("⚠️ Datos incompletos. Por favor subí una imagen más clara.");
          return;
        }

        setNombre(nombreVal);
        setApellido(apellidoVal);
        setNumero(numeroVal);
        setFechaNacimiento(fechaVal);
        setMostrarCampos(true);
        setMostrarFinal(true);
        setMensaje("✅ Licencia validada correctamente.");

        localStorage.setItem(
          "datosRegistro",
          JSON.stringify({
            nombre: nombreVal,
            apellido: apellidoVal,
            documento: numeroVal,
            fechaNacimiento: fechaVal,
            metodo: "licencia",
          })
        );

        const storageRef = ref(storage, `licencias/${numeroVal}_${Date.now()}`);
        await uploadBytes(storageRef, file);
      } catch (err) {
        console.error("OCR error:", err);
        setError("❌ Error al procesar la imagen. Intentá de nuevo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleSignup = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const resultado = await signInWithPopup(auth, provider);
    const user = resultado.user;

    const datos = JSON.parse(localStorage.getItem("datosRegistro"));
    if (!datos) {
      setError("No se encontraron los datos del documento. Volvé a subir la licencia.");
      return;
    }

    await setDoc(doc(db, "usuarios", user.uid), {
      ...datos,
      email: user.email,
      creado: serverTimestamp(),
      metodo: "google",
    });

    alert("Cuenta creada con Google. ¡Bienvenido a Cuenta Verificada!");
    window.location.href = "/login";
  } catch (err) {
    console.error("Error Google Sign-in:", err);
    setError("No se pudo crear cuenta con Google.");
  }
};


  const handleEmailSignup = async () => {
    if (!email || !password || !repeatPassword) {
      setError("Completá todos los campos.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);

      const datos = JSON.parse(localStorage.getItem("datosRegistro"));
      if (datos) {
        await setDoc(doc(db, "usuarios", cred.user.uid), {
          ...datos,
          email,
          creado: serverTimestamp(),
          metodo: "email",
        });
      }

      alert("Cuenta creada con éxito. Revisá tu correo para activarla.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Email signup error:", err);
      setError("No se pudo crear cuenta con Email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 py-10 relative">
      <img src="/img/Superheroe-frontal.png" alt="superheroe" className="w-32 mb-4 z-10 animate-pulse" />
      <h1 className="text-2xl font-bold mb-2 z-10">¡Verifiquemos tu identidad!</h1>
      <p className="text-sm text-green-300 mb-4 z-10">
        Subí una imagen de tu licencia de conducir paraguaya.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => manejarLicenciaOCR(e.target.files[0])}
        className="bg-white text-black p-2 rounded mb-4 z-10"
      />

      <button
        onClick={() => window.location.href = "/subir-cedula"}
        className="mt-4 text-blue-400 hover:underline text-sm transition duration-200 z-10"
      >
        ¿Tenés cédula de identidad? Probar con la cédula
      </button>

      {mensaje && <p className="text-green-400 text-center max-w-sm z-10">{mensaje}</p>}
      {error && (
        <>
          <p className="text-red-400 text-center max-w-sm z-10 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded z-10"
          >
            Intentar nuevamente
          </button>
        </>
      )}

      {mostrarCampos && (
        <div className="mt-4 w-full max-w-md z-10">
          <p>Apellido: <span className="text-green-300 font-bold">{apellido}</span></p>
          <p>Nombre: <span className="text-green-300 font-bold">{nombre}</span></p>
          <p>Número de documento: <span className="text-green-300 font-bold">{numero}</span></p>
          <p>Fecha de nacimiento: <span className="text-green-300 font-bold">{fechaNacimiento}</span></p>
        </div>
      )}

      {mostrarFinal && (
        <div className="flex flex-col gap-3 mt-6 z-10 w-full max-w-sm">
          <p className="text-center text-green-400">
            Falta poco para activar tu protección completa.
          </p>
          <div className="bg-red-900 border border-red-600 text-sm text-white p-3 rounded">
            ⚠️ Al hacer clic en <span className="underline font-bold">"Crear cuenta"</span>, aceptás bajo juramento que el documento es tuyo. <br />
            El uso de documentos ajenos o falsos puede derivar en <span className="font-bold text-red-300">sanciones legales</span> y el <span className="font-bold text-red-300">bloqueo inmediato</span> de la cuenta.
          </div>

          <button
            onClick={handleGoogleSignup}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
          >
            <img src="/img/google-logo.png" alt="Google" className="w-5 h-5" />
            Crear cuenta con Google
          </button>

          <button
            onClick={() => setMostrarEmailForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
          >
            <img src="/img/email-icon.png" alt="Email" className="w-5 h-5" />
            Crear cuenta con Email
          </button>

          {mostrarEmailForm && (
            <>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="text-black p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="text-black p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Repetir contraseña"
                className="text-black p-2 rounded"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
              <button
                onClick={handleEmailSignup}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded"
              >
                Verificar mi cuenta ahora
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SubirLicencia;
