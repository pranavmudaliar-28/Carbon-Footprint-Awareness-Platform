-- CreateTable
CREATE TABLE "GridSnapshot" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "intensityGco2" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GridSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffsetAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "offsetKg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OffsetAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GridSnapshot_region_fetchedAt_idx" ON "GridSnapshot"("region", "fetchedAt");

-- CreateIndex
CREATE INDEX "OffsetAction_userId_createdAt_idx" ON "OffsetAction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "OffsetAction" ADD CONSTRAINT "OffsetAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
