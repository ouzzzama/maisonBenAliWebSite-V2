/**
 * Point d'entrée pour l'hébergement Node.js (Hostinger).
 *
 * Hostinger lance `node server.js` : ce fichier démarre Next.js sur le port
 * fourni par la plateforme (process.env.PORT). Le site vitrine, lui, reste sur
 * l'hébergement mutualisé (public_html) et n'utilise pas ce fichier.
 */
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || "0.0.0.0";

const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, hostname, () => {
      console.log(`CRM Maison Benali prêt sur http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Échec du démarrage du CRM :", error);
    process.exit(1);
  });
