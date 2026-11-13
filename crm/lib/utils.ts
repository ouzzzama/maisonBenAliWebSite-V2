import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currency = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

export const formatMAD = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "—"
    : currency.format(Number(value));

export const formatCompactMAD = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M MAD`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}k MAD`;
  return `${value} MAD`;
};

export const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

export const toInputDate = (value?: string | Date | null) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const toInputDateTime = (value?: string | Date | null) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const daysBetween = (start: string, end: string) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
};

/* ------------------------------------------------------------ label maps */

export const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: "Nouveau",
  CONTACTED: "Contacté",
  QUALIFIED: "Qualifié",
  WON: "Gagné",
  LOST: "Perdu",
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const RENTAL_STATUS_LABEL: Record<string, string> = {
  RESERVED: "Réservée",
  ACTIVE: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planifié",
  ACTIVE: "En cours",
  PAUSED: "En pause",
  COMPLETED: "Livré",
};

export const EMAIL_STATUS_LABEL: Record<string, string> = {
  UNREAD: "Non lu",
  READ: "Lu",
  ARCHIVED: "Archivé",
  CONVERTED: "Converti",
};

export const TX_STATUS_LABEL: Record<string, string> = {
  PAID: "Payé",
  PENDING: "En attente",
  OVERDUE: "En retard",
};

export const TX_TYPE_LABEL: Record<string, string> = {
  PAYMENT: "Paiement",
  DEPOSIT: "Caution",
  REFUND: "Remboursement",
  EXPENSE: "Dépense",
};

export const INTEREST_LABEL: Record<string, string> = {
  ACHAT: "Achat",
  VENTE: "Vente",
  LOCATION: "Location",
  CONCIERGERIE: "Conciergerie",
  CARS: "Benali Cars",
  PROJET: "Projet",
  VEFA: "VEFA",
  GESTION: "Gestion",
};

export const PAGE_SLOT_LABEL: Record<string, string> = {
  HOME_HERO: "Accueil — Hero",
  HOME_GALLERY: "Accueil — Galerie",
  ABOUT_HERO: "À propos — Hero",
  CONTACT_BANNER: "Contact — Bannière",
  PORTFOLIO_COVER: "Portfolio — Couverture",
  PROJECTS_SHOWCASE: "Propriétés — Vitrine",
  CARS_BANNER: "Benali Cars — Bannière",
  BLOG_COVER: "Blog — Couverture",
  OTHER: "Autre",
};

export const toneFor = (status: string): string => {
  const map: Record<string, string> = {
    NEW: "bg-sky-50 text-sky-700 ring-sky-200",
    CONTACTED: "bg-amber-50 text-amber-700 ring-amber-200",
    QUALIFIED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    WON: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    LOST: "bg-slate-100 text-slate-500 ring-slate-200",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    COMPLETED: "bg-slate-100 text-slate-600 ring-slate-200",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
    RESERVED: "bg-sky-50 text-sky-700 ring-sky-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PLANNED: "bg-slate-100 text-slate-600 ring-slate-200",
    PAUSED: "bg-amber-50 text-amber-700 ring-amber-200",
    UNREAD: "bg-[#ef453b]/10 text-[#c53229] ring-[#ef453b]/25",
    READ: "bg-slate-100 text-slate-600 ring-slate-200",
    ARCHIVED: "bg-slate-100 text-slate-500 ring-slate-200",
    CONVERTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    OVERDUE: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-600 ring-slate-200";
};
