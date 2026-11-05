# Gestion des ventes et des stocks

Application web de gestion des produits, des clients, des ventes et des stocks. Le backend expose une API REST Laravel connectée à MySQL et le frontend React consomme cette API. Ce dépôt correspond à un projet académique.

## Démarrage rapide

Prérequis : PHP 8.3+, Composer, MySQL 8+, Node.js 20.19+ ou 22.12+ et npm. Depuis un clone du dépôt, ces commandes PowerShell lancent les deux serveurs ; adaptez les identifiants MySQL de `backend/.env` avant les migrations si nécessaire.

1. Créez la base :
   ```powershell
   mysql -u root -e "CREATE DATABASE gestion_ventes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
2. Dans un premier terminal, installez et préparez l’API :
   ```powershell
   Set-Location backend; composer install; Copy-Item .env.example .env; php artisan key:generate; php artisan migrate --seed
   ```
3. Lancez l’API dans ce terminal :
   ```powershell
   php artisan serve --host=127.0.0.1 --port=8000
   ```
4. Dans un second terminal, installez et lancez l’interface :
   ```powershell
   Set-Location frontend; npm install; Copy-Item .env.example .env; npm run dev
   ```

Ouvrez <http://localhost:5173>. L’API est disponible sur <http://127.0.0.1:8000/api>.

## Fonctionnalités

- Gestion des produits et des catégories, avec références uniques et seuils d'alerte.
- Gestion des clients.
- Enregistrement des ventes avec vérification du stock, mise à jour des quantités et création des mouvements associés.
- Historique des ventes avec recherche par client, filtre client et filtres de dates.
- Enregistrement et consultation des mouvements de stock (entrées et sorties).
- Alertes pour les produits dont le stock est inférieur ou égal au seuil défini.
- Tableau de bord alimenté par l'API : chiffre d'affaires, ventes, clients, stock, évolutions, catégories et produits les plus vendus.
- Interface disponible en français et en anglais, avec thèmes clair, sombre et système.

## Technologies et versions

Les versions ci-dessous sont celles déclarées dans les manifestes ou observées dans l'environnement de développement vérifié. Les contraintes entre parenthèses viennent des fichiers de dépendances.

| Technologie | Version / contrainte |
|---|---|
| PHP | `^8.3` requis ; PHP 8.4.12 vérifié |
| Laravel | `^13.17` déclaré ; Laravel Framework 13.39.0 vérifié |
| Laravel Sanctum | `^4.0` |
| Composer | 2.10.2 vérifié |
| MySQL | MySQL 8.x requis ; client 8.4.3 détecté et extension PHP `pdo_mysql` disponible |
| Node.js | v24.15.0 vérifié |
| npm | 11.12.1 vérifié |
| React / React DOM | 19.3.1 |
| Vite | 8.3.5 |
| Recharts | 3.10.1 |
| React Router | 7.18.5 |
| Tailwind CSS | 4.3.3 |
| Axios | 1.21.0 |
| date-fns | 4.4.0 |
| Lucide React | 1.63.0 |
| React Hook Form | 7.91.0 |

## Architecture

```text
backend/                         # API Laravel
├── app/
│   ├── Http/Controllers/Api/    # Contrôleurs REST
│   └── Models/                  # Modèles Eloquent et relations
├── database/
│   ├── migrations/              # Schéma SQL et clés étrangères
│   └── seeders/                 # Données initiales
├── routes/
│   └── api.php                 # Routes de l'API
├── tests/
│   └── Feature/                 # Tests fonctionnels
└── composer.json                # Dépendances PHP

frontend/                        # Application React / Vite
├── src/
│   ├── api/                     # Client HTTP et appels API
│   ├── components/              # Composants métier et UI partagés
│   ├── context/                 # Langue et thème
│   ├── hooks/                   # Hooks de données
│   ├── i18n/                    # Traductions française et anglaise
│   ├── lib/                     # Fonctions utilitaires
│   └── pages/                   # Accueil et pages de l'application
├── package.json                 # Dépendances et scripts frontend
└── vite.config.js               # Configuration Vite
```

### Schéma des tables métier

Les colonnes `id` sont les clés primaires. Les tables métier comportent également `created_at` et `updated_at`.

| Table | Colonnes clés | Relations / clés étrangères |
|---|---|---|
| `categories` | `id`, `nom` (unique), `description` | Une catégorie possède plusieurs produits. |
| `clients` | `id`, `nom`, `telephone`, `email`, `adresse` | Un client peut avoir plusieurs ventes. |
| `produits` | `id`, `categorie_id`, `nom`, `reference` (unique), `prix`, `quantite_stock`, `seuil_alerte` | `categorie_id` référence `categories.id`. Un produit apparaît dans des détails de vente et des mouvements de stock. |
| `ventes` | `id`, `client_id`, `date_vente`, `montant_total` | `client_id` référence `clients.id`. Une vente possède plusieurs détails. |
| `vente_details` | `id`, `vente_id`, `produit_id`, `quantite`, `prix_unitaire`, `sous_total` | `vente_id` référence `ventes.id` avec suppression en cascade ; `produit_id` référence `produits.id`. |
| `mouvement_stocks` | `id`, `produit_id`, `type` (`entree` / `sortie`), `quantite`, `motif` | `produit_id` référence `produits.id`. |

Laravel ajoute également ses tables de support (utilisateurs, sessions, cache, tâches en file et jetons personnels). Elles ne constituent pas un système de connexion dans l'interface actuelle.

## Installation et lancement

### Prérequis

- PHP 8.3 ou ultérieur avec `pdo_mysql`.
- Composer 2.x.
- MySQL 8.x, démarré localement.
- Node.js compatible avec Vite 8 (Node.js 20.19+ ou 22.12+) et npm.

### Backend

Depuis la racine du dépôt, créez la base MySQL (adaptez l'utilisateur si nécessaire) :

```powershell
mysql -u root -e "CREATE DATABASE gestion_ventes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Puis installez et démarrez l'API :

```powershell
Set-Location backend
composer install
Copy-Item .env.example .env
```

Modifiez au besoin `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` et `DB_PASSWORD` dans `backend/.env`, puis exécutez :

```powershell
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Les seeders chargent les données de démonstration métier ; aucun utilisateur de connexion n’est requis pour utiliser l’interface.

### Frontend

Dans un autre terminal :

```powershell
Set-Location frontend
npm install
Copy-Item .env.example .env
npm run dev
```

`VITE_API_URL` pointe par défaut vers `http://127.0.0.1:8000/api`. Changez cette valeur si l'API est servie ailleurs. Le fichier `frontend/.env` doit exister avant de lancer Vite ; copiez `frontend/.env.example`.

### URLs locales

- Interface : <http://localhost:5173>
- API : <http://127.0.0.1:8000/api>
- Tableau de bord API : <http://127.0.0.1:8000/api/dashboard>

## Parcours de démonstration

1. Depuis **Produits**, créez un produit en lui attribuant une catégorie, un prix, une quantité de départ et un seuil d’alerte.
2. Ouvrez **Ventes > Nouvelle vente**, sélectionnez un client et ajoutez ce produit au panier.
3. Validez la vente, puis retournez dans **Produits** ou **Stock** : la quantité disponible a diminué et un mouvement de sortie a été enregistré.
4. Recommencez en demandant une quantité supérieure au stock disponible : l’API refuse la vente et ne crée ni vente partielle ni mouvement.
5. Consultez **Ventes** pour rechercher et filtrer l’historique.
6. Ouvrez le **Tableau de bord** pour voir les indicateurs, l’évolution des ventes, les catégories et les produits les plus vendus.

## API principale

Routes relevées avec `php artisan route:list --path=api`. Les routes sont actuellement accessibles sans authentification.

| Méthode | URL | Rôle |
|---|---|---|
| `GET` | `/api/categories` | Lister les catégories |
| `POST` | `/api/categories` | Créer une catégorie |
| `GET` | `/api/categories/{categorie}` | Consulter une catégorie |
| `PUT`, `PATCH` | `/api/categories/{categorie}` | Modifier une catégorie |
| `DELETE` | `/api/categories/{categorie}` | Supprimer une catégorie sans produit associé |
| `GET` | `/api/clients` | Lister/rechercher les clients (`?search=`) |
| `POST` | `/api/clients` | Créer un client |
| `GET` | `/api/clients/{client}` | Consulter un client |
| `PUT`, `PATCH` | `/api/clients/{client}` | Modifier un client |
| `DELETE` | `/api/clients/{client}` | Supprimer un client sans vente associée |
| `GET` | `/api/produits` | Lister/rechercher les produits (`search`, `categorie_id`, `stock_faible`) |
| `GET` | `/api/produits/alertes` | Lister les produits en stock faible |
| `POST` | `/api/produits` | Créer un produit |
| `GET` | `/api/produits/{produit}` | Consulter un produit |
| `PUT`, `PATCH` | `/api/produits/{produit}` | Modifier un produit |
| `DELETE` | `/api/produits/{produit}` | Supprimer un produit qui n'a pas été vendu |
| `GET` | `/api/ventes` | Consulter l'historique (filtres `client_id`, `search`, `date_debut`, `date_fin`) |
| `POST` | `/api/ventes` | Enregistrer une vente |
| `GET` | `/api/ventes/{vente}` | Consulter le détail d'une vente |
| `DELETE` | `/api/ventes/{vente}` | Annuler une vente et rétablir les stocks |
| `GET` | `/api/mouvements-stock` | Lister les mouvements (`produit_id`, `type`) |
| `POST` | `/api/mouvements-stock` | Enregistrer une entrée ou sortie de stock |
| `GET` | `/api/dashboard` | Récupérer les indicateurs et agrégations du tableau de bord |

Une vente enregistrée n'a pas de route de modification : elle peut être annulée puis recréée.

## Règles métier

- Avant une vente, l'API vérifie que le stock couvre chaque quantité demandée.
- La vente, ses lignes, la décrémentation du stock et les mouvements correspondants sont traités dans une transaction. Les produits sont relus avec verrouillage (`lockForUpdate`) pour éviter les mises à jour concurrentes du stock.
- Le montant total et les sous-totaux sont calculés côté serveur à partir des prix des produits en base ; les prix envoyés par le navigateur ne font pas autorité.
- Une sortie manuelle de stock est refusée si la quantité disponible est insuffisante.
- La suppression d'un produit lié à une vente ou d'une catégorie contenant encore des produits est protégée. La suppression d'un client ayant des ventes est également refusée.
- L'annulation d'une vente rétablit les quantités et inscrit les mouvements d'entrée correspondants.

## Tests et vérifications

Depuis `backend/` :

```powershell
php artisan test
```

Depuis `frontend/` :

```powershell
npm run build
npm run lint
```

## Limites et améliorations possibles

- Aucune authentification ni autorisation n'est actuellement appliquée aux routes API ; ne pas exposer ce serveur tel quel à Internet.
- La pagination côté serveur et des politiques d'accès par rôle pourraient être ajoutées si le volume de données ou les besoins d'exploitation augmentent.
- `npm run lint` signale actuellement des avertissements Oxlint dans certains hooks et composants, même si la commande se termine avec succès.

## Dépannage

- **Base inexistante ou connexion refusée** : vérifiez que MySQL est démarré, créez `gestion_ventes`, puis contrôlez `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` et `DB_PASSWORD` dans `backend/.env`. Après correction, relancez `php artisan migrate --seed`.
- **Erreur CORS dans le navigateur** : utilisez les origines locales `http://localhost:5173` ou `http://127.0.0.1:5173` et l’URL API `http://127.0.0.1:8000/api`. Si Vite utilise une autre origine, ajoutez-la à `backend/config/cors.php`, puis redémarrez Laravel.
- **Port occupé** : lancez `php artisan serve --port=8001` ou `npm run dev -- --port 5174`, puis adaptez `VITE_API_URL` dans `frontend/.env` à l’adresse de l’API. Si Vite change de port, ajoutez aussi son origine (`http://localhost:5174`, par exemple) à `allowed_origins` dans `backend/config/cors.php`.
- **Clé d’application manquante** : depuis `backend/`, exécutez `php artisan key:generate` après avoir créé `.env`.
- **Fichier frontend `.env` absent** : depuis `frontend/`, copiez `.env.example` vers `.env`, puis relancez `npm run dev`.
