-- CreateTable
CREATE TABLE "public"."tipo_ticket" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket" (
    "id" SERIAL NOT NULL,
    "asunto" TEXT NOT NULL,
    "id_reportante" INTEGER,
    "id_asignado" INTEGER,
    "id_tipo_ticket" INTEGER,
    "prioridad" INTEGER DEFAULT 3,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6) NOT NULL,
    "ultimo_mensaje_at" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket_mensaje" (
    "id" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "url_archivo" TEXT[],
    "id_autor" INTEGER NOT NULL,
    "rol_autor" INTEGER NOT NULL,
    "mensaje" TEXT NOT NULL,
    "es_interno" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ticket_mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_estado_idx" ON "public"."ticket"("estado");

-- CreateIndex
CREATE INDEX "ticket_id_asignado_idx" ON "public"."ticket"("id_asignado");

-- CreateIndex
CREATE INDEX "ticket_mensaje_id_ticket_fecha_creacion_idx" ON "public"."ticket_mensaje"("id_ticket", "fecha_creacion");

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_id_tipo_ticket_fkey" FOREIGN KEY ("id_tipo_ticket") REFERENCES "public"."tipo_ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_mensaje" ADD CONSTRAINT "ticket_mensaje_id_ticket_fkey" FOREIGN KEY ("id_ticket") REFERENCES "public"."ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
