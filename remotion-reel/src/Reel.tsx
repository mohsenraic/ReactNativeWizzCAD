import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, COLORS, DEBUG, SCENES} from './config';
import {FilmOverlay} from './components/FilmOverlay';
import {SafeZones} from './components/SafeZones';
import {SceneSequence} from './components/SceneSequence';
import {Subtitles} from './components/Subtitles';
import {sec} from './lib/time';
import {AltitudeScene} from './scenes/AltitudeScene';
import {CtaScene} from './scenes/CtaScene';
import {HookScene} from './scenes/HookScene';
import {MapJourneyScene} from './scenes/MapJourneyScene';
import {VillageScene} from './scenes/VillageScene';

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.background}}>
    <SceneSequence name="1 · Accroche" start={SCENES.hook.start} end={SCENES.hook.end}>
      <HookScene />
    </SceneSequence>
    {/* Globe (2) + zoom (3) partagent une caméra continue */}
    <SceneSequence name="2-3 · Globe & zoom" start={SCENES.globe.start} end={SCENES.zoom.end}>
      <MapJourneyScene />
    </SceneSequence>
    <SceneSequence name="4 · Altitude" start={SCENES.altitude.start} end={SCENES.altitude.end}>
      <AltitudeScene />
    </SceneSequence>
    {/* Tours (5) + hiver (6) partagent le même décor */}
    <SceneSequence name="5-6 · Tours & hiver" start={SCENES.towers.start} end={SCENES.winter.end}>
      <VillageScene />
    </SceneSequence>
    <SceneSequence name="7 · CTA" start={SCENES.cta.start} end={SCENES.cta.end}>
      <CtaScene />
    </SceneSequence>

    <Subtitles />
    <FilmOverlay />
    {DEBUG.showSafeZones ? <SafeZones /> : null}

    {AUDIO.enabled ? (
      <Sequence from={sec(Math.max(0, AUDIO.offset))} name="Voix off" layout="none">
        <Html5Audio
          src={staticFile(AUDIO.voiceover)}
          volume={AUDIO.volume}
          trimBefore={AUDIO.offset < 0 ? sec(-AUDIO.offset) : undefined}
        />
      </Sequence>
    ) : null}
  </AbsoluteFill>
);
