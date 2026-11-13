import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { Sidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[262px_minmax(0,1fr)]">
      <Sidebar user={{ email: session.email, name: session.name }} />
      <div className="flex min-h-screen flex-col">
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          {children}
        </main>
        <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/8 px-6 py-4 text-[11px] text-ink/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/monogram-b.svg"
            alt=""
            aria-hidden
            width={16}
            height={17}
            className="h-4 w-auto opacity-45"
          />
          <span>
            Maison Ben Ali — CRM interne · données de démonstration tant que
            <code className="mx-1 rounded bg-ink/5 px-1 py-0.5">DATABASE_URL</code>
            n&apos;est pas branché.
          </span>
          <span className="font-script ml-auto text-[13px] leading-none text-ink/35">Espace CRM</span>
        </footer>
      </div>
    </div>
  );
}
