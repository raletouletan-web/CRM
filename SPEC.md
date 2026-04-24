# CRM Prospecting Tool - Spécification

## 1. Concept & Vision

Un outil de prospection puissant et intuitif conçu pour maximiser les ventes grâce à un système de rappels intelligent. L'application offre une expérience fluide pour gérer vos leads, suivre vos appels et analyser vos performances. Design professionnel inspiré des outils CRM modernes avec une touche de dynamisme.

## 2. Design Language

### Aesthetic Direction
Style "SaaS B2B moderne" - interface propre, cartes élevées avec ombres subtiles, données可视化 claires.

### Color Palette
- **Primary**: #3B82F6 (Blue - confiance, professionnalisme)
- **Secondary**: #1E293B (Slate dark - texte principal)
- **Accent Warm**: #F97316 (Orange - urgence haute)
- **Accent Medium**: #EAB308 (Yellow - urgence moyenne)
- **Accent Cold**: #06B6D4 (Cyan - urgence froide)
- **Success**: #10B981 (Green - clos, payé)
- **Danger**: #EF4444 (Red - perdu, objections)
- **Background**: #F8FAFC (Light slate)
- **Card**: #FFFFFF

### Typography
- **Headings**: Inter, system-ui, sans-serif (bold 600-700)
- **Body**: Inter, system-ui, sans-serif (regular 400, medium 500)
- **Monospace**: JetBrains Mono (pour les chiffres/CA)

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 12px (cards), 8px (buttons), 6px (inputs)

### Motion Philosophy
- Transitions: 200ms ease-out pour hover, 300ms pour modals
- Micro-interactions: scale 1.02 au hover des cartes
- Toast notifications: slide-in depuis le haut-droite

## 3. Layout & Structure

### Navigation
- Sidebar fixe à gauche avec logo et navigation principale
- Header avec titre de page et actions rapides
- Contenu principal adaptatif

### Pages principales
1. **Dashboard** - Vue d'ensemble KPIs + rappels du jour
2. **Prospects** - Liste filtrable avec pipeline
3. **Statistiques** - Analyse détaillée
4. **Ajout/Édition prospect** - Modal plein écran

### Responsive
- Desktop-first (1280px+)
- Tablet: sidebar collapse en icônes
- Mobile: bottom navigation

## 4. Features & Interactions

### Gestion des Prospects
- CRUD complet (Create, Read, Update, Delete)
- Import/export JSON
- Filtrage par statut, urgence, date
- Recherche par nom/email/téléphone

### Colonnes prospect
**Identité:**
- Nom (required)
- Prénom (required)
- Téléphone
- Email

**Profil:**
- Situation pro (Select: Salarié, Demandeur d'emploi, Indépendant, Entreprise, Autre)
- Métier actuel
- Diplôme visé
- Financement (CPF, Personnel, Financement entreprise, Non défini)
- Urgences: 🔥 Chaud, ⚡ Moyen, ❄️ Froid

**Suivi commercial:**
- Statut pipeline: Nouveau lead → À appeler → Appelé → Relance → RDV prévu → Closé → Perdu
- Nombre d'appels (auto-incrémenté)
- Dernier contact (date)
- Prochain rappel (date)
- Résumé appel (textarea)
- Objections (textarea)

**Closing:**
- Offre proposée (790€ / 1800€ / Autre)
- Statut paiement: Non proposé → En attente → Payé
- CA généré (calculé automatiquement si payé)

### Système de Rappel Intelligent
- Indicateur visuel "À rappeler aujourd'hui" automatique
- Badge rouge sur prospects à rappeler
- Filtre rapide "Aujourd'hui"
- Compteur en temps réel dans le header

### Dashboard Stats
- Total leads
- Total appels
- Total closings
- CA total
- Taux de closing (%)
- CA / lead (€)
- Appels / closing

### Pipeline Visualization
- Kanban horizontal avec colonnes
- Drag & drop entre statuts (optionnel)
- Compteur par colonne

## 5. Component Inventory

### Card (Prospect)
- États: default, hover (shadow-lg), selected (border blue)
- Badge urgence en couleur
- Indicateur rappel clignotant si à rappeler aujourd'hui

### Button
- Primary: bg-blue-600, hover:bg-blue-700
- Secondary: bg-slate-200, hover:bg-slate-300
- Danger: bg-red-500, hover:bg-red-600
- États: default, hover, active (scale 0.98), disabled (opacity 50%)

### Input/Select
- Border slate-300, focus:ring-blue-500
- Error state: border-red-500 + message

### Modal
- Overlay noir 50%
- Card centrée avec max-width
- Animation: scale 0.95 → 1, opacity 0 → 1

### Badge/Tag
- Statuts: couleurs selon l'état
- Urgences:🔥 Chaud (orange), ⚡ Moyen (yellow), ❄️ Froid (cyan)

### Toast
- Success: bg-green-500
- Error: bg-red-500
- Info: bg-blue-500
- Auto-dismiss après 3s

## 6. Technical Approach

### Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management léger)
- LocalStorage pour persistance

### Data Model
```typescript
interface Prospect {
  id: string;
  // Identité
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  // Profil
  situationPro: string;
  metierActuel: string;
  diplomeVise: string;
  financement: string;
  urgence: 'chaud' | 'moyen' | 'froid';
  // Suivi
  statut: string;
  nbAppels: number;
  dernierContact: string | null;
  prochainRappel: string | null;
  resumeAppel: string;
  objections: string;
  // Closing
  offreProposee: string;
  statutPaiement: string;
  caGenere: number;
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}
```

### State Management
- Store global avec Zustand
- Actions: addProspect, updateProspect, deleteProspect, getProspectsToRemind
- Computed: stats, pipeline counts
