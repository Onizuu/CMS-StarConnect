#!/bin/bash

# Script d'arrêt CMS-StarConnect
# Ce script arrête tous les services proprement

set -e

echo "🛑 Arrêt de CMS-StarConnect..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Arrêter Docker Compose
echo -e "${YELLOW}📦 Arrêt des services Docker...${NC}"
docker compose down

# Tuer les processus Node.js qui pourraient encore tourner
echo -e "${YELLOW}🔌 Arrêt des processus Node.js...${NC}"

# Trouver et tuer les processus sur les ports 3000 et 5000
if lsof -ti:3000 > /dev/null 2>&1; then
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    echo -e "${GREEN}✅ Frontend arrêté (port 3000)${NC}"
fi

if lsof -ti:5000 > /dev/null 2>&1; then
    kill -9 $(lsof -ti:5000) 2>/dev/null || true
    echo -e "${GREEN}✅ Backend arrêté (port 5000)${NC}"
fi

echo -e "${GREEN}✅ Tous les services ont été arrêtés${NC}"
