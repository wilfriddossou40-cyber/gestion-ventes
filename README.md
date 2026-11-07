# Gestion des ventes et des stocks

Application web de gestion commerciale permettant de gérer les produits, les clients, les ventes et les mouvements de stock. Elle repose sur une API REST Laravel et une interface React connectée à une base de données MySQL.

Projet académique.

## Équipe

**Groupe n°6**

| N° | Nom et prénom |
|---|---|
| 1 | ADJALA Odile |
| 2 | DOSSOU Wilfrid M. |
| 3 | MONSOUNDE Igor |
| 4 | TCHANSI Denis |
| 5 | VIDEKOU Sabine |

## Installation et exécution

### Prérequis

- PHP 8.4.1 ou supérieur
- Composer
- MySQL 8 ou supérieur
- Node.js compatible avec Vite 8 (testé avec Node 25.6)
- npm
- Git

### 1. Cloner le dépôt

```powershell
git clone https://github.com/wilfriddossou40-cyber/gestion-ventes.git
cd gestion-ventes
```

### 2. Installer les dépendances du backend

```powershell
cd backend
composer install
Copy-Item .env.example .env
```

### 3. Configurer MySQL et le fichier `.env`

Créer une base de données MySQL nommée `gestion_ventes`.

Configurer ensuite les paramètres de connexion dans `backend/.env` :

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_ventes
DB_USERNAME=root
DB_PASSWORD=
```

Adapter les identifiants selon votre configuration MySQL.

### 4. Préparer la base de données

Depuis le dossier `backend/` :

```powershell
php artisan key:generate
php artisan migrate --seed
```

Les seeders installent des données de démonstration pour permettre de découvrir les fonctionnalités de l'application.

### 5. Installer les dépendances du frontend

Depuis le dossier `backend/` :

```powershell
cd ../frontend
npm install
Copy-Item .env.example .env
```

Vérifier dans `frontend/.env` que l'URL de l'API pointe vers `http://127.0.0.1:8000/api`.

### 6. Démarrer l'application

Ouvrir deux terminaux.

**Terminal 1 – Backend (depuis `backend/`) :**

```powershell
php artisan serve
```

**Terminal 2 – Frontend (depuis `frontend/`) :**

```powershell
npm run dev
```

## Fonctionnalités

### Gestion des produits et des catégories

- Création, consultation, modification et suppression des produits.
- Organisation des produits par catégories.
- Gestion des références, des prix et des quantités en stock.
- Définition des seuils d'alerte pour chaque produit.

### Gestion des clients

- Enregistrement et gestion des informations des clients.
- Consultation et recherche des clients.

### Gestion des ventes

- Enregistrement des ventes avec plusieurs produits.
- Calcul automatique des montants.
- Vérification de la disponibilité du stock avant validation.
- Historique des ventes avec recherche et filtres par client et par période.
- Consultation et annulation des ventes avec rétablissement du stock.

### Gestion des stocks

- Enregistrement des entrées et sorties de stock.
- Historique des mouvements de stock.
- Mise à jour automatique du stock après chaque vente.
- Alertes en cas de stock faible.

### Tableau de bord

- Suivi du chiffre d'affaires et du nombre de ventes.
- Indicateurs sur les clients et les stocks.
- Graphiques d'évolution des ventes.
- Visualisation des catégories et des produits les plus vendus.

### Interface utilisateur

- Interface disponible en français et en anglais.
- Thèmes clair, sombre et système.
- Interface responsive adaptée aux différents écrans.

## Rapport du projet

### Contexte

Projet académique réalisé par le groupe n°6 : une application de gestion
commerciale qui centralise les produits, les clients, les ventes et les
mouvements de stock, avec un tableau de bord de suivi.

### Architecture

Le dépôt contient deux applications indépendantes qui communiquent par HTTP :

- **backend/** : API REST Laravel 13, qui porte la logique métier et accède à MySQL.
- **frontend/** : interface React 19 (Vite 8), qui appelle l'API avec Axios.

En local, l'API est servie sur `http://127.0.0.1:8000/api` et l'interface sur
`http://localhost:5173`.

### Base de données

La base `gestion_ventes` est créée par 10 migrations. Les tables propres au
projet sont : `categories`, `clients`, `produits`, `ventes`, `vente_details` et
la table des mouvements de stock. S'y ajoutent les tables standard de Laravel
(`users`, `cache`, `jobs`) et `personal_access_tokens` (Laravel Sanctum).

Six seeders alimentent la base de démonstration : catégories, clients, produits,
mouvements de stock, ventes et réapprovisionnements.

### Déroulement de l'exécution

1. Installation de PHP 8.4, des extensions requises et de Composer.
2. Installation des dépendances du backend (`composer install`, 111 paquets).
3. Création de la base, puis `php artisan migrate --seed` : 10 migrations et
   6 seeders exécutés sans erreur.
4. Installation des dépendances du frontend (`npm install`, 123 paquets,
   0 vulnérabilité signalée).
5. Démarrage de l'API et de l'interface : l'application s'exécute correctement
   avec les données de démonstration.

## Technologies utilisées

| Partie | Technologies |
|---|---|
| Backend | PHP 8.4+, Laravel 13 |
| Base de données | MySQL 8+ |
| Frontend | React 19, Vite 8 |
| Style | Tailwind CSS 4 |
| Bibliothèques | Axios, Recharts, React Router |