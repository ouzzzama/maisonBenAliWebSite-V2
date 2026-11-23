-- Rang d'affichage des cartes dans les colonnes du kanban (projets et annonces).
ALTER TABLE "Project" ADD COLUMN "position" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "MarketplaceListing" ADD COLUMN "position" DOUBLE PRECISION NOT NULL DEFAULT 0;
