<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\MouvementStock;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
// Mouvements de stock MANUELS : reapprovisionnement (entree), perte ou
// casse (sortie). Les ventes creent leurs propres mouvements toutes seules.
// Pas de modification ni de suppression : un historique ne se reecrit pas.
class MouvementStockController extends Controller
{
    // GET /api/mouvements-stock
    // Filtres facultatifs : ?produit_id=3  et  ?type=entree (ou sortie)
    public function index(Request $request)
    {
        $query = MouvementStock::with('produit');
        if ($request->filled('produit_id')) {
            $query->where('produit_id', $request->produit_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        // Les plus recents en premier
        return $query->orderByDesc('id')->get();
    }
    // POST /api/mouvements-stock : enregistre une entree ou une sortie
    public function store(Request $request)
    {
        $data = $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'type' => 'required|in:entree,sortie',
            'quantite' => 'required|integer|min:1',
            'motif' => 'nullable|string|max:255',
        ]);
        $mouvement = DB::transaction(function () use ($data) {
            // lockForUpdate bloque la ligne du produit pendant l'operation
            // (evite que deux personnes modifient le stock en meme temps)
            $produit = Produit::lockForUpdate()->find($data['produit_id']);
            if ($data['type'] === 'sortie') {
                if ($produit->quantite_stock < $data['quantite']) {
                    throw ValidationException::withMessages([
                        'quantite' => "Stock insuffisant (disponible : "
                            . "{$produit->quantite_stock})",
                    ]);
                }
                $produit->decrement('quantite_stock', $data['quantite']);
            } else {
                $produit->increment('quantite_stock', $data['quantite']);
            }
            return MouvementStock::create($data);
        });
        return response()->json($mouvement->load('produit'), 201);
    }
}