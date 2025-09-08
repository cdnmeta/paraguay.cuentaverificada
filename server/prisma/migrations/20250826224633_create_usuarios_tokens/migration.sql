-- CreateTable
CREATE TABLE "public"."tokens_usuarios_solicitudes" (
    "id" SERIAL NOT NULL,
    "id_usuario_solicitud" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMPTZ,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "tokens_usuarios_solicitudes_pkey" PRIMARY KEY ("id")
);
