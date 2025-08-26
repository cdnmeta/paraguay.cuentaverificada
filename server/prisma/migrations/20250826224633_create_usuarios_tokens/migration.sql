-- CreateTable
CREATE TABLE "public"."usuario_tokens" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMPTZ,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "usuario_tokens_pkey" PRIMARY KEY ("id")
);
