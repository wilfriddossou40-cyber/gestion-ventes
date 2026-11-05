<?php

namespace Database\Seeders;

use App\Http\Controllers\Api\VenteController;
use App\Models\Client;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaleSeeder extends Seeder
{
    private const QUANTITIES_SOLD = [
        'DEMO-EPI-001' => 17,
        'DEMO-EPI-002' => 13,
        'DEMO-EPI-003' => 15,
        'DEMO-EPI-004' => 15,
        'DEMO-BOI-001' => 32,
        'DEMO-BOI-002' => 21,
        'DEMO-BOI-003' => 19,
        'DEMO-HYG-001' => 23,
        'DEMO-HYG-002' => 13,
        'DEMO-HYG-003' => 11,
        'DEMO-ENT-001' => 9,
        'DEMO-ENT-002' => 12,
        'DEMO-FOU-001' => 13,
        'DEMO-FOU-002' => 15,
        'DEMO-ACC-001' => 5,
        'DEMO-ACC-002' => 10,
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            if ($this->demoSalesExist()) {
                return;
            }

            $clientIds = Client::query()
                ->where('email', 'like', '%@example.test')
                ->orderBy('email')
                ->pluck('id')
                ->all();
            if ($clientIds === []) {
                throw new \RuntimeException('Aucun client de démonstration n’a été créé.');
            }

            $products = Produit::query()
                ->whereIn('reference', array_keys(self::QUANTITIES_SOLD))
                ->get()
                ->keyBy('reference');
            $orders = $this->buildOrders();
            $saleController = app(VenteController::class);

            foreach ($orders as $index => $order) {
                $lines = [];
                foreach ($order as $reference => $quantity) {
                    $product = $products->get($reference);
                    if ($product === null) {
                        throw new \RuntimeException("Produit de démonstration manquant : {$reference}");
                    }

                    $lines[] = [
                        'produit_id' => $product->id,
                        'quantite' => $quantity,
                    ];
                }

                $daysAgo = 29 - (int) round($index * 29 / 24);
                $saleController->createFromValidatedData([
                    'client_id' => $clientIds[$index % count($clientIds)],
                    'date_vente' => today()->subDays($daysAgo)->toDateString(),
                    'lignes' => $lines,
                ]);
            }
        });
    }

    private function demoSalesExist(): bool
    {
        return Vente::query()
            ->whereHas('details.produit', function (Builder $query): void {
                $query->where('reference', 'like', 'DEMO-%');
            })
            ->exists();
    }

    /**
     * @return list<array<string, int>>
     */
    private function buildOrders(): array
    {
        $orders = array_fill(0, 25, []);

        foreach (array_values(self::QUANTITIES_SOLD) as $productIndex => $totalQuantity) {
            $reference = array_keys(self::QUANTITIES_SOLD)[$productIndex];
            $appearances = min(8, max(2, (int) ceil($totalQuantity / 3)));
            $baseQuantity = intdiv($totalQuantity, $appearances);
            $extraUnits = $totalQuantity % $appearances;

            for ($appearance = 0; $appearance < $appearances; $appearance++) {
                $saleIndex = ($appearance * 7 + $productIndex * 3) % 25;
                $orders[$saleIndex][$reference] = $baseQuantity
                    + ($appearance < $extraUnits ? 1 : 0);
            }
        }

        return $orders;
    }
}
