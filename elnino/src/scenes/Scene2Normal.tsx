/**
 * Scene 2 — A normal year. Map view: the equator lights up and trade-wind arrows sweep east → west while
 * warm water gathers in the west. The camera tilts down into <PacificCrossSection elNino={0}>: warm pool
 * piled west, tilted thermocline, upwelling off Peru, and a hand-drawn bracket "+~0.5 m" on the western
 * bulge. Closes on highlighted WARM / COLD labels.
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { Fade, HandDrawnAnnotation, Highlighter, SceneShell, SourceTag } from '../../../shared/components';
import type { MapApi } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { normalPacific } from '../data/elnino';
import { PacificCrossSection, crossSectionGeometry } from '../components/PacificCrossSection';
import { SSTAnomalyMap } from '../components/SSTAnomalyMap';
import { CHAPTERS, CHAPTER_CARD_FRAMES, cue, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 2;
export const SCENE_2_DURATION = sceneById(S).durationInFrames;
const CS_LEFT = 160;
const CS_TOP = 170;

/** Trade-wind arrows flowing east → west along the equator (map space). */
const tradeWinds = (api: MapApi, frame: number, at: number, fontMono: string) => {
  const o = interpolate(frame, [at, at + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (o <= 0) return null;
  const rows = [-7, 0, 7];
  return (
    <g opacity={o}>
      {rows.map((lat, r) =>
        [0, 1, 2, 3].map((k) => {
          // each arrow travels from ~85°W toward ~140°E, looping
          const span = 135;
          const lonStart = -85 - ((frame - at) * 0.9 + k * (span / 4) + r * 9) % span;
          const a = api.project([lonStart, lat]);
          const b = api.project([lonStart - 14, lat]);
          if (!a || !b) return null;
          const fade = interpolate(lonStart, [-220, -205, -100, -85], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <g key={`${r}-${k}`} opacity={fade}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#F2EEE6" strokeWidth={6} strokeLinecap="round" />
              <path d={`M ${b[0] + 14} ${b[1] - 10} L ${b[0]} ${b[1]} L ${b[0] + 14} ${b[1] + 10}`} fill="none" stroke="#F2EEE6" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        }),
      )}
      {(() => {
        const p = api.project([-150, 12]);
        return p ? (
          <text x={p[0]} y={p[1]} textAnchor="middle" fontFamily={fontMono} fontSize={26} letterSpacing={3} fill="#F2EEE6">
            ← TRADE WINDS · EAST TO WEST
          </text>
        ) : null;
      })()}
    </g>
  );
};

export const Scene2Normal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const equatorAt = cue(S, 'equator');
  const windsAt = cue(S, 'trade winds');
  const pushAt = cue(S, 'push warm');
  const pilesAt = cue(S, 'piles up');
  const metreAt = cue(S, 'half a metre');
  const coldAt = cue(S, 'cold water rises');
  const warmLabelAt = cue(S, 'warm in the west');
  const coldLabelAt = cue(S, 'cold in the east');

  // Camera tilt: map slides up, cross-section rises from below.
  const tiltAt = pilesAt + 20;
  const tilt = interpolate(frame, [tiltAt, tiltAt + 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const blur = Math.sin(tilt * Math.PI) * 18;
  const warmPool = interpolate(frame, [pushAt, pilesAt + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const eqP = interpolate(frame, [equatorAt, equatorAt + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });

  // Bracket on the western bulge, measured against the eastern sea level.
  const g = crossSectionGeometry(0);
  const bx = 330;
  const yWest = g.surfaceY(bx);
  const yEast = g.surfaceY(1440);

  return (
    <SceneShell
      durationInFrames={SCENE_2_DURATION}
      paper="dark"
      seed="s2"
      chapter={CHAPTERS[S]}
      chapterFrames={CHAPTER_CARD_FRAMES}
      enter="whip"
      exit="whip"
      moves={[
        { at: windsAt - 6, scale: 1.12, focus: [960, 560], duration: 30 },
        { at: tiltAt, scale: 1, focus: [960, 540], duration: 10 },
        { at: metreAt - 10, scale: 1.55, focus: [CS_LEFT + bx, CS_TOP + yWest], duration: 16 },
        { at: cue(S, 'meanwhile') - 4, scale: 1, focus: [960, 540], duration: 14 },
        { at: coldAt - 6, scale: 1.35, focus: [CS_LEFT + 1300, CS_TOP + 520], duration: 16 },
        { at: warmLabelAt - 8, scale: 1, focus: [960, 540], duration: 14 },
      ]}
      overlay={
        <Fade inAt={metreAt - 4}>
          <SourceTag dataset={normalPacific} tone="dark" at={metreAt - 4} text="NOAA PMEL · NASA EARTH OBSERVATORY · SCHEMATIC, NOT TO SCALE" />
        </Fade>
      }
    >
      {/* ── map view ── */}
      {tilt < 1 && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-tilt * 1080}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
          <SSTAnomalyMap
            intensity={warmPool * 0.9}
            pattern="normal"
            tone="dark"
            equator={false}
            overlay={(api) => {
              const a = api.project([100, 0]);
              const b = api.project([-70, 0]);
              return (
                <>
                  {a && b && eqP > 0 && (
                    <g>
                      <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * eqP} y2={b[1]} stroke={PALETTE.highlighter} strokeWidth={4} strokeDasharray="10 8" />
                      <text x={a[0] + 90} y={a[1] - 14} fontFamily={F.mono} fontSize={22} letterSpacing={3} fill={PALETTE.highlighter} opacity={eqP}>
                        EQUATOR
                      </text>
                    </g>
                  )}
                  {tradeWinds(api, frame, windsAt, F.mono)}
                </>
              );
            }}
          />
          {warmPool > 0 && (
            <div style={{ position: 'absolute', left: 140, top: 160, fontFamily: F.mono, fontSize: 20, letterSpacing: 2, color: '#F2EEE6', opacity: warmPool * 0.85 }}>
              SEA SURFACE · A NORMAL YEAR
            </div>
          )}
        </div>
      )}

      {/* ── cross-section ── */}
      {tilt > 0 && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - tilt) * 1080}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
          <Sfx name="whoosh" at={tiltAt} volume={0.35} />
          <PacificCrossSection elNino={0} style={{ left: CS_LEFT, top: CS_TOP }} reveal={{ upwelling: coldAt, atmosphere: 99999, labels: tiltAt + 20 }} />
          {/* reference: eastern sea level carried west */}
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <line
              x1={CS_LEFT + 170}
              x2={CS_LEFT + 170 + 1270 * interpolate(frame, [metreAt - 24, metreAt - 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
              y1={CS_TOP + yEast}
              y2={CS_TOP + yEast}
              stroke={PALETTE.highlighter}
              strokeWidth={2.5}
              strokeDasharray="8 8"
              opacity={0.9}
            />
          </svg>
          <HandDrawnAnnotation
            shape={{ type: 'brace', x: CS_LEFT + bx + 14, y1: CS_TOP + yWest - 4, y2: CS_TOP + yEast + 2, dir: 'right', depth: 26 }}
            at={metreAt}
            duration={14}
            color={PALETTE.highlighter}
            strokeWidth={4}
            seed="s2-brace"
            label={{ text: '+~{n} m', x: CS_LEFT + bx + 60, y: CS_TOP + yEast + 70, size: 64, anchor: 'start', count: { to: normalPacific.data.seaLevelDiffM, decimals: 1, duration: 22 } }}
          />
          <Sfx name="penScratch" at={metreAt} volume={0.4} />
          {/* WARM / COLD */}
          <div style={{ position: 'absolute', left: CS_LEFT + 330, top: CS_TOP + 400, fontFamily: F.headline, fontWeight: 700, fontSize: 96, letterSpacing: 4, color: PALETTE.ink, opacity: interpolate(frame, [warmLabelAt, warmLabelAt + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <Highlighter at={warmLabelAt + 6} seed="s2-warm">WARM</Highlighter>
          </div>
          <div style={{ position: 'absolute', left: CS_LEFT + 1080, top: CS_TOP + 520, fontFamily: F.headline, fontWeight: 700, fontSize: 96, letterSpacing: 4, color: PALETTE.ink, opacity: interpolate(frame, [coldLabelAt, coldLabelAt + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <Highlighter at={coldLabelAt + 6} seed="s2-cold" color="#BFE3F0">COLD</Highlighter>
          </div>
        </div>
      )}
    </SceneShell>
  );
};
