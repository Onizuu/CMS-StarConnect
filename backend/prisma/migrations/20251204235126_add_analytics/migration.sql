-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "userId" TEXT,
    "visitorId" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgDuration" INTEGER NOT NULL DEFAULT 0,
    "topContent" JSONB,
    "topReferrers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_contentId_idx" ON "PageView"("contentId");

-- CreateIndex
CREATE INDEX "PageView_userId_idx" ON "PageView"("userId");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_visitorId_idx" ON "PageView"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsSummary_userId_idx" ON "AnalyticsSummary"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsSummary_date_idx" ON "AnalyticsSummary"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSummary_userId_date_key" ON "AnalyticsSummary"("userId", "date");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSummary" ADD CONSTRAINT "AnalyticsSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
