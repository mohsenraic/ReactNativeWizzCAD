/**
 * Scene registry — order matches timings.ts SCENES.
 */
import React from 'react';
import { SCENES, type SceneId } from '../timings';
import { BEATS_S01, Scene01ColdOpen } from './Scene01ColdOpen';
import { BEATS_S02, Scene02Numbers } from './Scene02Numbers';
import { BEATS_S03, Scene03SilkRoad } from './Scene03SilkRoad';
import { BEATS_S04, Scene04Samarkand } from './Scene04Samarkand';
import { BEATS_S05, Scene05Bukhara } from './Scene05Bukhara';
import { BEATS_S06, Scene06Khiva } from './Scene06Khiva';
import { BEATS_S07, Scene07Opening } from './Scene07Opening';
import { BEATS_S08, Scene08BeyondDomes } from './Scene08BeyondDomes';
import { BEATS_S09, Scene09Future } from './Scene09Future';
import { BEATS_S10, Scene10Outro } from './Scene10Outro';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  s01: Scene01ColdOpen,
  s02: Scene02Numbers,
  s03: Scene03SilkRoad,
  s04: Scene04Samarkand,
  s05: Scene05Bukhara,
  s06: Scene06Khiva,
  s07: Scene07Opening,
  s08: Scene08BeyondDomes,
  s09: Scene09Future,
  s10: Scene10Outro,
};

const RAW_BEATS: Record<SceneId, Array<[string | null, number]>> = {
  s01: BEATS_S01,
  s02: BEATS_S02,
  s03: BEATS_S03,
  s04: BEATS_S04,
  s05: BEATS_S05,
  s06: BEATS_S06,
  s07: BEATS_S07,
  s08: BEATS_S08,
  s09: BEATS_S09,
  s10: BEATS_S10,
};

/** Extra visual beats in seconds from each scene's start, resolved from cue names — fed to retentionGaps(). */
export const SCENE_BEATS: Record<SceneId, number[]> = Object.fromEntries(
  SCENES.map((sc) => [
    sc.id,
    RAW_BEATS[sc.id].map(([name, off]) => (name === null ? off : (sc.cues as Record<string, number>)[name] + off)),
  ]),
) as Record<SceneId, number[]>;
