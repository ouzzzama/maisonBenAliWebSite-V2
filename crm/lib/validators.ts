import { z } from "zod";

export const leadStatusEnum = z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]);
export const interestEnum = z.enum([
  "ACHAT",
  "VENTE",
  "LOCATION",
  "CONCIERGERIE",
  "CARS",
  "PROJET",
  "VEFA",
  "GESTION",
]);

const phone = z
  .string()
  .trim()
  .min(6, "Numéro trop court")
  .max(24, "Numéro trop long")
  .optional()
  .or(z.literal(""));

export const leadSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  phone,
  company: z.string().trim().optional().or(z.literal("")),
  status: leadStatusEnum,
  interest: interestEnum,
  source: z.string().trim().optional().or(z.literal("")),
  budget: z.coerce.number().nonnegative("Montant invalide").optional(),
  notes: z.string().trim().optional().or(z.literal("")),
  tags: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const clientSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  phone,
  company: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  tags: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const bookingSchema = z.object({
  clientName: z.string().trim().min(2, "Client requis"),
  clientEmail: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  clientPhone: phone,
  serviceType: z.string().trim().min(2, "Service requis"),
  startsAt: z.string().min(1, "Date de début requise"),
  endsAt: z.string().optional().or(z.literal("")),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
  price: z.coerce.number().nonnegative().optional(),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const rentalSchema = z
  .object({
    vehicle: z.string().trim().min(2, "Véhicule requis"),
    vehiclePlate: z.string().trim().optional().or(z.literal("")),
    clientName: z.string().trim().min(2, "Client requis"),
    clientEmail: z.string().trim().email("Email invalide").optional().or(z.literal("")),
    clientPhone: phone,
    pickupAt: z.string().min(1, "Date de départ requise"),
    dropoffAt: z.string().min(1, "Date de retour requise"),
    pickupLocation: z.string().trim().optional().or(z.literal("")),
    dailyRate: z.coerce.number().positive("Tarif journalier requis"),
    deposit: z.coerce.number().nonnegative().optional(),
    depositPaid: z.boolean().optional(),
    agreementSigned: z.boolean().optional(),
    driverName: z.string().trim().optional().or(z.literal("")),
    driverLicense: z.string().trim().optional().or(z.literal("")),
    status: z.enum(["RESERVED", "ACTIVE", "COMPLETED", "CANCELLED"]),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.dropoffAt) > new Date(data.pickupAt), {
    message: "Le retour doit suivre le départ",
    path: ["dropoffAt"],
  });

export type RentalInput = z.infer<typeof rentalSchema>;

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Titre requis"),
  description: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["PLANNED", "ACTIVE", "PAUSED", "COMPLETED"]),
  budget: z.coerce.number().nonnegative().optional(),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  tags: z.string().optional(),
  milestones: z.string().optional(),
  coverUrl: z.string().trim().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const transactionSchema = z.object({
  label: z.string().trim().min(3, "Libellé requis"),
  amount: z.coerce.number().positive("Montant requis"),
  type: z.enum(["PAYMENT", "DEPOSIT", "REFUND", "EXPENSE"]),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
  method: z.string().trim().optional().or(z.literal("")),
  stream: z.string().trim().optional().or(z.literal("")),
  occurredAt: z.string().min(1, "Date requise"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const mediaSchema = z.object({
  url: z.string().trim().min(3, "Fichier ou URL requis"),
  filename: z.string().trim().optional().or(z.literal("")),
  alt: z.string().trim().optional().or(z.literal("")),
  pageSlot: z.enum([
    "HOME_HERO",
    "HOME_GALLERY",
    "ABOUT_HERO",
    "CONTACT_BANNER",
    "PORTFOLIO_COVER",
    "PROJECTS_SHOWCASE",
    "CARS_BANNER",
    "BLOG_COVER",
    "OTHER",
  ]),
  sectionKey: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
});

export type MediaInput = z.infer<typeof mediaSchema>;
