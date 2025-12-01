-- CreateTable
CREATE TABLE "public"."planes_porcentajes_repartir" (
    "id" SERIAL NOT NULL,
    "id_plan" INTEGER NOT NULL,
    "id_tipo" INTEGER NOT NULL,
    "porcentaje_primera_venta" DOUBLE PRECISION NOT NULL,
    "porcentaje_venta_recurrente" DOUBLE PRECISION NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "planes_porcentajes_repartir_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "planes_porcentajes_repartir_id_plan_id_tipo_key" ON "public"."planes_porcentajes_repartir"("id_plan", "id_tipo");

-- AddForeignKey
ALTER TABLE "public"."planes_porcentajes_repartir" ADD CONSTRAINT "fk_planes_porcentajes_repartir" FOREIGN KEY ("id_plan") REFERENCES "public"."planes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
