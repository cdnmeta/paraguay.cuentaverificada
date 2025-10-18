-- AlterTable
ALTER TABLE "public"."ticket" ADD COLUMN     "id_usuario_cierre" INTEGER,
ADD COLUMN     "id_usuario_completado" INTEGER,
ADD COLUMN     "motivo_cierre" TEXT;
