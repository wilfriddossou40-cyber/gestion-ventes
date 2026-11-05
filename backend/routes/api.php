<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\MouvementStockController;
use App\Http\Controllers\Api\VenteController;
use App\Http\Controllers\Api\DashboardController;
// apiResource cree d'un coup les 5 adresses du CRUD :
//   GET    /api/categories        -> index   (liste)
//   POST   /api/categories        -> store   (ajouter)
//   GET    /api/categories/{id}   -> show    (voir une)
//   PUT    /api/categories/{id}   -> update  (modifier)
//   DELETE /api/categories/{id}   -> destroy (supprimer)
//
// ->parameters(...) est necessaire ici : Laravel deduit "category"
// (anglais) de "categories", mais notre variable s'appelle $categorie.
Route::apiResource('categories', CategorieController::class)
    ->parameters(['categories' => 'categorie']);
// "clients" devient "client" : pas besoin de ->parameters(...)
Route::apiResource('clients', ClientController::class);
// IMPORTANT : cette route doit etre AVANT apiResource('produits'),
// sinon Laravel croit que "alertes" est un id de produit.
Route::get('produits/alertes', [ProduitController::class, 'alertes']);
Route::apiResource('produits', ProduitController::class);
// Seulement index (historique) et store (nouveau mouvement)
Route::apiResource('mouvements-stock', MouvementStockController::class)
    ->only(['index', 'store']);
// Tout sauf update : on ne modifie pas une vente enregistree
Route::apiResource('ventes', VenteController::class)
    ->except(['update']);
// Tableau de bord (statistiques)
Route::get('dashboard', [DashboardController::class, 'index']);