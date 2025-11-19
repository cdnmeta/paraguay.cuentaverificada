-- CreateTable
CREATE TABLE "public"."paises" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo_iso_2" TEXT,
    "codigo_iso_3" TEXT,
    "dial_code" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "paises_pkey" PRIMARY KEY ("id")
);
