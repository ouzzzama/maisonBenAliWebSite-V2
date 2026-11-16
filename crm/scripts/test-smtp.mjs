/**
 * Vérifie la boîte d'envoi utilisée par le CRM (code de connexion par e-mail).
 *
 *   cd crm
 *   set -a; . ./.env.local; set +a
 *   node scripts/test-smtp.mjs [destinataire]
 *
 * Sans argument, le message de test part vers SMTP_USER (donc vers vous).
 */
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;

if (!host || !user || !pass) {
  console.error("Manquant dans l'environnement : " + [!host && "SMTP_HOST", !user && "SMTP_USER", !pass && "SMTP_PASSWORD"].filter(Boolean).join(", "));
  process.exit(1);
}

const to = process.argv[2] || user;

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

try {
  await transport.verify();
  console.log(`Connexion SMTP OK → ${host}:${port} en tant que ${user}`);

  const info = await transport.sendMail({
    from: process.env.MAIL_FROM || `Maison Ben Ali <${user}>`,
    to,
    subject: "Test SMTP — CRM Maison Ben Ali",
    text: "Si vous lisez ce message, l'envoi des codes de connexion du CRM fonctionne.",
  });

  console.log(`E-mail envoyé à ${to} — id ${info.messageId}`);
} catch (error) {
  console.error("ÉCHEC :", error.message);
  if (/535|534|Invalid login|authentication/i.test(error.message)) {
    console.error("→ Le serveur refuse le couple adresse / mot de passe : vérifiez SMTP_USER et le mot de passe exact de la boîte.");
  }
  process.exit(1);
}
