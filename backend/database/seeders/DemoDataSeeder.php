<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Client;
use App\Models\MouvementStock;
use App\Models\Produit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $clients = [
                ['Aïcha Diallo', 'aicha.diallo@example.test', '+221770000101', 'Dakar'],
                ['Mamadou Ndiaye', 'mamadou.ndiaye@example.test', '+221770000102', 'Pikine'],
                ['Fatou Sow', 'fatou.sow@example.test', '+221770000103', 'Thiès'],
                ['Ibrahima Fall', 'ibrahima.fall@example.test', '+221770000104', 'Saint-Louis'],
                ['Mariama Ba', 'mariama.ba@example.test', '+221770000105', 'Rufisque'],
                ['Ousmane Diop', 'ousmane.diop@example.test', '+221770000106', 'Dakar'],
                ['Aminata Cissé', 'aminata.cisse@example.test', '+221770000107', 'Kaolack'],
                ['Cheikh Gueye', 'cheikh.gueye@example.test', '+221770000108', 'Mbour'],
                ['Khady Sarr', 'khady.sarr@example.test', '+221770000109', 'Dakar'],
                ['Abdoulaye Kane', 'abdoulaye.kane@example.test', '+221770000110', 'Louga'],
                ['Rokhaya Mbaye', 'rokhaya.mbaye@example.test', '+221770000111', 'Thiès'],
                ['Moussa Faye', 'moussa.faye@example.test', '+221770000112', 'Dakar'],
                ['Seynabou Gning', 'seynabou.gning@example.test', '+221770000113', 'Ziguinchor'],
                ['Modou Lô', 'modou.lo@example.test', '+221770000114', 'Diourbel'],
                ['Adama Thiam', 'adama.thiam@example.test', '+221770000115', 'Dakar'],
            ];

            foreach ($clients as [$nom, $email, $telephone, $adresse]) {
                Client::firstOrCreate(
                    ['email' => $email],
                    compact('nom', 'telephone', 'adresse'),
                );
            }

            $catalogue = [
                [
                    'category' => 'Boissons',
                    'description' => 'Boissons et eaux',
                    'products' => [
                        ['Eau minérale 1,5 L', 'DEMO-BOI-001', 500, 5, 24, 6],
                        ['Jus de bissap 1 L', 'DEMO-BOI-002', 1500, 5, 12, 10],
                        ['Jus de gingembre 1 L', 'DEMO-BOI-003', 1750, 5, 20, 4],
                    ],
                ],
                [
                    'category' => 'Épicerie',
                    'description' => 'Produits alimentaires de base',
                    'products' => [
                        ['Riz parfumé 5 kg', 'DEMO-EPI-001', 4500, 5, 30, 8],
                        ['Huile végétale 1 L', 'DEMO-EPI-002', 1300, 5, 18, 16],
                        ['Sucre en poudre 1 kg', 'DEMO-EPI-003', 900, 5, 22, 7],
                    ],
                ],
                [
                    'category' => 'Entretien',
                    'description' => 'Produits pour l’entretien de la maison',
                    'products' => [
                        ['Savon de ménage', 'DEMO-ENT-001', 350, 5, 28, 9],
                        ['Eau de javel 1 L', 'DEMO-ENT-002', 800, 5, 15, 5],
                        ['Liquide vaisselle 750 ml', 'DEMO-ENT-003', 1200, 5, 16, 6],
                    ],
                ],
                [
                    'category' => 'Hygiène',
                    'description' => 'Articles d’hygiène courante',
                    'products' => [
                        ['Savon de toilette', 'DEMO-HYG-001', 500, 5, 25, 8],
                        ['Dentifrice 75 ml', 'DEMO-HYG-002', 1100, 5, 14, 12],
                        ['Papier hygiénique x4', 'DEMO-HYG-003', 1600, 5, 18, 6],
                    ],
                ],
                [
                    'category' => 'Accessoires',
                    'description' => 'Petits accessoires du quotidien',
                    'products' => [
                        ['Lampe torche', 'DEMO-ACC-001', 2500, 5, 12, 3],
                        ['Pile AA x4', 'DEMO-ACC-002', 1800, 5, 20, 5],
                        ['Bouteille réutilisable', 'DEMO-ACC-003', 3000, 5, 10, 7],
                    ],
                ],
            ];

            foreach ($catalogue as $categoryData) {
                $category = Categorie::firstOrCreate(
                    ['nom' => $categoryData['category']],
                    ['description' => $categoryData['description']],
                );

                foreach ($categoryData['products'] as [$nom, $reference, $prix, $seuil, $entree, $sortie]) {
                    $product = Produit::firstOrCreate(
                        ['reference' => $reference],
                        [
                            'categorie_id' => $category->id,
                            'nom' => $nom,
                            'prix' => $prix,
                            'quantite_stock' => 0,
                            'seuil_alerte' => $seuil,
                        ],
                    );

                    $this->recordMovement($product, 'entree', $entree, 'Démo — approvisionnement');
                    $this->recordMovement($product, 'sortie', $sortie, 'Démo — vente comptoir');
                }
            }
        });
    }

    private function recordMovement(Produit $product, string $type, int $quantity, string $reason): void
    {
        $movement = MouvementStock::firstOrCreate([
            'produit_id' => $product->id,
            'type' => $type,
            'quantite' => $quantity,
            'motif' => $reason,
        ]);

        if (! $movement->wasRecentlyCreated) {
            return;
        }

        if ($type === 'entree') {
            $product->increment('quantite_stock', $quantity);
            return;
        }

        $product->decrement('quantite_stock', $quantity);
    }
}
