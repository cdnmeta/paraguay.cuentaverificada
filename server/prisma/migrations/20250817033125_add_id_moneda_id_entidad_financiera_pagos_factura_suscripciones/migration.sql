/*
  Warnings:

  - Added the required column `id_moneda` to the `pagos_factura_suscripciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pagos_factura_suscripciones" ADD COLUMN     "id_entidad_financiera" INTEGER,
ADD COLUMN     "id_moneda" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."pagos_factura_suscripciones" ADD CONSTRAINT "pagos_factura_suscripciones_id_moneda_fkey" FOREIGN KEY ("id_moneda") REFERENCES "public"."monedas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
