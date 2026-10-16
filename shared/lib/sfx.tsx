/**
 * sfx.tsx — sound-design slots.
 *
 * Drop files into public/sfx/ with the names below and flip ENABLE_SFX (or pass the input prop
 * `sfx: true` when rendering). While disabled, <Sfx> renders nothing, so missing files never
 * break a render.
 */
import React from 'react';
import { Audio, Sequence, getInputProps, staticFile } from 'remotion';

export const SFX_FILES = {
  paperSlide: 'sfx/paper-slide.mp3',
  markerSqueak: 'sfx/marker-squeak.mp3',
  stampThud: 'sfx/stamp-thud.mp3',
  counterClick: 'sfx/counter-click.mp3',
  whoosh: 'sfx/whoosh.mp3',
  penScratch: 'sfx/pen-scratch.mp3',
  /** Soft, airy whoosh for gentle transitions (pattern wipes). */
  whooshSoft: 'sfx/whoosh-soft.mp3',
  /** Market crowd bed — pass `loop` and `durationInFrames`. */
  bazaarAmbience: 'sfx/bazaar-ambience.mp3',
} as const;

export type SfxName = keyof typeof SFX_FILES;

const ENABLE_SFX = false;

export const sfxEnabled = (): boolean => {
  const props = getInputProps() as { sfx?: boolean };
  return props.sfx ?? ENABLE_SFX;
};

const SfxContext = React.createContext<{ enabled: boolean; gain: number } | undefined>(undefined);

/**
 * Turns sound effects on/off for everything inside (overrides ENABLE_SFX / the `sfx` input prop) and scales
 * their level. Videos that never mount it behave exactly as before.
 */
export const SfxProvider: React.FC<{ enabled: boolean; gain?: number; children: React.ReactNode }> = ({ enabled, gain = 1, children }) => (
  <SfxContext.Provider value={{ enabled, gain }}>{children}</SfxContext.Provider>
);

/**
 * Plays a sound effect at `at` (frames, relative to the enclosing sequence).
 * Ambience beds: pass `durationInFrames` to stop it, `loop` to repeat a short file, `fade` (frames) to ease in/out.
 */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number; durationInFrames?: number; loop?: boolean; fade?: number }> = ({
  name,
  at,
  volume = 0.6,
  durationInFrames,
  loop,
  fade,
}) => {
  const ctx = React.useContext(SfxContext);
  const props = getInputProps() as { sfx?: boolean };
  const enabled = props.sfx ?? ctx?.enabled ?? ENABLE_SFX;
  if (!enabled) return null;
  volume *= ctx?.gain ?? 1;
  const level = volume;
  const vol =
    fade && durationInFrames
      ? (f: number) => level * Math.min(1, f / fade, Math.max(0, durationInFrames - f) / fade)
      : volume;
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={durationInFrames} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(SFX_FILES[name])} volume={vol} loop={loop} />
    </Sequence>
  );
};
