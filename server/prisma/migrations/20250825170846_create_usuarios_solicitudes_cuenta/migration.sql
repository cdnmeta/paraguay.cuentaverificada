-- CreateTable
CREATE TABLE "public"."usuarios_solicitudes_cuenta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "codigo_pais" TEXT,
    "dial_code" TEXT,
    "cedula_frontal" TEXT,
    "cedula_reverso" TEXT,
    "id_estado" INTEGER NOT NULL DEFAULT 1,
    "observacion" TEXT,
    "fecha_creacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ,
    "fecha_anulacion" TIMESTAMPTZ,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id_usuario_actualizacion" INTEGER,
    "id_usuario_anulacion" INTEGER,

    CONSTRAINT "usuarios_solicitudes_cuenta_pkey" PRIMARY KEY ("id")
);
