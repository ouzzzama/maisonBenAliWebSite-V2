const BRAND_INK = "#122b43";
const BRAND_CORAL = "#ef453b";
const BRAND_CREAM = "#f7f5ef";

export type OtpDelivery = { delivered: boolean; devCode?: string };

/**
 * Sends the one-time code to the admin address.
 *
 * With SMTP_HOST configured the mail goes out for real. Without it, the code is
 * written to the server console and to `crm/.otp-dev.log`, and returned to the
 * login screen so the app stays usable in local development. Set
 * AUTH_SHOW_DEV_OTP=false to suppress that in the UI.
 */
/** Real delivery needs both a relay and its credential. */
export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PASSWORD);
}

export async function sendOtpCode(params: { to: string; code: string; name: string }): Promise<OtpDelivery> {
  const host = process.env.SMTP_HOST;

  if (!isMailConfigured() || !host) {
    await recordLocalCode(params);
    const devCode = process.env.AUTH_SHOW_DEV_OTP === "false" ? undefined : params.code;
    return { delivered: false, devCode };
  }

  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    // A wrong host or port must fail the sign-in quickly instead of leaving the
    // visitor waiting on a two-minute socket timeout.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  // Gmail (and most hosted relays) reject a sender that is not the authenticated
  // mailbox, so fall back to SMTP_USER rather than to a fixed address.
  const from =
    process.env.MAIL_FROM ||
    (process.env.SMTP_USER
      ? `Maison Benali <${process.env.SMTP_USER}>`
      : "Maison Benali <direction@maisonbenali.com>");

  await transport.sendMail({
    from,
    to: params.to,
    subject: `${params.code} — votre code de connexion Maison Benali`,
    text: [
      `Bonjour ${params.name},`,
      "",
      `Votre code de vérification est : ${params.code}`,
      "",
      "Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette connexion, ignorez cet e-mail.",
      "",
      "Maison Benali — Espace CRM",
    ].join("\n"),
    html: `
      <div style="background:${BRAND_CREAM};padding:32px 16px;font-family:'Cal Sans',Helvetica,Arial,sans-serif;color:${BRAND_INK}">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${BRAND_CORAL}">Maison Benali</p>
          <h1 style="margin:0 0 18px;font-size:22px">Votre code de connexion</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#42546a">
            Bonjour ${params.name}, voici le code à saisir pour accéder au CRM.
          </p>
          <div style="border:1px solid #e6e2d8;border-radius:14px;padding:18px;text-align:center;font-size:32px;letter-spacing:.32em;font-weight:600;color:${BRAND_INK}">
            ${params.code}
          </div>
          <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#6b7c8c">
            Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette connexion, ignorez cet e-mail.
          </p>
        </div>
      </div>
    `,
  });

  return { delivered: true };
}

export type AckResult = { delivered: boolean; reason?: string };

function fromAddress(): string {
  return (
    process.env.MAIL_FROM ||
    (process.env.SMTP_USER
      ? `Maison Benali <${process.env.SMTP_USER}>`
      : "Maison Benali <direction@maisonbenali.com>")
  );
}

async function smtpTransport() {
  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

/** 2026-12-01 → 1er décembre 2026 */
function frDate(value?: string): string {
  if (!value) return "À confirmer";
  const date = new Date(value.length <= 10 ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "À confirmer";
  const text = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return text.replace(/^1 /, "1er ");
}

/**
 * Accusé de réception envoyé au client qui demande une voiture depuis le site.
 * Best effort : sans relais SMTP configuré, la demande reste enregistrée dans le
 * CRM et la raison du non-envoi est journalisée côté serveur.
 */
export async function sendCarReservationAck(params: {
  to: string;
  name: string;
  car: string;
  startDate?: string;
  endDate?: string;
  reference: string;
}): Promise<AckResult> {
  if (!isMailConfigured() || !process.env.SMTP_HOST) {
    console.log(`[reservation] SMTP non configuré — accusé non envoyé à ${params.to} (${params.reference})`);
    return { delivered: false, reason: "smtp-not-configured" };
  }

  const stay =
    frDate(params.startDate) === frDate(params.endDate)
      ? frDate(params.startDate)
      : `du ${frDate(params.startDate)} au ${frDate(params.endDate)}`;

  try {
    const transport = await smtpTransport();
    await transport.sendMail({
      from: fromAddress(),
      to: params.to,
      replyTo: process.env.MAIL_REPLY_TO || undefined,
      subject: `Votre demande de réservation — ${params.car} (réf. ${params.reference})`,
      text: [
        `Bonjour ${params.name},`,
        "",
        `Nous avons bien reçu votre demande de réservation pour la ${params.car}, ${stay}.`,
        `Référence de suivi : ${params.reference}.`,
        "",
        "Nous confirmons la disponibilité et le tarif sous 24 h ouvrées, par e-mail ou par téléphone.",
        "Livraison possible à l'aéroport Agadir Al Massira ou à votre résidence.",
        "",
        "Une question ? WhatsApp : +212 661-191787 — direction@maisonbenali.com",
        "",
        "Maison Benali — Benali Cars",
      ].join("\n"),
      html: `
        <div style="background:${BRAND_CREAM};padding:32px 16px;font-family:'Cal Sans',Helvetica,Arial,sans-serif;color:${BRAND_INK}">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${BRAND_CORAL}">Benali Cars · Agadir</p>
            <h1 style="margin:0 0 18px;font-size:22px">Demande bien reçue</h1>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#42546a">
              Bonjour ${params.name}, nous avons bien enregistré votre demande de réservation.
              Notre équipe revient vers vous sous 24 h ouvrées pour confirmer la disponibilité et le tarif.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:${BRAND_INK}">
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#6b7c8c">Véhicule</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right;font-weight:600">${params.car}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #eee9df;color:#6b7c8c">Dates</td><td style="padding:10px 0;border-bottom:1px solid #eee9df;text-align:right;font-weight:600">${stay}</td></tr>
              <tr><td style="padding:10px 0;color:#6b7c8c">Référence</td><td style="padding:10px 0;text-align:right;font-weight:600">${params.reference}</td></tr>
            </table>
            <p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#6b7c8c">
              Livraison possible à l'aéroport Agadir Al Massira ou à votre résidence.<br/>
              Une question ? WhatsApp +212 661-191787 · direction@maisonbenali.com
            </p>
          </div>
        </div>
      `,
    });
    return { delivered: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "envoi impossible";
    console.warn(`[reservation] accusé non envoyé à ${params.to} : ${reason}`);
    return { delivered: false, reason };
  }
}

async function recordLocalCode(params: { to: string; code: string; name: string }) {
  console.log(`[auth] SMTP non configuré — code OTP pour ${params.to} : ${params.code}`);
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(process.cwd(), ".otp-dev.log");
    await fs.appendFile(file, `[${new Date().toISOString()}] ${params.to} → ${params.code}\n`, "utf8");
  } catch {
    /* logging is best effort */
  }
}
