/*
  Warnings:

  - You are about to drop the `UserStatistic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "UserStatistic";

-- CreateTable
CREATE TABLE "user_statistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pdfCount" INTEGER NOT NULL DEFAULT 0,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "directPrintCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_statistics_userId_date_idx" ON "user_statistics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_statistics_userId_date_key" ON "user_statistics"("userId", "date");
