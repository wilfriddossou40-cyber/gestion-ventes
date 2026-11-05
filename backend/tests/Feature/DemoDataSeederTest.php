<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\MouvementStock;
use App\Models\Produit;
use App\Models\Vente;
use App\Models\VenteDetail;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class DemoDataSeederTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_demo_seeders_create_consistent_idempotent_data_and_dashboard_metrics(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('categories', 6);
        $this->assertDatabaseCount('produits', 16);
        $this->assertDatabaseCount('clients', 12);
        $this->assertDatabaseCount('ventes', 25);
        $this->assertGreaterThan(25, VenteDetail::count());
        $this->assertDatabaseHas('mouvement_stocks', [
            'motif' => 'Stock initial de démonstration',
            'type' => 'entree',
        ]);
        $this->assertSame(
            8,
            MouvementStock::query()
                ->where('motif', 'Réapprovisionnement de démonstration')
                ->count(),
        );
        $this->assertSame(
            24,
            MouvementStock::query()->where('type', 'entree')->count(),
        );
        $this->assertGreaterThan(
            0,
            MouvementStock::query()->where('type', 'sortie')->count(),
        );

        $recentMovements = $this->getJson('/api/mouvements-stock')
            ->assertOk()
            ->json();
        $this->assertSame(
            8,
            collect(array_slice($recentMovements, 0, 8))
                ->where('type', 'entree')
                ->count(),
        );

        foreach (Produit::query()->get() as $product) {
            $netMovement = (int) MouvementStock::query()
                ->where('produit_id', $product->id)
                ->selectRaw(
                    "COALESCE(SUM(CASE WHEN type = 'entree' THEN quantite ELSE -quantite END), 0) as net_stock"
                )
                ->value('net_stock');

            $this->assertSame($product->quantite_stock, $netMovement, $product->reference);
        }

        $this->assertSame(
            4,
            Produit::query()
                ->whereColumn('quantite_stock', '<=', 'seuil_alerte')
                ->count(),
        );

        $dashboard = $this->getJson('/api/dashboard', [
            'Origin' => 'http://localhost:5173',
        ])
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertJsonPath('nombre_produits', 16)
            ->assertJsonPath('nombre_clients', 12)
            ->assertJsonPath('nombre_ventes', 25)
            ->assertJsonPath('produits_stock_faible', 4)
            ->assertJsonCount(30, 'ventes_par_jour')
            ->assertJsonCount(5, 'top_produits')
            ->assertJsonCount(5, 'top_produits_par_chiffre_affaires')
            ->assertJsonCount(6, 'ventes_par_categorie')
            ->assertJsonCount(5, 'dernieres_ventes');

        $this->assertGreaterThan(0, $dashboard->json('chiffre_affaires'));
        $this->assertGreaterThan(0, collect($dashboard->json('ventes_par_jour'))->sum('total'));
        $this->assertSame(
            6,
            collect($dashboard->json('ventes_par_categorie'))
                ->where('chiffre_affaires', '>', 0)
                ->count(),
        );

        $stockBeforeReseed = Produit::query()->orderBy('id')->pluck('quantite_stock')->all();
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('categories', 6);
        $this->assertDatabaseCount('produits', 16);
        $this->assertDatabaseCount('clients', 12);
        $this->assertDatabaseCount('ventes', 25);
        $this->assertSame($stockBeforeReseed, Produit::query()->orderBy('id')->pluck('quantite_stock')->all());
        $this->assertSame(25, Vente::query()->count());
    }

    public function test_sale_above_available_stock_is_rejected_without_partial_records(): void
    {
        $this->seed(DatabaseSeeder::class);

        $product = Produit::query()->where('reference', 'DEMO-EPI-004')->firstOrFail();
        $clientId = Client::query()
            ->where('email', 'aicha.diallo@example.test')
            ->value('id');
        $salesCount = Vente::query()->count();
        $movementCount = MouvementStock::query()->count();

        $this->postJson('/api/ventes', [
            'client_id' => $clientId,
            'date_vente' => today()->toDateString(),
            'lignes' => [
                [
                    'produit_id' => $product->id,
                    'quantite' => $product->quantite_stock + 1,
                ],
            ],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('lignes');

        $this->assertSame($salesCount, Vente::query()->count());
        $this->assertSame($movementCount, MouvementStock::query()->count());
        $this->assertSame(5, $product->fresh()->quantite_stock);
    }
}
