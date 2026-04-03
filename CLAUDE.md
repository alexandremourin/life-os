# Life OS

App PWA de développement personnel. Live sur Vercel + installée sur mobile.
**Repo :** https://github.com/alexandremourin/life-os
**Stack :** React 19 + Vite 8, Tailwind CSS v4, Supabase, HashRouter, vite-plugin-pwa

---

## Contraintes critiques

```bash
npm install --legacy-peer-deps          # toujours — conflit vite-plugin-pwa/React 19
npm run build -- --outDir /tmp/life-os-dist --emptyOutDir  # jamais dans dist/
```

- **HashRouter** obligatoire (jamais BrowserRouter)
- **Tailwind v4** : pas de tailwind.config — variables CSS dans index.css uniquement

---

## Règles de stockage

| Donnée | Où |
|---|---|
| habits_log, todos, journal, smoke_streak | Supabase |
| Notes, todo priority/deadline, jours validés | localStorage |

---

## Pièges métier

- **Score journal** : toujours stocker en **1-5**. Vieilles données en /10 → `/2` uniquement pour l'affichage
- **Smoke habit** : `completed = true` = n'a PAS fumé (logique inversée — ne pas fumer = victoire)
- **useStore.js** = source de vérité unique. Ne jamais bypasser.

---

## Deploy

Push sur `main` → Vercel déploie automatiquement → app live sur mobile immédiatement.
Chaque push va en prod. Tester localement avant de pusher.
