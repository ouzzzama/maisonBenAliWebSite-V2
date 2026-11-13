"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";

type Step = "credentials" | "otp";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("credentials");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [delivered, setDelivered] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function requestCode(event?: React.FormEvent) {
    event?.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        delivered?: boolean;
        devCode?: string;
      };
      if (!response.ok || !body.ok) throw new Error(body.error || "Connexion impossible");

      setStep("otp");
      setDelivered(Boolean(body.delivered));
      setDevCode(body.devCode ?? null);
      setCode("");
      setCooldown(30);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion impossible");
    } finally {
      setPending(false);
    }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) throw new Error(body.error || "Vérification impossible");

      router.replace(next);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Vérification impossible");
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "focus-ring h-11 w-full rounded-xl border border-ink/12 bg-white px-3.5 text-[13.5px] text-ink outline-none transition placeholder:text-ink/30 focus:border-ink/35";

  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(18,43,67,0.55)] sm:p-8">
      {step === "credentials" ? (
        <>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-coral">Connexion</p>
          <h2 className="mt-1.5 text-[24px] leading-tight tracking-[-0.02em] text-ink">Accès administrateur</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
            Un code de vérification sera envoyé à l&apos;adresse e-mail autorisée.
          </p>

          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-semibold text-ink/70">Adresse e-mail</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/30" />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="contact@maisonbenali.com"
                  className={`${inputClass} pl-10`}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-semibold text-ink/70">Mot de passe</span>
              <span className="relative block">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/30" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-10`}
                />
              </span>
            </label>

            {error ? (
              <p className="rounded-xl border border-coral/25 bg-coral/8 px-3 py-2 text-[12px] text-coral-deep">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13px] font-semibold text-white transition hover:bg-ink-deep disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Recevoir le code
              {!pending ? <ArrowRight className="size-4" /> : null}
            </button>
          </form>

          <p className="mt-4 text-[11px] leading-relaxed text-ink/35">
            Toute tentative est limitée à 6 essais par tranche de 10 minutes.
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setCode("");
              setError(null);
            }}
            className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink/45 transition hover:text-ink"
          >
            <ArrowLeft className="size-3.5" />
            Modifier l&apos;adresse
          </button>

          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-coral">Vérification</p>
          <h2 className="mt-1.5 text-[24px] leading-tight tracking-[-0.02em] text-ink">
            Saisissez le code reçu
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
            {delivered
              ? `Code envoyé à ${email}. Il expire dans 10 minutes.`
              : `Code à 6 chiffres généré pour ${email}. Il expire dans 10 minutes.`}
          </p>

          {devCode ? (
            <div className="mt-4 rounded-xl border border-ink/12 bg-cream px-3.5 py-3">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                Mode développement · SMTP non configuré
              </p>
              <p className="mt-1 text-[12px] text-ink/60">
                Code :{" "}
                <span className="font-mono text-[15px] font-semibold tracking-[0.25em] text-ink">
                  {devCode}
                </span>
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-ink/35">
                Renseignez SMTP_HOST / SMTP_USER / SMTP_PASSWORD pour recevoir le code par e-mail.
              </p>
            </div>
          ) : null}

          <form onSubmit={verify} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-semibold text-ink/70">Code de vérification</span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className={`${inputClass} text-center font-mono text-[20px] tracking-[0.5em]`}
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-coral/25 bg-coral/8 px-3 py-2 text-[12px] text-coral-deep">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending || code.length !== 6}
              className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-coral text-[13px] font-semibold text-white transition hover:bg-coral-deep disabled:opacity-50"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Vérifier et entrer
            </button>

            <button
              type="button"
              disabled={pending || cooldown > 0}
              onClick={() => requestCode()}
              className="focus-ring w-full text-center text-[11.5px] font-semibold text-ink/45 transition hover:text-ink disabled:opacity-45"
            >
              {cooldown > 0 ? `Renvoyer un code dans ${cooldown} s` : "Renvoyer un code"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
