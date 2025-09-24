-- CreateTable
CREATE TABLE "public"."recordatorios" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "url_imagen" TEXT[],
    "id_estado" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id_usuario" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."recordatorios" ADD CONSTRAINT "fk_usuarios_id_recordatorios" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
