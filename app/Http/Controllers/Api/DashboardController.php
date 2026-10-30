<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Support\Facades\DB;
// Tableau de bord : une seule adresse qui renvoie tous les indicateurs
class DashboardController extends Controller
{
    // GET /api/dashboard
    public function index()
    {
        // Ventes du jour
        $ventesAujourdhui = Vente::whereDate('date_vente', today());
        // Top 5 des produits les plus vendus
        // (jointure vente_details + produits, regroupement par produit)
        $topProduits = DB::table('vente_details')
            ->join('produits', 'produits.id', '=', 'vente_details.produit_id')
            ->select(
                'produits.id',
                'produits.nom',
                DB::raw('SUM(vente_details.quantite) as total_vendu')
            )
            ->groupBy('produits.id', 'produits.nom')
            ->orderByDesc('total_vendu')
            ->limit(5)
            ->get();
        // Ventes des 6 derniers mois, regroupees par mois (pour un graphique)
        $ventesParMois = Vente::select(
                DB::raw("DATE_FORMAT(date_vente, '%Y-%m') as mois"),
                DB::raw('SUM(montant_total) as total'),
                DB::raw('COUNT(*) as nombre')
            )
            ->where('date_vente', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();
        return response()->json([
            'nombre_produits' => Produit::count(),
            'nombre_clients' => Client::count(),
            'nombre_ventes' => Vente::count(),
            'chiffre_affaires' => (float) Vente::sum('montant_total'),
            'ventes_aujourdhui' => $ventesAujourdhui->count(),
            'ca_aujourdhui' => (float) $ventesAujourdhui->sum('montant_total'),
            // Alerte : produits dont le stock est <= au seuil
            'produits_stock_faible' => Produit::whereColumn(
                'quantite_stock', '<=', 'seuil_alerte'
            )->count(),
            'top_produits' => $topProduits,
            'ventes_par_mois' => $ventesParMois,
        ]);
    }
}