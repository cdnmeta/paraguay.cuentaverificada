// src/hooks/useFirebaseMessaging.js
import { messaging } from "@/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_APP_VAPID_PUBLIC_KEY; // tu clave pública VAPID

export function useFirebaseMessaging() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const initMessaging = async () => {
      try {
        // Verificar si messaging está disponible
        if (!messaging) {
          setError("Firebase Messaging no está soportado en este navegador");
          return;
        }

        // 1. Pedir permiso de notificaciones
        const permission = await Notification.requestPermission();
        console.log("Permiso de notificaciones:", permission);
        if (permission !== "granted") {
          setError("Permiso de notificaciones denegado");
          return;
        }

        // 2. Usar el Service Worker principal (ya registrado por Vite PWA)
        const registration = await navigator.serviceWorker.ready;
        console.log("Service Worker registration:", registration);

        // Verificar que el registration es válido para push notifications
        if (!registration || !registration.pushManager) {
          throw new Error("Service Worker registration no válido para push notifications");
        }

        // 3. Obtener token FCM
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration, // Usar el SW de Vite explícitamente
        });

        if (currentToken) {
          console.log("FCM Token:", currentToken);
          setToken(currentToken);
          
        } else {
          setError("No se pudo obtener el token FCM");
        }

        // 4. Escuchar mensajes en foreground
        onMessage(messaging, async (payload) => {
          console.log("Mensaje recibido en foreground: ", payload);
          setLastMessage(payload);
          
          // Mostrar notificación usando el Service Worker registration
          const title = payload.notification?.title || payload.data?.title || "Cuenta Verificada";
          const options = {
            body: payload.notification?.body || payload.data?.body || "Nueva notificación",
            icon: payload.notification?.icon || "/favicon.ico",
            tag: "cuenta-verificada-foreground",
            requireInteraction: true,
            data: payload.data // Incluir datos adicionales
          };

          console.log("Mostrando notificación:", title, options);
          
          // Usar registration.showNotification() que es más confiable
          await registration.showNotification(title, options);
        });
      } catch (err) {
        console.error("Error inicializando FCM:", err);
        setError(err.message);
      }
    };

    if ("Notification" in window && "serviceWorker" in navigator) {
      initMessaging();
    } else {
      setError("El navegador no soporta notificaciones push");
    }
  }, []);

  return { token, error, lastMessage };
}
