# 🌟 StarConnect CMS - MVP Hackathon

> Plateforme moderne de gestion de contenu avec mode crise, syndication sociale, analytics RGPD et engagement audience

## 🌐 Démo

- **Backend API (Live)** : https://starconnect-backend.onrender.com
- **Test Health** : https://starconnect-backend.onrender.com/health
- **Frontend** : Démo locale (voir instructions ci-dessous)
- **Code Source** : https://github.com/Onizuu/CMS-StarConnect

## 🎯 Fonctionnalités Principales

### ✨ Innovations Clés
- 🚨 **Mode Crise** - Transformation du site en "Dark Site" en 1 clic pour communications urgentes
- 🔗 **Syndication Sociale** - Publication automatique sur Twitter/Facebook
- 📊 **Analytics RGPD** - Tracking anonyme sans cookies tiers
- 💬 **Système de Commentaires** - Avec modération et réponses hiérarchiques
- 💰 **Monétisation** - Donations et newsletter intégrées

### 📋 Fonctionnalités Complètes

#### Backend (Node.js + Express + PostgreSQL)
- ✅ Authentification JWT sécurisée (access + refresh tokens)
- ✅ CRUD complet pour contenus (Articles, Updates, Announcements)
- ✅ Upload et gestion médias (images avec thumbnails)
- ✅ Profils publics personnalisables
- ✅ Mode crise avec templates pré-configurés
- ✅ Intégration Twitter/Facebook (OAuth)
- ✅ File d'attente de publication cross-platform
- ✅ Analytics privacy-first (pas de cookies)
- ✅ Système de commentaires avec modération
- ✅ Donations et produits
- ✅ Newsletter avec gestion abonnés

#### Frontend (Next.js 16 + React 19)
- ✅ Dashboard complet avec Quick Actions
- ✅ Éditeur rich text (TipTap)
- ✅ Pages publiques SEO-optimisées
- ✅ Dashboard analytics avec graphiques (Recharts)
- ✅ Interface modération commentaires
- ✅ Glassmorphism UI moderne
- ✅ Responsive design

## 🏗️ Architecture Technique

### Stack Technologique

**Backend**
```
- Node.js 22 + Express + TypeScript
- PostgreSQL (Prisma ORM)
- JWT Authentication
- Multer + Sharp (media processing)
- Twitter API v2
- Crypto-js (token encryption)
```

**Frontend**
```
- Next.js 16 (App Router)
- React 19
- TailwindCSS 4
- Zustand (state)
- TipTap (rich text)
- Recharts (analytics)
- Axios
```

**Déploiement**
```
- Backend: Render.com (avec PostgreSQL)
- Frontend: Local (instructions ci-dessous)
- Database: PostgreSQL sur Render
```

### Base de Données - 15 Models

1. User (authentification)
2. RefreshToken
3. Content (articles, updates, annonces)
4. Media (images, vidéos)
5. CrisisMode
6. SocialAccount (Twitter, Facebook)
7. SocialPost
8. PublishQueue
9. PageView (analytics)
10. AnalyticsSummary
11. Comment
12. Product
13. Donation
14. Subscription
15. NewsletterSubscriber

## 🚀 Installation Locale

### Prérequis
```bash
- Node.js 18+ 
- PostgreSQL 14+
- npm/yarn
```

### 1. Cloner le Projet
```bash
git clone https://github.com/Onizuu/CMS-StarConnect.git
cd CMS-StarConnect
```

### 2. Configuration Backend
```bash
cd backend

# Installer dépendances
npm install

# Copier .env
cp .env.example .env

# Éditer .env avec vos credentials
# DATABASE_URL, JWT secrets, etc.

# Migrations Prisma
npx prisma migrate dev
npx prisma generate

# Build
npm run build

# Démarrer
npm start
# Backend: http://localhost:3001
```

### 3. Configuration Frontend
```bash
cd ../frontend

# Installer dépendances
npm install

# Créer .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Démarrer
npm run dev
# Frontend: http://localhost:3000
```

### 4. Script de Démarrage Rapide
```bash
# À la racine du projet
./start-local.sh
```

## 📊 Stats du Projet

| Métrique | Valeur |
|----------|--------|
| **Durée développement** | ~8 heures |
| **Lignes de code** | 12,000+ |
| **Backend files** | 25+ |
| **Frontend pages** | 15+ |
| **Components** | 10+ |
| **API endpoints** | 60+ |
| **Database models** | 15 |
| **Migrations** | 7 |
| **MVP Completion** | 100% ✅ |

## 🎨 Captures d'Écran

### Dashboard Principal
![Dashboard](/path/to/screenshot1.png)

### Mode Crise Actif
![Crisis Mode](/path/to/screenshot2.png)

### Analytics Dashboard
![Analytics](/path/to/screenshot3.png)

### Page Publique
![Public Profile](/path/to/screenshot4.png)

## 📚 Documentation Complète

- **Guide de Déploiement** : `deployment_guide.md`
- **Walkthrough Technique** : `walkthrough.md`
- **Task Breakdown** : `task.md`

## 🔐 Variables d'Environnement

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/starconnect
JWT_SECRET=votre_secret_32_caracteres
JWT_REFRESH_SECRET=autre_secret_32_caracteres
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
SOCIAL_TOKEN_ENCRYPTION_KEY=cle_encryption_32_caracteres
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎯 Points Forts pour le Jury

1. **Innovation** : Mode Crise unique pour communications urgentes
2. **Technique** : Architecture solide avec 15 models, JWT security
3. **RGPD** : Analytics respectueux de la vie privée
4. **Complétude** : 100% MVP en 8h - pas un simple CRUD
5. **Production** : Backend déployé et fonctionnel
6. **Documentation** : Guide complet d'installation et déploiement

## 📝 Roadmap Future

- [ ] WebSocket pour real-time
- [ ] Notifications push
- [ ] Email templates (Nodemailer)
- [ ] Stripe integration complète
- [ ] Instagram integration
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 👤 Auteur

**Oni** - [GitHub](https://github.com/Onizuu)

## 📄 Licence

MIT License - Projet Hackathon 2025

---

**Développé avec ❤️ en 8 heures** pour démontrer la puissance d'un CMS moderne avec fonctionnalités innovantes !
