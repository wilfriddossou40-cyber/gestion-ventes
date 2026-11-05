<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->call([
                CategorySeeder::class,
                ClientSeeder::class,
                ProductSeeder::class,
                StockMovementSeeder::class,
                SaleSeeder::class,
                ReplenishmentSeeder::class,
            ]);
        });
    }
}
