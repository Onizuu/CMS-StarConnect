#!/bin/bash

# Script d'arrêt CMS-StarConnect (Version locale)
# Arrête les serveurs mais garde PostgreSQL et Redis actifs

echo "🛑 Arrêt de CMS-StarConnect..."

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Tuer les processus Node.js
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

echo -e "${GREEN}✅ Serveurs arrêtés${NC}"
echo -e "${YELLOW}Note: PostgreSQL et Redis restent actifs${NC}"
