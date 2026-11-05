<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
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
        ];

        foreach ($clients as [$name, $email, $telephone, $address]) {
            Client::updateOrCreate(
                ['email' => $email],
                [
                    'nom' => $name,
                    'telephone' => $telephone,
                    'adresse' => $address,
                ],
            );
        }
    }
}
