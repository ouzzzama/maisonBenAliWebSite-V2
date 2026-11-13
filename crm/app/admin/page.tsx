import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  Car,
  CircleDollarSign,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { RevenueChart, StreamsChart } from "@/components/charts/revenue-chart";
import { getAnalytics, listRows } from "@/lib/repo";
import {
  BOOKING_STATUS_LABEL,
  LEAD_STATUS_LABEL,
  TX_STATUS_LABEL,
  formatDate,
  formatDateTime,
  formatMAD,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [analytics, emails] = await Promise.all([getAnalytics(), listRows("emails")]);
  const unread = emails.filter((email) => email.status === "UNREAD").length;
  const { kpis, monthly, streams, leadFunnel, upcoming, recentTransactions } = analytics;
  const maxFunnel = Math.max(...leadFunnel.map((step) => step.count), 1);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Tableau de bord"
        description="Activité commerciale, trésorerie et opérations en un seul écran."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/inbox"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/12 bg-white px-4 text-[13px] font-semibold text-ink transition hover:border-ink/25"
            >
              Boîte de réception
              {unread ? (
                <span className="grid size-5 place-items-center rounded-full bg-coral text-[10px] font-bold text-white">
                  {unread}
                </span>
              ) : null}
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-coral px-4 text-[13px] font-semibold text-white transition hover:bg-coral-deep"
            >
              <UserPlus className="size-4" />
              Nouveau lead
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires encaissé"
          value={formatMAD(kpis.revenue)}
          hint={`${formatMAD(kpis.pending)} en attente`}
          trend={{ value: "+18 %", positive: true }}
          icon={<Banknote className="size-4" />}
          tone="coral"
        />
        <StatCard
          label="Solde à recouvrer"
          value={formatMAD(kpis.overdue + kpis.pending)}
          hint={`${formatMAD(kpis.overdue)} en retard`}
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          label="Leads / Clients"
          value={`${kpis.leads} · ${kpis.clients}`}
          hint={`Conversion ${kpis.conversion} %`}
          trend={{ value: `${kpis.conversion} %`, positive: kpis.conversion >= 30 }}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Opérations en cours"
          value={String(kpis.activeRentals + kpis.upcomingBookings)}
          hint={`${kpis.activeRentals} locations · ${kpis.upcomingBookings} RDV`}
          icon={<Car className="size-4" />}
          tone="ink"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenus par activité</CardTitle>
              <p className="mt-1 text-xs text-muted">Six derniers mois, encaissements uniquement.</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="size-3" /> En hausse
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <RevenueChart data={monthly} />
            <div className="mt-4 flex flex-wrap gap-4">
              {[
                { label: "Réservations", color: "#ef453b" },
                { label: "Benali Cars", color: "#122b43" },
                { label: "Projets", color: "#15483d" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 text-[11.5px] text-ink/60">
                  <span className="size-2 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des revenus</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <StreamsChart data={streams} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Entonnoir commercial</CardTitle>
            <Link href="/admin/leads" className="text-[11.5px] font-semibold text-coral">
              Voir les leads
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {leadFunnel.map((step) => (
              <div key={step.status}>
                <div className="mb-1 flex items-center justify-between text-[11.5px]">
                  <span className="font-medium text-ink/70">{LEAD_STATUS_LABEL[step.status]}</span>
                  <span className="font-semibold text-ink">{step.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/6">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${Math.max(6, (step.count / maxFunnel) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4 rounded-2xl bg-cream p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                Prochains rendez-vous
              </p>
              <ul className="mt-2 space-y-2.5">
                {upcoming.length ? (
                  upcoming.map((booking) => (
                    <li key={String(booking.id)} className="flex items-start gap-2.5">
                      <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-coral" />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink">
                          {String(booking.serviceType)}
                        </p>
                        <p className="text-[11px] text-muted">
                          {String(booking.clientName)} · {formatDateTime(String(booking.startsAt))}
                        </p>
                      </div>
                      <StatusBadge
                        status={String(booking.status)}
                        label={BOOKING_STATUS_LABEL[String(booking.status)]}
                        className="ml-auto shrink-0"
                      />
                    </li>
                  ))
                ) : (
                  <li className="text-[12px] text-muted">Aucun rendez-vous à venir.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dernières transactions</CardTitle>
            <Link
              href="/admin/finance"
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-coral"
            >
              Finances <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            <ul className="divide-y divide-ink/5">
              {recentTransactions.map((tx) => (
                <li key={String(tx.id)} className="flex items-center gap-3 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink/5 text-[11px] font-semibold text-ink/60">
                    {String(tx.reference).split("-")[1] ?? "TX"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink">{String(tx.label)}</p>
                    <p className="text-[11px] text-muted">{formatDate(String(tx.occurredAt))}</p>
                  </div>
                  <span className="shrink-0 text-[12.5px] font-semibold text-ink">
                    {formatMAD(Number(tx.amount))}
                  </span>
                  <StatusBadge
                    status={String(tx.status)}
                    label={TX_STATUS_LABEL[String(tx.status)]}
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
