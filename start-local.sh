#!/bin/bash

# Script de démarrage CMS-StarConnect (Version SANS Docker)
# Utilise PostgreSQL et Redis installés localement

set -e

echo "🚀 Démarrage de CMS-StarConnect (mode local)..."

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet${NC}"
    exit 1
fi

# 1. Démarrer Redis si ce n'est pas déjà fait
echo -e "${BLUE}📦 Vérification de Redis...${NC}"
if ! pgrep -x redis-server > /dev/null; then
    echo -e "${YELLOW}   Démarrage de Redis...${NC}"
    redis-server --daemonize yes
    sleep 2
    echo -e "${GREEN}✅ Redis démarré${NC}"
else
    echo -e "${GREEN}✅ Redis est déjà en cours d'exécution${NC}"
fi

# 2. Vérifier PostgreSQL
echo -e "${BLUE}📦 Vérification de PostgreSQL...${NC}"
if ! pgrep -x postgres > /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL ne semble pas être en cours d'exécution${NC}"
    echo -e "${YELLOW}   Tentative de démarrage...${NC}"
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    sleep 3
fi

# Vérifier si PostgreSQL répond
if ! pg_isready -h localhost > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL n'est pas disponible${NC}"
    echo -e "${YELLOW}   Essayez de le démarrer manuellement: brew services start postgresql${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL est disponible${NC}"

# 3. Vérifier/créer la base de données
echo -e "${BLUE}🗄️  Vérification de la base de données...${NC}"
if ! psql -lqt | cut -d \| -f 1 | grep -qw starconnect; then
    echo -e "${YELLOW}   Création de la base de données 'starconnect'...${NC}"
    createdb starconnect
    echo -e "${GREEN}✅ Base de données créée${NC}"
else
    echo -e "${GREEN}✅ Base de données existe${NC}"
fi

# 4. Configurer le Backend
echo -e "${BLUE}🔧 Configuration du Backend...${NC}"
cd backend

# Générer le client Prisma
echo -e "${YELLOW}   Génération du client Prisma...${NC}"
npx prisma generate > /dev/null 2>&1

# Appliquer les migrations
echo -e "${YELLOW}   Application des migrations...${NC}"
npx prisma migrate deploy

cd ..

# 5. Démarrer tous les services en parallèle
echo -e "${GREEN}✅ Configuration terminée${NC}"
echo -e "${BLUE}🌟 Démarrage des serveurs...${NC}"
echo ""
echo -e "${GREEN}Backend:${NC}  sera disponible sur http://localhost:5000"
echo -e "${GREEN}Frontend:${NC} sera disponible sur http://localhost:3000"
echo ""
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter tous les services${NC}"
echo ""

# Utiliser trap pour arrêter proprement tous les processus
trap 'echo -e "\n${YELLOW}🛑 Arrêt des services...${NC}"; kill 0' INT

# Démarrer le backend
cd backend
npm run dev &
BACKEND_PID=$!

# Attendre un peu avant de démarrer le frontend
sleep 3

# Démarrer le frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Attendre que les processus se terminent
wait
