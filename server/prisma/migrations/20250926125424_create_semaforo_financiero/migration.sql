-- CreateTable
CREATE TABLE "public"."semaforo_movimientos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo_movimiento" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "id_moneda" INTEGER NOT NULL,
    "observacion" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "semaforo_movimientos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."semaforo_movimientos" ADD CONSTRAINT "fk_usuarios_id_semaforo_movimientos" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."semaforo_movimientos" ADD CONSTRAINT "fk_monedas_id_semaforo_movimientos" FOREIGN KEY ("id_moneda") REFERENCES "public"."monedas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
