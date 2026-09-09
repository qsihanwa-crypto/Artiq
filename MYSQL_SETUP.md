# MySQL Setup Quick Reference

## 1. Install MySQL

**Windows:**
- Download from https://dev.mysql.com/downloads/mysql/
- Run installer, choose "MySQL Community Server 8.0"
- Run through setup wizard, choose default options
- Service will auto-start

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

---

## 2. Verify MySQL Is Running

```bash
mysql --version
# Should show: mysql Ver 8.0.xx

# Try connecting (no password initially on Linux/Mac)
mysql -u root -p
# Or just: mysql -u root
# (press Enter if prompted for password)
```

---

## 3. Create Database & User (Run These Commands)

```bash
# Connect to MySQL with root
mysql -u root -p
# Press Enter or enter password if one exists

# Copy & paste these commands:
CREATE DATABASE kirtanraw_gallery;
CREATE USER 'gallery_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON kirtanraw_gallery.* TO 'gallery_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Result:** Database and user created ✅

---

## 4. Test Connection

```bash
# Test that the user can connect
mysql -u gallery_user -p kirtanraw_gallery
# Password: password123

# If you see the MySQL prompt, you're good!
# Type: EXIT;
```

---

## 5. Update Laravel .env

In `backend/.env`, make sure these lines exist:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kirtanraw_gallery
DB_USERNAME=gallery_user
DB_PASSWORD=password123
```

---

## 6. Run Migrations

```bash
cd backend
php artisan migrate

# Should see output like:
# Migrating: 2014_10_12_000000_create_users_table
# Migrated: 2014_10_12_000000_create_users_table
```

---

## Credentials Summary

| Field | Value |
|-------|-------|
| Host | 127.0.0.1 |
| Port | 3306 |
| Database | kirtanraw_gallery |
| Username | gallery_user |
| Password | password123 |

---

## Troubleshooting

**"Can't connect to MySQL"**
- Is MySQL running? Check Services (Windows) or `brew services list` (Mac)
- Start it: `mysql.server start` (Mac) or check Services (Windows)

**"Access denied for user 'gallery_user'"**
- Did you run the CREATE USER and GRANT commands?
- Check password is `password123` in `.env`

**"Database doesn't exist"**
- Did you run `CREATE DATABASE kirtanraw_gallery;`?
- Verify: `mysql -u gallery_user -p -e "SHOW DATABASES;"`

**"Migrations failed"**
```bash
# Check database exists
mysql -u gallery_user -p -e "SHOW DATABASES;"

# Try migrations again
php artisan migrate

# If all else fails, reset (dev only!)
php artisan migrate:fresh
```

---

## GUI Tools (Optional)

View/manage database visually:
- **MySQL Workbench** (free, official): https://dev.mysql.com/downloads/workbench/
- **TablePlus** (paid, beautiful): https://tableplus.com
- **Sequel Pro** (Mac free): https://www.sequelpro.com

All can connect with:
- Host: `127.0.0.1`
- Username: `gallery_user`
- Password: `password123`
- Database: `kirtanraw_gallery`

---

## Common Commands

```bash
# Connect to MySQL
mysql -u gallery_user -p kirtanraw_gallery

# Inside MySQL console:
SHOW TABLES;                    # List all tables
DESCRIBE artworks;              # Show artwork table structure
SELECT COUNT(*) FROM artworks;  # Count artworks
EXIT;                           # Exit

# Reset database (dev only!)
php artisan migrate:fresh
```

---

**That's it! MySQL is now ready for Laravel.** 🎉
