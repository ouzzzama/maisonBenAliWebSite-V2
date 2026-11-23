-- Photo de l'annonce, renseignée depuis le CRM (les portails externes ne sont
-- pas éditables : tout se pilote ici).
ALTER TABLE "MarketplaceListing" ADD COLUMN "imageUrl" TEXT;
