#!/bin/bash

# 🎯 Script de vérification finale - Juice Finder France

echo "🧃 Juice Finder France - Vérification finale"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success=0
failed=0

# Fonction pour vérifier
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((success++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((failed++))
    fi
}

echo "📦 Vérification de l'installation..."
echo ""

# Node modules
if [ -d "node_modules" ]; then
    check "node_modules installés"
else
    echo -e "${RED}❌ node_modules non installés${NC}"
    ((failed++))
fi

# Prisma client
if [ -d "node_modules/@prisma/client" ]; then
    check "Prisma Client installé"
else
    echo -e "${RED}❌ Prisma Client non généré${NC}"
    ((failed++))
fi

# Fichier .env
if [ -f ".env" ]; then
    check "Fichier .env présent"
else
    echo -e "${RED}❌ Fichier .env manquant${NC}"
    ((failed++))
fi

# Prisma schema
if [ -f "prisma/schema.prisma" ]; then
    check "Schéma Prisma présent"
else
    echo -e "${RED}❌ Schéma Prisma manquant${NC}"
    ((failed++))
fi

# Migrations
if [ -d "prisma/migrations" ]; then
    check "Migrations Prisma appliquées"
else
    echo -e "${YELLOW}⚠️  Migrations non appliquées - Exécutez: npx prisma migrate dev${NC}"
fi

echo ""
echo "🗃️  Vérification de la base de données..."
echo ""

# Test connexion MySQL
/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot --socket=/Applications/MAMP/tmp/mysql/mysql.sock -e "USE juice_finder;" 2>/dev/null
if [ $? -eq 0 ]; then
    check "Connexion à MySQL réussie"
    
    # Vérifier la table restaurants
    TABLE_EXISTS=$(/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot --socket=/Applications/MAMP/tmp/mysql/mysql.sock juice_finder -e "SHOW TABLES LIKE 'restaurants';" 2>/dev/null | grep restaurants)
    if [ ! -z "$TABLE_EXISTS" ]; then
        check "Table restaurants existe"
        
        # Compter les restaurants
        COUNT=$(/Applications/MAMP/Library/bin/mysql80/bin/mysql -u root -proot --socket=/Applications/MAMP/tmp/mysql/mysql.sock juice_finder -e "SELECT COUNT(*) FROM restaurants;" 2>/dev/null | tail -1)
        if [ "$COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ $COUNT restaurants en base${NC}"
            ((success++))
        else
            echo -e "${YELLOW}⚠️  Aucun restaurant en base - Cliquez sur 'Mettre à jour depuis l'API'${NC}"
        fi
    else
        echo -e "${RED}❌ Table restaurants n'existe pas${NC}"
        ((failed++))
    fi
else
    echo -e "${RED}❌ Impossible de se connecter à MySQL${NC}"
    echo -e "${YELLOW}→ Vérifiez que MAMP est démarré${NC}"
    ((failed++))
fi

echo ""
echo "🔧 Vérification des composants..."
echo ""

# Vérifier les fichiers principaux
files=(
    "src/app/page.tsx"
    "src/app/layout.tsx"
    "src/app/api/restaurants/route.ts"
    "src/app/api/restaurants/update/route.ts"
    "src/app/api/regions/route.ts"
    "src/app/components/UpdateButton.tsx"
    "src/app/components/MapView.tsx"
    "src/app/components/SearchBar.tsx"
    "src/app/components/Filters.tsx"
    "src/app/components/ResultsList.tsx"
    "src/lib/db.ts"
    "src/lib/api.ts"
    "src/lib/types.ts"
    "src/hooks/useRestaurantSearch.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check "$(basename $file)"
    else
        echo -e "${RED}❌ $(basename $file) manquant${NC}"
        ((failed++))
    fi
done

echo ""
echo "📝 Vérification de la documentation..."
echo ""

docs=(
    "README.md"
    "QUICK_START.md"
    "MIGRATION_MYSQL.md"
    "DOCUMENTATION.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        check "$doc"
    else
        echo -e "${YELLOW}⚠️  $doc manquant${NC}"
    fi
done

echo ""
echo "=============================================="
echo ""
echo -e "📊 Résumé: ${GREEN}$success réussies${NC} / ${RED}$failed échouées${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 Tout est prêt !${NC}"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "   1. npm run dev"
    echo "   2. Ouvrir http://localhost:3000"
    echo "   3. Cliquer sur 'Mettre à jour depuis l'API'"
    echo ""
else
    echo -e "${RED}⚠️  Certains éléments nécessitent votre attention${NC}"
    echo ""
fi

