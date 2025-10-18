/*
  Warnings:

  - You are about to drop the column `estado` on the `ticket` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."ticket_estado_idx";

-- AlterTable
ALTER TABLE "public"."ticket" DROP COLUMN "estado",
ADD COLUMN     "id_estado" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "ticket_id_estado_idx" ON "public"."ticket"("id_estado");
