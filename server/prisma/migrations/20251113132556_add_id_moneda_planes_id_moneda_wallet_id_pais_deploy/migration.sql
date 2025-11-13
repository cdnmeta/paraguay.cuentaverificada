-- AlterTable
ALTER TABLE "public"."empresa_config" ADD COLUMN     "id_moneda_planes" INTEGER,
ADD COLUMN     "id_moneda_wallet" INTEGER,
ADD COLUMN     "id_pais_deploy" INTEGER,
ALTER COLUMN "id_moneda_base" DROP NOT NULL;
