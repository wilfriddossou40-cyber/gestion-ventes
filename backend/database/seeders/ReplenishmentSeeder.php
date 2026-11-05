<?php

namespace Database\Seeders;

use App\Models\MouvementStock;
use App\Models\Produit;
use Illuminate\Database\Seeder;
use RuntimeException;

class ReplenishmentSeeder extends Seeder
{
    private const REPLENISHMENTS = [
        'DEMO-EPI-001' => 10,
        'DEMO-EPI-002' => 8,
        'DEMO-EPI-003' => 6,
        'DEMO-BOI-001' => 12,
        'DEMO-HYG-001' => 8,
        'DEMO-ENT-002' => 8,
        'DEMO-FOU-001' => 6,
        'DEMO-ACC-002' => 6,
    ];

    public function run(): void
    {
        $products = Produit::query()
            ->whereIn('reference', array_keys(self::REPLENISHMENTS))
            ->get()
            ->keyBy('reference');

        foreach (self::REPLENISHMENTS as $reference => $quantity) {
            $product = $products->get($reference);
            if ($product === null) {
                throw new RuntimeException("Produit de démonstration manquant : {$reference}");
            }

            $movement = MouvementStock::firstOrCreate(
                [
                    'produit_id' => $product->id,
                    'type' => 'entree',
                    'motif' => 'Réapprovisionnement de démonstration',
                ],
                ['quantite' => $quantity],
            );

            if ($movement->wasRecentlyCreated) {
                $product->increment('quantite_stock', $quantity);
            }
        }
    }
}
