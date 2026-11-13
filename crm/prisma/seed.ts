/* Loads the demo dataset into the configured database.
 * Run with: npx prisma db push && npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { demoClients, demoLeads } from "../lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Nettoyage des tables…");
  await prisma.transaction.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.emailMessage.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.carRental.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ Administrateur…");
  await prisma.user.create({
    data: {
      name: "Fouad Benali",
      email: "direction@maisonbenali.com",
      // Remplacez ce hash par un vrai mot de passe avant toute mise en ligne.
      passwordHash: "$2b$10$demo.hash.replace.me",
      role: "OWNER",
    },
  });

  console.log("→ Leads et clients…");
  for (const lead of demoLeads) {
    await prisma.lead.create({
      data: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        interest: lead.interest,
        source: lead.source,
        budget: lead.budget,
        notes: lead.notes,
        tags: lead.tags,
        createdAt: new Date(lead.createdAt),
      },
    });
  }

  for (const client of demoClients) {
    await prisma.client.create({
      data: {
        id: client.id,
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        tags: client.tags,
        notes: client.notes,
        createdAt: new Date(client.createdAt),
      },
    });
  }

  console.log("→ Réservations, locations, projets, transactions, médias, emails…");
  const { demoBookings, demoRentals, demoProjects, demoTransactions, demoMedia, demoEmails } =
    await import("../lib/demo-data");

  for (const booking of demoBookings) {
    await prisma.booking.create({
      data: {
        id: booking.id,
        reference: booking.reference,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        serviceType: booking.serviceType,
        startsAt: new Date(booking.startsAt),
        endsAt: booking.endsAt ? new Date(booking.endsAt) : null,
        status: booking.status,
        price: booking.price,
        notes: booking.notes,
      },
    });
  }

  for (const rental of demoRentals) {
    await prisma.carRental.create({
      data: {
        id: rental.id,
        reference: rental.reference,
        vehicle: rental.vehicle,
        vehiclePlate: rental.vehiclePlate,
        clientName: rental.clientName,
        clientEmail: rental.clientEmail,
        clientPhone: rental.clientPhone,
        pickupAt: new Date(rental.pickupAt),
        dropoffAt: new Date(rental.dropoffAt),
        pickupLocation: rental.pickupLocation,
        dailyRate: rental.dailyRate,
        totalPrice: rental.totalPrice,
        deposit: rental.deposit,
        depositPaid: rental.depositPaid,
        agreementSigned: rental.agreementSigned,
        driverName: rental.driverName,
        driverLicense: rental.driverLicense,
        notes: rental.notes,
        status: rental.status,
      },
    });
  }

  for (const project of demoProjects) {
    await prisma.project.create({
      data: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        description: project.description,
        status: project.status,
        budget: project.budget,
        startsAt: project.startsAt ? new Date(project.startsAt) : null,
        endsAt: project.endsAt ? new Date(project.endsAt) : null,
        tags: project.tags,
        milestones: project.milestones,
        coverUrl: project.coverUrl,
      },
    });
  }

  for (const tx of demoTransactions) {
    await prisma.transaction.create({
      data: {
        id: tx.id,
        reference: tx.reference,
        label: tx.label,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        method: tx.method,
        stream: tx.stream,
        occurredAt: new Date(tx.occurredAt),
      },
    });
  }

  for (const asset of demoMedia) {
    await prisma.mediaAsset.create({
      data: {
        id: asset.id,
        url: asset.url,
        filename: asset.filename,
        alt: asset.alt,
        mimeType: asset.mimeType,
        size: asset.size,
        width: asset.width,
        height: asset.height,
        pageSlot: asset.pageSlot,
        sectionKey: asset.sectionKey,
        sortOrder: asset.sortOrder,
        active: asset.active,
        createdAt: new Date(asset.createdAt),
      },
    });
  }

  for (const email of demoEmails) {
    await prisma.emailMessage.create({
      data: {
        id: email.id,
        fromName: email.fromName,
        fromEmail: email.fromEmail,
        toEmail: email.toEmail,
        subject: email.subject,
        snippet: email.snippet,
        body: email.body,
        status: email.status,
        provider: email.provider,
        threadKey: email.threadKey,
        isOutbound: email.isOutbound,
        receivedAt: new Date(email.receivedAt),
      },
    });
  }

  console.log("✓ Seed terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
