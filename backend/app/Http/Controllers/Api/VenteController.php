<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

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

        return response()->json(
            $this->createFromValidatedData($data)->load('client', 'details.produit'),
            201,
        );
    }

    /**
     * @param  array{client_id: int, date_vente: string, lignes: list<array{produit_id: int, quantite: int}>}  $data
     */
    public function createFromValidatedData(array $data): Vente
    {
        return DB::transaction(function () use ($data): Vente {
            $vente = Vente::create([
                'client_id' => $data['client_id'],
                'date_vente' => $data['date_vente'],
                'montant_total' => 0,
            ]);

            $total = 0.0;
            foreach ($data['lignes'] as $ligne) {
                $product = Produit::query()->lockForUpdate()->find($ligne['produit_id']);
                if ($product === null) {
                    throw new RuntimeException("Produit introuvable : {$ligne['produit_id']}");
                }

                if ($product->quantite_stock < $ligne['quantite']) {
                    throw ValidationException::withMessages([
                        'lignes' => "Stock insuffisant pour {$product->nom} "
                            ."(disponible : {$product->quantite_stock})",
                    ]);
                }

                $subtotal = $ligne['quantite'] * $product->prix;
                $vente->details()->create([
                    'produit_id' => $product->id,
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $product->prix,
                    'sous_total' => $subtotal,
                ]);
                $product->decrement('quantite_stock', $ligne['quantite']);
                $product->mouvementStocks()->create([
                    'type' => 'sortie',
                    'quantite' => $ligne['quantite'],
                    'motif' => "Vente #{$vente->id}",
                ]);

                $total += $subtotal;
            }

            $vente->update(['montant_total' => $total]);

            return $vente;
        });
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
                    'motif' => "Annulation vente #{$vente->id}",
                ]);
            }

            // Les lignes sont supprimees avec la vente (cascadeOnDelete)
            $vente->delete();
        });

        return response()->json(null, 204);
    }
}
