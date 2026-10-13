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
} as const;

export type SfxName = keyof typeof SFX_FILES;

const ENABLE_SFX = false;

export const sfxEnabled = (): boolean => {
  const props = getInputProps() as { sfx?: boolean };
  return props.sfx ?? ENABLE_SFX;
};

/** Plays a sound effect at `at` (frames, relative to the enclosing sequence). */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.6 }) => {
  if (!sfxEnabled()) return null;
  return (
    <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(SFX_FILES[name])} volume={volume} />
    </Sequence>
  );
};
