-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_layoutId_fkey";

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
