"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Car,
  ExternalLink,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  UserSquare2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/inbox", label: "Boîte de réception", icon: Inbox },
  { href: "/admin/leads", label: "Leads", icon: UserSquare2 },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/bookings", label: "Réservations", icon: CalendarDays },
  { href: "/admin/cars", label: "Benali Cars", icon: Car },
  { href: "/admin/projects", label: "Projets", icon: FolderKanban },
  { href: "/admin/media", label: "Médias & CMS", icon: Images },
  { href: "/admin/finance", label: "Finances", icon: BarChart3 },
];

function initials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
              active
                ? "bg-white/12 text-white"
                : "text-white/60 hover:bg-white/6 hover:text-white"
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
      })}
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
            <div className="mb-6 flex items-center justify-between">
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
            <NavList onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <AccountCard user={user} />
            </div>
          </aside>
        </div>
      ) : null}

      {/* desktop rail */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/5 bg-graphite p-4 lg:flex">
        <div className="mb-7 px-1">
          <Brand />
        </div>
        <NavList />
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener"
          className="focus-ring mt-4 flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2.5 text-[12px] font-medium text-white/55 transition hover:border-white/20 hover:text-white"
        >
          <ExternalLink className="size-3.5 text-coral" />
          Voir le site public
        </a>
        <AccountCard user={user} />
      </aside>
    </>
  );
}
