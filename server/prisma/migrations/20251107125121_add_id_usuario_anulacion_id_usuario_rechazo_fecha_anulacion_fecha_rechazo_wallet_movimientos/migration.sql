-- AlterTable
ALTER TABLE "public"."wallet_movimientos" ADD COLUMN     "fecha_anulacion" TIMESTAMPTZ(6),
ADD COLUMN     "fecha_rechazo" TIMESTAMPTZ(6),
ADD COLUMN     "id_usuario_anulacion" INTEGER,
ADD COLUMN     "id_usuario_rechazo" INTEGER;
