/* ------------------------------------------------------------------ types */

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";
export type ServiceInterest =
  | "ACHAT"
  | "VENTE"
  | "LOCATION"
  | "CONCIERGERIE"
  | "CARS"
  | "PROJET"
  | "VEFA"
  | "GESTION";
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type RentalStatus = "RESERVED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type ProjectStatus = "PLANNED" | "ACTIVE" | "PAUSED" | "COMPLETED";
export type EmailStatus = "UNREAD" | "READ" | "ARCHIVED" | "CONVERTED";
export type TransactionType = "PAYMENT" | "DEPOSIT" | "REFUND" | "EXPENSE";
export type TransactionStatus = "PENDING" | "PAID" | "OVERDUE";
export type PageSlot =
  | "HOME_HERO"
  | "HOME_GALLERY"
  | "ABOUT_HERO"
  | "CONTACT_BANNER"
  | "PORTFOLIO_COVER"
  | "PROJECTS_SHOWCASE"
  | "CARS_BANNER"
  | "BLOG_COVER"
  | "OTHER";

export type Lead = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  interest: ServiceInterest;
  source: string | null;
  budget: number | null;
  notes: string | null;
  tags: string[];
  createdAt: string;
};

export type Client = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  tags: string[];
  notes: string | null;
  leadId: string | null;
  createdAt: string;
};

export type EmailMessage = {
  id: string;
  fromName: string | null;
  fromEmail: string;
  toEmail: string;
  subject: string;
  snippet: string | null;
  body: string;
  status: EmailStatus;
  provider: string;
  threadKey: string | null;
  isOutbound: boolean;
  receivedAt: string;
  leadId: string | null;
};

export type Booking = {
  id: string;
  reference: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  serviceType: string;
  startsAt: string;
  endsAt: string | null;
  status: BookingStatus;
  price: number | null;
  notes: string | null;
  clientId: string | null;
};

export type CarRental = {
  id: string;
  reference: string;
  vehicle: string;
  vehiclePlate: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  pickupAt: string;
  dropoffAt: string;
  pickupLocation: string;
  dailyRate: number;
  totalPrice: number | null;
  deposit: number | null;
  depositPaid: boolean;
  agreementSigned: boolean;
  driverName: string | null;
  driverLicense: string | null;
  notes: string | null;
  status: RentalStatus;
  clientId: string | null;
};

export type Milestone = { title: string; dueAt: string; done: boolean };

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  startsAt: string | null;
  endsAt: string | null;
  tags: string[];
  milestones: Milestone[];
  coverUrl: string | null;
  clientId: string | null;
};

export type Transaction = {
  id: string;
  reference: string;
  label: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  method: string | null;
  stream: string | null;
  occurredAt: string;
  clientId: string | null;
  bookingId: string | null;
  rentalId: string | null;
  projectId: string | null;
};

export type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  alt: string | null;
  mimeType: string;
  size: number | null;
  width: number | null;
  height: number | null;
  pageSlot: PageSlot;
  sectionKey: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  projectId: string | null;
};

/* ------------------------------------------------------------- utilities */

const iso = (daysAgo: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const isoIn = (daysAhead: number, hour = 14) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

/* ---------------------------------------------------------------- leads */

export const demoLeads: Lead[] = [
  {
    id: "ld_01",
    fullName: "Youssef El Amrani",
    email: "y.elamrani@gmail.com",
    phone: "+212 662 41 08 74",
    company: null,
    status: "NEW",
    interest: "ACHAT",
    source: "Instagram",
    budget: 1850000,
    notes: "Cherche un appartement 3 chambres avec vue mer, livraison 2027.",
    tags: ["MRE", "Vue mer"],
    createdAt: iso(1, 9),
  },
  {
    id: "ld_02",
    fullName: "Sofia Benjelloun",
    email: "sofia.b@outlook.fr",
    phone: "+33 6 71 88 45 20",
    company: "Atlas Invest",
    status: "QUALIFIED",
    interest: "VEFA",
    source: "Google Ads",
    budget: 2400000,
    notes: "Investisseuse MRE, souhaite 2 lots VEFA pour du locatif.",
    tags: ["MRE", "Investisseur"],
    createdAt: iso(3, 11),
  },
  {
    id: "ld_03",
    fullName: "Karim Ouazzani",
    email: "k.ouazzani@maisonbenali.ma",
    phone: "+212 661 22 97 05",
    company: "Ksar Hospitality",
    status: "CONTACTED",
    interest: "CONCIERGERIE",
    source: "Recommandation",
    budget: 900000,
    notes: "Gère 6 appartements à Founty, veut sortir de la location courte sans gestion.",
    tags: ["B2B", "Conciergerie"],
    createdAt: iso(6, 15),
  },
  {
    id: "ld_04",
    fullName: "Nadia Cherkaoui",
    email: "nadia.cherkaoui@gmail.com",
    phone: "+212 670 55 12 88",
    company: null,
    status: "NEW",
    interest: "CARS",
    source: "WhatsApp",
    budget: 12000,
    notes: "Séjour 10 jours en décembre, demande un SUV avec chauffeur.",
    tags: ["Location"],
    createdAt: iso(2, 18),
  },
  {
    id: "ld_05",
    fullName: "Groupe Al Baraka",
    email: "contact@albaraka-dev.ma",
    phone: "+212 528 84 60 12",
    company: "Al Baraka Développement",
    status: "QUALIFIED",
    interest: "PROJET",
    source: "Salon immobilier",
    budget: 7800000,
    notes: "Terrain 2 400 m² à Tikiouine, étude de faisabilité demandée.",
    tags: ["Promoteur", "Terrain"],
    createdAt: iso(9, 10),
  },
  {
    id: "ld_06",
    fullName: "Hicham Rami",
    email: "hicham.rami@yahoo.fr",
    phone: "+212 663 78 20 41",
    company: null,
    status: "WON",
    interest: "VENTE",
    source: "Site web",
    budget: 1450000,
    notes: "Villa vendue, dossier notaire en cours.",
    tags: ["Vente"],
    createdAt: iso(14, 12),
  },
  {
    id: "ld_07",
    fullName: "Leila Fassi",
    email: "leila.fassi@gmail.com",
    phone: "+212 665 90 33 17",
    company: null,
    status: "LOST",
    interest: "ACHAT",
    source: "Instagram",
    budget: 700000,
    notes: "Budget trop bas pour le segment visé.",
    tags: ["Achat"],
    createdAt: iso(21, 16),
  },
  {
    id: "ld_08",
    fullName: "Imane Tazi",
    email: "i.tazi@cabinetmre.ma",
    phone: "+212 664 12 55 09",
    company: "Cabinet MRE Conseil",
    status: "CONTACTED",
    interest: "GESTION",
    source: "LinkedIn",
    budget: 300000,
    notes: "Cherche un mandat de gestion patrimoniale pour 3 clients MRE.",
    tags: ["B2B", "Gestion"],
    createdAt: iso(4, 14),
  },
];

/* -------------------------------------------------------------- clients */

export const demoClients: Client[] = [
  {
    id: "cl_01",
    fullName: "Hicham Rami",
    email: "hicham.rami@yahoo.fr",
    phone: "+212 663 78 20 41",
    company: null,
    address: "Résidence Al Amal, Agadir",
    tags: ["Vente", "VIP"],
    notes: "Villa vendue en octobre. Client historique, 3 opérations.",
    leadId: "ld_06",
    createdAt: iso(14, 12),
  },
  {
    id: "cl_02",
    fullName: "Sofia Benjelloun",
    email: "sofia.b@outlook.fr",
    phone: "+33 6 71 88 45 20",
    company: "Atlas Invest",
    address: "Casablanca / Paris",
    tags: ["MRE", "Investisseur"],
    notes: "Deux lots VEFA signés, échéancier de paiement en cours.",
    leadId: null,
    createdAt: iso(28, 10),
  },
  {
    id: "cl_03",
    fullName: "Karim Ouazzani",
    email: "k.ouazzani@maisonbenali.ma",
    phone: "+212 661 22 97 05",
    company: "Ksar Hospitality",
    address: "Founty, Agadir",
    tags: ["B2B", "Conciergerie"],
    notes: "Mandat conciergerie 6 unités, reporting mensuel.",
    leadId: null,
    createdAt: iso(40, 9),
  },
  {
    id: "cl_04",
    fullName: "Nadia Cherkaoui",
    email: "nadia.cherkaoui@gmail.com",
    phone: "+212 670 55 12 88",
    company: null,
    address: "Marrakech",
    tags: ["Location"],
    notes: "Cliente fidèle Benali Cars, 4 séjours en 2 ans.",
    leadId: null,
    createdAt: iso(90, 15),
  },
  {
    id: "cl_05",
    fullName: "Groupe Al Baraka",
    email: "contact@albaraka-dev.ma",
    phone: "+212 528 84 60 12",
    company: "Al Baraka Développement",
    address: "Tikiouine, Agadir",
    tags: ["Promoteur"],
    notes: "Partenariat de promotion sur 2 opérations.",
    leadId: null,
    createdAt: iso(120, 11),
  },
];

/* ------------------------------------------------------------- bookings */

export const demoBookings: Booking[] = [
  {
    id: "bk_01",
    reference: "BK-2411",
    clientName: "Sofia Benjelloun",
    clientEmail: "sofia.b@outlook.fr",
    clientPhone: "+33 6 71 88 45 20",
    serviceType: "Visite VEFA — Résidence Founty",
    startsAt: isoIn(2, 11),
    endsAt: isoIn(2, 12),
    status: "CONFIRMED",
    price: 0,
    notes: "Visite du showroom + plans 3D.",
    clientId: "cl_02",
  },
  {
    id: "bk_02",
    reference: "BK-2412",
    clientName: "Nadia Cherkaoui",
    clientEmail: "nadia.cherkaoui@gmail.com",
    clientPhone: "+212 670 55 12 88",
    serviceType: "Location SUV + chauffeur",
    startsAt: isoIn(4, 9),
    endsAt: isoIn(9, 9),
    status: "PENDING",
    price: 6900,
    notes: "Livraison aéroport Al Massira.",
    clientId: "cl_04",
  },
  {
    id: "bk_03",
    reference: "BK-2413",
    clientName: "Groupe Al Baraka",
    clientEmail: "contact@albaraka-dev.ma",
    clientPhone: "+212 528 84 60 12",
    serviceType: "Rendez-vous acquisition terrain",
    startsAt: isoIn(1, 15),
    endsAt: isoIn(1, 16),
    status: "CONFIRMED",
    price: 0,
    notes: "Présenter l'étude de faisabilité Tikiouine.",
    clientId: "cl_05",
  },
  {
    id: "bk_04",
    reference: "BK-2414",
    clientName: "Youssef El Amrani",
    clientEmail: "y.elamrani@gmail.com",
    clientPhone: "+212 662 41 08 74",
    serviceType: "Estimation certifiée",
    startsAt: isoIn(6, 10),
    endsAt: isoIn(6, 11),
    status: "PENDING",
    price: 1500,
    notes: "Appartement 120 m², Marina.",
    clientId: null,
  },
  {
    id: "bk_05",
    reference: "BK-2409",
    clientName: "Karim Ouazzani",
    clientEmail: "k.ouazzani@maisonbenali.ma",
    clientPhone: "+212 661 22 97 05",
    serviceType: "Audit conciergerie",
    startsAt: iso(5, 14),
    endsAt: iso(5, 16),
    status: "COMPLETED",
    price: 3200,
    notes: "Rapport remis le lendemain.",
    clientId: "cl_03",
  },
  {
    id: "bk_06",
    reference: "BK-2407",
    clientName: "Leila Fassi",
    clientEmail: "leila.fassi@gmail.com",
    clientPhone: "+212 665 90 33 17",
    serviceType: "Visite appartement",
    startsAt: iso(12, 11),
    endsAt: iso(12, 12),
    status: "CANCELLED",
    price: 0,
    notes: "Annulée par le prospect.",
    clientId: null,
  },
];

/* -------------------------------------------------------------- rentals */

export const demoRentals: CarRental[] = [
  {
    id: "cr_01",
    reference: "CR-1180",
    vehicle: "Range Rover Velar 2024",
    vehiclePlate: "12345-A-6",
    clientName: "Nadia Cherkaoui",
    clientEmail: "nadia.cherkaoui@gmail.com",
    clientPhone: "+212 670 55 12 88",
    pickupAt: isoIn(4, 9),
    dropoffAt: isoIn(9, 9),
    pickupLocation: "Agadir — Aéroport Al Massira",
    dailyRate: 1150,
    totalPrice: 5750,
    deposit: 8000,
    depositPaid: true,
    agreementSigned: true,
    driverName: "Nadia Cherkaoui",
    driverLicense: "MA-770214",
    notes: "Siège bébé demandé.",
    status: "RESERVED",
    clientId: "cl_04",
  },
  {
    id: "cr_02",
    reference: "CR-1181",
    vehicle: "Mercedes Classe C 2023",
    vehiclePlate: "88231-B-1",
    clientName: "Sofia Benjelloun",
    clientEmail: "sofia.b@outlook.fr",
    clientPhone: "+33 6 71 88 45 20",
    pickupAt: isoIn(1, 18),
    dropoffAt: isoIn(6, 18),
    pickupLocation: "Agadir — Marina",
    dailyRate: 890,
    totalPrice: 4450,
    deposit: 6000,
    depositPaid: true,
    agreementSigned: false,
    driverName: "Sofia Benjelloun",
    driverLicense: "FR-9920145",
    notes: "Contrat à signer au retrait.",
    status: "RESERVED",
    clientId: "cl_02",
  },
  {
    id: "cr_03",
    reference: "CR-1176",
    vehicle: "Dacia Duster 2024",
    vehiclePlate: "55120-C-4",
    clientName: "Youssef El Amrani",
    clientEmail: "y.elamrani@gmail.com",
    clientPhone: "+212 662 41 08 74",
    pickupAt: iso(3, 10),
    dropoffAt: iso(1, 10),
    pickupLocation: "Agadir — Agence",
    dailyRate: 380,
    totalPrice: 760,
    deposit: 2000,
    depositPaid: true,
    agreementSigned: true,
    driverName: "Youssef El Amrani",
    driverLicense: "MA-441209",
    notes: null,
    status: "ACTIVE",
    clientId: null,
  },
  {
    id: "cr_04",
    reference: "CR-1170",
    vehicle: "Audi A6 2023",
    vehiclePlate: "77840-D-2",
    clientName: "Karim Ouazzani",
    clientEmail: "k.ouazzani@maisonbenali.ma",
    clientPhone: "+212 661 22 97 05",
    pickupAt: iso(18, 9),
    dropoffAt: iso(12, 9),
    pickupLocation: "Agadir — Aéroport Al Massira",
    dailyRate: 980,
    totalPrice: 5880,
    deposit: 7000,
    depositPaid: true,
    agreementSigned: true,
    driverName: "Karim Ouazzani",
    driverLicense: "MA-110938",
    notes: "Retour avec plein, état impeccable.",
    status: "COMPLETED",
    clientId: "cl_03",
  },
];

/* ------------------------------------------------------------- projects */

export const demoProjects: Project[] = [
  {
    id: "pr_01",
    title: "Résidence Al Manar — Founty",
    slug: "residence-al-manar-founty",
    description:
      "12 appartements haut standing avec vue mer, livraison T3 2027. Suivi promotion + commercialisation.",
    status: "ACTIVE",
    budget: 12500000,
    startsAt: iso(180, 9),
    endsAt: isoIn(300, 9),
    tags: ["VEFA", "Founty", "12 lots"],
    milestones: [
      { title: "Permis de construire", dueAt: iso(60, 9), done: true },
      { title: "Gros œuvre", dueAt: isoIn(45, 9), done: false },
      { title: "Commercialisation 70 %", dueAt: isoIn(120, 9), done: false },
    ],
    coverUrl: "/media/projects/al-manar.jpg",
    clientId: "cl_05",
  },
  {
    id: "pr_02",
    title: "Villa Palmier — Marina",
    slug: "villa-palmier-marina",
    description: "Rénovation complète d'une villa 320 m² pour mise en location premium.",
    status: "ACTIVE",
    budget: 1850000,
    startsAt: iso(90, 9),
    endsAt: isoIn(60, 9),
    tags: ["Rénovation", "Location premium"],
    milestones: [
      { title: "Dépose cloisons", dueAt: iso(40, 9), done: true },
      { title: "Second œuvre", dueAt: isoIn(20, 9), done: false },
      { title: "Shooting photo", dueAt: isoIn(50, 9), done: false },
    ],
    coverUrl: "/media/projects/villa-palmier.jpg",
    clientId: "cl_01",
  },
  {
    id: "pr_03",
    title: "Showroom Boulevard Hassan II",
    slug: "showroom-hassan-ii",
    description: "Plateau commercial 240 m² livré et loué à un opérateur premium.",
    status: "COMPLETED",
    budget: 2400000,
    startsAt: iso(400, 9),
    endsAt: iso(150, 9),
    tags: ["Commercial", "Livré"],
    milestones: [
      { title: "Livraison plateau", dueAt: iso(200, 9), done: true },
      { title: "Bail signé", dueAt: iso(150, 9), done: true },
    ],
    coverUrl: "/media/projects/showroom.jpg",
    clientId: null,
  },
  {
    id: "pr_04",
    title: "Étude Tikiouine — 2 400 m²",
    slug: "etude-tikiouine-2400",
    description: "Faisabilité d'un programme mixte de 24 lots sur terrain de 2 400 m².",
    status: "PLANNED",
    budget: 7800000,
    startsAt: isoIn(15, 9),
    endsAt: isoIn(210, 9),
    tags: ["Étude", "Programme mixte"],
    milestones: [{ title: "Étude de sol", dueAt: isoIn(30, 9), done: false }],
    coverUrl: null,
    clientId: "cl_05",
  },
  {
    id: "pr_05",
    title: "Flotte Benali Cars — extension 2027",
    slug: "flotte-benali-cars-extension",
    description: "Acquisition de 6 véhicules premium et mise en place du suivi d'entretien.",
    status: "PAUSED",
    budget: 3200000,
    startsAt: iso(45, 9),
    endsAt: null,
    tags: ["Flotte", "Investissement"],
    milestones: [{ title: "Négociation concessionnaire", dueAt: isoIn(40, 9), done: false }],
    coverUrl: null,
    clientId: null,
  },
];

/* --------------------------------------------------------- transactions */

export const demoTransactions: Transaction[] = [
  {
    id: "tx_01",
    reference: "TX-9841",
    label: "Acompte VEFA — Lot B2 (Sofia Benjelloun)",
    amount: 420000,
    type: "PAYMENT",
    status: "PAID",
    method: "Virement",
    stream: "project",
    occurredAt: iso(5, 11),
    clientId: "cl_02",
    bookingId: null,
    rentalId: null,
    projectId: "pr_01",
  },
  {
    id: "tx_02",
    reference: "TX-9842",
    label: "Location Range Rover — CR-1180",
    amount: 5750,
    type: "PAYMENT",
    status: "PAID",
    method: "Carte",
    stream: "rental",
    occurredAt: iso(2, 16),
    clientId: "cl_04",
    bookingId: null,
    rentalId: "cr_01",
    projectId: null,
  },
  {
    id: "tx_03",
    reference: "TX-9843",
    label: "Audit conciergerie — Ksar Hospitality",
    amount: 3200,
    type: "PAYMENT",
    status: "PAID",
    method: "Virement",
    stream: "booking",
    occurredAt: iso(5, 17),
    clientId: "cl_03",
    bookingId: "bk_05",
    rentalId: null,
    projectId: null,
  },
  {
    id: "tx_04",
    reference: "TX-9844",
    label: "Caution — CR-1181 (Mercedes Classe C)",
    amount: 6000,
    type: "DEPOSIT",
    status: "PAID",
    method: "Carte",
    stream: "rental",
    occurredAt: iso(1, 18),
    clientId: "cl_02",
    bookingId: null,
    rentalId: "cr_02",
    projectId: null,
  },
  {
    id: "tx_05",
    reference: "TX-9845",
    label: "Honoraires gestion — Al Baraka",
    amount: 48000,
    type: "PAYMENT",
    status: "PENDING",
    method: "Virement",
    stream: "project",
    occurredAt: iso(1, 9),
    clientId: "cl_05",
    bookingId: null,
    rentalId: null,
    projectId: "pr_02",
  },
  {
    id: "tx_06",
    reference: "TX-9846",
    label: "Estimation certifiée — Youssef El Amrani",
    amount: 1500,
    type: "PAYMENT",
    status: "OVERDUE",
    method: "Espèces",
    stream: "booking",
    occurredAt: iso(8, 10),
    clientId: null,
    bookingId: "bk_04",
    rentalId: null,
    projectId: null,
  },
  {
    id: "tx_07",
    reference: "TX-9847",
    label: "Séjour Villa Palmier — novembre",
    amount: 24500,
    type: "PAYMENT",
    status: "PAID",
    method: "Virement",
    stream: "booking",
    occurredAt: iso(20, 12),
    clientId: "cl_01",
    bookingId: null,
    rentalId: null,
    projectId: "pr_02",
  },
  {
    id: "tx_08",
    reference: "TX-9848",
    label: "Maintenance flotte — révision Audi A6",
    amount: 4200,
    type: "EXPENSE",
    status: "PAID",
    method: "Espèces",
    stream: "other",
    occurredAt: iso(12, 15),
    clientId: null,
    bookingId: null,
    rentalId: "cr_04",
    projectId: null,
  },
  {
    id: "tx_09",
    reference: "TX-9849",
    label: "Location Dacia Duster — CR-1176",
    amount: 760,
    type: "PAYMENT",
    status: "PAID",
    method: "Espèces",
    stream: "rental",
    occurredAt: iso(1, 10),
    clientId: null,
    bookingId: null,
    rentalId: "cr_03",
    projectId: null,
  },
  {
    id: "tx_10",
    reference: "TX-9850",
    label: "Acompte rénovation Villa Palmier",
    amount: 350000,
    type: "PAYMENT",
    status: "PAID",
    method: "Virement",
    stream: "project",
    occurredAt: iso(45, 11),
    clientId: "cl_01",
    bookingId: null,
    rentalId: null,
    projectId: "pr_02",
  },
];

/* ---------------------------------------------------------------- media */

export const demoMedia: MediaAsset[] = [
  {
    id: "md_01",
    url: "/assets/images/home-one/hero/hero-building-2.png",
    filename: "hero-building-2.png",
    alt: "Villas contemporaines — visuel piloté par le CRM",
    mimeType: "image/jpeg",
    size: 1843200,
    width: 1920,
    height: 1080,
    pageSlot: "HOME_HERO",
    sectionKey: "home.hero",
    sortOrder: 1,
    active: true,
    createdAt: iso(30, 9),
    projectId: "pr_02",
  },
  {
    id: "md_02",
    url: "/media/home/gallery-1.jpg",
    filename: "gallery-1.jpg",
    alt: "Salon contemporain — Résidence Al Manar",
    mimeType: "image/jpeg",
    size: 921600,
    width: 1600,
    height: 1200,
    pageSlot: "HOME_GALLERY",
    sectionKey: "home.gallery",
    sortOrder: 1,
    active: true,
    createdAt: iso(28, 10),
    projectId: "pr_01",
  },
  {
    id: "md_03",
    url: "/assets/images/innerpage/contact/contact-photo.png",
    filename: "contact-photo.png",
    alt: "Agence Maison Benali — Agadir",
    mimeType: "image/jpeg",
    size: 1126400,
    width: 1920,
    height: 900,
    pageSlot: "CONTACT_BANNER",
    sectionKey: "contact.banner",
    sortOrder: 1,
    active: true,
    createdAt: iso(26, 11),
    projectId: null,
  },
  {
    id: "md_04",
    url: "/media/cars/banner.jpg",
    filename: "cars-banner.jpg",
    alt: "Range Rover Velar — flotte Benali Cars",
    mimeType: "image/jpeg",
    size: 1433600,
    width: 1920,
    height: 1080,
    pageSlot: "CARS_BANNER",
    sectionKey: "cars.banner",
    sortOrder: 1,
    active: true,
    createdAt: iso(22, 14),
    projectId: null,
  },
  {
    id: "md_05",
    url: "/assets/images/gallery/agadir-bay-signature.jpg",
    filename: "agadir-bay-signature.jpg",
    alt: "Résidence Agadir Bay — couverture portfolio",
    mimeType: "image/jpeg",
    size: 1024000,
    width: 1400,
    height: 1050,
    pageSlot: "PORTFOLIO_COVER",
    sectionKey: "portfolio.cover",
    sortOrder: 1,
    active: true,
    createdAt: iso(20, 9),
    projectId: "pr_01",
  },
  {
    id: "md_06",
    url: "/media/about/hero.jpg",
    filename: "about-hero.jpg",
    alt: "Équipe Maison Benali",
    mimeType: "image/jpeg",
    size: 1720320,
    width: 1920,
    height: 1280,
    pageSlot: "ABOUT_HERO",
    sectionKey: "about.hero",
    sortOrder: 1,
    active: false,
    createdAt: iso(60, 9),
    projectId: null,
  },
];

/* --------------------------------------------------------------- emails */

export const demoEmails: EmailMessage[] = [
  {
    id: "em_01",
    fromName: "Sofia Benjelloun",
    fromEmail: "sofia.b@outlook.fr",
    toEmail: "contact@maisonbenali.com",
    subject: "Échéancier de paiement — lot B2",
    snippet: "Bonjour, je souhaite confirmer la date du deuxième versement…",
    body:
      "Bonjour,\n\nJe souhaite confirmer la date du deuxième versement pour le lot B2 de la Résidence Al Manar. Est-ce bien le 15 du mois prochain ?\n\nMerci d'avance,\nSofia Benjelloun",
    status: "UNREAD",
    provider: "imap",
    threadKey: "thread-sb-1",
    isOutbound: false,
    receivedAt: iso(0, 8),
    leadId: null,
  },
  {
    id: "em_02",
    fromName: "Youssef El Amrani",
    fromEmail: "y.elamrani@gmail.com",
    toEmail: "contact@maisonbenali.com",
    subject: "Visite appartement Marina",
    snippet: "Est-il possible de visiter samedi matin ?…",
    body:
      "Bonjour,\n\nEst-il possible de visiter l'appartement de la Marina samedi matin ? Je serai à Agadir du vendredi au dimanche.\n\nCordialement,\nYoussef El Amrani",
    status: "UNREAD",
    provider: "imap",
    threadKey: "thread-ye-1",
    isOutbound: false,
    receivedAt: iso(0, 7),
    leadId: "ld_01",
  },
  {
    id: "em_03",
    fromName: "Maison Benali",
    fromEmail: "contact@maisonbenali.com",
    toEmail: "k.ouazzani@maisonbenali.ma",
    subject: "Re: Rapport conciergerie — octobre",
    snippet: "Bonjour Karim, le rapport mensuel est prêt…",
    body:
      "Bonjour Karim,\n\nLe rapport mensuel de la conciergerie est prêt : 92 % d'occupation, revenu net de 84 300 MAD sur les six unités.\n\nBien à vous,\nMaison Benali",
    status: "READ",
    provider: "resend",
    threadKey: "thread-ko-1",
    isOutbound: true,
    receivedAt: iso(1, 17),
    leadId: null,
  },
  {
    id: "em_04",
    fromName: "Groupe Al Baraka",
    fromEmail: "contact@albaraka-dev.ma",
    toEmail: "contact@maisonbenali.com",
    subject: "Étude Tikiouine — documents",
    snippet: "Veuillez trouver ci-joint le titre foncier et l'étude de sol…",
    body:
      "Bonjour,\n\nVeuillez trouver ci-joint le titre foncier et l'étude de sol pour le terrain de Tikiouine. Nous attendons votre retour sur la faisabilité.\n\nCordialement,\nAl Baraka Développement",
    status: "READ",
    provider: "imap",
    threadKey: "thread-ab-1",
    isOutbound: false,
    receivedAt: iso(2, 11),
    leadId: "ld_05",
  },
  {
    id: "em_05",
    fromName: "Nadia Cherkaoui",
    fromEmail: "nadia.cherkaoui@gmail.com",
    toEmail: "contact@maisonbenali.com",
    subject: "Siège bébé pour la location",
    snippet: "Merci de prévoir un siège bébé pour le Range Rover…",
    body:
      "Bonjour,\n\nMerci de prévoir un siège bébé pour le Range Rover, notre fille a 18 mois.\n\nÀ bientôt,\nNadia",
    status: "CONVERTED",
    provider: "imap",
    threadKey: "thread-nc-1",
    isOutbound: false,
    receivedAt: iso(3, 19),
    leadId: "ld_04",
  },
  {
    id: "em_06",
    fromName: "Imane Tazi",
    fromEmail: "i.tazi@cabinetmre.ma",
    toEmail: "contact@maisonbenali.com",
    subject: "Mandat de gestion — 3 clients MRE",
    snippet: "Nous souhaiterions échanger sur un mandat de gestion…",
    body:
      "Bonjour,\n\nNous souhaiterions échanger sur un mandat de gestion patrimoniale pour trois de nos clients MRE.\n\nBien cordialement,\nImane Tazi",
    status: "ARCHIVED",
    provider: "imap",
    threadKey: "thread-it-1",
    isOutbound: false,
    receivedAt: iso(6, 9),
    leadId: "ld_08",
  },
];

/* ---------------------------------------------------------------- export */

export type Row = Record<string, unknown> & { id: string };

type PrismaModelName =
  | "lead"
  | "client"
  | "booking"
  | "carRental"
  | "project"
  | "transaction"
  | "mediaAsset"
  | "emailMessage";

export const demoData = {
  leads: demoLeads,
  clients: demoClients,
  bookings: demoBookings,
  rentals: demoRentals,
  projects: demoProjects,
  transactions: demoTransactions,
  media: demoMedia,
  emails: demoEmails,
  scope: {
    leads: "lead",
    clients: "client",
    bookings: "booking",
    rentals: "carRental",
    projects: "project",
    transactions: "transaction",
    media: "mediaAsset",
    emails: "emailMessage",
  } as Record<string, PrismaModelName>,
};

