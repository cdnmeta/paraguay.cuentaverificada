/*
  Warnings:

  - Added the required column `id_usuario` to the `pagos_factura_suscripciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pagos_factura_suscripciones" ADD COLUMN     "id_usuario" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."pagos_factura_suscripciones" ADD CONSTRAINT "pagos_factura_suscripciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
