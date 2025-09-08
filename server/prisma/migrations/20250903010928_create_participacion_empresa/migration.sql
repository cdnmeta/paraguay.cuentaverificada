-- CreateTable
CREATE TABLE "public"."participacion_empresa" (
    "id" SERIAL NOT NULL,
    "total_participacion" DECIMAL(10,2),
    "total_vendido" DECIMAL(10,2),
    "saldo_participacion" DECIMAL(10,2),
    "precio_meta" DECIMAL(10,2),
    "nombre_meta" TEXT,
    "porcentaje_participantes_primera_venta" DECIMAL(10,2),
    "porcentaje_participantes_recurrente" DECIMAL(10,2),
    "porcentaje_empresa_primera_venta" DECIMAL(10,2),
    "porcentaje_empresa_recurrente" DECIMAL(10,2),
    "porcentaje_vendedores_primera_venta" DECIMAL(10,2),
    "porcentaje_vendedores_recurrente" DECIMAL(10,2),
    "fecha_creacion" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "id_usuario_creacion" INTEGER,
    "id_usuario_actualizacion" INTEGER,

    CONSTRAINT "participacion_empresa_pkey" PRIMARY KEY ("id")
);
