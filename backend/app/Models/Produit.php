<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    protected $fillable = [
        'categorie_id',
        'nom',
        'reference',
        'prix',
        'quantite_stock',
        'seuil_alerte',
    ];

    protected function casts(): array
    {
        return [
            'prix' => 'decimal:2',
            'quantite_stock' => 'integer',
            'seuil_alerte' => 'integer',
        ];
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    public function venteDetails(): HasMany
    {
        return $this->hasMany(VenteDetail::class);
    }

    public function mouvementStocks(): HasMany
    {
        return $this->hasMany(MouvementStock::class);
    }
}
