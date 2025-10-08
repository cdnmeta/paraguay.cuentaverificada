-- CreateTable
CREATE TABLE "public"."usuarios_comercios_fav" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_comercio" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_comercios_fav_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_comercios_fav_id_usuario_id_comercio_key" ON "public"."usuarios_comercios_fav"("id_usuario", "id_comercio");

-- AddForeignKey
ALTER TABLE "public"."usuarios_comercios_fav" ADD CONSTRAINT "fk_usuarios_id_usuarios_fav_comercios" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios_comercios_fav" ADD CONSTRAINT "fk_comercios_id_usuarios_fav_comercios" FOREIGN KEY ("id_comercio") REFERENCES "public"."comercio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
