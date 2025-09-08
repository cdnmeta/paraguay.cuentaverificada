-- CreateTable
CREATE TABLE "public"."ganancias_futuras" (
    "id" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "monto" DOUBLE PRECISION NOT NULL,
    "id_estado" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN DEFAULT true,
    "tipo_participante" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "id_usuario_creacion" INTEGER,
    "id_usuario_actualizacion" INTEGER,

    CONSTRAINT "ganancias_futuras_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ganancias_futuras" ADD CONSTRAINT "fk_facturas_id_ganancias_futuras" FOREIGN KEY ("id_factura") REFERENCES "public"."factura_suscripciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ganancias_futuras" ADD CONSTRAINT "fk_usuarios_id_ganancias_futuras" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
