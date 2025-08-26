/*
  Warnings:

  - Added the required column `monto_base` to the `pagos_factura_suscripciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pagos_factura_suscripciones" ADD COLUMN     "monto_base" DOUBLE PRECISION NOT NULL;
