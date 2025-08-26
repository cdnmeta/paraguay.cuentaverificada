import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

export const AlertWithBody = ({
  title = "¿Estás seguro?",
  description,
  trigger = <Button variant="outline">Abrir</Button>,
  body,
  actionText = "Aceptar",
  cancelText,
  footerChildren = null, // componente opcional para pasar botones adicionales
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-h-[90vh] overflow-y-auto w-[90vw] max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {body}
        {
            footerChildren && (
                <AlertDialogFooter>
                    {footerChildren}
                </AlertDialogFooter>
            )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
