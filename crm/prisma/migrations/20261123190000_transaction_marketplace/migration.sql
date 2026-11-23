-- Portail de diffusion à l'origine de l'encaissement (airbnb, mubawab, avito, hespress)
ALTER TABLE "Transaction" ADD COLUMN "marketplace" TEXT;
