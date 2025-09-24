import React from "react";
import { PhotoView, PhotoProvider } from "react-photo-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Eye } from "lucide-react";
import "react-photo-view/dist/react-photo-view.css";

const ImagenesRecordatorioModal = ({ imagenes = [], descripcion = "Recordatorio" }) => {
  if (!imagenes || imagenes.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className="flex items-center gap-1 h-8 px-2">
        <ImageIcon className="h-3 w-3" />
        Sin imágenes
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2">
          <Eye className="h-3 w-3" />
          Ver ({imagenes.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imágenes del Recordatorio
          </DialogTitle>
          <DialogDescription>
            {descripcion} - {imagenes.length} imagen{imagenes.length > 1 ? 'es' : ''}
          </DialogDescription>
        </DialogHeader>
        
        <PhotoProvider
          maskOpacity={0.7}
          maskClosable
          onVisibleChange={(open) => {
        document.body.style.pointerEvents = open ? "auto" : "none";
      }}
          toolbarRender={({ onScale, scale, rotate, onRotate }) => {
            return (
              <div className="flex items-center gap-2 text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onScale(scale + 0.2)}
                  className="text-white hover:text-gray-300"
                >
                  Zoom+
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onScale(scale - 0.2)}
                  className="text-white hover:text-gray-300"
                >
                  Zoom-
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRotate(rotate + 90)}
                  className="text-white hover:text-gray-300"
                >
                  Rotar
                </Button>
              </div>
            );
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {imagenes.map((url, index) => (
              <div key={index} className="relative group">
                <PhotoView src={url}>
                  <div className="cursor-pointer transform transition-transform hover:scale-105">
                    <img
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>
                </PhotoView>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1} de {imagenes.length}
                </div>
              </div>
            ))}
          </div>
        </PhotoProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ImagenesRecordatorioModal;