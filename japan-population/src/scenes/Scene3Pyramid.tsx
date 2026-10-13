/**
 * Scene 3 — The Shape (0:55–1:45). Pyramid built from paper strips, morphing 1950 → 1990 → 2025
 * → 2070. Baby-boom strips are highlighted yellow and tracked by hand-drawn arrows as they climb.
 * In 2070 the 65+ zone gets a red brace and "~39%"; on the last line the shape flips and wobbles.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BigCounter, Cutout, HandDrawnAnnotation, PopulationPyramid, SourceTag, boomIndexAt, pyramidGeometry, pyramidStateAt } from '../components';
import type { PyramidKeyframe } from '../components';
import { babyBooms, ipss2070, pyramids } from '../data/japan';
import { COLORS, FONTS } from '../theme';
import { sceneById } from '../timeline';
import { SceneShell, cue, useFade } from './helpers';

export const SCENE_3_DURATION = sceneById(3).durationInFrames;

const S = 3;
const LEFT = 470;
const TOP = 110;
const MORPH = 60;
const SIZE = { width: 1000, height: 880, maxValue: 6000 };

const BoomLabel: React.FC<{ years: string; text: string; at: number; outAt: number; top: number; seed: string }> = ({ years, text, at, outAt, top, seed }) => {
  const o = useFade(0, outAt);
  return (
    <div style={{ opacity: o }}>
      <Cutout enterAt={at} from="left" seed={seed} style={{ left: 60, top }} background="#FBFAF6">
        <div style={{ padding: '14px 22px', width: 390 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 20, letterSpacing: 2, color: COLORS.greyDark }}>BABY BOOM · {years}</div>
          <div style={{ fontFamily: FONTS.headline, fontWeight: 700, fontSize: 38, color: COLORS.ink, marginTop: 4, whiteSpace: 'nowrap' }}>
            <span style={{ background: COLORS.highlighter, padding: '0 6px' }}>{text}</span>
          </div>
        </div>
      </Cutout>
    </div>
  );
};

export const Scene3Pyramid: React.FC = () => {
  const frame = useCurrentFrame();
  const buildAt = cue(S, 'pyramid in 1950');
  const watchAt = cue(S, 'Now watch');
  const boomsAt = cue(S, 'baby booms');
  const boom1At = cue(S, 'late 1940s');
  const boom2At = cue(S, 'early 1970s');
  const climbAt = cue(S, 'As they age');
  const replacedAt = cue(S, 'never replaced');
  const urnAt = cue(S, 'By 2070');
  const fourInTenAt = cue(S, 'four in ten');
  const flipAt = cue(S, 'standing on its', 24);

  const keyframes: PyramidKeyframe[] = [
    { data: pyramids.data[0], at: 0 },
    { data: pyramids.data[1], at: watchAt },
    { data: pyramids.data[2], at: climbAt },
    { data: pyramids.data[3], at: urnAt },
  ];
  const g = pyramidGeometry(SIZE);
  const st = pyramidStateAt(keyframes, frame, MORPH);
  const labelsOut = fourInTenAt - 30;

  const arrowTo = (boom: 'boom1' | 'boom2'): [number, number] | null => {
    const idx = boomIndexAt(keyframes, frame, boom, MORPH);
    if (idx === null) return null;
    const row = st.cohorts[Math.min(st.cohorts.length - 1, Math.max(0, Math.round(idx)))];
    return [LEFT + g.maleEdge(row.male) - 14, TOP + g.rowCenter(idx)];
  };
  const a1 = arrowTo('boom1');
  const a2 = arrowTo('boom2');
  const arrowsOpacity = useFade(0, labelsOut);
  const braceOpacity = useFade(0, flipAt - 16);
  const share = Math.round(ipss2070.data.share65plus * 100);
  const braceX = LEFT + g.femaleEdge(3400) + 30;

  return (
    <SceneShell id={S} paper="light" enter="paper" exit="whip" focus={[960, 560]} overlay={<SourceTag dataset={pyramids} also={[ipss2070]} at={buildAt} />}>
      <PopulationPyramid keyframes={keyframes} morphFrames={MORPH} buildAt={buildAt} highlightBoomsAt={boomsAt} flip={{ at: flipAt, duration: 34 }} {...SIZE} style={{ left: LEFT, top: TOP }} />

      <BoomLabel years="1947–49" text={babyBooms.data[0].label} at={boom1At} outAt={labelsOut} top={430} seed="s3-b1" />
      <BoomLabel years="1971–74" text={babyBooms.data[1].label} at={boom2At} outAt={labelsOut} top={700} seed="s3-b2" />
      <div style={{ position: 'absolute', inset: 0, opacity: arrowsOpacity }}>
        {a1 && frame >= boom1At && <HandDrawnAnnotation shape={{ type: 'arrow', from: [460, 505], to: a1, bend: 0.15 }} at={boom1At + 10} duration={14} color="ink" seed="s3-a1" />}
        {a2 && frame >= boom2At && <HandDrawnAnnotation shape={{ type: 'arrow', from: [460, 775], to: a2, bend: -0.15 }} at={boom2At + 10} duration={14} color="ink" seed="s3-a2" />}
      </div>

      <div style={{ position: 'absolute', inset: 0, opacity: useFade(0, urnAt) }}>
        <HandDrawnAnnotation
          shape={{ type: 'arrow', from: [1640, 1010], to: [LEFT + g.femaleEdge(st.cohorts[0].female) + 20, TOP + g.rowCenter(0)], bend: -0.2 }}
          at={replacedAt + 10}
          duration={16}
          color="red"
          seed="s3-small"
          label={{ text: 'smaller every generation', x: 1620, y: 960, size: 42 }}
        />
      </div>

      {frame >= fourInTenAt && (
        <div style={{ position: 'absolute', inset: 0, opacity: braceOpacity }}>
          <HandDrawnAnnotation shape={{ type: 'brace', x: braceX, y1: TOP + g.rowTop(19), y2: TOP + g.rowTop(12), dir: 'right', depth: 44 }} at={fourInTenAt} duration={18} color="red" seed="s3-brace" />
          <div style={{ position: 'absolute', left: braceX + 70, top: TOP + g.rowCenter(16) - 80, transform: 'rotate(-4deg)' }}>
            <BigCounter to={share} prefix="~" suffix="%" at={fourInTenAt + 14} duration={30} fontSize={120} fontFamily={FONTS.hand} color={COLORS.red} digitWidth={0.48} />
            <div style={{ fontFamily: FONTS.hand, fontWeight: 700, fontSize: 40, color: COLORS.red }}>aged 65+ in 2070</div>
          </div>
        </div>
      )}
    </SceneShell>
  );
};
