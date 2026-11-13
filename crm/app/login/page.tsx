import { redirect } from "next/navigation";
import { ShieldCheck, MailCheck, Lock } from "lucide-react";
import { getSession } from "@/lib/auth-server";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

const POINTS = [
  { icon: Lock, title: "Accès privé", text: "Le back-office est fermé à toute session non vérifiée." },
  { icon: MailCheck, title: "Code par e-mail", text: "Un code à 6 chiffres envoyé sur l'adresse autorisée." },
  { icon: ShieldCheck, title: "Session signée", text: "Cookie HttpOnly signé, expiré automatiquement." },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const { next } = await searchParams;
  const target = next && next.startsWith("/") ? next : "/admin";

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-graphite p-10 text-white lg:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/monogram-b-white.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-10 w-[420px] opacity-[0.05]"
        />
        <div className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/monogram-b-white.svg" alt="Maison Ben Ali" width={30} height={32} className="h-8 w-auto" />
          <span className="font-script text-[15px] leading-none text-white/55">Espace CRM</span>
        </div>

        <div className="relative max-w-md">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-coral">
            Maison Ben Ali
          </p>
          <h1 className="text-[34px] leading-[1.1] tracking-[-0.02em]">
            Le pilotage de vos opérations, en accès restreint.
          </h1>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/55">
            Leads, réservations, Benali Cars, projets et trésorerie. La connexion se fait en deux
            étapes : mot de passe puis code envoyé par e-mail.
          </p>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.title} className="flex gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-white/8 text-coral">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-semibold text-white">{point.title}</span>
                    <span className="block text-[12px] leading-relaxed text-white/45">{point.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-[11px] text-white/30">
          © {new Date().getFullYear()} Maison Ben Ali — accès réservé à l&apos;administration.
        </p>
      </section>

      <section className="flex items-center justify-center bg-cream px-4 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/monogram-b.svg" alt="Maison Ben Ali" width={26} height={28} className="h-7 w-auto" />
            <span className="font-script text-[14px] leading-none text-ink/55">Espace CRM</span>
          </div>
          <LoginForm next={target} />
        </div>
      </section>
    </main>
  );
}
