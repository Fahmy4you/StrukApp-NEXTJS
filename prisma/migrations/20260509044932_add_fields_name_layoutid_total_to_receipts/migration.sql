/*
  Warnings:

  - Added the required column `nama` to the `receipts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "layoutId" TEXT,
ADD COLUMN     "nama" TEXT NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
