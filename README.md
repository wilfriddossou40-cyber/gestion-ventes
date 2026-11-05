# Gestion des ventes et des stocks

Application web de gestion commerciale permettant de gérer les produits, les clients, les ventes et les mouvements de stock. Elle repose sur une API REST Laravel et une interface React connectée à une base de données MySQL.

Projet académique.

## Installation et exécution

### Prérequis

- PHP 8.3 ou supérieur
- Composer
- MySQL 8 ou supérieur
- Node.js compatible avec Vite 8
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

Depuis la racine du projet :

```powershell
cd ../frontend
npm install
Copy-Item .env.example .env
```

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

## Accès à l'application

- **Interface web :** [http://localhost:5173](http://localhost:5173/)
- **API REST :** [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
- **Tableau de bord API :** [http://127.0.0.1:8000/api/dashboard](http://127.0.0.1:8000/api/dashboard)

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

## Technologies utilisées

| Partie | Technologies |
|---|---|
| Backend | PHP 8.3+, Laravel 13 |
| Base de données | MySQL 8+ |
| Frontend | React 19, Vite 8 |
| Style | Tailwind CSS 4 |
| Bibliothèques | Axios, Recharts, React Router |
