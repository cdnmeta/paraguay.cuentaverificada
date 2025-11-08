-- CreateTable
CREATE TABLE "public"."wallet" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_estado" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id_moneda" INTEGER,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallet_movimientos" (
    "id" SERIAL NOT NULL,
    "id_wallet" INTEGER NOT NULL,
    "id_tipo_movimiento" INTEGER NOT NULL,
    "id_estado" INTEGER,
    "monto" DOUBLE PRECISION,
    "url_imagen" TEXT,
    "observacion" TEXT,
    "id_usuario_verificador" INTEGER,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "fecha_verificacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "wallet_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tipo_movimiento_wallet" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo_movimiento" INTEGER,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),

    CONSTRAINT "tipo_movimiento_wallet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."wallet" ADD CONSTRAINT "wallet_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet" ADD CONSTRAINT "wallet_id_moneda_fkey" FOREIGN KEY ("id_moneda") REFERENCES "public"."monedas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet_movimientos" ADD CONSTRAINT "wallet_movimientos_id_wallet_fkey" FOREIGN KEY ("id_wallet") REFERENCES "public"."wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet_movimientos" ADD CONSTRAINT "wallet_movimientos_id_tipo_movimiento_fkey" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "public"."tipo_movimiento_wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet_movimientos" ADD CONSTRAINT "wallet_movimientos_id_usuario_verificador_fkey" FOREIGN KEY ("id_usuario_verificador") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
