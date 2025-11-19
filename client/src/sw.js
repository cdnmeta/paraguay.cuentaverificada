import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

// src/sw.js
// Service Worker principal con Firebase Messaging integrado y Workbox
console.log('[SW] Service Worker cargado');

// Workbox - Precaching de archivos estáticos
precacheAndRoute(self.__WB_MANIFEST);

// Workbox - Fallback para navegación SPA (todas las rutas van a index.html)
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);


// Configuración de Firebase (reemplaza con tus valores reales)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si la configuración está completa
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Opcional pero recomendable
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

// DESPUÉS: (con verificación)
onBackgroundMessage(messaging, (payload) => {
  console.log("[SW] Mensaje en background", payload);
  
  // Verificar que self.registration existe y tiene pushManager
  if (!self.registration || !self.registration.pushManager) {
    console.error("[SW] Registration o pushManager no disponible");
    return;
  }
  
  const title = payload.notification?.title || "Cuenta Verificada";
  const options = {
    body: payload.notification?.body || "",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(title, options);
});


