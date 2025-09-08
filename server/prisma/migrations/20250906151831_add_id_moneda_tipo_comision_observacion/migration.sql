/*
  Warnings:

  - Added the required column `tipo_ganancia` to the `ganancias_futuras` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ganancias_futuras" ADD COLUMN     "id_moneda" INTEGER,
ADD COLUMN     "observacion" TEXT,
ADD COLUMN     "tipo_ganancia" INTEGER,
ALTER COLUMN "id_factura" DROP NOT NULL;
