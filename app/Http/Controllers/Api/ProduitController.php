<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ProduitController extends Controller
{
    // GET /api/produits
    // Filtres possibles (tous facultatifs) :
    //   ?search=stylo        -> cherche dans le nom ou la reference
    //   ?categorie_id=2      -> produits d'une categorie
    //   ?stock_faible=1      -> produits en alerte de stock
    public function index(Request $request)
    {
        // with('categorie') charge aussi la categorie de chaque produit,
        // pour afficher son nom directement dans React
        $query = Produit::with('categorie');
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('reference', 'like', "%$search%");
            });
        }
        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }
        // Alerte : quantite en stock <= seuil d'alerte (compare 2 colonnes)
        if ($request->boolean('stock_faible')) {
            $query->whereColumn('quantite_stock', '<=', 'seuil_alerte');
        }
        return $query->orderBy('nom')->get();
    }
    // GET /api/produits/alertes : raccourci pour les produits en stock faible
    public function alertes()
    {
         return Produit::with('categorie')
            ->whereColumn('quantite_stock', '<=', 'seuil_alerte')
            ->orderBy('quantite_stock')
            ->get();
    }
    // POST /api/produits : ajoute un produit
    public function store(Request $request)
    {
        $data = $request->validate([
            // exists = la categorie doit exister dans la table categories
            'categorie_id' => 'required|exists:categories,id',
            'nom' => 'required|string|max:255',
            'reference' => 'required|string|max:100|unique:produits,reference',
            'prix' => 'required|numeric|min:0',
            // sometimes = valide seulement si le champ est envoye
            'quantite_stock' => 'sometimes|integer|min:0',
            'seuil_alerte' => 'sometimes|integer|min:0',
        ]);
        // Transaction : tout est enregistre, ou rien du tout
        $produit = DB::transaction(function () use ($data) {
            $produit = Produit::create($data);
            // Si un stock de depart est donne, on le note dans l'historique
            $stockInitial = $data['quantite_stock'] ?? 0;
            if ($stockInitial > 0) {
                $produit->mouvementStocks()->create([
                    'type' => 'entree',
                    'quantite' => $stockInitial,
                    'motif' => 'Stock initial',
                ]);
            }
            return $produit;
        });
        return response()->json($produit->load('categorie'), 201);
    }
    // GET /api/produits/{id} : UN produit avec sa categorie
    public function show(Produit $produit)
    {
        return $produit->load('categorie');
    }
    // PUT /api/produits/{id} : modifie un produit
    // Le stock n'est PAS modifiable ici : il change seulement par les
    // ventes et les mouvements de stock (pour garder un historique fiable).
    public function update(Request $request, Produit $produit)
    {
        $data = $request->validate([
            'categorie_id' => 'required|exists:categories,id',
            'nom' => 'required|string|max:255',
            'reference' => 'required|string|max:100|unique:produits,reference,'
                . $produit->id,
            'prix' => 'required|numeric|min:0',
            'seuil_alerte' => 'sometimes|integer|min:0',
        ]);
        $produit->update($data);
        return $produit->load('categorie');
    }
    // DELETE /api/produits/{id} : supprime, sauf si deja vendu
    public function destroy(Produit $produit)
    {
        if ($produit->venteDetails()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : ce produit a deja ete vendu.'
            ], 409);
        }
        // On supprime d'abord son historique de stock (sinon MySQL refuse)
        $produit->mouvementStocks()->delete();
        $produit->delete();
        return response()->json(null, 204);
    }
}