import {
  AlertDialog as ShadAlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAlertDialogStore } from "@/store/useAlertDialogStore";

import {
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

const ICON_MAP = {
  info: { icon: Info, color: "text-blue-600" },
  success: { icon: CheckCircle, color: "text-green-600" },
  error: { icon: XCircle, color: "text-red-600" },
  warning: { icon: AlertTriangle, color: "text-yellow-600" },
  question: { icon: HelpCircle, color: "text-purple-600" },
};

export function AlertDialogGlobal() {
  const {
    open,
    title,
    description,
    type,
    confirmText,
    cancelText,
    showCancel,
    closeOnOutsideClick,
    onConfirm,
    closeAlert,
  } = useAlertDialogStore();

  const { icon: Icon, color } = ICON_MAP[type] || ICON_MAP.info;

  // Esta función se llama cuando cambia el estado del dialog (click afuera o escape)
  const handleOpenChange = (nextOpen) => {
    console.log("cabiuo en handleOpenChange", nextOpen);
    if (nextOpen === false && closeOnOutsideClick) {
      closeAlert();
    }
    // Si NO se permite cerrar afuera, simplemente ignoramos el cierre
  };

  const handleConfirm = () => {
    closeAlert();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    closeAlert();
  };

  return (
    <ShadAlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[350px]">
        <div className="flex flex-col items-center text-center gap-3">
          <span className={`mx-auto rounded-full bg-muted p-2 ${color}`}>
            <Icon size={38} />
          </span>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-center">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex justify-center gap-2">
          {showCancel && (
            <AlertDialogCancel onClick={handleCancel}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ShadAlertDialog>
  );
}
