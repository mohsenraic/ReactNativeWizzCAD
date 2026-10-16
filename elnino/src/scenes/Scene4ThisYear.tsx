/**
 * Scene 4 — Why 2026 is different. <SSTAnomalyMap> with the Niño 3.4 box drawn by hand; a threshold card
 * "+0.5 °C"; a BigCounter climbs past it to "+3.7 °C" (forecast, Oct–Dec); a WMO card with the quote
 * highlighted and "~100%" counting. Then a paper slide to <NinoIndexChart>: ONI since 1980, the 1982, 1997
 * and 2015 peaks as cutout tags, the 2026 forecast dotted and circled.
 */
import React from 'react';
import { Easing, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { BigCounter, Cutout, DocumentCard, Fade, HandDrawnAnnotation, PaperBackground, SceneShell, SourceTag } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { Sfx } from '../../../shared/lib/sfx';
import { nino2026Forecast, ninoThreshold, oni, wmoOct2026 } from '../data/elnino';
import { NinoIndexChart, ninoChartScales } from '../components/NinoIndexChart';
import type { NinoChartTiming } from '../components/NinoIndexChart';
import { SSTAnomalyMap, projectPacific } from '../components/SSTAnomalyMap';
import { CHAPTERS, CHAPTER_CARD_FRAMES, cue, ramp, sceneById } from '../timeline';
import { PALETTE } from '../theme';

const S = 4;
export const SCENE_4_DURATION = sceneById(S).durationInFrames;
const CHART_LEFT = 120;
const CHART_TOP = 170;

export const Scene4ThisYear: React.FC = () => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const boxAt = cue(S, 'one box');
  const halfAt = cue(S, 'half a degree');
  const thisYearAt = cue(S, 'this year');
  const wmoAt = cue(S, 'world meteorological');
  const sevenAt = cue(S, 'three point seven');
  const peakAt = cue(S, 'peak');
  const firmlyAt = cue(S, 'firmly');
  const hundredAt = cue(S, 'one hundred percent');
  const giantsAt = cue(S, 'giants');
  const y82 = cue(S, 'nineteen eighty two');
  const y97 = cue(S, 'nineteen ninety seven');
  const y15 = cue(S, 'twenty fifteen');
  const leagueAt = cue(S, 'same league');

  const slideAt = giantsAt - 30;
  const slide = interpolate(frame, [slideAt, slideAt + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const intensity = interpolate(frame, ramp(0, boxAt, thisYearAt, sevenAt), [0.35, 0.45, 0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const counterColor = interpolateColors(frame, [thisYearAt + 10, sevenAt], [PALETTE.onDark, PALETTE.warm]);

  const timing: NinoChartTiming = { drawAt: slideAt + 16, drawDuration: y82 - slideAt - 40, thresholdAt: slideAt + 30, tagsAt: [y82, y97, y15], forecastAt: leagueAt - 10 };
  const sc = ninoChartScales(timing);
  const fx = CHART_LEFT + sc.x(nino2026Forecast.data.forecast.year);
  const fy = CHART_TOP + sc.y(nino2026Forecast.data.forecast.value);

  return (
    <SceneShell
      durationInFrames={SCENE_4_DURATION}
      paper="dark"
      seed="s4"
      chapter={CHAPTERS[S]}
      chapterFrames={CHAPTER_CARD_FRAMES}
      enter="whip"
      exit="whip"
      moves={[
        { at: boxAt - 6, scale: 1.3, focus: projectPacific([-145, 0]), duration: 18 },
        { at: halfAt - 6, scale: 1, focus: [960, 540], duration: 14 },
        { at: thisYearAt + 6, scale: 1.22, focus: [1480, 780], duration: 18 },
        { at: firmlyAt - 16, scale: 1, focus: [960, 540], duration: 14 },
        { at: leagueAt - 8, scale: 1.3, focus: [fx, fy], duration: 18 },
      ]}
      overlay={
        <>
          <Fade inAt={boxAt} outAt={slideAt}>
            <SourceTag dataset={ninoThreshold} also={[wmoOct2026]} tone="dark" at={boxAt} />
          </Fade>
          <Fade inAt={slideAt + 20}>
            <SourceTag dataset={oni} also={[nino2026Forecast]} at={slideAt + 20} />
          </Fade>
        </>
      }
    >
      {/* ── part 1: the box, the threshold, the forecast ── */}
      {slide < 1 && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: interpolate(frame, [firmlyAt - 10, firmlyAt + 10], [1, 0.45], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <SSTAnomalyMap intensity={intensity} tone="dark" nino34={{ at: boxAt, duration: 30 }} />
          </div>

          <Cutout enterAt={halfAt} from="left" seed="s4-thr" style={{ left: 110, top: 150 }} innerStyle={{ padding: '18px 26px', background: '#FBFAF6' }} exitAt={firmlyAt - 20} exitTo="left">
            <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: 2, color: PALETTE.greyDark }}>EL NIÑO THRESHOLD</div>
            <BigCounter to={ninoThreshold.data.value} decimals={1} sign="always" suffix="°C" at={halfAt + 6} duration={20} fontSize={86} color={PALETTE.ink} digitWidth={0.5} />
            <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: 1, color: PALETTE.greyDark }}>
              FOR <BigCounter to={ninoThreshold.data.minSeasons} at={halfAt + 10} duration={16} fontSize={18} fontFamily={F.mono} fontWeight={500} color={PALETTE.greyDark} digitWidth={0.6} /> OVERLAPPING 3-MONTH SEASONS
            </div>
          </Cutout>

          {frame >= thisYearAt && (
            <div style={{ position: 'absolute', left: 1180, top: 640, opacity: interpolate(frame, ramp(thisYearAt, thisYearAt + 8, firmlyAt - 20, firmlyAt - 8), [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: 2, color: PALETTE.onDark }}>NIÑO 3.4 · OCT–DEC 2026 FORECAST</div>
              <BigCounter from={ninoThreshold.data.value} to={wmoOct2026.data.ondForecast} decimals={1} sign="always" suffix="°C" at={thisYearAt + 10} duration={sevenAt - thisYearAt} fontSize={210} color={counterColor} digitWidth={0.5} clicks />
              <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: 2, color: PALETTE.onDark, opacity: interpolate(frame, [peakAt, peakAt + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                PEAK EXPECTED AROUND DECEMBER · WMO
              </div>
            </div>
          )}
          <HandDrawnAnnotation shape={{ type: 'underline', x: 1180, y: 880, width: 560 }} at={wmoAt + 20} duration={14} color={PALETTE.highlighter} seed="s4-ul" />

          <DocumentCard
            variant="brief"
            kicker="WMO · 8 OCT 2026"
            title="Global Seasonal Climate Update"
            paragraphs={[
              [{ text: '“' }, { text: wmoOct2026.data.quotes.firmlyEstablished.text, highlight: true }, { text: '”' }],
              [{ text: 'Chance it lasts through Feb 2027: ' }, { text: '~{n}%', highlight: true, count: { to: wmoOct2026.data.persistThroughFeb2027, at: hundredAt - 6, duration: 30 } }],
            ]}
            fillerPerParagraph={1}
            highlightAt={firmlyAt + 6}
            enterAt={firmlyAt - 14}
            exitAt={slideAt - 8}
            width={900}
            seed="s4-doc"
            rotation={1.2}
            style={{ left: 510, top: 250 }}
          />
          <Sfx name="markerSqueak" at={firmlyAt + 6} volume={0.4} />
        </div>
      )}

      {/* ── part 2: the giants (paper slides in) ── */}
      {slide > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${(1 - slide) * 1100}px) rotate(${(1 - slide) * 3}deg)`,
            boxShadow: slide < 1 ? '0 -20px 50px rgba(0,0,0,0.35)' : undefined,
          }}
        >
          <PaperBackground tone="light" seed="s4-sheet" />
          <Sfx name="paperSlide" at={slideAt} />
          <div style={{ position: 'absolute', left: CHART_LEFT + 100, top: 80, fontFamily: F.mono, fontSize: 22, letterSpacing: 2, color: PALETTE.greyDark }}>
            NIÑO 3.4 SEA-SURFACE TEMPERATURE ANOMALY · 3-MONTH MEAN · °C
          </div>
          <NinoIndexChart {...timing} style={{ left: CHART_LEFT, top: CHART_TOP }} />
          <HandDrawnAnnotation shape={{ type: 'circle', cx: fx + 120, cy: fy + 14, rx: 215, ry: 118 }} at={leagueAt + 30} duration={18} seed="s4-circle" />
        </div>
      )}
    </SceneShell>
  );
};
