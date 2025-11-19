import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from 'virtual:pwa-register'

// registra el SW (auto-update por la config)
registerSW({
  onRegistered(registration) {
    console.log('SW registrado:', registration);
    // Lo guardamos global para usarlo en FCM
      window.__PWA_SW_REG__ = registration;
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
