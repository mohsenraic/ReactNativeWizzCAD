/**
 * Scene 6 — On your plate. <CommodityCards> pinned to the paper, red string from each card to its producing
 * regions on a mini world map; upward price arrows (no price numbers — none are sourced). Zoom to Peru:
 * an anchovy school swims away from warming water. A research-paper card with the trillions figures
 * (Callahan & Mankin 2023, abstract-verified) counting up.
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { DocumentCard, Fade, RedString, SceneShell, SourceTag, WorldMap } from '../../../shared/components';
import type { MapApi } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { commodities, economicCost, peruAnchovy } from '../data/elnino';
import { AnchovySchool } from '../components/AnchovySchool';
import { CommodityCards, commodityPin } from '../components/CommodityCards';
import type { CommodityLayout } from '../components/CommodityCards';
import { CHAPTERS, CHAPTER_CARD_FRAMES, cue, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 6;
export const SCENE_6_DURATION = sceneById(S).durationInFrames;

// Order follows commodities.data: cocoa, coffee, palm oil, rice, sugar, fishmeal.
// Cards sit near their producers on a map centred on 20°E (West Africa, India, SE Asia and Peru all visible).
const LAYOUT: CommodityLayout = {
  scale: 0.55,
  slots: [
    { x: 620, y: 40 }, { x: 1440, y: 40 }, { x: 1030, y: 40 },
    { x: 1030, y: 790 }, { x: 1440, y: 790 }, { x: 170, y: 790 },
  ],
};
const MAP_CENTER_LON = 20;

/** Same projection as the mini-map below (Pacific-centred Equal Earth, fitted to the frame). */
const MAP_W = 1920;
const MAP_H = 1080;

export const Scene6Economy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const cueAt = [cue(S, 'cocoa'), cue(S, 'coffee'), cue(S, 'palm oil'), cue(S, 'rice'), cue(S, 'sugar'), cue(S, 'off peru')];
  const pricesAt = cue(S, 'higher prices');
  const peruAt = cue(S, 'off peru');
  const anchAt = cue(S, 'anchovies');
  const fishmealAt = cue(S, 'fishmeal');
  const pastAt = cue(S, 'past strong');
  const trillionsAt = cue(S, 'trillions');
  const cardsOut = peruAt + 2;
  const cardEnter = [cueAt[0] - 4, cueAt[1] - 4, cueAt[2] - 4, cueAt[3] - 4, cueAt[4] - 4, cueAt[4] + 14];
  const zoomAt = peruAt + 6;
  const warm = interpolate(frame, [anchAt - 10, fishmealAt + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Strings: card pin → each producer dot. Needs the map projection → drawn inside the map overlay.
  const strings = (api: MapApi) =>
    commodities.data.flatMap((c, i) =>
      c.producers.map((p, j) => {
        const dot = api.project(p.lonLat);
        if (!dot) return null;
        const at = cardEnter[i] + 14 + j * 6;
        return { key: `${c.id}-${j}`, from: commodityPin(i, LAYOUT), to: dot, at };
      }),
    );

  return (
    <SceneShell
      durationInFrames={SCENE_6_DURATION}
      paper="light"
      seed="s6"
      chapter={CHAPTERS[S]}
      chapterFrames={CHAPTER_CARD_FRAMES}
      enter="whip"
      exit="whip"
      moves={[
        { at: cueAt[0] - 6, scale: 1.12, focus: [960, 220], duration: 20 },
        { at: cueAt[3] - 6, scale: 1.12, focus: [1200, 860], duration: 16 },
        { at: pricesAt - 6, scale: 1, focus: [960, 540], duration: 14 },
        { at: trillionsAt - 10, scale: 1.18, focus: [960, 520], duration: 18 },
      ]}
      overlay={
        <>
          <Fade inAt={cueAt[0]} outAt={pastAt - 20}>
            <SourceTag dataset={commodities} also={[peruAnchovy]} at={cueAt[0]} />
          </Fade>
          <Fade inAt={pastAt}>
            <SourceTag dataset={economicCost} at={pastAt} />
          </Fade>
        </>
      }
    >
      {/* mini world map with producer dots + strings */}
      <Fade outAt={pastAt - 16} len={16}>
        <WorldMap
          width={MAP_W}
          height={MAP_H}
          centerLon={MAP_CENTER_LON}
          padding={[120, 250]}
          zoom={{ from: { center: [MAP_CENTER_LON, 0], scale: 1 }, to: { center: [-84, -9], scale: 4.2 }, at: zoomAt, duration: 40 }}
          dots={commodities.data.flatMap((c, i) =>
            c.producers.map((p) => ({ name: p.name, label: '', lon: p.lonLat[0], lat: p.lonLat[1], at: cardEnter[i] + 12, color: PALETTE.warm })),
          )}
          overlay={(api) => {
            const ss = strings(api).filter(Boolean) as Array<{ key: string; from: [number, number]; to: [number, number]; at: number }>;
            const o = interpolate(frame, [cardsOut - 6, cardsOut + 6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const peru = api.project([-81, -10]);
            return (
              <>
                <g opacity={o}>
                  {ss.map((s) => (
                    <g key={s.key}>
                      <RedString points={[s.from, s.to]} at={s.at} segmentFrames={12} sag={0.08} width={3} />
                    </g>
                  ))}
                </g>
                {peru && frame >= zoomAt + 30 && (
                  <text x={peru[0] - 40} y={peru[1] - 230} textAnchor="end" fontFamily={F.mono} fontSize={24} letterSpacing={3} fill={PALETTE.greyDark} opacity={interpolate(frame, [zoomAt + 30, zoomAt + 42], [0, 1], { extrapolateRight: 'clamp' })}>
                    OFF PERU
                  </text>
                )}
              </>
            );
          }}
        />
      </Fade>

      <CommodityCards layout={LAYOUT} enterAt={cardEnter} arrowsAt={pricesAt} exitAt={cardsOut} />

      {/* anchovies leave the warming water */}
      <Fade inAt={zoomAt + 30} outAt={pastAt - 16} len={14}>
        <AnchovySchool center={[820, 560]} warm={warm} radius={170} />
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 150,
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: 2,
            color: PALETTE.greyDark,
            opacity: interpolate(frame, [fishmealAt, fishmealAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          PERUVIAN ANCHOVY → FISHMEAL → FISH FARMS
        </div>
      </Fade>

      {/* the bill */}
      <DocumentCard
        variant="paper"
        header="RESEARCH ARTICLE"
        meta="SCIENCE · 2023"
        kicker="CALLAHAN & MANKIN"
        title="Persistent effect of El Niño on global economic growth"
        paragraphs={[
          [{ text: 'Global income lost in the 5 years after the 1982–83 event: ' }, { text: '${n} trillion', highlight: true, count: { to: economicCost.data.loss1982, decimals: 1, at: trillionsAt - 10, duration: 30 } }],
          [{ text: 'In the 5 years after the 1997–98 event: ' }, { text: '${n} trillion', highlight: true, count: { to: economicCost.data.loss1997, decimals: 1, at: trillionsAt + 6, duration: 30 } }],
        ]}
        fillerPerParagraph={1}
        highlightAt={trillionsAt}
        enterAt={pastAt - 6}
        width={980}
        seed="s6-paper"
        rotation={-1.2}
        style={{ left: 470, top: 210 }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: 1, color: PALETTE.greyDark, marginTop: 8 }}>MODEL-BASED ESTIMATES IN 2017 US$, NOT OBSERVED TOTALS</div>
      </DocumentCard>
    </SceneShell>
  );
};
