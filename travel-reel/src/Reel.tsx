import React, {useMemo} from 'react';
import {AbsoluteFill, getStaticFiles, Html5Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DATA} from './data';
import type {ReelProps} from './data/types';
import {Globe} from './components/Globe';
import {Captions, EndCardText, FactCards, HookBackground, HookTitle, LocationPin} from './components/Overlays';
import {PhotoScene} from './components/PhotoScene';
import {PhotoTrack} from './components/PhotoTrack';
import {FPS} from './lib/constants';
import {progress} from './lib/anim';
import {buildTimeline, endCardPhoto, heroPhoto, Timeline} from './lib/timeline';

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

  const endPhoto = endCardPhoto(DATA, photos);
  const endFocus = DATA.photos.hints[endPhoto]?.focus ?? {x: 50, y: 50};
  const showGlobe = time >= tl.globeStart - 0.3 && time <= tl.revealEnd + 0.05;
  const endIn = progress(time, tl.endCardStart - 0.15, tl.endCardStart + 0.35);

  return (
    <AbsoluteFill style={{backgroundColor: DATA.theme.navy}}>
      {/* 1 · Hook: abstract lagoon colours, no photo (surprise kept for later) */}
      <HookBackground time={time} tl={tl} />

      {/* 3 · Photos, revealed mid-video, under the map's iris */}
      {time >= tl.revealAt - 0.05 ? <PhotoTrack shots={tl.shots} time={time} /> : null}

      {/* 2 · Globe -> coast -> detail -> zoom -> iris reveal */}
      {showGlobe ? <Globe time={time} tl={tl} /> : null}

      {/* 4 · End card */}
      {endIn > 0 ? (
        <PhotoScene
          src={endPhoto}
          focus={endFocus}
          motion="zoomOut"
          progress={interpolate(time, [tl.endCardStart, tl.total], [0, 1], {extrapolateRight: 'clamp'})}
          enterP={endIn}
          enterType="zoomThrough"
          darken={0.2}
        />
      ) : null}

      <LocationPin time={time} tl={tl} />
      {DATA.showFactCards ? <FactCards time={time} tl={tl} /> : null}
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
