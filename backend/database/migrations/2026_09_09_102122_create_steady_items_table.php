<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('steady_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->text('insight');
            $table->foreignId('artwork_id')->nullable()->constrained()->nullOnDelete();
            $table->json('swatch_artwork_ids')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('steady_items');
    }
};
