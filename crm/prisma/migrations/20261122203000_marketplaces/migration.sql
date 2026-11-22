-- Annonces diffusées sur les portails externes (Airbnb, Mubawab, Avito, Hespress).
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'airbnb',
    "title" TEXT NOT NULL,
    "productId" TEXT,
    "externalUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "price" DECIMAL(12,2),
    "views" INTEGER NOT NULL DEFAULT 0,
    "contacts" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MarketplaceListing_platform_status_idx" ON "MarketplaceListing"("platform", "status");
