import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export default function ConfirmDialog({
  confirmDialogTitle = "¿Estás seguro?",
  confirmDialogDescripcion = "Esta acción no se puede deshacer.",
  confirmLabelText = "Confirmar",
  cancelLabelText = "Cancelar",
  buttonActivate = <Button variant="outline">Mostrar diálogo</Button>,
  onConfirm = () => {},
  onCancel = () => {},
  isDestructive = false,
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {buttonActivate}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmDialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmDialogDescripcion}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelLabelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isDestructive ? "bg-destructive text-white hover:bg-destructive/90" : ""}
          >
            {confirmLabelText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
