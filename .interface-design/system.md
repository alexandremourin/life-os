# Life OS — Design System

## Direction
Personality: Data & Analysis — dark, dense, personal tracker
Foundation: Near-black (OLED-friendly)
Depth: Borders + subtle surface elevation

## Tokens

### Colors
--bg: #0a0a0a
--surface: #111111
--surface-2: #171717
--surface-3: #1e1e1e
--border: #1e1e1e
--text: #ebebeb
--text-2: #888888
--text-3: #555555
--accent: #d4a44a        ← or/doré (couleur principale)
--accent-dim: rgba(212,164,74,0.12)
--success: #34d399
--success-dim: rgba(52,211,153,0.12)
--danger: #f87171
--danger-dim: rgba(248,113,113,0.12)

### Category colors (Todo)
--tcs: #6366f1
--projects: #f59e0b
--ace: #10b981
--personal: #ec4899

### Typography
Font UI: DM Sans (300/400/500/600/700)
Font mono: JetBrains Mono (400/500/600)

### Spacing
Base: 4px | Scale: 4, 8, 12, 16, 20, 24, 32, 48

### Border radius
Small: 6px | Default: 10px | Large: 14px

### Scrollbar
Width: 3px | Thumb: var(--surface-3)

## Patterns

### Nav (bottom, mobile)
Height: 60px | Background: rgba(10,10,10,0.92) + blur(24px)
Border-top: 1px solid var(--surface-2)
Active indicator: 2px bar top, 14px wide, accent color
Icon active: strokeWidth 2.2 | inactive: 1.5

### Cards / Surface
Background: var(--surface) | Border: 1px solid var(--border)
Padding: 16px | Radius: 10–14px

### Buttons
Radius: 8–10px | No box-shadow | Transition: 0.2s

### Textarea / Input
Background: var(--surface-2) | Focus: var(--surface-3)
Radius: 10px | Padding: 12px 16px | Font: DM Sans 14px

### Animations
fadeIn: opacity 0→1 + translateY 6px→0, 0.2s ease
Spinner: spin 0.8s linear infinite

## Anti-patterns
- Pas de BrowserRouter (HashRouter uniquement)
- Pas de valeurs hardcodées hors variables CSS
- Pas de thème clair (dark only)
- Jamais de fetch Supabase hors useStore.js
