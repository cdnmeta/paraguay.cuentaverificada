import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";
import { rellenarNumero } from "@/utils/funciones";
import useComercioStore from "@/store/useComercioStore";

/**
 * Conversión de comercio.html + comercio.css + css-global.css a React + Tailwind.
 * - Sin dependencias externas ni CSS adicional.
 * - Imágenes y textos tomados del HTML original.
 * - Estructura responsive y utilidades Tailwind para sombras, bordes y tipografía.
 *
 * Cómo usar:
 * 1) Copia este archivo como `ComercioPage.jsx` dentro de tu app React (Vite/CRA/Next client component).
 * 2) Asegúrate de tener Tailwind configurado.
 * 3) Importa y renderiza <ComercioPage /> donde lo necesites.
 */

const IMAGES = {
  logo:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/CuentaVerificadablancotransparentegrande.png",
  headerAvatar:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/APLASTAALENEMIGOCDEPARAGUAYDJCHOWUY03.jpg",
  iconMensaje: "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/1157000.png",
  iconBell: "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/549739-97d027b6.png",
  iconMenu: "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/4337319-8edc9898.png",
  heroBg:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/sliderdiosaesbeltacuentaverificada1.png",
  infoBg:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/fondocuentaverificada1.png",
  // Íconos de las tarjetas
  razon:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/1547295-e05b4e32.png",
  ruc: "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/4052615-f902524c.png",
  ubicacion:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/2377937-2e0229a3.png",
  whatsapp:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/88220-599796e9.png",
  telefono:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/114333-2351c1eb.png",
  pago:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/1019709-861d7af5.png",
  comoPagar:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/1688568-ea314c56.png",
  verificado:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/3472625-a13f7d82.png",
  nuvIcon:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/471715-9bf7527b.png",
};

export default function ComercioVerificadoPage() {
const { 
      comercioActual: comercioData,     // Comercio cargado actualmente
    } = useComercioStore();
  return (
    <div>
      {/* Hero */}
      <section
        className="w-full bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${IMAGES.heroBg})` }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-[214px] md:h-[286px] lg:h-[387px] xl:h-[454px]" />
        </div>
      </section>

      {/* Información Verificada */}
      <section
        id="informacion-verificada"
        className="relative w-full bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${IMAGES.infoBg})`,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 text-white">
          <h1 className="text-center text-4xl font-semibold">{comercioData?.razon_social || 'Comercio'}</h1>
          <h2 className="mt-4 text-center text-base font-light">
            Información Verificada
            <img
              src={IMAGES.verificado}
              alt="Verificado"
              className="inline-block align-[-2px] ml-2 h-5 w-5"
            />
          </h2>

          {/* NUV */}
          <div className="w-full flex justify-center">
            {comercioData?.codigo_nuv && (
            <a
              href="#popup-f407"
              className="mx-auto mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2 font-semibold text-black shadow hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              NUV: {rellenarNumero(5, comercioData?.codigo_nuv)}
              <img src={IMAGES.nuvIcon} alt="NUV" className="h-4 w-4" />
            </a>
          )}
          </div>

          {/* Grid de info */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Card helper */}
            {[
              {
                icon: IMAGES.razon,
                title: "razón social",
                value: comercioData?.razon_social || "No disponible",
              },
              { 
                icon: IMAGES.ruc, 
                title: "ruc", 
                value: comercioData?.ruc || "No disponible" 
              },
              { 
                icon: IMAGES.ubicacion, 
                title: "ubicación", 
                value: comercioData?.direccion || "No disponible" 
              },
              { 
                icon: IMAGES.whatsapp, 
                title: "whatsapp", 
                value: comercioData?.telefono ? 
                  `${comercioData.dial_code ? `+${comercioData.dial_code} ` : ''}${comercioData.telefono}` : 
                  "No disponible" 
              },
              { 
                icon: IMAGES.telefono, 
                title: "Teléfono", 
                value: comercioData?.telefono ? 
                  `${comercioData.dial_code ? `+${comercioData.dial_code} ` : ''}${comercioData.telefono}` : 
                  "No disponible" 
              },
              { 
                icon: IMAGES.pago, 
                title: "contacto", 
                value: comercioData?.correo_empresa || "Consultar" 
              },
              { 
                icon: IMAGES.comoPagar, 
                title: "ubicación maps", 
                value: comercioData?.urlmaps ? (
                  <a 
                    href={comercioData.urlmaps} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:text-emerald-200 underline"
                  >
                    Ver ubicación
                  </a>
                ) : "No disponible" 
              },
            ].map((item, idx) => (
              <article
                key={idx}
                className="group relative mx-auto w-full max-w-[260px] rounded-2xl bg-neutral-900/40 p-4 text-center shadow-xl ring-1 ring-emerald-400/70 backdrop-blur-sm transition hover:translate-y-[-2px] hover:shadow-2xl"
              >
                <img src={item.icon} alt="" className="mx-auto h-10 w-10" />
                <h3 className="mt-2 text-lg font-bold uppercase tracking-wide">
                  {item.title}
                </h3>
                <div className="mt-0.5 text-sm italic font-light text-neutral-100">
                  {typeof item.value === 'string' ? item.value : item.value}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
