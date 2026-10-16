/**
 * Scene 2 — The numbers (0:38–1:42). Chapter "1 — THE BOOM".
 * Bar chart of arrivals: 2025 counts up to 11.7M, RECORD stamp, +3.7M brace, +46.8% highlighted.
 * "First time ever" → April 2025 calendar + "1,000,000+" stamp. 2026 Jan–Feb card. "A decade ago" → 2016 circled.
 * "Here's the catch" → whip-pan to the waffle: 74 squares from three neighbours + mini map lighting up.
 * "Further away" → the rest glow gold; planes fly in from four regions. End on the handwritten question.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { AnimatedBarChart } from '../../../shared/components/AnimatedBarChart';
import { BigCounter } from '../../../shared/components/BigCounter';
import { Cutout } from '../../../shared/components/Cutout';
import { DocumentCard } from '../../../shared/components/DocumentCard';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { Highlighter } from '../../../shared/components/Highlighter';
import { KineticTitle } from '../../../shared/components/KineticTitle';
import { RouteMap } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp } from '../../../shared/components/Stamp';
import { WaffleChart } from '../../../shared/components/WaffleChart';
import { WorldMap } from '../../../shared/components/WorldMap';
import { RouteLayer } from '../../../shared/components/RouteMap';
import { useTheme } from '../../../shared/theme';
import { CalendarCard } from '../components/illustrations';
import { SilkIcon } from '../components/silkIcons';
import { arrivals2025, arrivalsSeries, DECADE_AGO_YEAR, longHaulOrigins, monthlyRecord, start2026, topOrigins2025, waffle2025 } from '../data/data';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, WhipPan, Words, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S02: Beat<'s02'>[] = [['numbers', 0.6], ['total2025', 1], ['record', 0], ['plus37', 0], ['pct47', 0], ['pct47', 0.9], ['april', 0], ['firstTimeEver', 0], ['singleMonth', 0], ['started2026', 0], ['started2026', 0.6], ['decadeAgo', 0], ['catch', 0], ['catch', 0.3], ['whereFrom', 0], ['threeOfFour', 0], ['threeOfFour', 0.7], ['threeOfFour', 1.5], ['neighbors', 0.6], ['crossBorder', 0], ['realStory', 0], ['furtherAway', 0], ['regions', 0], ['regions', 1], ['flying', 0], ['question', 0]];

const CAT_COLORS = [PALETTE.turquoise, PALETTE.lapis, PALETTE.terracotta];
const TASHKENT: [number, number] = [69.24, 41.31];

export const Scene02Numbers: React.FC = () => {
  const { c } = useScene('s02');
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const bars = arrivalsSeries.data.map((p) => ({ label: String(p.year), value: p.value, at: p.year === 2025 ? c('total2025') : undefined }));
  const i2016 = arrivalsSeries.data.findIndex((p) => p.year === DECADE_AGO_YEAR);
  const i2024 = bars.length - 2;
  const iLast = bars.length - 1;
  const chartBox = { left: 120, top: 170, width: 1500, height: 780 };
  const catStart = c('threeOfFour');
  const catAt = waffle2025.categories.map((_, i) => catStart + i * 22);

  // the chart steps back while the calendar and the 2026 card are on stage
  const dim = interpolate(frame, [c('april') - 6, c('april') + 6, c('decadeAgo') - 14, c('decadeAgo')], [1, 0.22, 0.22, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const chart = (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: dim }}>
      <AnimatedBarChart
        {...chartBox}
        style={{ left: chartBox.left, top: chartBox.top }}
        bars={bars}
        yMax={12.5}
        yTicks={[4, 8, 12]}
        yTickFormat={(v) => `${v}M`}
        grow={{ at: c('numbers'), stagger: 4, duration: 18 }}
        axesAt={c('numbers') - 6}
        labelEvery={3}
        valueLabels={frame >= c('decadeAgo') ? [i2016] : []}
        valueFormat={{ decimals: 1, suffix: 'M' }}
        highlight={{ index: iLast, at: c('total2025'), dimOthers: false }}
        overlay={(s) => {
          const b24 = s.bar(i2024);
          const b25 = s.bar(iLast);
          const b16 = s.bar(i2016);
          return (
            <>
              <HandDrawnAnnotation
                shape={{ type: 'brace', x: b25.x + b25.w + 20, y1: b25.top, y2: b24.top, dir: 'right' }}
                at={c('plus37')}
                width={chartBox.width}
                height={chartBox.height}
                label={{ text: '+{n}M', x: b25.x + b25.w + 64, y: (b25.top + b24.top) / 2 + 16, size: 60, anchor: 'start', count: { to: arrivals2025.data.increaseM, decimals: 1 } }}
              />
              <HandDrawnAnnotation
                shape={{ type: 'circle', cx: b16.cx, cy: b16.top - 40, rx: 78, ry: 120 }}
                at={c('decadeAgo')}
                width={chartBox.width}
                height={chartBox.height}
                label={{ text: 'a decade ago', x: b16.cx, y: b16.top - 180, size: 54 }}
              />
            </>
          );
        }}
      />
      <Stamp text="RECORD" at={c('record')} fontSize={88} rotation={-8} style={{ left: 1060, top: 40 }} />
      </div>
      {/* +46.8% — the headline growth, counted and marked */}
      <Between from={c('pct47') - 2}>
        <div style={{ position: 'absolute', left: 300, top: 170, fontFamily: F.headline, fontWeight: 700, opacity: dim }}>
          <Highlighter at={c('pct47', 0.9)} duration={16}>
            <BigCounter to={arrivals2025.data.increasePct} decimals={1} sign="always" suffix="%" at={c('pct47')} duration={30} fontSize={170} color={PALETTE.ink} />
          </Highlighter>
          <div style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: 2, color: PALETTE.greyDark, marginTop: 6 }}>IN A SINGLE YEAR · 2024 → 2025</div>
        </div>
      </Between>
      {/* April 2025: first month above one million */}
      <Cutout enterAt={c('april')} from="right" exitAt={c('started2026') - 6} exitTo="right" rotation={4} seed="cal" style={{ left: 520, top: 250 }} background="#FBFAF6">
        <CalendarCard month={monthlyRecord.data.month} year={monthlyRecord.data.year} at={c('april')} />
      </Cutout>
      <Between from={c('firstTimeEver') - 2} to={c('started2026') - 6}>
        <Stamp text="{n}+" count={{ to: monthlyRecord.data.atLeast, duration: 26 }} at={c('firstTimeEver')} fontSize={100} rotation={-9} style={{ left: 960, top: 380 }} />
        <HandDrawnAnnotation shape={{ type: 'underline', x: 1030, y: 640, width: 420 }} at={c('singleMonth')} label={{ text: 'in ONE month', x: 1240, y: 720, size: 72 }} />
      </Between>
      {/* 2026 started even faster */}
      <DocumentCard
        variant="brief"
        kicker="ARRIVALS · JAN–FEB 2026"
        title="Two months, new record pace"
        paragraphs={[
          [{ text: 'Foreign arrivals: ' }, { text: '{n}', highlight: true, count: { to: start2026.data.arrivals, duration: 34 } }],
          [{ text: 'vs. same period 2025: ' }, { text: '+{n}%', highlight: true, count: { to: start2026.data.increasePct, duration: 24 } }],
        ]}
        fillerPerParagraph={1}
        highlightAt={c('started2026', 0.6)}
        enterAt={c('started2026')}
        from="right"
        exitAt={c('decadeAgo') - 8}
        width={640}
        seed="jan26"
        style={{ left: 640, top: 240 }}
      />
    </>
  );

  const waffle = (
    <>
      <Between from={c('whereFrom') - 30}>
        <WaffleChart
          at={catStart}
          style={{ left: 170, top: 210 }}
          cell={58}
          categories={waffle2025.categories.map((cat, i) => ({ ...cat, color: CAT_COLORS[i], at: catAt[i] }))}
          rest={{ label: 'FROM MUCH FURTHER AWAY', glowAt: c('furtherAway'), glowColor: PALETTE.saffron }}
        />
        <div style={{ position: 'absolute', left: 170, top: 130, fontFamily: F.mono, fontSize: 28, letterSpacing: 2, color: PALETTE.greyDark }}>EVERY 100 ARRIVALS, 2025</div>
      </Between>
      {/* mini map: the three neighbours light up as their squares fill */}
      <Cutout enterAt={c('whereFrom')} from="right" rotation={2} seed="ca-map" style={{ left: 1300, top: 600 }} background="#FBFAF6">
        <div style={{ width: 520, height: 330, position: 'relative' }}>
          <WorldMap
            width={520}
            height={330}
            fitBounds={{ west: 48, east: 84, south: 35, north: 54 }}
            padding={[10, 10]}
            resolution="50m"
            land="#E4DED2"
            highlight={[
              { iso: '860', at: c('whereFrom'), color: '#BFB6A4' },
              ...topOrigins2025.data.map((o, i) => ({ iso: o.iso, at: catAt[i], color: CAT_COLORS[i] })),
            ]}
            overlay={(api) => (
              <RouteLayer
                api={api}
                routes={[
                  { id: 'kg', points: [[74.5, 41.5], [70.5, 41.0]], at: c('crossBorder'), duration: 18, color: PALETTE.ink, width: 4, arrow: true },
                  { id: 'tj', points: [[70.0, 38.6], [67.5, 39.6]], at: c('crossBorder', 0.3), duration: 18, color: PALETTE.ink, width: 4, arrow: true },
                  { id: 'kz', points: [[67.0, 45.5], [66.5, 42.4]], at: c('crossBorder', 0.6), duration: 18, color: PALETTE.ink, width: 4, arrow: true },
                ]}
                nodes={[{ id: 'uz', lonLat: [64.0, 41.2], label: 'UZBEKISTAN', at: c('whereFrom'), color: PALETTE.ink, r: 0, dx: -60, dy: 6 }]}
              />
            )}
          />
        </div>
      </Cutout>
      <Words words={['family', 'trade', 'shopping']} at={c('neighbors', 0.6)} stagger={10} size={58} color={PALETTE.terracotta} style={{ left: 1310, top: 500 }} />
    </>
  );

  const world = (
    <>
      <RouteMap
        centerLon={55}
        padding={[60, 120]}
        land="#D9D2C4"
        highlight={[{ iso: '860', at: c('regions') - 10, color: PALETTE.saffron }]}
        nodes={longHaulOrigins.map((o, i) => ({ id: o.id, lonLat: o.lonLat, label: o.label, at: c('regions') + i * 6, color: PALETTE.lapis, dx: o.id === 'americas' ? 18 : 18, dy: -18 }))}
        routes={longHaulOrigins.map((o, i) => ({
          id: o.id,
          points: [o.lonLat, TASHKENT],
          at: c('regions') + 4 + i * 6,
          duration: 40,
          color: PALETTE.lapis,
          width: 4,
          style: 'dashed',
          bend: 0.18,
          markers: [{ at: c('regions') + 14 + i * 6, duration: 70, orient: true, loop: { gap: 20 }, render: () => <SilkIcon name="plane" size={44} token={false} /> }],
        }))}
      />
      <HandDrawnAnnotation shape={{ type: 'underline', x: 230, y: 930, width: 520 }} at={c('flying')} label={{ text: 'thousands of km', x: 490, y: 900, size: 64 }} />
      <KineticTitle
        text="So what exactly are they coming for?"
        font="hand"
        uppercase={false}
        at={c('question')}
        stagger={3}
        fontSize={96}
        color={PALETTE.terracotta}
        style={{ position: 'absolute', left: 0, right: 0, top: 70 }}
      />
    </>
  );

  return (
    <UzScene
      id="s02"
      pushIn={0.03}
      moves={[
        { at: c('decadeAgo') - 4, scale: 1.18, focus: [700, 640], duration: 24 },
        { at: c('catch') - 30, scale: 1.0, focus: [960, 540], duration: 24 },
        { at: c('realStory'), scale: 1.08, focus: [500, 560], duration: 40 },
        { at: c('regions') - 6, scale: 1.0, focus: [960, 540], duration: 16 },
      ]}
      overlay={
        <>
          <QuestionPin at={0} />
          <Between from={0} to={c('catch')}>
            <SourceTag dataset={arrivalsSeries} also={[arrivals2025, monthlyRecord, start2026]} at={c('numbers')} />
          </Between>
          <Between from={c('catch') + 12}>
            <SourceTag dataset={topOrigins2025} />
          </Between>
        </>
      }
    >
      <WhipPan at={c('catch')} from={chart} to={<WhipPan at={c('regions')} vertical from={waffle} to={world} />} />
      {/* "Here's the catch": a quick slammed label as the camera whips */}
      <Between from={c('catch') + 6} to={c('whereFrom') - 20}>
        <KineticTitle text="THE CATCH" entrance="slam" strip at={c('catch') + 8} fontSize={150} style={{ position: 'absolute', left: 560, top: 420 }} />
      </Between>
    </UzScene>
  );
};
