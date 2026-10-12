# Travel Reel — template Remotion (Ksamil, Albanie)

Reel Instagram / YouTube Short **1080×1920 · 30 fps**. La durée est calculée depuis la voix off. On y trouve des photos avec des mouvements de caméra, un globe d3-geo, une épingle, des cartes « FACT », des sous-titres synchronisés au mot près et un écran de fin.

## Installation et commandes

```bash
cd travel-reel
npm install
npm run dev        # Remotion Studio
npm run render     # → out/ksamil-reel.mp4 (h264, CRF 16)
```

## Structure

```
travel-reel/
├── public/
│   ├── audio/voiceover.mp3           ← voix off (ElevenLabs)
│   ├── audio/voiceover.words.json    ← horodatage de chaque mot (sync scènes + sous-titres)
│   ├── audio/music.mp3               ← optionnel : musique (0.15, ducking sous la voix)
│   └── photos/                       ← toutes les images sont utilisées automatiquement
└── src/
    ├── data/ksamil.ts                ← ★ toutes les données du lieu
    ├── data/index.ts                 ← lieu rendu par la composition
    ├── Root.tsx                      ← composition, durée = getAudioDurationInSeconds(voiceover) + fin
    ├── Reel.tsx                      ← assemblage des calques + audio
    ├── lib/timeline.ts               ← moteur : ancrage sur la voix, plan des photos, sous-titres
    └── components/                   ← PhotoScene, PhotoTrack, Globe, Overlays (Hook, Pin, FactCards, Captions, EndCard), Icons
```

## Comment ça se synchronise

Aucun timing n'est écrit en dur. Chaque moment clé est **ancré sur une phrase de la voix off** dans `data/ksamil.ts`, par exemple `beats.pin.phrase = "but it's Ksamil"` ou `facts[i].phrase`. Ces phrases sont retrouvées dans `voiceover.words.json` :
- le globe démarre sur « Most people think » ;
- l'épingle atterrit exactement sur le mot « Ksamil » ;
- chaque FactCard apparaît sur sa phrase ;
- l'écran de fin démarre sur « Would you go here ».

Les photos sont découpées en plans de 2,6 s maximum entre la plongée dans la carte et l'écran de fin. Deux plans qui se suivent n'ont jamais la même photo ni le même mouvement. Une photo réutilisée reçoit un autre cadrage.

Si `voiceover.words.json` est absent, les mots sont estimés à partir du texte (`script`) et de la durée de l'audio. Ça marche, mais la synchro est moins précise.

## Créer la vidéo d'un autre lieu

1. **Données :** dupliquez `src/data/ksamil.ts`, par exemple en `src/data/zanzibar.ts`. Changez le lieu, le drapeau, le code ISO numérique du pays (world-atlas : France `250`, Grèce `300`, etc.), les coordonnées, le texte de l'accroche, les `phrase` d'ancrage, les faits, la caméra du globe et les points de cadrage des photos.
2. **Lieu rendu :** dans `src/data/index.ts`, importez le nouveau fichier. Pensez aussi à changer `compositionId` et le script `render` dans `package.json`.
3. **Voix :** générez la voix off avec ElevenLabs.
   - Mettez le texte exact dans `script`.
   - Enregistrez l'audio dans `public/audio/voiceover.mp3`.
   - Récupérez l'horodatage de chaque mot (transcription Scribe, ou endpoint *with-timestamps*) dans `public/audio/voiceover.words.json`, au format `{"words":[{"text","start","end"}]}`.
   - Les `phrase` d'ancrage doivent apparaître telles quelles dans le texte.
4. **Photos :** remplacez le contenu de `public/photos/`, en jpg, png ou webp. Le nom de fichier fixe l'ordre. La photo `hero` (ou la première) ouvre et ferme la vidéo : mettez-y la plus spectaculaire. Si besoin, ajustez `photos.hints[fichier].focus` pour garder le sujet centré dans le recadrage 9:16.
5. **Vérification :** lancez `npm run dev` pour vérifier, puis `npm run render`.
