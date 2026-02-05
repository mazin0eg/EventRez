# 🎫 EventRez - Système de Gestion d'Événements

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![NestJS](https://img.shields.io/badge/NestJS-11.0-red)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

**Une plateforme moderne de gestion d'événements avec réservation en ligne**

[Fonctionnalités](#-fonctionnalités) •
[Installation](#-installation) •
[Architecture](#-architecture) •
[API](#-documentation-api) •
[Contribution](#-contribution)

</div>

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Documentation API](#-documentation-api)
- [Structure du Projet](#-structure-du-projet)
- [Contribution](#-contribution)

---

## ✨ Fonctionnalités

### 👤 Utilisateurs
- ✅ Inscription et connexion sécurisées (JWT)
- ✅ Consultation des événements publiés
- ✅ Réservation de places pour les événements
- ✅ Suivi de ses réservations (en attente, confirmée, annulée)

### 👑 Administrateurs
- ✅ Gestion complète des événements (CRUD)
- ✅ Gestion des catégories d'événements
- ✅ Publication/Dépublication des événements
- ✅ Gestion des réservations (confirmation/annulation)
- ✅ Tableau de bord avec statistiques

### 🌐 Technique
- ✅ **SSR** (Server-Side Rendering) pour les pages publiques (SEO optimisé)
- ✅ **CSR** (Client-Side Rendering) pour les espaces authentifiés
- ✅ Design responsive (Mobile-first)
- ✅ Thème sombre/clair
- ✅ API RESTful documentée (Swagger)

---

## 🛠 Technologies

### Backend (`EventRev_backend`)

| Technologie | Version | Description |
|-------------|---------|-------------|
| **NestJS** | 11.0 | Framework Node.js pour applications serveur |
| **TypeORM** | 0.3.28 | ORM pour TypeScript/JavaScript |
| **PostgreSQL** | 15+ | Base de données relationnelle |
| **Passport JWT** | 4.0 | Authentification par tokens JWT |
| **Swagger** | 11.0 | Documentation API automatique |
| **class-validator** | 0.14 | Validation des données entrantes |

### Frontend (`EventRev_frontend`)

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js** | 16.1 | Framework React avec SSR/SSG |
| **React** | 19.2 | Bibliothèque UI |
| **TypeScript** | 5.0 | Typage statique |
| **Tailwind CSS** | 4.0 | Framework CSS utilitaire |

---

## 🏗 Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js Frontend (Port 3001)                │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │    │
│  │  │  Server         │  │  Client Components          │   │    │
│  │  │  Components     │  │  - AuthContext              │   │    │
│  │  │  - SSR pages    │  │  - Réservations             │   │    │
│  │  │  - SEO metadata │  │  - Dashboard                │   │    │
│  │  └─────────────────┘  └─────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVEUR                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              NestJS Backend (Port 3000)                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │    │
│  │  │  Auth    │ │  Events  │ │ Reserv.  │ │ Category │    │    │
│  │  │  Module  │ │  Module  │ │  Module  │ │  Module  │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │    │
│  │                      │                                   │    │
│  │              ┌───────┴───────┐                          │    │
│  │              │   TypeORM     │                          │    │
│  │              └───────────────┘                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BASE DE DONNÉES                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   PostgreSQL                             │    │
│  │  ┌────────┐ ┌────────┐ ┌─────────────┐ ┌────────────┐   │    │
│  │  │ Users  │ │ Events │ │ Reservations│ │ Categories │   │    │
│  │  └────────┘ └────────┘ └─────────────┘ └────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Stratégie de Rendu (SSR vs CSR)

| Type de Page | Rendu | Raison |
|--------------|-------|--------|
| Page d'accueil | **SSR** | SEO, premier chargement rapide |
| Liste des événements | **SSR** | Indexation Google, partage social |
| Détail d'un événement | **SSR** | Métadonnées dynamiques pour SEO |
| Login / Register | **CSR** | Formulaires interactifs |
| Dashboard utilisateur | **CSR** | Données personnelles en temps réel |
| Panel Admin | **CSR** | CRUD en temps réel |

---

## 🚀 Installation

### Prérequis

- **Node.js** >= 18.0
- **npm** >= 9.0
- **PostgreSQL** >= 15
- **Git**
- **Docker** (optionnel) >= 20.0

### 🐳 Option 1: Installation avec Docker (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/mazin0eg/EventRez.git
cd EventRez

# Copier le fichier d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Lancer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

**Services disponibles après démarrage :**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api |
| PostgreSQL | localhost:5432 |

### Option 2: Installation Manuelle

#### 1. Cloner le projet

```bash
git clone https://github.com/mazin0eg/EventRez.git
cd EventRez
```

##### 2. Backend Setup

```bash
# Aller dans le dossier backend
cd EventRev_backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Lancer en mode développement
npm run start:dev
```

#### 3. Frontend Setup

```bash
# Aller dans le dossier frontend
cd EventRev_frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos paramètres

# Lancer en mode développement
npm run dev
```

---

## ⚙️ Configuration

### Variables d'environnement Backend (`.env`)

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=eventrez

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
```

### Variables d'environnement Frontend (`.env.local`)

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📖 Utilisation

### Accès à l'application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api |

### Comptes par défaut

Après la première exécution, créez un compte admin via l'API ou la base de données :

```sql
-- Créer un admin (mot de passe hashé avec bcrypt)
INSERT INTO users (email, password, role) 
VALUES ('admin@eventrez.com', '$2b$10$...', 'admin');
```

---

## 📚 Documentation API

### Endpoints principaux

#### 🔐 Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/auth/register` | Inscription d'un nouvel utilisateur |
| `POST` | `/auth/login` | Connexion (retourne JWT) |
| `GET` | `/auth/profile` | Profil de l'utilisateur connecté |

#### 📅 Événements

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/events/published` | Liste des événements publiés | ❌ |
| `GET` | `/events/:id` | Détail d'un événement | ❌ |
| `GET` | `/events` | Tous les événements | 🔑 Admin |
| `POST` | `/events` | Créer un événement | 🔑 Admin |
| `PATCH` | `/events/:id` | Modifier un événement | 🔑 Admin |
| `DELETE` | `/events/:id` | Supprimer un événement | 🔑 Admin |

#### 🎟️ Réservations

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/reservations/my` | Mes réservations | 🔑 User |
| `POST` | `/reservations` | Créer une réservation | 🔑 User |
| `GET` | `/reservations` | Toutes les réservations | 🔑 Admin |
| `PATCH` | `/reservations/:id/status` | Changer le statut | 🔑 Admin |

#### 📁 Catégories

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/categories` | Liste des catégories | ❌ |
| `POST` | `/categories` | Créer une catégorie | 🔑 Admin |
| `PATCH` | `/categories/:id` | Modifier une catégorie | 🔑 Admin |
| `DELETE` | `/categories/:id` | Supprimer une catégorie | 🔑 Admin |

### Documentation Swagger

Accédez à la documentation interactive complète sur :
```
http://localhost:3000/api
```

---

## 📁 Structure du Projet

```
EventRez/
├── EventRev_backend/                 # Backend NestJS
│   ├── src/
│   │   ├── auth/                     # Module d'authentification
│   │   │   ├── decorators/           # Décorateurs personnalisés
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   ├── enums/                # Énumérations (Role)
│   │   │   ├── guards/               # Guards JWT & Roles
│   │   │   └── strategies/           # Stratégie Passport JWT
│   │   ├── category/                 # Module catégories
│   │   ├── event/                    # Module événements
│   │   ├── reservation/              # Module réservations
│   │   ├── users/                    # Module utilisateurs
│   │   ├── app.module.ts             # Module principal
│   │   └── main.ts                   # Point d'entrée
│   ├── test/                         # Tests E2E
│   └── package.json
│
├── EventRev_frontend/                # Frontend Next.js
│   ├── app/                          # App Router (Next.js 13+)
│   │   ├── admin/                    # Pages admin (CSR)
│   │   ├── dashboard/                # Dashboard utilisateur (CSR)
│   │   ├── events/                   # Pages événements (SSR)
│   │   │   ├── page.tsx              # Liste des événements
│   │   │   └── [id]/page.tsx         # Détail d'un événement
│   │   ├── login/                    # Page de connexion
│   │   ├── register/                 # Page d'inscription
│   │   ├── layout.tsx                # Layout principal
│   │   └── page.tsx                  # Page d'accueil (SSR)
│   ├── components/                   # Composants réutilisables
│   │   ├── Navbar.tsx                # Barre de navigation
│   │   ├── EventsSection.tsx         # Grille d'événements
│   │   ├── HeroSection.tsx           # Section hero
│   │   └── ...
│   ├── context/                      # Contextes React
│   │   └── AuthContext.tsx           # Gestion de l'authentification
│   ├── lib/                          # Utilitaires
│   │   └── api.ts                    # Client API & Types
│   └── package.json
│
└── README.md                         # Ce fichier
```

---

## 🧪 Tests

### Backend

```bash
cd EventRev_backend

# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Frontend

```bash
cd EventRev_frontend

# Linting
npm run lint

# Build de production
npm run build
```

---

## 🚢 Déploiement

### 🐳 Déploiement avec Docker (Recommandé)

```bash
# Build et lancement en production
docker-compose up -d --build

# Voir le statut des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (reset DB)
docker-compose down -v
```

### Commandes Docker utiles

```bash
# Reconstruire un service spécifique
docker-compose build backend
docker-compose build frontend

# Redémarrer un service
docker-compose restart backend

# Accéder au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d eventrez

# Voir les logs d'un service
docker-compose logs -f backend
```

### Production Build (sans Docker)

```bash
# Backend
cd EventRev_backend
npm run build
npm run start:prod

# Frontend
cd EventRev_frontend
npm run build
npm run start
```

### Variables de production

Assurez-vous de configurer :
- `JWT_SECRET` : Une clé secrète forte et unique
- `DB_*` : Identifiants de la base de données de production
- `NEXT_PUBLIC_API_URL` : URL du backend en production

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

**mazin0eg**

- GitHub: [@mazin0eg](https://github.com/mazin0eg)

---

<div align="center">

**⭐ Si ce projet vous a été utile, n'hésitez pas à lui donner une étoile !**

</div>
