-- CreateTable
CREATE TABLE "public"."entidades_bancarias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "entidades_bancarias_pkey" PRIMARY KEY ("id")
);
