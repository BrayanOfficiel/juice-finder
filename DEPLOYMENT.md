# ✅ Checklist de déploiement - Juice Finder France

## 📋 Pré-déploiement

### Code et Build
- [x] ✅ Tous les composants créés et fonctionnels
- [x] ✅ Pas d'erreurs TypeScript
- [x] ✅ Pas d'erreurs ESLint critiques
- [x] ✅ Build de production réussi (`npm run build`)
- [x] ✅ Types correctement définis
- [x] ✅ Imports/exports corrects

### Fonctionnalités
- [x] ✅ Recherche avec debounce
- [x] ✅ Filtres dynamiques (type, région, département)
- [x] ✅ Carte interactive MapLibre
- [x] ✅ Liste des résultats avec pagination infinie
- [x] ✅ Export CSV
- [x] ✅ Responsive design (mobile/desktop)
- [x] ✅ Gestion des erreurs
- [x] ✅ États de chargement

### Performance
- [x] ✅ Cache TanStack Query (5 min)
- [x] ✅ Debounce sur recherche (300ms)
- [x] ✅ Pagination par lots de 20
- [x] ✅ Optimisation des markers MapLibre
- [x] ✅ Pas de fuites mémoire

### Documentation
- [x] ✅ README.md complet
- [x] ✅ DOCUMENTATION.md technique
- [x] ✅ EXAMPLES.md avec cas d'usage
- [x] ✅ Commentaires dans le code

---

## 🚀 Déploiement

### Option 1: Vercel (Recommandé)

**Étapes:**

1. **Créer un compte Vercel**
   ```bash
   # Installer Vercel CLI
   npm install -g vercel
   ```

2. **Connexion**
   ```bash
   vercel login
   ```

3. **Déploiement**
   ```bash
   cd /Users/brayan/Sites/juice-finder
   vercel
   ```

4. **Configuration automatique**
   - Framework: Next.js
   - Build command: `next build`
   - Output directory: `.next`

5. **Domaine personnalisé (optionnel)**
   - Dashboard Vercel → Settings → Domains
   - Ajouter votre domaine

**Avantages:**
- ✅ Déploiement en 1 clic
- ✅ HTTPS automatique
- ✅ CDN global
- ✅ Preview deployments
- ✅ Analytics inclus

---

### Option 2: Netlify

1. **Installation**
   ```bash
   npm install -g netlify-cli
   ```

2. **Déploiement**
   ```bash
   netlify deploy --prod
   ```

3. **Configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`

---

### Option 3: Docker (Auto-hébergement)

1. **Créer un Dockerfile**
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Build et run**
   ```bash
   docker build -t juice-finder .
   docker run -p 3000:3000 juice-finder
   ```

---

### Option 4: VPS (Node.js)

1. **Prérequis sur le serveur**
   ```bash
   # Installer Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Installer PM2
   sudo npm install -g pm2
   ```

2. **Déployer le code**
   ```bash
   scp -r /Users/brayan/Sites/juice-finder user@server:/var/www/
   ```

3. **Sur le serveur**
   ```bash
   cd /var/www/juice-finder
   npm install
   npm run build
   pm2 start npm --name "juice-finder" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔧 Configuration post-déploiement

### Variables d'environnement (optionnel)

Aucune variable obligatoire ! L'API est publique.

Si vous voulez personnaliser :
```env
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://public.opendatasoft.com/api/explore/v2.1
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
```

### Analytics (optionnel)

**Google Analytics:**
```typescript
// src/app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Plausible (recommandé, privacy-friendly):**
```html
<Script
  defer
  data-domain="votre-domaine.com"
  src="https://plausible.io/js/script.js"
/>
```

---

## 🧪 Tests avant mise en production

### Checklist de test

**Fonctionnel:**
- [ ] Recherche fonctionne correctement
- [ ] Filtres s'appliquent bien
- [ ] Carte affiche les markers
- [ ] Pagination charge plus de résultats
- [ ] Export CSV télécharge un fichier
- [ ] Popup de carte affiche les bonnes infos
- [ ] Sélection d'un restaurant fonctionne
- [ ] Bouton "copier" copie le téléphone
- [ ] Liens externes s'ouvrent correctement

**Performance:**
- [ ] Temps de chargement < 3s
- [ ] Pas de freeze lors du scroll
- [ ] Carte fluide (60fps)
- [ ] Recherche réactive (debounce)

**Responsive:**
- [ ] Mobile (320px-767px)
- [ ] Tablette (768px-1023px)
- [ ] Desktop (1024px+)
- [ ] Carte visible sur mobile
- [ ] Filtres toggle sur mobile

**Navigateurs:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)

**Accessibilité:**
- [ ] Navigation clavier
- [ ] Labels sur les inputs
- [ ] Contraste suffisant
- [ ] Textes alternatifs

---

## 📊 Monitoring

### Erreurs

**Sentry (recommandé):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Performance

**Vercel Analytics:**
- Inclus automatiquement sur Vercel
- Dashboard → Analytics

**Web Vitals:**
```typescript
// src/app/layout.tsx
export function reportWebVitals(metric) {
  console.log(metric);
  // Envoyer à votre service analytics
}
```

---

## 🔒 Sécurité

### Headers recommandés

```javascript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

### HTTPS

- ✅ Vercel: HTTPS automatique
- ✅ Netlify: HTTPS automatique
- ⚠️ VPS: Utiliser Let's Encrypt (Certbot)

---

## 📈 Améliorations futures

### Court terme
- [ ] Géolocalisation "Autour de moi"
- [ ] Favoris (localStorage)
- [ ] Toast notifications
- [ ] Mode sombre

### Moyen terme
- [ ] Tests automatisés (Jest + RTL)
- [ ] Storybook pour les composants
- [ ] PWA (Service Worker)
- [ ] Recherche par rayon

### Long terme
- [ ] Backend personnalisé
- [ ] Base de données (cache)
- [ ] API propre
- [ ] Système de reviews
- [ ] Application mobile (React Native)

---

## 🆘 Support et maintenance

### Logs

**Vercel:**
```bash
vercel logs [deployment-url]
```

**PM2:**
```bash
pm2 logs juice-finder
```

### Mise à jour

```bash
# Dépendances
npm update

# Next.js
npm install next@latest react@latest react-dom@latest

# Rebuild
npm run build
```

### Backup

- Code: Repository Git
- Données: Pas de données stockées (API externe)

---

## 📞 Contact et ressources

- **Repository:** https://github.com/votre-username/juice-finder
- **Issues:** https://github.com/votre-username/juice-finder/issues
- **Documentation:** Voir DOCUMENTATION.md

---

✅ **Projet prêt pour le déploiement !**

**Commande rapide Vercel:**
```bash
cd /Users/brayan/Sites/juice-finder
vercel --prod
```

**Résultat attendu:**
- ✅ URL de production
- ✅ HTTPS activé
- ✅ Application accessible mondialement
- ✅ Performance optimale

🎉 **Félicitations ! Votre application est maintenant en ligne !**

