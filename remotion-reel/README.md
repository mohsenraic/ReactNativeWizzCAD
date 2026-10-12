# Reel « trésor caché » : template Remotion

Vidéo verticale **1080×1920 · 30 fps · 32 s** (Instagram Reel / YouTube Short).
La carte est dessinée en SVG avec **d3-geo + world-atlas**, sans tuiles externes. Les sous-titres karaoké sont synchronisés sur une voix off.

## Installation

```bash
cd remotion-reel
npm install
# déposer la voix off :
cp /chemin/vers/voiceover.mp3 public/voiceover.mp3
```

Dépendances (versions figées dans `package.json`) :

```bash
npm i remotion @remotion/cli @remotion/google-fonts @remotion/paths react react-dom \
      d3-geo topojson-client world-atlas
npm i -D typescript @types/react @types/d3-geo @types/topojson-client \
      @types/topojson-specification @types/geojson
```

## Commandes

| Commande            | Effet                                         |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Remotion Studio (prévisualisation en direct)  |
| `npm run render`    | Rendu final → `out/reel.mp4`                  |
| `npm run still`     | Image de couverture → `out/cover.png`         |
| `npm run typecheck` | Vérification TypeScript                       |

## Structure

```
remotion-reel/
├── public/voiceover.mp3        ← votre voix off (non versionnée)
├── remotion.config.ts          ← codec, qualité
└── src/
    ├── config.ts               ← ★ TOUT le contenu : lieu, textes, timings, couleurs, sous-titres
    ├── index.ts / Root.tsx     ← enregistrement de la composition « Reel »
    ├── Reel.tsx                ← montage : scènes + sous-titres + grain + audio
    ├── lib/
    │   ├── geo.ts              ← world-atlas → GeoJSON, projection orthographique, interpolation caméra
    │   ├── time.ts             ← secondes↔frames, springAt(), progress(), contexte de scène
    │   ├── text.ts             ← découpage des mots, mots-clés en or, format « 2 000 »
    │   └── fonts.ts            ← Montserrat / Inter via @remotion/google-fonts
    ├── components/
    │   ├── SceneSequence.tsx   ← Sequence + fondu enchaîné
    │   ├── WorldMap.tsx        ← carte SVG (océan, pays, frontières lumineuses, halo)
    │   ├── Pin.tsx             ← pin doré, rebond, ondes, étiquette
    │   ├── Subtitles.tsx       ← sous-titres karaoké
    │   ├── AnimatedWords.tsx   ← texte mot par mot
    │   ├── Landscape.tsx       ← montagnes + tours de pierre + passage à l'hiver
    │   ├── Snow.tsx            ← particules de neige
    │   ├── Background.tsx      ← fond nuit + étoiles
    │   ├── FilmOverlay.tsx     ← grain + vignette
    │   └── SafeZones.tsx       ← aide visuelle des zones interdites
    └── scenes/
        ├── HookScene.tsx       ← 1 · 0–3 s
        ├── MapJourneyScene.tsx ← 2+3 · 3–13 s (globe → Géorgie → Ushguli, caméra continue)
        ├── AltitudeScene.tsx   ← 4 · 13–19 s
        ├── VillageScene.tsx    ← 5+6 · 19–27 s (tours puis hiver, même décor)
        └── CtaScene.tsx        ← 7 · 27–32 s
```

## Réutiliser le template pour un autre lieu

Tout se règle dans `src/config.ts` :

- **`PLACE`** : nom, pays, `countryIsoNumeric` (code ISO numérique, ex. `'250'` pour la France), lat/lon.
- **`MAP.camera`** : positions et échelles de la caméra (globe, pays, lieu, CTA). Le paramètre `scale` correspond au rayon du globe en px.
- **`SCENES`**, **`MAP.*At`**, **`ALTITUDE.draw*`**, etc. : tous les timings, en secondes.
- **`HOOK` / `ALTITUDE` / `TOWERS` / `WINTER` / `CTA`** : textes et mots-clés en or.
- **`COLORS`**, **`FONTS`**, **`FILM`** : charte graphique.

### Recaler les sous-titres sur la voix off

`SUBTITLES.segments` est une liste de blocs de 2 à 4 mots `{start, end, text}`. Dans chaque bloc, les mots sont répartis au prorata de leur longueur. Pour un calage au mot près, ajoutez `wordStarts: [t1, t2, …]`, avec un instant par mot.
Si toute la voix est décalée, utilisez plutôt `AUDIO.offset`.

### Zones de sécurité

Les éléments importants restent entre **y = 250** et **y = 1520**. Pour vérifier le cadrage, passez `DEBUG.showSafeZones = true` : les zones masquées par l'interface s'affichent en rouge dans le Studio.
