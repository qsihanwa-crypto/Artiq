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
        Schema::create('artworks', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('medium');
            $table->string('category');
            $table->string('category_label');
            $table->string('dimensions')->default('Dimensions on request');
            $table->string('aspect')->default('portrait');
            $table->json('palette')->nullable();
            $table->text('description');
            $table->json('features')->nullable();
            $table->decimal('price', 10, 2);
            $table->boolean('available')->default(true);
            $table->json('materials')->nullable();
            $table->string('technique')->nullable();
            $table->json('tags')->nullable();
            $table->string('alt');
            $table->boolean('featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};
