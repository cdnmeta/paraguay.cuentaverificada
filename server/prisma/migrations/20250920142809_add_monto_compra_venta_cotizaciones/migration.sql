-- AlterTable
ALTER TABLE "public"."cotizacion_empresa" ADD COLUMN     "monto_compra" DOUBLE PRECISION,
ADD COLUMN     "monto_venta" DOUBLE PRECISION,
ALTER COLUMN "monto" DROP NOT NULL;
