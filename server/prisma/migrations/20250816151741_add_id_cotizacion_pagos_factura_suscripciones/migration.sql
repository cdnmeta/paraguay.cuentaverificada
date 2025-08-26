-- AlterTable
ALTER TABLE "public"."pagos_factura_suscripciones" ADD COLUMN     "id_cotizacion" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."pagos_factura_suscripciones" ADD CONSTRAINT "fk_cotizacion_pago" FOREIGN KEY ("id_cotizacion") REFERENCES "public"."cotizacion_empresa"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
