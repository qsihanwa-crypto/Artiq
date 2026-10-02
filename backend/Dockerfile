FROM php:8.4-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        libicu-dev \
        libonig-dev \
        libpq-dev \
        libxml2-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install \
        bcmath \
        intl \
        mbstring \
        pdo_pgsql \
        xml \
        zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public \
    && chown -R www-data:www-data storage bootstrap/cache \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT:-/var/www/html/public}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
ENV PORT=8080

CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --class=AdminUserSeeder --force && php artisan db:seed --class=SiteSettingSeeder --force && php artisan storage:link --force && php artisan serve --host=0.0.0.0 --port=${PORT}"]
