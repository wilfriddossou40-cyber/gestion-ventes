<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Produit;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['Épicerie', 'Riz parfumé 5 kg', 'DEMO-EPI-001', 4500, 5],
            ['Épicerie', 'Huile végétale 1 L', 'DEMO-EPI-002', 1600, 5],
            ['Épicerie', 'Sucre en poudre 1 kg', 'DEMO-EPI-003', 900, 5],
            ['Épicerie', 'Pâtes alimentaires 500 g', 'DEMO-EPI-004', 700, 5],
            ['Boissons', 'Eau minérale 1,5 L', 'DEMO-BOI-001', 400, 6],
            ['Boissons', 'Jus de bissap 1 L', 'DEMO-BOI-002', 1200, 5],
            ['Boissons', 'Jus de gingembre 1 L', 'DEMO-BOI-003', 1500, 5],
            ['Hygiène', 'Savon de ménage', 'DEMO-HYG-001', 350, 5],
            ['Hygiène', 'Dentifrice 75 ml', 'DEMO-HYG-002', 1000, 4],
            ['Hygiène', 'Papier hygiénique x4', 'DEMO-HYG-003', 1600, 4],
            ['Entretien', 'Eau de javel 1 L', 'DEMO-ENT-001', 750, 5],
            ['Entretien', 'Liquide vaisselle 750 ml', 'DEMO-ENT-002', 1200, 5],
            ['Fournitures', 'Cahier 200 pages', 'DEMO-FOU-001', 800, 5],
            ['Fournitures', 'Stylos à bille x3', 'DEMO-FOU-002', 500, 5],
            ['Accessoires', 'Lampe torche', 'DEMO-ACC-001', 2500, 3],
            ['Accessoires', 'Piles AA x4', 'DEMO-ACC-002', 1200, 4],
        ];

        foreach ($products as [$categoryName, $name, $reference, $price, $alertThreshold]) {
            $product = Produit::firstOrNew(['reference' => $reference]);
            $isNew = ! $product->exists;
            $product->fill([
                'categorie_id' => Categorie::where('nom', $categoryName)->firstOrFail()->id,
                'nom' => $name,
                'prix' => $price,
                'seuil_alerte' => $alertThreshold,
            ]);

            if ($isNew) {
                $product->quantite_stock = 0;
            }

            $product->save();
        }
    }
}
