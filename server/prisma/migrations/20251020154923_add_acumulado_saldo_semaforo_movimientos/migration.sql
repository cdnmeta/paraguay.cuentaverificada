-- AlterTable
ALTER TABLE "public"."semaforo_movimientos" ADD COLUMN     "acumulado" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "saldo" DOUBLE PRECISION DEFAULT 0;
