"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Car,
  ExternalLink,
  FolderKanban,
  Home,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  Users,
  UserSquare2,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label?: string; items: NavItem[] };

/**
 * Le CRM est découpé par secteur : chaque secteur gère son propre catalogue,
 * et les finances consolident les quatre.
 */
const NAV_GROUPS: NavGroup[] = [
  { items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard }] },
  {
    label: "Vente immobilière",
    items: [
      { href: "/admin/products?deal=vente", label: "Biens à vendre", icon: Home },
      { href: "/admin/projects", label: "Projets VEFA", icon: FolderKanban },
    ],
  },
  {
    label: "Location immobilière",
    items: [
      { href: "/admin/products?deal=location", label: "Biens à louer", icon: KeyRound },
      { href: "/admin/bookings", label: "Réservations & conciergerie", icon: CalendarDays },
    ],
  },
  {
    label: "Boutique",
    items: [{ href: "/admin/boutique", label: "Produits à vendre / louer", icon: Package }],
  },
  {
    label: "Benali Cars",
    items: [{ href: "/admin/cars", label: "Location de voitures", icon: Car }],
  },
  {
    label: "Finances",
    items: [{ href: "/admin/finance", label: "Gestion financière", icon: BarChart3 }],
  },
  {
    label: "Relation client & contenu",
    items: [
      { href: "/admin/inbox", label: "Boîte de réception", icon: Inbox },
      { href: "/admin/leads", label: "Leads", icon: UserSquare2 },
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
    ],
  },
];

function initials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "focus-ring group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition",
        active ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/6 hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "size-[17px] shrink-0 transition",
          active ? "text-coral" : "text-white/45 group-hover:text-white/80"
        )}
      />
      <span className="truncate">{item.label}</span>
      {active ? <span className="ml-auto size-1.5 rounded-full bg-coral" /> : null}
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deal = searchParams.get("deal") ?? "";

  const isActive = (item: NavItem) => {
    const [path, query] = item.href.split("?");
    if (path === "/admin") return pathname === "/admin";
    if (!pathname.startsWith(path)) return false;
    if (!query) return !deal || path !== "/admin/products";
    const wanted = new URLSearchParams(query).get("deal");
    return (deal || "vente") === wanted;
  };

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_GROUPS.map((group, index) => (
        <div key={group.label ?? `group-${index}`} className={cn(index > 0 && "mt-3")}>
          {group.label ? (
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="focus-ring group flex items-center gap-3 rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/monogram-b-white.svg"
        alt="Maison Ben Ali"
        width={28}
        height={30}
        className="h-[30px] w-auto transition group-hover:opacity-90"
      />
      <span className="font-script text-[14px] leading-none text-white/50">Espace CRM</span>
    </Link>
  );
}

function AccountCard({ user }: { user: { email: string; name: string } }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="relative mt-auto overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-3.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/monogram-b-white.svg"
        alt=""
        aria-hidden
        width={76}
        height={81}
        className="pointer-events-none absolute -bottom-4 -right-3 w-[74px] opacity-[0.07]"
      />
      <p className="text-[11px] font-semibold text-white/70">Connecté en tant que</p>
      <div className="mt-2 flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-white/12 text-[11px] font-semibold text-white">
          {initials(user.name, user.email)}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[12px] font-medium text-white">{user.name}</span>
          <span className="block truncate text-[10px] text-white/45">{user.email}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-1.5 text-[11px] font-semibold text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-50"
      >
        <LogOut className="size-3.5" />
        Se déconnecter
      </button>
    </div>
  );
}

export function Sidebar({ user }: { user: { email: string; name: string } }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/8 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/monogram-b.svg"
            alt="Maison Ben Ali"
            width={24}
            height={26}
            className="h-6 w-auto"
          />
          <span className="font-script text-[13px] leading-none text-ink/50">Espace CRM</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="focus-ring grid size-9 place-items-center rounded-xl border border-ink/10 text-ink"
        >
          <Menu className="size-4" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-hidden />
          <aside className="animate-in relative z-10 flex h-full w-[280px] flex-col bg-graphite p-4">
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="grid size-8 place-items-center rounded-lg text-white/60"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="sidebar-scroll -mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-3">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <div className="shrink-0 pt-3">
              <AccountCard user={user} />
            </div>
          </aside>
        </div>
      ) : null}

      {/* desktop rail — the column wrapper paints the graphite down to the very
          bottom of the page, so no cream band appears under a short sidebar */}
      <div className="hidden bg-graphite lg:block">
      <aside className="sticky top-0 flex h-dvh flex-col overflow-hidden border-r border-white/5 bg-graphite p-4">
        <div className="mb-5 shrink-0 px-1">
          <Brand />
        </div>
        {/* Le menu défile si la fenêtre est courte : rien n'est rogné et le
            compte reste toujours visible en bas. */}
        <div className="sidebar-scroll -mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-3">
          <NavList />
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener"
            className="focus-ring mt-3 flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-[12px] font-medium text-white/55 transition hover:border-white/20 hover:text-white"
          >
            <ExternalLink className="size-3.5 text-coral" />
            Voir le site public
          </a>
        </div>
        <div className="shrink-0 pt-3">
          <AccountCard user={user} />
        </div>
      </aside>
      </div>
    </>
  );
}
