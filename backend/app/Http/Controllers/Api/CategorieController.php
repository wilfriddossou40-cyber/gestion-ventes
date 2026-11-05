<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\Request;
class CategorieController extends Controller
{
    // GET /api/categories : TOUTES les categories
    public function index()
    {
        return Categorie::all();
    }
    // POST /api/categories : ajoute une categorie
    public function store(Request $request)
    {
        // required = obligatoire | string = texte | max:255 = 255 car. max
        // unique = pas deux categories avec le meme nom
        // nullable = peut rester vide
        $data = $request->validate([
            'nom' => 'required|string|max:255|unique:categories,nom',
            'description' => 'nullable|string',
        ]);
        $categorie = Categorie::create($data);
        // 201 = "cree avec succes"
        return response()->json($categorie, 201);
    }
    // GET /api/categories/{id} : UNE categorie
    // Laravel la cherche tout seul grace a l'id (404 si elle n'existe pas)
    public function show(Categorie $categorie)
    {
        return $categorie;
    }
    // PUT /api/categories/{id} : modifie une categorie
    public function update(Request $request, Categorie $categorie)
    {
        // "unique:categories,nom,ID" = unique SAUF pour cette categorie
        $data = $request->validate([
            'nom' => 'required|string|max:255|unique:categories,nom,' . $categorie->id,
            'description' => 'nullable|string',
        ]);
        $categorie->update($data);
        return $categorie;
    }
    // DELETE /api/categories/{id} : supprime une categorie
    public function destroy(Categorie $categorie)
    {
        // On refuse si des produits utilisent cette categorie
        if ($categorie->produits()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : cette categorie a des produits.'
            ], 409);
        }
        $categorie->delete();
        // 204 = "fait, rien a renvoyer"
        return response()->json(null, 204);
    }
}