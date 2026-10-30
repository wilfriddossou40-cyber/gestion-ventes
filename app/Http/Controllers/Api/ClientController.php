<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
class ClientController extends Controller
{
    // GET /api/clients
    // GET /api/clients?search=ali
    // Sans "search" : tous les clients. Avec "search" : liste filtree.
    public function index(Request $request)
    {
        // On prepare la demande sans rien chercher encore
        $query = Client::query();
        // Si React envoie ?search=..., on ajoute une condition
        if ($request->filled('search')) {
            $search = $request->search;
            // Le nom, le telephone OU l'email doit contenir le texte tape
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('telephone', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }
        // Tri par nom, puis get() va vraiment chercher les resultats
        return $query->orderBy('nom')->get();
    }
    // POST /api/clients : ajoute un client
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255|unique:clients,email',
            'adresse' => 'nullable|string|max:255',
        ]);
        $client = Client::create($data);
        return response()->json($client, 201);
    }
    // GET /api/clients/{id} : UN client
    public function show(Client $client)
    {
        return $client;
    }
    // PUT /api/clients/{id} : modifie un client
    public function update(Request $request, Client $client)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:30',
            // email unique SAUF pour ce client lui-meme
            'email' => 'nullable|email|max:255|unique:clients,email,' . $client->id,
            'adresse' => 'nullable|string|max:255',
        ]);
        $client->update($data);
        return $client;
    }
    // DELETE /api/clients/{id} : supprime, sauf si le client a des ventes
    public function destroy(Client $client)
    {
        if ($client->ventes()->exists()) {
            // 409 = conflit : suppression refusee avec un message clair
            return response()->json([
                'message' => 'Impossible de supprimer : ce client a des ventes.'
            ], 409);
        }
        $client->delete();
        return response()->json(null, 204);
    }
}