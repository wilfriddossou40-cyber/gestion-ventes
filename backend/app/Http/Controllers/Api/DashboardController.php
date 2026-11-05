<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\Produit;
use App\Models\Vente;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = today();
        $currentMonthStart = $today->copy()->startOfMonth();
        $previousMonthStart = $currentMonthStart->copy()->subMonth();
        $previousMonthEnd = $currentMonthStart->copy()->subDay();
        $currentMonth = Vente::query()
            ->whereBetween('date_vente', [$currentMonthStart, $today])
            ->selectRaw('COALESCE(SUM(montant_total), 0) as chiffre_affaires')
            ->selectRaw('COUNT(*) as nombre')
            ->first();
        $previousMonth = Vente::query()
            ->whereBetween('date_vente', [$previousMonthStart, $previousMonthEnd])
            ->selectRaw('COALESCE(SUM(montant_total), 0) as chiffre_affaires')
            ->selectRaw('COUNT(*) as nombre')
            ->first();

        $ventesAujourdhui = Vente::query()->whereDate('date_vente', $today);
        $ventesDerniersJours = Vente::query()
            ->whereBetween('date_vente', [$today->copy()->subDays(6), $today]);
        $ventesParJour = Vente::query()
            ->whereBetween('date_vente', [$today->copy()->subDays(29), $today])
            ->selectRaw('DATE(date_vente) as jour')
            ->selectRaw('SUM(montant_total) as total')
            ->selectRaw('COUNT(*) as nombre')
            ->groupBy('jour')
            ->get()
            ->keyBy('jour');

        $topProduits = DB::table('vente_details')
            ->join('produits', 'produits.id', '=', 'vente_details.produit_id')
            ->select('produits.id', 'produits.nom')
            ->selectRaw('SUM(vente_details.quantite) as total_vendu')
            ->groupBy('produits.id', 'produits.nom')
            ->orderByDesc('total_vendu')
            ->orderBy('produits.id')
            ->limit(5)
            ->get();
        $topProduitsParChiffreAffaires = DB::table('vente_details')
            ->join('produits', 'produits.id', '=', 'vente_details.produit_id')
            ->select('produits.id', 'produits.nom')
            ->selectRaw('SUM(vente_details.sous_total) as chiffre_affaires')
            ->groupBy('produits.id', 'produits.nom')
            ->orderByDesc('chiffre_affaires')
            ->orderBy('produits.id')
            ->limit(5)
            ->get();
        $ventesParCategorie = Categorie::query()
            ->leftJoin('produits', 'categories.id', '=', 'produits.categorie_id')
            ->leftJoin('vente_details', 'produits.id', '=', 'vente_details.produit_id')
            ->leftJoin('ventes', 'vente_details.vente_id', '=', 'ventes.id')
            ->select('categories.id', 'categories.nom')
            ->selectRaw('COALESCE(SUM(vente_details.quantite), 0) as quantite_vendue')
            ->selectRaw('COALESCE(SUM(vente_details.sous_total), 0) as chiffre_affaires')
            ->selectRaw('COUNT(DISTINCT ventes.id) as nombre_ventes')
            ->groupBy('categories.id', 'categories.nom')
            ->orderByDesc('chiffre_affaires')
            ->orderBy('categories.id')
            ->get();
        $monthExpression = DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', date_vente)"
            : "DATE_FORMAT(date_vente, '%Y-%m')";
        $ventesParMois = Vente::query()
            ->selectRaw($monthExpression.' as mois')
            ->selectRaw('SUM(montant_total) as total')
            ->selectRaw('COUNT(*) as nombre')
            ->where('date_vente', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        $chiffreAffairesMoisPrecedent = (float) $previousMonth->chiffre_affaires;
        $nombreVentesMoisPrecedent = (int) $previousMonth->nombre;
        $chiffreAffairesMois = (float) $currentMonth->chiffre_affaires;
        $nombreVentesMois = (int) $currentMonth->nombre;

        return response()->json([
            'nombre_produits' => Produit::count(),
            'nombre_clients' => Client::count(),
            'nombre_ventes' => Vente::count(),
            'chiffre_affaires' => (float) Vente::sum('montant_total'),
            'chiffre_affaires_mois' => $chiffreAffairesMois,
            'nombre_ventes_mois' => $nombreVentesMois,
            'chiffre_affaires_mois_precedent' => $chiffreAffairesMoisPrecedent,
            'nombre_ventes_mois_precedent' => $nombreVentesMoisPrecedent,
            'variation_chiffre_affaires' => $this->percentageChange(
                $chiffreAffairesMois,
                $chiffreAffairesMoisPrecedent
            ),
            'variation_nombre_ventes' => $this->percentageChange(
                (float) $nombreVentesMois,
                (float) $nombreVentesMoisPrecedent
            ),
            'valeur_stock' => (float) Produit::query()
                ->selectRaw('COALESCE(SUM(prix * quantite_stock), 0) as valeur_stock')
                ->first()
                ->valeur_stock,
            'ventes_aujourdhui' => $ventesAujourdhui->count(),
            'ca_aujourdhui' => (float) $ventesAujourdhui->sum('montant_total'),
            'nombre_ventes_7_derniers_jours' => $ventesDerniersJours->count(),
            'ca_7_derniers_jours' => (float) $ventesDerniersJours->sum('montant_total'),
            'produits_stock_faible' => Produit::whereColumn(
                'quantite_stock',
                '<=',
                'seuil_alerte'
            )->count(),
            'ventes_par_jour' => collect(CarbonPeriod::create(
                $today->copy()->subDays(29),
                $today
            ))->map(function ($day) use ($ventesParJour) {
                $date = $day->toDateString();
                $sales = $ventesParJour->get($date);

                return [
                    'jour' => $date,
                    'total' => (float) ($sales->total ?? 0),
                    'nombre' => (int) ($sales->nombre ?? 0),
                ];
            })->values(),
            'top_produits' => $topProduits->map(fn ($product) => [
                'id' => $product->id,
                'nom' => $product->nom,
                'total_vendu' => (int) $product->total_vendu,
            ]),
            'top_produits_par_chiffre_affaires' => $topProduitsParChiffreAffaires
                ->map(fn ($product) => [
                    'id' => $product->id,
                    'nom' => $product->nom,
                    'chiffre_affaires' => (float) $product->chiffre_affaires,
                ]),
            'ventes_par_categorie' => $ventesParCategorie->map(fn ($category) => [
                'id' => $category->id,
                'nom' => $category->nom,
                'quantite_vendue' => (int) $category->quantite_vendue,
                'chiffre_affaires' => (float) $category->chiffre_affaires,
                'nombre_ventes' => (int) $category->nombre_ventes,
            ]),
            'ventes_par_mois' => $ventesParMois,
            'dernieres_ventes' => Vente::query()
                ->with('client:id,nom')
                ->orderByDesc('date_vente')
                ->orderByDesc('id')
                ->limit(5)
                ->get(),
        ]);
    }

    private function percentageChange(float $current, float $previous): ?float
    {
        if ($previous === 0.0) {
            return null;
        }

        return (($current - $previous) / $previous) * 100;
    }
}
