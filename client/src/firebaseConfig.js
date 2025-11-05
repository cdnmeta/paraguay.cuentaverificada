// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { PRODUCCION, ENTORNO } from "@/utils/constants";

// Configuración de Firebase

let firebaseConfig = {};

if (PRODUCCION) {
  firebaseConfig = {
    apiKey: "AIzaSyA-MpIkaAhyk-sdMk3Jt0CV2rWY5AeK-28",
    authDomain: "paraguay-cuenta-verificada.firebaseapp.com",
    projectId: "paraguay-cuenta-verificada",
    storageBucket: "paraguay-cuenta-verificada.firebasestorage.app",
    messagingSenderId: "172475353319",
    appId: "1:172475353319:web:42cd9daeaf4026eb6dfa42",
  };
} else {
  firebaseConfig = {
    apiKey: "AIzaSyBwgebsSf3QhlxI9yYEtm6avtoJfL-hI18",
    authDomain: "cuenta-verificada-paraguay-dev.firebaseapp.com",
    projectId: "cuenta-verificada-paraguay-dev",
    storageBucket: "cuenta-verificada-paraguay-dev.firebasestorage.app",
    messagingSenderId: "388582065023",
    appId: "1:388582065023:web:faa9d9e5bec3af8fccd04a",
  };
}

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);

// Exportaciones para usar en otros componentes
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
