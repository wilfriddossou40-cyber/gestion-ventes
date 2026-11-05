<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['nom' => 'Épicerie', 'description' => 'Produits alimentaires de base'],
            ['nom' => 'Boissons', 'description' => 'Eaux, jus et boissons locales'],
            ['nom' => 'Hygiène', 'description' => 'Produits de soin et d’hygiène'],
            ['nom' => 'Entretien', 'description' => 'Produits d’entretien de la maison'],
            ['nom' => 'Fournitures', 'description' => 'Fournitures scolaires et de bureau'],
            ['nom' => 'Accessoires', 'description' => 'Accessoires pratiques du quotidien'],
        ];

        foreach ($categories as $category) {
            Categorie::updateOrCreate(
                ['nom' => $category['nom']],
                ['description' => $category['description']],
            );
        }
    }
}
