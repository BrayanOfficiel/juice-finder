# 🎨 Juice Finder - Guide de Style

## Vue d'ensemble

Ce document décrit le système de design de Juice Finder, basé sur la charte graphique Juice avec SASS pour une meilleure maintenabilité.

---

## 🎨 Palette de Couleurs

### Couleurs Principales

| Couleur | Variable SASS | Variable CSS | Hex | Usage |
|---------|--------------|--------------|-----|-------|
| **Bleu Principal** | `$color-primary` | `--color-primary` | `#2853FE` | Boutons, liens, accents |
| **Bleu Foncé** | `$color-secondary` | `--color-secondary` | `#092C42` | Titres, texte important |
| **Texte Principal** | `$color-text` | `--color-text` | `#011C2D` | Corps de texte |
| **Vert Néon** | `$color-success` | `--color-success` | `#9DEC09` | Succès, validation |
| **Cyan/Turquoise** | `$color-info` | `--color-info` | `#12D7DD` | Information, badges |
| **Fond Clair** | `$color-background-light` | `--color-background-light` | `#F5FBFF` | Arrière-plans |

### Couleurs Complémentaires

- **Nuances de gris** : `$color-gray-100` à `$color-gray-900`
- **Erreur** : `$color-error` (#EF4444)
- **Avertissement** : `$color-warning` (#F59E0B)
- **Blanc** : `$color-white` (#FFFFFF)

---

## 📝 Typographie

### Familles de polices

```scss
$font-family-primary: "Lexend", "owners-wide", sans-serif;
$font-family-secondary: "owners-wide", sans-serif;
$font-family-text: "owners", sans-serif;
$font-family-accent: "owners-wide", sans-serif;
```

### Tailles

| Taille | Variable | Valeur |
|--------|----------|--------|
| XS | `$font-size-xs` | 0.75rem (12px) |
| SM | `$font-size-sm` | 0.875rem (14px) |
| Base | `$font-size-base` | 1rem (16px) |
| LG | `$font-size-lg` | 1.125rem (18px) |
| XL | `$font-size-xl` | 1.25rem (20px) |
| 2XL | `$font-size-2xl` | 1.5rem (24px) |
| 3XL | `$font-size-3xl` | 1.875rem (30px) |
| 4XL | `$font-size-4xl` | 2rem (32px) |
| 5XL | `$font-size-5xl` | 2.5rem (40px) |

### Poids

- **Normal** : `$font-weight-normal` (400)
- **Medium** : `$font-weight-medium` (500)
- **Semibold** : `$font-weight-semibold` (600)
- **Bold** : `$font-weight-bold` (700)

---

## 📐 Espacements

```scss
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px
$spacing-3xl: 4rem;     // 64px
```

---

## 🔘 Composants

### Boutons

```scss
// Bouton principal
@include button-primary;

// Bouton secondaire
@include button-secondary;

// Bouton succès
@include button-success;
```

**Classes utilitaires** :
- `.btn-primary`
- `.btn-secondary`
- `.btn-success`

### Cartes

```scss
// Carte standard
@include card;

// Carte avec bordure
@include card-bordered;
```

**Classes utilitaires** :
- `.card`
- `.card-bordered`

### Champs de formulaire

```scss
// Champ de saisie
@include input-base;
```

**Classe utilitaire** :
- `.input`

### Badges

**Classes** :
- `.badge.badge-primary`
- `.badge.badge-success`
- `.badge.badge-info`

---

## 🎭 Mixins Utilitaires

### Layout

```scss
@include flex-center;        // Centrage horizontal et vertical
@include flex-between;       // Space-between avec alignement vertical
@include flex-start;         // Flex start avec alignement vertical
@include flex-column;        // Flex en colonne
```

### Texte

```scss
@include text-truncate;      // Tronquer avec ellipse
@include text-clamp(2);      // Limiter à N lignes
```

### Scrollbar

```scss
@include custom-scrollbar;   // Scrollbar personnalisée
```

### Media Queries

```scss
@include mobile { ... }      // < 640px
@include tablet { ... }      // 640px - 767px
@include desktop { ... }     // >= 1024px
@include responsive($breakpoint-lg) { ... }  // >= breakpoint
```

### Animations

```scss
@include fade-in($duration);
@include slide-up($duration);
```

---

## 🎬 Animations Globales

**Classes** :
- `.animate-spin` - Rotation infinie
- `.animate-pulse` - Pulsation
- `.animate-bounce` - Rebond

**États** :
- `.loading` - Spinner de chargement
- `.error-message` - Message d'erreur stylisé
- `.success-message` - Message de succès stylisé

---

## 📱 Responsive

### Breakpoints

```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;
```

### Classes utilitaires

- `.mobile-only` - Visible uniquement sur mobile
- `.desktop-only` - Visible uniquement sur desktop

---

## 💡 Bonnes Pratiques

### 1. Utiliser les variables SASS

```scss
// ✅ Bon
.my-component {
  color: $color-primary;
  padding: $spacing-md;
}

// ❌ Mauvais
.my-component {
  color: #2853FE;
  padding: 16px;
}
```

### 2. Utiliser les mixins

```scss
// ✅ Bon
.my-button {
  @include button-primary;
}

// ❌ Mauvais
.my-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #2853FE;
  color: white;
  // ... beaucoup de code répétitif
}
```

### 3. Responsive avec mixins

```scss
// ✅ Bon
.my-component {
  font-size: $font-size-2xl;
  
  @include mobile {
    font-size: $font-size-xl;
  }
}

// ❌ Mauvais
.my-component {
  font-size: 1.5rem;
}

@media (max-width: 639px) {
  .my-component {
    font-size: 1.25rem;
  }
}
```

### 4. Nesting modéré

```scss
// ✅ Bon - 2-3 niveaux max
.card {
  padding: $spacing-md;
  
  &__title {
    color: $color-secondary;
  }
  
  &:hover {
    box-shadow: $shadow-lg;
  }
}

// ❌ Mauvais - trop de nesting
.card {
  .header {
    .title {
      .text {
        .span {
          color: red;
        }
      }
    }
  }
}
```

---

## 📦 Structure des Fichiers

```
src/app/styles/
├── _variables.scss    # Variables globales (couleurs, typographie, etc.)
├── _mixins.scss       # Mixins réutilisables
├── _theme.scss        # Extension du thème Tailwind
└── globals.scss       # Point d'entrée principal
```

---

## 🚀 Utilisation

### En SCSS

```scss
@import '../styles/variables';
@import '../styles/mixins';

.my-component {
  @include card;
  color: $color-primary;
  
  &__button {
    @include button-primary;
  }
}
```

### En JSX/TSX avec classes

```tsx
<div className="card">
  <button className="btn-primary">
    Action
  </button>
</div>
```

### En JSX/TSX avec style inline

```tsx
<div style={{ 
  color: 'var(--color-primary)',
  backgroundColor: 'var(--color-background-light)' 
}}>
  Contenu
</div>
```

---

## 🎯 Migration de l'ancien système

### Correspondances de couleurs

| Ancien | Nouveau |
|--------|---------|
| `bg-gray-50` | `var(--color-background-light)` |
| `text-gray-900` | `var(--color-secondary)` |
| `text-blue-600` | `var(--color-primary)` |
| `text-green-500` | `var(--color-success)` |

---

## 📞 Support

Pour toute question sur l'utilisation du système de design, consultez les fichiers sources dans `src/app/styles/`.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2025

