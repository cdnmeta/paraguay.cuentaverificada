/*
  Warnings:

  - You are about to alter the column `precio_meta` on the `participacion_empresa` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,6)`.

*/
-- AlterTable
ALTER TABLE "public"."participacion_empresa" ALTER COLUMN "precio_meta" SET DATA TYPE DECIMAL(10,6);
