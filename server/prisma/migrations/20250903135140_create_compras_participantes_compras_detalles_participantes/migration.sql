-- CreateTable
CREATE TABLE "public"."compras_participantes" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_usuario_creacion" INTEGER,
    "id_usuario_actualizacion" INTEGER,
    "total_meta" DOUBLE PRECISION,
    "porcentaje_participacion" DOUBLE PRECISION,
    "activo" BOOLEAN DEFAULT true,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),

    CONSTRAINT "compras_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compras_detalles_participantes" (
    "id" SERIAL NOT NULL,
    "id_compras_participantes" INTEGER NOT NULL,
    "monto_meta" DOUBLE PRECISION NOT NULL,
    "total_venta" DOUBLE PRECISION NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "id_moneda" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN DEFAULT true,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "id_usuario_creacion" INTEGER,
    "id_usuario_actualizacion" INTEGER,

    CONSTRAINT "compras_detalles_participantes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."compras_detalles_participantes" ADD CONSTRAINT "fk_compras_participantes_id_compras_detalles_participantes" FOREIGN KEY ("id_compras_participantes") REFERENCES "public"."compras_participantes"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
