-- CreateTable
CREATE TABLE "UserStatistic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pdfCount" INTEGER NOT NULL DEFAULT 0,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "directPrintCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserStatistic_userId_date_idx" ON "UserStatistic"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatistic_userId_date_key" ON "UserStatistic"("userId", "date");
