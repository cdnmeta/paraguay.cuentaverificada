-- CreateTable
CREATE TABLE "public"."planes_tipo_repartir" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "fechas_eliminacion" TIMESTAMPTZ(6),

    CONSTRAINT "planes_tipo_repartir_pkey" PRIMARY KEY ("id")
);
