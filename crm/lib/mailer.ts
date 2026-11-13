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
export async function sendOtpCode(params: { to: string; code: string; name: string }): Promise<OtpDelivery> {
  const host = process.env.SMTP_HOST;

  if (!host) {
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
  });

  const from = process.env.MAIL_FROM || "Maison Ben Ali <contact@maisonbenali.com>";

  await transport.sendMail({
    from,
    to: params.to,
    subject: `${params.code} — votre code de connexion Maison Ben Ali`,
    text: [
      `Bonjour ${params.name},`,
      "",
      `Votre code de vérification est : ${params.code}`,
      "",
      "Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette connexion, ignorez cet e-mail.",
      "",
      "Maison Ben Ali — Espace CRM",
    ].join("\n"),
    html: `
      <div style="background:${BRAND_CREAM};padding:32px 16px;font-family:'Cal Sans',Helvetica,Arial,sans-serif;color:${BRAND_INK}">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${BRAND_CORAL}">Maison Ben Ali</p>
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
