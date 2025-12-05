# StarConnect CMS - Quick Start Guide

## 🚀 Déploiement en Production

Le CMS est prêt à être déployé ! Suivez le [Guide de Déploiement](./brain/cb38e0ec-3ebf-4f16-9917-f2f1f5a18a79/deployment_guide.md) pour mettre en ligne.

**Résumé Express:**
1. **Backend**: Déployer sur Railway (gratuit) - Inclut PostgreSQL & Redis
2. **Frontend**: Déployer sur Vercel (gratuit) - Optimisé pour Next.js
3. **Temps:** ~15-20 minutes

---

## 💻 Développement Local

### Prérequis
- Node.js 18+
- PostgreSQL (via Homebrew)
- Redis (via Homebrew)

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/CMS-StarConnect.git
cd CMS-StarConnect

# Lancer en mode local (PostgreSQL + Redis locaux)
./start-local.sh

# Arrêter les serveurs
./stop-local.sh
```

**URLs locales:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 📚 Fonctionnalités

### ✅ Implémentées (85% du MVP)

**Phase 1 - Base (30%)**
- ✅ Backend API complet (Express + Prisma + PostgreSQL)
- ✅ Authentification JWT sécurisée
- ✅ Dashboard administrateur moderne
- ✅ Création/édition/suppression de contenu
- ✅ Éditeur TipTap avec formatage riche

**Phase 2 - Priorités Critiques (30%)**
- ✅ Profils publics personnalisables (`/u/username`)
- ✅ Pages publiques de posts (`/p/slug`) avec SEO
- ✅ Upload de médias avec drag & drop
- ✅ Communication de crise / Dark Site activable en 1 clic

**Phase 3 - Intégration Sociale (15%)**
- ✅ Connexion comptes sociaux (Twitter/X, Facebook)
- ✅ Publication automatique cross-platform
- ✅ File d'attente de publication
- ✅ Fil d'activité unifié sur profil public

**Phase 4 - Analytics Propriétaires (10%)**
- ✅ Tracking visiteurs sans cookies (RGPD-friendly)
- ✅ Dashboard avec graphiques (Recharts)
- ✅ Métriques: vues, visiteurs uniques, temps passé
- ✅ Export CSV des données

### 🔜 À Venir (15% restants)

- Newsletter
- Commentaires
- E-commerce / Monétisation
- Auto-syndication des posts

---

## 🏗️ Architecture

```
CMS-StarConnect/
├── backend/           # API Express + Prisma
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── middleware/# Auth, CORS, etc.
│   └── prisma/        # Database schema
│
├── frontend/          # Next.js 16 App Router
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/# React components
│   │   ├── store/     # Zustand state
│   │   └── lib/       # API client
│
└── brain/             # Documentation & Guides
```

---

## 🔧 Technologies

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication
- Multer + Sharp (media)
- Twitter API, Crypto-js

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TailwindCSS 4
- Zustand (state)
- TipTap (rich editor)
- Recharts (analytics)
- React-Dropzone (upload)

---

## 📖 Documentation

- 📘 [Guide de Déploiement](./brain/cb38e0ec-3ebf-4f16-9917-f2f1f5a18a79/deployment_guide.md)
- 📗 [Walkthrough Complet](./brain/cb38e0ec-3ebf-4f16-9917-f2f1f5a18a79/walkthrough.md)
- 📙 [Liste des Tâches](./brain/cb38e0ec-3ebf-4f16-9917-f2f1f5a18a79/task.md)

---

## 🎯 Pour le Hackathon

**URLs de Démo:**
- Frontend: [À compléter après déploiement]
- Backend: [À compléter après déploiement]

**Compte Démo:**
- Email: [À créer après déploiement]
- Password: [À créer après déploiement]

**Différenciateurs Clés:**
1. 🚨 **Mode Crise** - Dark Site activable en 1 clic
2. 🔗 **Syndication Sociale** - Publication cross-platform automatique
3. 📊 **Analytics Propriétaires** - Sans cookies, respectueux RGPD
4. 👤 **Profils Publics** - SEO optimisé, personnalisables

---

## 📝 Licence

MIT - Hackathon Project

---

## 🤝 Support

Pour questions ou problèmes, consulter la documentation dans `/brain/`.
