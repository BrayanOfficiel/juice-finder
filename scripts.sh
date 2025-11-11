#!/bin/bash

# 🚀 Scripts utiles pour Juice Finder France

echo "🧃 Juice Finder France - Scripts utiles"
echo "========================================"
echo ""

# Fonction pour afficher le menu
show_menu() {
    echo "Que voulez-vous faire ?"
    echo ""
    echo "1) 🔧 Installer les dépendances"
    echo "2) 🏃 Lancer le serveur de développement"
    echo "3) 🏗️  Build de production"
    echo "4) 🚀 Démarrer le serveur de production"
    echo "5) 🧹 Nettoyer le cache"
    echo "6) 📊 Vérifier le code (lint)"
    echo "7) 📦 Déployer sur Vercel"
    echo "8) 🧪 Tests complets (build + lint)"
    echo "9) 📈 Analyser le bundle"
    echo "0) ❌ Quitter"
    echo ""
    read -p "Votre choix (0-9) : " choice
    echo ""
}

# Fonctions pour chaque action
install_deps() {
    echo "📦 Installation des dépendances..."
    npm install
    echo "✅ Installation terminée !"
}

dev_server() {
    echo "🏃 Démarrage du serveur de développement..."
    echo "→ Accessible sur http://localhost:3000"
    npm run dev
}

build_prod() {
    echo "🏗️  Build de production..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Build réussi !"
    else
        echo "❌ Erreur lors du build"
        exit 1
    fi
}

start_prod() {
    echo "🚀 Démarrage du serveur de production..."
    echo "→ Accessible sur http://localhost:3000"
    npm start
}

clean_cache() {
    echo "🧹 Nettoyage du cache..."
    rm -rf .next
    rm -rf node_modules/.cache
    echo "✅ Cache nettoyé !"
}

lint_code() {
    echo "📊 Vérification du code..."
    npm run lint
    if [ $? -eq 0 ]; then
        echo "✅ Aucune erreur détectée !"
    else
        echo "⚠️  Des erreurs ont été détectées"
    fi
}

deploy_vercel() {
    echo "🚀 Déploiement sur Vercel..."
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI n'est pas installé"
        echo "→ Installation : npm install -g vercel"
        exit 1
    fi
    vercel --prod
}

run_tests() {
    echo "🧪 Tests complets..."
    echo ""
    
    echo "1/3 - Vérification du code..."
    npm run lint
    if [ $? -ne 0 ]; then
        echo "❌ Erreurs de lint détectées"
        exit 1
    fi
    echo "✅ Lint OK"
    echo ""
    
    echo "2/3 - Build de production..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors du build"
        exit 1
    fi
    echo "✅ Build OK"
    echo ""
    
    echo "3/3 - Vérification des types TypeScript..."
    npx tsc --noEmit
    if [ $? -ne 0 ]; then
        echo "❌ Erreurs TypeScript détectées"
        exit 1
    fi
    echo "✅ Types OK"
    echo ""
    
    echo "🎉 Tous les tests sont passés !"
}

analyze_bundle() {
    echo "📈 Analyse du bundle..."
    echo "→ Installation de @next/bundle-analyzer..."
    npm install --save-dev @next/bundle-analyzer
    
    echo "→ Build avec analyse..."
    ANALYZE=true npm run build
}

# Boucle principale
while true; do
    show_menu
    
    case $choice in
        1)
            install_deps
            ;;
        2)
            dev_server
            ;;
        3)
            build_prod
            ;;
        4)
            start_prod
            ;;
        5)
            clean_cache
            ;;
        6)
            lint_code
            ;;
        7)
            deploy_vercel
            ;;
        8)
            run_tests
            ;;
        9)
            analyze_bundle
            ;;
        0)
            echo "👋 Au revoir !"
            exit 0
            ;;
        *)
            echo "❌ Choix invalide. Veuillez choisir entre 0 et 9."
            ;;
    esac
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
    clear
done

