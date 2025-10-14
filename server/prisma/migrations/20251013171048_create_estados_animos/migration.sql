-- CreateTable
CREATE TABLE "public"."estados_animos" (
    "id" SERIAL NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "id_tipo_animo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estados_animos_pkey" PRIMARY KEY ("id")
);
