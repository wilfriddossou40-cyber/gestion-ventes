<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
class VenteController extends Controller
{
    // GET /api/ventes : historique des ventes
    // Filtres facultatifs :
    //   ?client_id=2               -> ventes d'un client
    //   ?search=ali                -> par nom de client
    //   ?date_debut=2026-10-01     -> a partir de cette date
    //   ?date_fin=2026-10-31       -> jusqu'a cette date
    public function index(Request $request)
    {
        // withCount('details') ajoute "details_count" = nombre de lignes
        $query = Vente::with('client')->withCount('details');
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            // whereHas = filtre selon une donnee de la table liee (clients)
            $query->whereHas('client', function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%");
            });
        }
        if ($request->filled('date_debut')) {
            $query->whereDate('date_vente', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('date_vente', '<=', $request->date_fin);
        }
        return $query->orderByDesc('date_vente')->orderByDesc('id')->get();
    }
    // POST /api/ventes : enregistre une vente complete
    // React envoie le client, la date et la liste des produits achetes :
    // {
    //   "client_id": 1, "date_vente": "2026-10-29",
    //   "lignes": [ {"produit_id": 1, "quantite": 2}, ... ]
    // }
    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_vente' => 'required|date',
            'lignes' => 'required|array|min:1',
            // "*" = la regle s'applique a CHAQUE ligne du tableau
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
        ]);
        // TRANSACTION : vente + lignes + baisse du stock + historique.
        // Si UNE seule etape echoue (ex : stock insuffisant),
        // TOUT est annule et la base reste comme avant.
        $vente = DB::transaction(function () use ($data) {
            // 1. On cree la vente avec un total provisoire de 0
            $vente = Vente::create([
                'client_id' => $data['client_id'],
                'date_vente' => $data['date_vente'],
                'montant_total' => 0,
            ]);
            $total = 0;
            foreach ($data['lignes'] as $ligne) {
                // 2. On relit le produit en le bloquant (stock a jour)
                $produit = Produit::lockForUpdate()->find($ligne['produit_id']);
                // 3. VERIFICATION DU STOCK avant de vendre
                if ($produit->quantite_stock < $ligne['quantite']) {
                    // Erreur 422 : l'exception annule toute la transaction
                    throw ValidationException::withMessages([
                        'lignes' => "Stock insuffisant pour {$produit->nom} "
                            . "(disponible : {$produit->quantite_stock})",
                    ]);
                }
                // 4. CALCUL AUTOMATIQUE : sous-total = quantite x prix
                // Le prix est copie dans la ligne : si le prix du produit
                // change plus tard, les anciennes ventes restent justes.
                $sousTotal = $ligne['quantite'] * $produit->prix;
                $vente->details()->create([
                    'produit_id' => $produit->id,
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $produit->prix,
                    'sous_total' => $sousTotal,
                ]);
                // 5. On diminue le stock
                $produit->decrement('quantite_stock', $ligne['quantite']);
                // 6. On note la sortie dans l'historique du stock
                $produit->mouvementStocks()->create([
                    'type' => 'sortie',
                    'quantite' => $ligne['quantite'],
                    'motif' => "Vente #{$vente->id}",
                ]);
                $total += $sousTotal;
            }
            // 7. On enregistre le montant total calcule
            $vente->update(['montant_total' => $total]);
            return $vente;
        });
        return response()->json($vente->load('client', 'details.produit'), 201);
    }
    // GET /api/ventes/{id} : une vente avec son client et ses lignes
    public function show(Vente $vente)
    {
        return $vente->load('client', 'details.produit');
    }
    // PAS de update : on ne modifie pas une vente enregistree.
    // En cas d'erreur, on annule la vente et on en refait une.
    // DELETE /api/ventes/{id} : ANNULE une vente et remet le stock
    public function destroy(Vente $vente)
    {
        DB::transaction(function () use ($vente) {
            foreach ($vente->details as $detail) {
                $produit = Produit::lockForUpdate()->find($detail->produit_id);
                // On remet en stock les quantites vendues
                $produit->increment('quantite_stock', $detail->quantite);
                $produit->mouvementStocks()->create([
                    'type' => 'entree',
                    'quantite' => $detail->quantite,
                    'motif' => "Annulation vente #{$vente->id}"
                ]);
            }

            // Les lignes sont supprimees avec la vente (cascadeOnDelete)
            $vente->delete();
        });

        return response()->json(null, 204);
    }
}