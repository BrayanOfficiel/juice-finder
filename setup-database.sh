#!/bin/bash

# Script de configuration de la base de données MySQL pour Juice Finder

echo "🗃️  Configuration de la base de données MySQL"
echo "=============================================="
echo ""

# Vérification de MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL n'est pas installé ou n'est pas dans le PATH"
    echo "→ Si vous utilisez MAMP, assurez-vous que MySQL est démarré"
    exit 1
fi

echo "✅ MySQL détecté"
echo ""

# Configuration
DB_NAME="juice_finder"
DB_USER="root"
DB_PASS=""
DB_HOST="localhost"
DB_PORT="3306"

echo "📋 Configuration de la base:"
echo "   • Base de données: $DB_NAME"
echo "   • Utilisateur: $DB_USER"
echo "   • Host: $DB_HOST"
echo "   • Port: $DB_PORT"
echo ""

read -p "Voulez-vous continuer ? (o/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Configuration annulée"
    exit 1
fi

# Création de la base de données
echo ""
echo "📦 Création de la base de données..."

if [ -z "$DB_PASS" ]; then
    mysql -u "$DB_USER" -h "$DB_HOST" -P "$DB_PORT" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
else
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -P "$DB_PORT" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
fi

if [ $? -eq 0 ]; then
    echo "✅ Base de données '$DB_NAME' créée (ou déjà existante)"
else
    echo "❌ Erreur lors de la création de la base"
    echo "→ Vérifiez vos identifiants MySQL"
    exit 1
fi

# Mise à jour du fichier .env
echo ""
echo "📝 Mise à jour du fichier .env..."

DATABASE_URL="mysql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"

if [ -f .env ]; then
    # Mise à jour de la ligne DATABASE_URL
    if grep -q "^DATABASE_URL=" .env; then
        sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" .env
        echo "✅ Fichier .env mis à jour"
    else
        echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
        echo "✅ DATABASE_URL ajouté au fichier .env"
    fi
else
    echo "DATABASE_URL=\"$DATABASE_URL\"" > .env
    echo "✅ Fichier .env créé"
fi

echo ""
echo "🚀 Génération du client Prisma..."
npx prisma generate

echo ""
echo "📊 Création des tables (migration)..."
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration terminée avec succès !"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Démarrer l'application: npm run dev"
    echo "   2. Cliquer sur le bouton 'Mettre à jour depuis l'API'"
    echo "   3. Attendre la synchronisation (plusieurs minutes)"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de la migration"
    echo "→ Vérifiez que MySQL est bien démarré"
fi

