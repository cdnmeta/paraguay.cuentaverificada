-- CreateTable
CREATE TABLE "public"."tipo_estado_animo" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipo_estado_animo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."estados_animos" ADD CONSTRAINT "fk_tipo_estado_animo_id_estados_animos" FOREIGN KEY ("id_tipo_animo") REFERENCES "public"."tipo_estado_animo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
