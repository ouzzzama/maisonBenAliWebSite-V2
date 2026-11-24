import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

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
    <main className="flex min-h-[100dvh] flex-col items-center overflow-hidden bg-cream lg:justify-center lg:bg-[#0c2136] lg:py-10">
      {/* Une seule composition, du mobile au desktop : photo entière bord à bord,
          logo blanc complet, arc doux de la maison, formulaire posé dessus. */}
      <div className="flex min-h-0 w-full flex-1 flex-col lg:max-w-[470px] lg:flex-none lg:overflow-hidden lg:rounded-[34px] lg:shadow-[0_44px_100px_-42px_rgba(0,0,0,0.7)]">
        <div className="relative aspect-[1184/880] w-full shrink-0 overflow-hidden bg-graphite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/login-hero-wide.jpg"
            alt="Résidence balnéaire Maison Benali à Agadir"
            className="relative z-[1] h-full w-full object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 z-[2] bg-gradient-to-b from-graphite/40 via-transparent to-graphite/75"
          />
          <div className="absolute inset-x-0 bottom-[72px] z-[3] flex flex-col items-center px-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/maison-benali-logo-all-white.svg"
              alt="Maison Benali"
              width={220}
              height={54}
              className="h-auto w-[210px] drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] lg:w-[230px]"
            />
            <p className="mt-2 font-script text-[13px] leading-none text-white/75">Espace CRM</p>
          </div>
        </div>

        <div className="relative z-10 -mt-8 flex min-h-0 flex-1 flex-col [filter:drop-shadow(0_-16px_28px_rgba(18,43,67,0.28))]">
          {/* Arche douce de la maison : ellipse très large, épaules hors cadre */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-[28px] left-1/2 h-[120px] w-[130%] -translate-x-1/2 rounded-[50%] bg-white"
          />
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-5 pb-6 pt-10 lg:px-8 lg:pb-8 lg:pt-12">
            <div className="mx-auto flex w-full max-w-[420px] flex-col">
              <LoginForm next={target} framed={false} compact />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
