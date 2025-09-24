-- AlterTable
ALTER TABLE "public"."recordatorios" ADD COLUMN     "titulo" TEXT,
ALTER COLUMN "descripcion" DROP NOT NULL;
