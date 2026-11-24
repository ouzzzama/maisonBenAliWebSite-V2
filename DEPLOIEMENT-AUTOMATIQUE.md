# Déploiement automatique vers Hostinger

Un `git push` sur `main` suffit désormais : les CSS/JS sont re-versions automatiquement,
le site part chez Hostinger et l'app Node (CRM) est reconstruite puis redémarrée par
Hostinger. Plus aucun envoi de fichiers à la main.

```
push sur main
   │
   ├── GitHub Actions · scripts/cache-bust.mjs   hash des CSS/JS → ?v=…
   ├── GitHub Actions · scripts/build-site.mjs   dist/ (pages + assets uniquement)
   ├── GitHub Actions · FTP vers public_html/    envoi incrémental, sans nettoyage
   ├── GitHub Actions · vérification              HTTP 200 + hash servi = hash local
   └── Hostinger (intégration Git de l'app Node)  npm install → build → redémarrage
       GitHub Actions · vérification              /login 200 + /api/public/cars 200
```

## 1. Installation, une seule fois

### a. Compte FTP

hPanel → **Fichiers → Comptes FTP** : créez (ou réutilisez) un compte dont le dossier
est `public_html` (c'est celui que le CRM utilise déjà pour les images).
Notez l'hôte, l'utilisateur et le mot de passe.

### b. Secrets GitHub

Dépôt `ouzzzama/maisonBenAliWebSite-V2` → **Settings → Secrets and variables → Actions** :

| Nom | Type | Valeur |
| --- | --- | --- |
| `FTP_SERVER` | secret | hôte FTP, ex. `ftp.maisonbenali.com` |
| `FTP_USERNAME` | secret | utilisateur du compte FTP |
| `FTP_PASSWORD` | secret | mot de passe du compte FTP |
| `FTP_SERVER_DIR` | variable (optionnel) | `/public_html/` par défaut ; mettez `/` si le compte FTP est déjà ouvert sur `public_html` |
| `SITE_URL` | variable (optionnel) | `https://maisonbenali.com` |
| `CRM_URL` | variable (optionnel) | `https://crm.maisonbenali.com` |

Les deux variables sont facultatives : ce sont les valeurs par défaut.

### c. App Node (CRM)

hPanel → l'application Node.js du CRM → **Git / Déploiement** :

- dépôt `ouzzzama/maisonBenAliWebSite-V2`, branche `main`
- dossier racine : `crm`
- commande de build : `npx prisma generate && npm run build`
- commande de démarrage : `npm run start`
- **auto-déploiement activé** (Hostinger redéploie et redémarre à chaque push)

C'est cette intégration qui redémarre le process Node : inutile de cliquer « Redémarrer »
après un changement de code. Elle ne sert qu'après une modification de variables
d'environnement. Le job `crm` du workflow vérifie ensuite que `/login` et
`/api/public/cars` répondent en 200 : si le build Hostinger échoue, l'ancienne
version reste en ligne et ce contrôle le signale (le build est visible dans
hPanel → app Node.js → *Deployments*).

### d. Hooks locaux

```bash
npm run hooks:install   # une fois par clone
```

Le hook `pre-commit` met à jour les `?v=` avant chaque commit (et réindexe les pages
HTML modifiées) : le dépôt contient toujours des hashes à jour, même si le déploiement
les recalcule de son côté. Il se contourne avec `MB_SKIP_ASSET_HASH=1 git commit …`.

## 2. Utilisation quotidienne

```bash
git add -A && git commit -m "…" && git push
```

C'est tout. Le workflow **Déploiement Hostinger** (onglet *Actions*) montre les étapes :
hash, assemblage, FTP, puis les deux vérifications.

Déclenchement manuel : *Actions → Déploiement Hostinger → Run workflow*.

## 3. Comment le cache-busting fonctionne

`scripts/cache-bust.mjs` parcourt les 20 pages HTML et remplace chaque
`…/style.css?v=97` par `…/style.css?v=1bc41f67c5`, le hash SHA-256 du contenu du
fichier (10 caractères). Dès qu'un CSS ou un JS change, son adresse change : le
navigateur télécharge la nouvelle version, sans vider son cache.

```bash
npm run assets:hash    # met à jour les ?v= (fait aussi par le hook et la CI)
npm run assets:check   # sort en erreur si un hash est périmé
npm run site:build     # construit dist/ comme la CI
```

Le script est idempotent : sans modification de fichier, il n'écrit rien.
Les références externes (CDN) et les fichiers absents ne sont jamais touchés.

## 4. Ce qui est publié (et ce qui ne l'est pas)

`dist/` contient uniquement : les pages `*.html` de la racine, `assets/`,
`robots.txt`, `sitemap.xml` et `.htaccess`.

Ne partent jamais en ligne : `crm/` (code du CRM), `server.js`, `launcher/`,
`.env`, `node_modules/`, `data/`, les `.md`/`.txt`. Une page qui pointerait vers
un CSS/JS absent fait échouer la CI (`scripts/build-site.mjs`).

La synchronisation FTP est **incrémentale et sans nettoyage** : les fichiers
inchangés ne repartent pas, et surtout `public_html/uploads` (images envoyées par
le CRM) n'est jamais effacé. Le premier envoi complet est long (~255 Mo) ; les
suivants ne concernent que les fichiers modifiés.

## 5. Dépannage

- **Échec à l'étape FTP (FTPS)** : certains comptes Hostinger n'acceptent que le FTP
  simple. Dans `.github/workflows/deploy.yml`, passez `protocol: ftps` à `protocol: ftp`.
- **Erreur 530** : utilisateur ou mot de passe FTP ; vérifiez aussi que le compte a
  bien `public_html` comme dossier racine.
- **« Le site en ligne ne sert pas encore les nouveaux hashes »** : cache LiteSpeed ou
  propagation. Relancez le workflow ; sinon purgez le cache dans hPanel.
- **Le CRM ne répond pas** : ouvrez hPanel → app Node.js → *Deployments* pour lire le
  build. Un build en échec (variable d'environnement manquante, Prisma) laisse l'ancienne
  version en ligne : le CRM répond alors, mais avec l'ancien code.
- **Changement de variables d'environnement du CRM** : hPanel → app Node.js →
  *Redémarrer* (l'auto-déploiement ne le fait que sur un push).
