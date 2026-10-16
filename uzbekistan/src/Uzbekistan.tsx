/**
 * Uzbekistan.tsx — the full video "Why Everyone Is Suddenly Visiting Uzbekistan": a <Series> of the 10 scenes
 * (chapter cards overlay the first 1.4 s of scenes 2, 3, 7, 8, 9), the Uzbekistan theme, the voiceover, an
 * optional music bed and sound-design slots. No subtitles or captions of any kind.
 *
 * Audio (public/):
 *   voiceover.wav   the recorded narration, played untouched from frame 0 (timings.ts is fitted to it by
 *                   scripts/voiceover/fit_timings.py). Missing file → silent render, no crash.
 *   music.mp3       low bed (8 %), faded in/out, ducked a little further under the narration.
 *   sfx/*.mp3       paper slides, stamps, marker, whooshes, counter clicks, bazaar ambience (see shared/lib/sfx.tsx).
 *
 * Props (--props='{"music":false}' etc.): voiceover, music, musicVolume, sfx.
 */
import React from 'react';
import { AbsoluteFill, Audio, Series, getStaticFiles, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PaperBackground } from '../../shared/components/PaperBackground';
import { SfxProvider } from '../../shared/lib/sfx';
import { ThemeProvider } from '../../shared/theme';
import { SCENE_COMPONENTS } from './scenes';
import { uzbekistanTheme } from './theme';
import { AD_BREAKS, BREATH_SECONDS, SCENES, sec } from './timings';

export type UzbekistanProps = {
  voiceover: boolean;
  music: boolean;
  /** Music bed level (0–1). */
  musicVolume: number;
  sfx: boolean;
};

export const defaultUzbekistanProps: UzbekistanProps = { voiceover: true, music: true, musicVolume: 0.08, sfx: true };

const hasFile = (name: string) => {
  try {
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
};

/** The 0.5 s "breath" before each mid-roll marker: the frame settles and dims very slightly. */
const AdBreaths: React.FC = () => {
  const frame = useCurrentFrame();
  const b = AD_BREAKS.find((x) => frame >= x.breathFrom - 6 && frame < x.frame);
  if (!b) return null;
  const o = interpolate(frame, [b.breathFrom - 6, b.breathFrom + 4, b.frame - 1], [0, 0.1, 0.14], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ backgroundColor: `rgba(20,18,15,${o})`, pointerEvents: 'none' }} />;
};

export const Uzbekistan: React.FC<UzbekistanProps> = ({ voiceover, music, musicVolume, sfx }) => {
  const { durationInFrames } = useVideoConfig();
  const vo = voiceover && hasFile('voiceover.wav');
  const bed = music && hasFile('music.mp3');
  return (
    <ThemeProvider theme={uzbekistanTheme}>
      <SfxProvider enabled={sfx && hasFile('sfx/paper-slide.mp3')} gain={0.6}>
        <AbsoluteFill>
          {/* under every scene: paper, so whip / paper-slide entrances never reveal black */}
          <PaperBackground seed="uz-underlay" />
          <Series>
            {SCENES.map((s) => {
              const C = SCENE_COMPONENTS[s.id];
              return (
                <Series.Sequence key={s.id} durationInFrames={sec(s.seconds)} name={`${s.id} ${s.name}`}>
                  <C />
                </Series.Sequence>
              );
            })}
          </Series>
          <AdBreaths />
          {vo && <Audio src={staticFile('voiceover.wav')} volume={1} />}
          {bed && (
            <Audio
              src={staticFile('music.mp3')}
              loop
              volume={(f) =>
                musicVolume * interpolate(f, [0, 45, durationInFrames - 120, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              }
            />
          )}
        </AbsoluteFill>
      </SfxProvider>
    </ThemeProvider>
  );
};

/** Breath length in frames (for docs / checks). */
export const BREATH_FRAMES = sec(BREATH_SECONDS);
