-- CreateTable
CREATE TABLE "public"."direcciones_usuarios" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "url_maps" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id_usuario" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),

    CONSTRAINT "direcciones_usuarios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."direcciones_usuarios" ADD CONSTRAINT "fk_usuarios_id_direcciones_usuarios" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
