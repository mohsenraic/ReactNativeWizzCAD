import React, {useMemo} from 'react';
import {AbsoluteFill, getStaticFiles, Html5Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DATA} from './data';
import type {ReelProps} from './data/types';
import {Globe} from './components/Globe';
import {Captions, EndCardText, FactCards, HookTitle, LocationPin} from './components/Overlays';
import {PhotoScene} from './components/PhotoScene';
import {PhotoTrack} from './components/PhotoTrack';
import {FPS} from './lib/constants';
import {progress} from './lib/anim';
import {buildTimeline, heroPhoto, Timeline} from './lib/timeline';

const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

/** Every image in public/photos/ */
const listPhotos = () =>
  getStaticFiles()
    .filter((f) => f.name.startsWith('photos/') && IMAGE_RE.test(f.name))
    .map((f) => f.name.replace(/^photos\//, ''));

const hasStaticFile = (name: string) => getStaticFiles().some((f) => f.name === name);

/** Music volume: fade in/out + ducking while the voice speaks */
const musicVolume = (t: number, tl: Timeline) => {
  const {musicVolume: base, musicDuckedVolume: ducked} = DATA.audio;
  const speaking = tl.captions.some((c) => t >= c.start - 0.15 && t <= c.end + 0.1);
  const fade = Math.min(progress(t, 0, 0.5, (x) => x), 1 - progress(t, tl.total - 1, tl.total, (x) => x));
  return (speaking ? ducked : base) * fade;
};

export const Reel: React.FC<ReelProps> = ({audioDuration, words}) => {
  const frame = useCurrentFrame();
  const time = frame / FPS;
  const photos = useMemo(listPhotos, []);
  const tl = useMemo(() => buildTimeline(DATA, audioDuration, words, photos), [audioDuration, words, photos]);
  const hero = heroPhoto(DATA, photos);
  const hasMusic = useMemo(() => hasStaticFile(DATA.audio.music), []);

  if (!hero) {
    return (
      <AbsoluteFill style={{background: DATA.theme.navy, color: 'white', fontSize: 50, padding: 80, justifyContent: 'center'}}>
        No photo found in public/photos/
      </AbsoluteFill>
    );
  }

  const heroFocus = DATA.photos.hints[hero]?.focus ?? {x: 50, y: 50};
  const showGlobe = time >= tl.globeStart - 0.3 && time <= tl.diveEnd + 0.05;
  const endIn = progress(time, tl.endCardStart - 0.15, tl.endCardStart + 0.35);

  return (
    <AbsoluteFill style={{backgroundColor: DATA.theme.navy}}>
      {/* 1 · Hook: the most spectacular photo */}
      {time < tl.globeStart + 0.4 ? (
        <PhotoScene
          src={hero}
          focus={heroFocus}
          motion="zoomIn"
          progress={time / (tl.globeStart + 0.4)}
          exitP={progress(time, tl.globeStart - 0.3, tl.globeStart + 0.3, (x) => x)}
          exitType="zoomThrough"
          darken={0.15}
        />
      ) : null}

      {/* 2 · Globe -> zoom -> dive */}
      {showGlobe ? <Globe time={time} tl={tl} /> : null}

      {/* 3 · Photos synced to the facts */}
      {time >= tl.diveStart ? <PhotoTrack shots={tl.shots} time={time} /> : null}

      {/* 4 · End card on the hero photo */}
      {endIn > 0 ? (
        <PhotoScene
          src={hero}
          focus={heroFocus}
          motion="zoomOut"
          progress={interpolate(time, [tl.endCardStart, tl.total], [0, 1], {extrapolateRight: 'clamp'})}
          enterP={endIn}
          enterType="zoomThrough"
          darken={0.2}
        />
      ) : null}

      <LocationPin time={time} tl={tl} />
      <FactCards time={time} tl={tl} />
      <HookTitle time={time} tl={tl} />
      <EndCardText time={time} tl={tl} />
      <Captions time={time} tl={tl} />

      <Html5Audio src={staticFile(DATA.audio.voiceover)} volume={1} />
      {hasMusic ? (
        <Html5Audio src={staticFile(DATA.audio.music)} volume={(f) => musicVolume(f / FPS, tl)} loop />
      ) : null}
    </AbsoluteFill>
  );
};
