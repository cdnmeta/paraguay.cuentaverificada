import React, { useState, useEffect } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { cargarURL } from "@/utils/funciones";
import "react-photo-view/dist/react-photo-view.css";

// Componente simple para mostrar imagen con URL precargada
const SimpleImage = ({ imageUrl, alt, className, onClick }) => {
  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <svg
          className="w-6 h-6 text-gray-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${className}`}
      onClick={onClick}
      loading="lazy"
    />
  );
};

// Componente para mostrar archivos multimedia con galería
const MediaGallery = ({ archivos, esMio }) => {
  const [imageUrls, setImageUrls] = useState({});

  // Separar imágenes y videos
  const images = archivos.filter((url) => {
    const extension = url.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension);
  });

  const videos = archivos.filter((url) => {
    const extension = url.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "ogg", "avi", "mov"].includes(extension);
  });

  const others = archivos.filter((url) => {
    const extension = url.split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
      extension
    );
    const isVideo = ["mp4", "webm", "ogg", "avi", "mov"].includes(extension);
    return !isImage && !isVideo;
  });

  // Cargar todas las URLs de imágenes al montar el componente
  useEffect(() => {
    const loadAllImageUrls = async () => {
      if (images.length === 0) {
        return;
      }

      const urls = {};

      // Cargar todas las URLs en paralelo
      await Promise.all(
        images.map(async (imagePath) => {
          try {
            const url = await cargarURL(imagePath);
            if (url) {
              urls[imagePath] = url;
            }
          } catch (error) {
            console.error("Error cargando imagen:", imagePath, error);
          }
        })
      );

      setImageUrls(urls);
    };

    loadAllImageUrls();
  }, []);

  if (archivos.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Galería de imágenes con PhotoView */}
      {images.length > 0 && (
        <>
          <p className="text-xs opacity-75 font-medium">
            📷 Imágenes ({images.length}):
          </p>

          <PhotoProvider>
            <div className="space-y-2">
              {/* Grid de imágenes */}
              <div
                className={`grid gap-1 ${
                  images.length === 1
                    ? "grid-cols-1"
                    : images.length === 2
                    ? "grid-cols-2"
                    : images.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2"
                } max-w-xs`}
              >
                {images.map((imagePath, index) => {
                  const imageUrl = imageUrls[imagePath];

                  return (
                    <PhotoView key={index} src={imageUrl || ""}>
                      <SimpleImage
                        imageUrl={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="rounded-2xl"
                        onClick={() => {}} // PhotoView maneja el click
                      />
                    </PhotoView>
                  );
                })}
              </div>

              {/* Contador si hay más de 4 imágenes */}
              {images.length > 4 && (
                <p className="text-xs text-gray-500">
                  +{images.length - 4} imágenes más
                </p>
              )}
            </div>
          </PhotoProvider>
        </>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs opacity-75 font-medium">
            🎥 Videos ({videos.length}):
          </p>
          {videos.map((videoPath, index) => (
            <VideoPlayer
              key={index}
              firebasePath={videoPath}
              className="max-w-xs h-32 rounded border"
            />
          ))}
        </div>
      )}

      {/* Otros archivos */}
      {others.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs opacity-75 font-medium">
            📎 Archivos ({others.length}):
          </p>
          {others.map((filePath, index) => (
            <FileDownloadLink
              key={index}
              firebasePath={filePath}
              className={`block text-xs underline hover:no-underline ${
                esMio ? "text-blue-100" : "text-blue-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para videos con carga diferida
const VideoPlayer = ({ firebasePath, className }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadVideo = async () => {
    setLoading(true);
    try {
      const url = await cargarURL(firebasePath);
      if (url) {
        setVideoUrl(url);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error cargando video:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadVideo = () => {
    if (!videoUrl && !loading && !error) {
      loadVideo();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {!videoUrl && !loading && !error && (
        <div
          className="flex items-center justify-center h-full bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={handleLoadVideo}
        >
          <div className="text-center">
            <svg
              className="w-8 h-8 text-gray-400 mx-auto mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-gray-600">Click para cargar video</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <svg
            className="w-6 h-6 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full bg-red-50 text-red-500">
          <p className="text-xs">Error al cargar video</p>
        </div>
      )}

      {videoUrl && (
        <video
          controls
          className="w-full h-full object-cover rounded"
          preload="metadata"
        >
          <source src={videoUrl} />
          Tu navegador no soporta el elemento de video.
        </video>
      )}
    </div>
  );
};

// Componente para enlaces de descarga de archivos
const FileDownloadLink = ({ firebasePath, className }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();

    if (fileUrl) {
      window.open(fileUrl, "_blank");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const url = await cargarURL(firebasePath);
      if (url) {
        setFileUrl(url);
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error cargando archivo:", error);
    } finally {
      setLoading(false);
    }
  };

  const fileName = firebasePath.split("/").pop() || "Archivo";

  return (
    <a href="#" onClick={handleDownload} className={className}>
      {loading ? (
        <span className="flex items-center">
          <svg
            className="w-3 h-3 mr-1 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando...
        </span>
      ) : (
        <span>📎 {fileName}</span>
      )}
    </a>
  );
};

export default MediaGallery;
