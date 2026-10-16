/**
 * common.tsx — scene scaffolding for the Uzbekistan video.
 *
 *   <UzScene id="s04">      background + camera + chapter card + this scene's transitions (from TRANSITIONS)
 *   useScene('s04')         { d, c } — scene length and cue(name, offsetSeconds) in frames
 *   <QuestionPin>           the open-loop red "?" cutout (pinned small, or big in the centre, can be crossed out)
 *   <Words>                 short Caveat/Oswald labels that appear one by one (annotation chips — never narration text)
 *
 * Transitions alternate so no two neighbouring cuts look alike: tile-pattern wipes, whip-pans and a paper slide.
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraMove } from '../../../shared/components/CameraRig';
import { Cutout } from '../../../shared/components/Cutout';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { SceneShell } from '../../../shared/components/SceneShell';
import { TransitionType } from '../../../shared/components/SceneTransition';
import { PaperVariant } from '../../../shared/components/PaperBackground';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { PatternWipe, Tiling } from '../components/GeometricPattern';
import { PALETTE, TILE_COLORS } from '../theme';
import { CHAPTER_CARD_FRAMES, CueName, SCENES, SceneId, cue, sceneFrames } from '../timings';

export const WIPE_FRAMES = 18;

/** A visual beat: [cue name, offset seconds] or [null, seconds from scene start]. */
export type Beat<S extends SceneId> = [CueName<S> | null, number];

type Wipe = { tiling: Tiling; origin: [number, number]; colors?: readonly string[] };

/** How each scene enters / exits. A 'wipe' exit must be followed by a 'wipe' entry with the same settings. */
export const TRANSITIONS: Record<SceneId, { enter: TransitionType | 'wipe'; exit: 'none' | 'wipe'; wipe?: Wipe; paper: PaperVariant }> = {
  s01: { enter: 'none', exit: 'wipe', wipe: { tiling: '4.8.8', origin: [960, 540] }, paper: 'dark' },
  s02: { enter: 'wipe', exit: 'none', paper: 'light' },
  s03: { enter: 'whip', exit: 'wipe', wipe: { tiling: '3.12.12', origin: [1180, 420] }, paper: 'light' },
  s04: { enter: 'wipe', exit: 'none', paper: 'light' },
  s05: { enter: 'paper', exit: 'wipe', wipe: { tiling: '6.6.6', origin: [1500, 300] }, paper: 'light' },
  s06: { enter: 'wipe', exit: 'none', paper: 'dark' },
  s07: { enter: 'whip', exit: 'wipe', wipe: { tiling: '4.8.8', origin: [300, 800], colors: [PALETTE.turquoise, PALETTE.saffron, PALETTE.tileWhite] }, paper: 'light' },
  s08: { enter: 'wipe', exit: 'none', paper: 'light' },
  s09: { enter: 'whip', exit: 'wipe', wipe: { tiling: '3.12.12', origin: [960, 1000], colors: [PALETTE.lapis, PALETTE.turquoise, PALETTE.saffron] }, paper: 'light' },
  s10: { enter: 'wipe', exit: 'none', paper: 'dark' },
};

const ORDER: SceneId[] = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10'];
const wipeInto = (id: SceneId): Wipe | undefined => {
  const prev = ORDER[ORDER.indexOf(id) - 1];
  return prev ? TRANSITIONS[prev].wipe : undefined;
};

export const useScene = <S extends SceneId>(id: S) => {
  const d = sceneFrames(id);
  const c = (name: CueName<S>, offsetSeconds = 0) => cue(id, name, offsetSeconds);
  return { d, c };
};

export const UzScene: React.FC<{
  id: SceneId;
  children: React.ReactNode;
  under?: React.ReactNode;
  foreground?: React.ReactNode;
  /** Unaffected by the camera (source tags, pins). */
  overlay?: React.ReactNode;
  moves?: CameraMove[];
  pushIn?: number;
  drift?: [number, number];
  focus?: [number, number];
  /** Paper override (defaults to TRANSITIONS[id].paper). */
  paper?: PaperVariant;
}> = ({ id, children, under, foreground, overlay, moves, pushIn, drift, focus, paper }) => {
  const t = TRANSITIONS[id];
  const d = sceneFrames(id);
  const scene = SCENES.find((s) => s.id === id)!;
  const chapter = 'chapter' in scene ? scene.chapter : undefined;
  const wIn = t.enter === 'wipe' ? wipeInto(id) : undefined;
  return (
    <SceneShell
      durationInFrames={d}
      paper={paper ?? t.paper}
      seed={`uz-${id}`}
      chapter={chapter}
      chapterFrames={CHAPTER_CARD_FRAMES}
      enter={t.enter === 'wipe' ? 'none' : t.enter}
      exit="none"
      moves={moves}
      pushIn={pushIn}
      drift={drift}
      focus={focus}
      under={under}
      foreground={foreground}
      overlay={
        <>
          {overlay}
          {wIn && <PatternWipe phase="reveal" at={0} frames={WIPE_FRAMES} tiling={wIn.tiling} origin={wIn.origin} colors={wIn.colors ?? TILE_COLORS} sound={false} />}
          {t.exit === 'wipe' && t.wipe && <PatternWipe phase="cover" at={d - WIPE_FRAMES} frames={WIPE_FRAMES} tiling={t.wipe.tiling} origin={t.wipe.origin} colors={t.wipe.colors ?? TILE_COLORS} />}
        </>
      }
    >
      {children}
    </SceneShell>
  );
};

/**
 * The open-loop question mark: a red "?" cutout with a pin. `big` puts it centre-screen (the question returns),
 * `crossAt` strikes it through (answered).
 */
export const QuestionPin: React.FC<{
  at: number;
  outAt?: number;
  big?: boolean;
  crossAt?: number;
  left?: number;
  top?: number;
  note?: string;
}> = ({ at, outAt, big = false, crossAt, left, top, note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  if (frame < at - 1 || (outAt !== undefined && frame > outAt + 16)) return null;
  const size = big ? 440 : 120;
  const x = left ?? (big ? 960 - size * 0.42 : 1690);
  const y = top ?? (big ? 540 - size * 0.62 : 56);
  const wobble = Math.sin((frame - at) / 22) * 1.5;
  const pinS = spring({ frame: frame - at - 6, fps, config: SPRINGS.stamp });
  return (
    <>
      <Sfx name="paperSlide" at={at} volume={0.4} />
      <Cutout enterAt={at} from={big ? 'scale' : 'top'} exitAt={outAt} exitTo="top" rotation={big ? -4 + wobble : 6 + wobble} seed="question" style={{ left: x, top: y }} background={PALETTE.tileWhite} border={big ? 10 : 6}>
        <div style={{ position: 'relative', width: size * 0.84, height: size * 1.12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: F.headline, fontWeight: 700, fontSize: size, lineHeight: 1, color: PALETTE.questionRed }}>?</span>
          <div
            style={{
              position: 'absolute',
              top: -size * 0.06,
              left: '50%',
              width: size * 0.16,
              height: size * 0.16,
              marginLeft: -size * 0.08,
              borderRadius: '50%',
              transform: `scale(${pinS})`,
              background: `radial-gradient(circle at 35% 35%, #E0705F, ${PALETTE.questionRed} 55%, #7A1E14)`,
              boxShadow: '2px 4px 4px rgba(0,0,0,0.35)',
            }}
          />
          {crossAt !== undefined && (
            <HandDrawnAnnotation shape={{ type: 'x', cx: size * 0.42, cy: size * 0.56, size: size * 0.8 }} at={crossAt} duration={14} color="ink" strokeWidth={big ? 16 : 7} width={size * 0.84} height={size * 1.12} />
          )}
        </div>
        {note && (
          <div style={{ position: 'absolute', left: '50%', bottom: -48, transform: 'translateX(-50%)', fontFamily: F.hand, fontWeight: 700, fontSize: 40, color: PALETTE.questionRed, whiteSpace: 'nowrap' }}>{note}</div>
        )}
      </Cutout>
    </>
  );
};

/** Words that pop in one by one (labels / tags — not narration). */
export const Words: React.FC<{
  words: string[];
  at: number;
  stagger?: number;
  font?: 'hand' | 'headline' | 'mono';
  size?: number;
  color?: string;
  gap?: number;
  style?: React.CSSProperties;
  direction?: 'row' | 'column';
  outAt?: number;
}> = ({ words, at, stagger = 8, font = 'hand', size = 56, color, gap = 28, style, direction = 'row', outAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F, colors: C } = useTheme();
  const out = outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (out <= 0) return null;
  const family = font === 'hand' ? F.hand : font === 'mono' ? F.mono : F.headline;
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: direction, gap, opacity: out, ...style }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - (at + i * stagger), fps, config: SPRINGS.cutout });
        return (
          <span
            key={i}
            style={{
              fontFamily: family,
              fontWeight: 700,
              fontSize: size,
              color: color ?? C.ink,
              transform: `translateY(${(1 - s) * 30}px) rotate(${(1 - s) * -6}deg)`,
              opacity: Math.min(1, s * 2),
              whiteSpace: 'nowrap',
              letterSpacing: font === 'headline' ? 1.5 : font === 'mono' ? 2 : 0,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Visible-only-between helper (unmounts outside the window, fades at both ends). */
export const Between: React.FC<{ from: number; to?: number; fade?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, to, fade = 10, children, style }) => {
  const frame = useCurrentFrame();
  if (frame < from || (to !== undefined && frame > to + fade)) return null;
  const a = interpolate(frame, [from, from + fade], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b = to === undefined ? 1 : interpolate(frame, [to, to + fade], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ position: 'absolute', inset: 0, opacity: a * b, ...style }}>{children}</div>;
};

/** Seconds → frames inside a scene. */
export const s2f = (s: number) => Math.round(s * 30);

/**
 * In-scene whip-pan: `from` flies out to the left with motion blur while `to` arrives from the right.
 * Before `at` only `from` renders; after the pan only `to`.
 */
export const WhipPan: React.FC<{ at: number; frames?: number; from: React.ReactNode; to: React.ReactNode; vertical?: boolean }> = ({ at, frames = 12, from, to, vertical = false }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t) });
  const blur = Math.sin(p * Math.PI) * 30;
  const axis = vertical ? 'Y' : 'X';
  const dist = vertical ? 1080 : 1920;
  return (
    <>
      <Sfx name="whoosh" at={at} volume={0.4} />
      {p < 1 && <div style={{ position: 'absolute', inset: 0, transform: `translate${axis}(${-p * dist}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>{from}</div>}
      {p > 0 && <div style={{ position: 'absolute', inset: 0, transform: `translate${axis}(${(1 - p) * dist}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>{to}</div>}
    </>
  );
};
