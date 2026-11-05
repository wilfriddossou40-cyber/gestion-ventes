<?php

namespace Database\Seeders;

use App\Models\MouvementStock;
use App\Models\Produit;
use Illuminate\Database\Seeder;

class StockMovementSeeder extends Seeder
{
    private const OPENING_STOCKS = [
        'DEMO-EPI-001' => 35,
        'DEMO-EPI-002' => 25,
        'DEMO-EPI-003' => 25,
        'DEMO-EPI-004' => 20,
        'DEMO-BOI-001' => 40,
        'DEMO-BOI-002' => 25,
        'DEMO-BOI-003' => 22,
        'DEMO-HYG-001' => 30,
        'DEMO-HYG-002' => 15,
        'DEMO-HYG-003' => 18,
        'DEMO-ENT-001' => 20,
        'DEMO-ENT-002' => 20,
        'DEMO-FOU-001' => 25,
        'DEMO-FOU-002' => 30,
        'DEMO-ACC-001' => 12,
        'DEMO-ACC-002' => 18,
    ];

    public function run(): void
    {
        $products = Produit::whereIn('reference', array_keys(self::OPENING_STOCKS))
            ->get()
            ->keyBy('reference');

        foreach (self::OPENING_STOCKS as $reference => $quantity) {
            $product = $products->get($reference);
            if ($product === null) {
                throw new \RuntimeException("Produit de démonstration manquant : {$reference}");
            }

            $movement = MouvementStock::firstOrCreate(
                [
                    'produit_id' => $product->id,
                    'type' => 'entree',
                    'motif' => 'Stock initial de démonstration',
                ],
                ['quantite' => $quantity],
            );

            if ($movement->wasRecentlyCreated) {
                $product->increment('quantite_stock', $quantity);
            }
        }
    }
}
