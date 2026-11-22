-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "deal" TEXT NOT NULL DEFAULT 'vente';

-- CreateTable
CREATE TABLE "public"."ShopItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Équipement',
    "mode" TEXT NOT NULL DEFAULT 'vente',
    "price" DECIMAL(12,2),
    "unit" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "coverUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_slug_key" ON "public"."ShopItem"("slug");

-- CreateIndex
CREATE INDEX "ShopItem_mode_published_sortOrder_idx" ON "public"."ShopItem"("mode", "published", "sortOrder");
