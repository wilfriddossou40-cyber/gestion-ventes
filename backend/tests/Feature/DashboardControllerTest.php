<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Client;
use App\Models\Produit;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_dashboard_returns_database_kpis_and_sales_breakdowns(): void
    {
        $this->travelTo('2026-11-05 12:00:00');
        $categoryA = Categorie::create(['nom' => 'Category A']);
        $categoryB = Categorie::create(['nom' => 'Category B']);
        $clientA = Client::create(['nom' => 'Client A']);
        $clientB = Client::create(['nom' => 'Client B']);
        $productA = Produit::create([
            'categorie_id' => $categoryA->id,
            'nom' => 'Product A',
            'reference' => 'PRODUCT-A',
            'prix' => 10,
            'quantite_stock' => 10,
            'seuil_alerte' => 2,
        ]);
        $productB = Produit::create([
            'categorie_id' => $categoryB->id,
            'nom' => 'Product B',
            'reference' => 'PRODUCT-B',
            'prix' => 20,
            'quantite_stock' => 3,
            'seuil_alerte' => 2,
        ]);

        $this->createSale($clientA->id, '2026-11-05', $productA->id, 1);
        $this->createSale($clientB->id, '2026-11-05', $productB->id, 1);
        $this->createSale($clientA->id, '2026-10-25', $productA->id, 1);
        $this->createSale($clientB->id, '2026-10-20', $productB->id, 1);
        $this->createSale($clientA->id, '2026-10-15', $productA->id, 1);
        $this->createSale($clientB->id, '2026-10-05', $productB->id, 1);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('chiffre_affaires', 90)
            ->assertJsonPath('chiffre_affaires_mois', 30)
            ->assertJsonPath('nombre_ventes_mois', 2)
            ->assertJsonPath('chiffre_affaires_mois_precedent', 60)
            ->assertJsonPath('nombre_ventes_mois_precedent', 4)
            ->assertJsonPath('variation_chiffre_affaires', -50)
            ->assertJsonPath('variation_nombre_ventes', -50)
            ->assertJsonPath('nombre_ventes', 6)
            ->assertJsonPath('nombre_clients', 2)
            ->assertJsonPath('nombre_produits', 2)
            ->assertJsonPath('valeur_stock', 70)
            ->assertJsonPath('produits_stock_faible', 1)
            ->assertJsonPath('ventes_aujourdhui', 2)
            ->assertJsonPath('ca_aujourdhui', 30)
            ->assertJsonPath('nombre_ventes_7_derniers_jours', 2)
            ->assertJsonPath('ca_7_derniers_jours', 30)
            ->assertJsonCount(30, 'ventes_par_jour')
            ->assertJsonPath('ventes_par_jour.0.jour', '2026-10-07')
            ->assertJsonPath('ventes_par_jour.0.total', 0)
            ->assertJsonPath('ventes_par_jour.0.nombre', 0)
            ->assertJsonPath('ventes_par_jour.29.total', 30)
            ->assertJsonPath('ventes_par_jour.29.nombre', 2)
            ->assertJsonPath('top_produits.0.id', $productA->id)
            ->assertJsonPath('top_produits.0.total_vendu', 3)
            ->assertJsonPath('top_produits_par_chiffre_affaires.0.id', $productB->id)
            ->assertJsonPath('top_produits_par_chiffre_affaires.0.chiffre_affaires', 60)
            ->assertJsonPath('ventes_par_categorie.0.id', $categoryB->id)
            ->assertJsonPath('ventes_par_categorie.0.quantite_vendue', 3)
            ->assertJsonPath('ventes_par_categorie.0.chiffre_affaires', 60)
            ->assertJsonPath('ventes_par_categorie.0.nombre_ventes', 3)
            ->assertJsonCount(5, 'dernieres_ventes')
            ->assertJsonPath('dernieres_ventes.0.client.nom', 'Client B')
            ->assertJsonPath('dernieres_ventes.4.date_vente', '2026-10-15T00:00:00.000000Z');

        $this->assertDatabaseCount('ventes', 6);
    }

    private function createSale(int $clientId, string $date, int $productId, int $quantity): void
    {
        $this->postJson('/api/ventes', [
            'client_id' => $clientId,
            'date_vente' => $date,
            'lignes' => [
                [
                    'produit_id' => $productId,
                    'quantite' => $quantity,
                ],
            ],
        ])->assertStatus(201);
    }
}
