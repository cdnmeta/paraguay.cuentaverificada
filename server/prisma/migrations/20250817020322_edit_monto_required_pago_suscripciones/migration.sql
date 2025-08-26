/*
  Warnings:

  - Made the column `monto` on table `pagos_factura_suscripciones` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."pagos_factura_suscripciones" ALTER COLUMN "monto" SET NOT NULL;
