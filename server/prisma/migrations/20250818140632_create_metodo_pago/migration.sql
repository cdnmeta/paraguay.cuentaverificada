-- CreateTable
CREATE TABLE "public"."metodo_pagos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "cod_set" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "metodo_pagos_pkey" PRIMARY KEY ("id")
);
