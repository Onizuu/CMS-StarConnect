#!/bin/bash

# Script de démarrage CMS-StarConnect
# Ce script démarre tous les services nécessaires

set -e

echo "🚀 Démarrage de CMS-StarConnect..."

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet"
    exit 1
fi

# 1. Démarrer Docker Compose (PostgreSQL + Redis)
echo -e "${BLUE}📦 Démarrage des services Docker (PostgreSQL + Redis)...${NC}"
docker compose up -d

# Attendre que PostgreSQL soit prêt
echo -e "${YELLOW}⏳ Attente de la disponibilité de PostgreSQL...${NC}"
sleep 5

# Vérifier si PostgreSQL est prêt
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo -e "${YELLOW}   Postgres n'est pas encore prêt, nouvelle tentative...${NC}"
    sleep 2
done

echo -e "${GREEN}✅ PostgreSQL est prêt${NC}"

# 2. Configurer le Backend
echo -e "${BLUE}🔧 Configuration du Backend...${NC}"
cd backend

# Générer le client Prisma
echo -e "${YELLOW}   Génération du client Prisma...${NC}"
npx prisma generate

# Appliquer les migrations
echo -e "${YELLOW}   Application des migrations...${NC}"
npx prisma migrate deploy

cd ..

# 3. Démarrer tous les services en parallèle
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
