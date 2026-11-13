# Maison Ben Ali — CRM & back-office

Application Next.js (App Router, TypeScript) pour piloter leads, clients, réservations,
flotte Benali Cars, projets, médias et trésorerie.

## Démarrage

```bash
npm install
cp .env.example .env      # renseigner DATABASE_URL pour brancher la vraie base
npm run dev               # http://localhost:3000/admin
```

Sans `DATABASE_URL`, l'application tourne sur un **store de démonstration en mémoire**
(journalisé dans la console) : toutes les pages, filtres, formulaires et actions
fonctionnent, les données sont réinitialisées au redémarrage.

## Base de données

```bash
npx prisma generate        # client Prisma
npm run db:push            # crée le schéma (PostgreSQL ou MySQL)
npm run db:seed            # charge le jeu de données de démonstration
npm run db:studio          # exploration visuelle
```

Le schéma complet est dans `prisma/schema.prisma` : `User`, `Lead`, `Client`,
`Interaction`, `EmailMessage`, `Booking`, `CarRental`, `Project`, `Transaction`,
`MediaAsset`.

Pour MySQL : `provider = "mysql"`, remplacer les champs `String[]` par `Json`
et supprimer les attributs `@db.Decimal`.

## Modules

| Route | Rôle |
| --- | --- |
| `/admin` | KPIs, revenus par activité, entonnoir commercial, prochains RDV |
| `/admin/inbox` | Emails entrants, fils, statuts (non lu / lu / archivé / converti), réponse, conversion en lead |
| `/admin/leads` | Filtres statut + intérêt + plage de dates, création/édition, conversion en client en un clic |
| `/admin/clients` | Base clients, segments, nombre d'opérations, origine |
| `/admin/bookings` | Vue tableau **et** calendrier mensuel, statuts, montants |
| `/admin/cars` | Locations : véhicule, période, tarif, caution, contrat, conducteur |
| `/admin/projects` | Cartes projets, jalons cochables, avancement, budget |
| `/admin/media` | Bibliothèque d'images, affectation à un emplacement public (`pageSlot` + `sectionKey`) |
| `/admin/finance` | Encaissé / en attente / retard / dépenses, graphique, grand livre |

## API

Routes REST sous `/api` : `leads`, `clients`, `bookings`, `rentals`, `projects`,
`transactions`, `media`, `emails` (`GET`, `POST`, `PATCH /:id`, `DELETE /:id`),
`analytics`, et `POST /api/emails/:id/convert`.

Les routes utilisent `lib/repo.ts` : Prisma si `DATABASE_URL` est défini, sinon le
store mémoire. Les payloads sont validés par Zod côté client (React Hook Form) et
normalisés côté serveur (dates, montants, références).

## Emails et stockage

`lib/validators.ts` + colonnes `provider` / `threadKey` préparent l'IMAP et les
webhooks Resend/SendGrid ; brancher un worker IMAP ou un endpoint webhook
(secret `INBOUND_WEBHOOK_SECRET`) qui écrit dans `EmailMessage`. Les réponses sont
enregistrées comme messages sortants (`isOutbound`). L'envoi réel se fait via SMTP
ou l'API du fournisseur.

Les médias acceptent une URL publique ou un fichier encodé en data-URL (démo).
En production : upload vers S3/Supabase, puis stocker l'URL dans `MediaAsset.url`
et exposer `GET /api/media?slot=HOME_HERO` à la partie publique du site.

## Structure

```
app/admin/…            pages du back-office
app/api/…              routes REST
components/ui/…        primitives shadcn-like (button, card, field, table, dialog…)
components/<module>/…  vues métier (leads, inbox, cars…)
components/charts/…    Recharts (revenus, répartition)
lib/repo.ts            accès données (Prisma ou démo)
lib/validators.ts      schémas Zod
prisma/schema.prisma   modèle complet
prisma/seed.ts         jeu de données
```
