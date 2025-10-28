-- CreateTable
CREATE TABLE "public"."semaforo_abonos" (
    "id" SERIAL NOT NULL,
    "id_semaforo_movimiento" INTEGER NOT NULL,
    "monto_abono" DOUBLE PRECISION NOT NULL,
    "tipo_abono" INTEGER NOT NULL,
    "id_moneda" INTEGER NOT NULL,
    "observacion" TEXT,
    "fecha_abono" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "semaforo_abonos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."semaforo_abonos" ADD CONSTRAINT "fk_semaforo_movimientos_id_semaforo_abonos" FOREIGN KEY ("id_semaforo_movimiento") REFERENCES "public"."semaforo_movimientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
