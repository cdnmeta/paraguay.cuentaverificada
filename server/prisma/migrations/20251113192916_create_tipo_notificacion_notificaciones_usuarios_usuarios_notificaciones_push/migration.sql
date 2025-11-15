-- CreateTable
CREATE TABLE "public"."tipo_notificacion" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipo_notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notificaciones_usuarios" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "titulo" TEXT,
    "id_tipo_notificacion" INTEGER NOT NULL,
    "cuerpo" TEXT,
    "icono" TEXT,
    "datos" JSONB,
    "prioridad" INTEGER NOT NULL DEFAULT 3,
    "id_estado" INTEGER NOT NULL DEFAULT 1,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_envio" TIMESTAMPTZ(6),
    "fecha_actualizacion" TIMESTAMPTZ(6),

    CONSTRAINT "notificaciones_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios_notificaciones_push" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "proveedor" TEXT NOT NULL,
    "token" TEXT,
    "subscriptionJson" JSONB,
    "plataforma" TEXT,
    "user_agent" TEXT,
    "modelo_dispositivo" TEXT,
    "so_version" TEXT,
    "app_version" TEXT,
    "idioma" TEXT,
    "region" TEXT,
    "ip_origen" TEXT,
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_notificaciones_push_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."notificaciones_usuarios" ADD CONSTRAINT "fk_tipo_notificacion_id_notificaciones_usuarios" FOREIGN KEY ("id_tipo_notificacion") REFERENCES "public"."tipo_notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones_usuarios" ADD CONSTRAINT "fk_usuarios_id_notificaciones_usuarios" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios_notificaciones_push" ADD CONSTRAINT "fk_usuarios_id_usuarios_notificaciones_push" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
