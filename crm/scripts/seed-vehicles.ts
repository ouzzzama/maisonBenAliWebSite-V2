/* Amorçage de la flotte : crée les cinq véhicules Benali Cars dans la table
   Vehicle si elle est vide. Idempotent — relançable sans doublon.

   Usage : cd crm && npx tsx scripts/seed-vehicles.ts
*/

import { PrismaClient } from "@prisma/client";
import { demoVehicles } from "../lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  for (const vehicle of demoVehicles) {
    const existing = await prisma.vehicle.findUnique({ where: { slug: vehicle.slug } });
    if (existing) continue;
    await prisma.vehicle.create({
      data: {
        slug: vehicle.slug,
        name: vehicle.name,
        category: vehicle.category,
        badge: vehicle.badge,
        tagline: vehicle.tagline,
        description: vehicle.description,
        image: vehicle.image,
        alt: vehicle.alt,
        dailyRate: vehicle.dailyRate,
        weeklyRate: vehicle.weeklyRate,
        highSeasonRate: vehicle.highSeasonRate,
        seasonNote: vehicle.seasonNote,
        deposit: vehicle.deposit,
        published: vehicle.published,
        sortOrder: vehicle.sortOrder,
      },
    });
    created += 1;
  }
  const total = await prisma.vehicle.count();
  console.log(`flotte : ${created} véhicule(s) créé(s), ${total} en base`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
