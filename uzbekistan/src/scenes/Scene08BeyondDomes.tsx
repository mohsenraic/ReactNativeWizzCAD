/**
 * Scene 8 — Beyond the domes (6:10–7:28). Chapter "4 — THE SURPRISES". Fast montage, a new element every ~4 s.
 * Plov (P14) with drawn steam, kazan label, crowd icons, UNESCO 2016 stamp → Tashkent (P15) → metro (P13),
 * chandeliers circled, "underground palaces" → Tian Shan (P16), 4,000+ m counter, ~80 km / < 2 h route inset →
 * Fergana Valley map with silk (P17) and ceramics (P18) pinned → Moynaq (P19) desaturated, the Aral shrinking
 * (stylized), ~150 km to today's shore → every photo snaps into a collage in the shape of Uzbekistan.
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BigCounter } from '../../../shared/components/BigCounter';
import { Cutout } from '../../../shared/components/Cutout';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { PhotoCutout, usePhotoReady } from '../../../shared/components/PhotoCutout';
import { RouteMap } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp } from '../../../shared/components/Stamp';
import { WorldMap } from '../../../shared/components/WorldMap';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { AralShrink } from '../components/illustrations';
import { SilkIcon } from '../components/silkIcons';
import { moynaq, plov, tianShan } from '../data/data';
import { PhotoId, photoProps, photoSrc } from '../data/photos';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, WhipPan, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S08: Beat<'s08'>[] = [['surprised', -1], ['food', 0], ['plov', 0], ['cauldrons', 0], ['feedHundreds', 0], ['unesco', 0], ['tashkent', 0], ['tashkent', 0.6], ['metro', 0], ['metro', 1.2], ['metro', 2.6], ['palaces', -0.7], ['palaces', 0], ['tianShan', 0], ['tianShan', 0.6], ['twoHours', 0], ['fergana', 0], ['fergana', 0.8], ['ceramics', 0], ['moynaq', 0], ['haunting', 0], ['oldPort', 0], ['ships', 0], ['aral', 0], ['aral', 1.6], ['montage', 0], ['montage', 3], ['oneCountry', 0]];

const COLLAGE: PhotoId[] = ['P01', 'P03', 'P04', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20', 'P02', 'P05', 'P12'];

/** Rising steam: three wavy strokes that keep drawing upward. */
const Steam: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <svg width={400} height={420} style={{ position: 'absolute', left: x - 200, top: y - 420, overflow: 'visible' }}>
      {[0, 1, 2].map((i) => {
        const cyc = ((frame - at + i * 14) % 42) / 42;
        const cx = 120 + i * 80;
        const d = `M${cx},400 C ${cx - 40},330 ${cx + 40},270 ${cx},200 C ${cx - 40},140 ${cx + 30},90 ${cx},20`;
        return <path key={i} d={d} fill="none" stroke="#FBFAF6" strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray="0.35 1" style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.35))' }} strokeDashoffset={-cyc * 1.35 + 0.35} opacity={Math.sin(cyc * Math.PI)} />;
      })}
    </svg>
  );
};

export const Scene08BeyondDomes: React.FC = () => {
  const { c } = useScene('s08');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const collageIn = c('montage') - 10;
  COLLAGE.forEach((id) => usePhotoReady(photoSrc(id))); // eslint-disable-line react-hooks/rules-of-hooks

  const plovSection = (
    <Between from={0} to={c('tashkent') + 14} fade={1}>
      {/* the domes step aside */}
      <PhotoCutout {...photoProps('P03')} width={1100} height={660} enterAt={c('surprised') - 30} from="scale" exitAt={c('food') - 8} exitTo="top" rotation={-2} seed="p03" style={{ left: 410, top: 200 }} />
      <PhotoCutout
        {...photoProps('P14')}
        width={1240}
        height={780}
        enterAt={c('food')}
        from="bottom"
        rotation={1}
        seed="p14"
        style={{ left: 200, top: 150 }}
        kenBurns={{ from: { scale: 1.05, focus: [0.5, 0.55] }, to: { scale: 1.18, focus: [0.55, 0.6] }, at: c('food'), duration: c('tashkent') - c('food') }}
      >
        <Steam at={c('plov')} x={640} y={330} />
        <HandDrawnAnnotation shape={{ type: 'arrow', from: [1080, 640], to: [880, 560] }} at={c('cauldrons')} width={1240} height={780} color="#FBFAF6" label={{ text: 'kazan', x: 1110, y: 690, size: 64 }} />
      </PhotoCutout>
      {/* feeds hundreds: crowd icons multiply */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const s = spring({ frame: frame - (c('feedHundreds') + i * 4), fps, config: SPRINGS.cutout });
          return s > 0.01 ? (
            <g key={i} transform={`translate(${300 + i * 125} ${1000}) scale(${s})`}>
              <SilkIcon name="crowd" size={100} />
            </g>
          ) : null;
        })}
      </svg>
      <Stamp text="UNESCO · {n}" count={{ from: 1990, to: plov.data.unescoYear, duration: 20, grouping: false }} at={c('unesco')} fontSize={84} rotation={-8} style={{ left: 1400, top: 420 }} />
      <div style={{ position: 'absolute', left: 1450, top: 590, fontFamily: F.mono, fontSize: 22, letterSpacing: 2, color: PALETTE.greyDark, opacity: interpolate(frame, [c('unesco', 0.6), c('unesco', 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        INTANGIBLE CULTURAL HERITAGE
      </div>
    </Between>
  );

  const tashkentSection = (
    <>
      <PhotoCutout {...photoProps('P15')} width={1300} height={760} enterAt={c('tashkent')} from="none" rotation={-1.5} seed="p15" style={{ left: 310, top: 170 }} exitAt={c('metro') - 6} exitTo="left" kenBurns={{ from: { scale: 1.0, focus: [0.5, 0.5] }, to: { scale: 1.1, focus: [0.5, 0.4] }, at: c('tashkent'), duration: 170 }}>
        <HandDrawnAnnotation shape={{ type: 'underline', x: 380, y: 140, width: 540 }} at={c('tashkent', 0.6)} width={1300} height={760} color="ink" label={{ text: 'Chorsu bazaar, Tashkent', x: 650, y: 120, size: 60 }} />
      </PhotoCutout>
      <PhotoCutout {...photoProps('P13')} width={1400} height={820} enterAt={c('metro')} from="right" rotation={1} seed="p13" style={{ left: 260, top: 130 }} kenBurns={{ from: { scale: 1.05, focus: [0.5, 0.4] }, to: { scale: 1.2, focus: [0.48, 0.3] }, at: c('metro'), duration: c('tianShan') - c('metro') }}>
        <HandDrawnAnnotation shape={{ type: 'circle', cx: 700, cy: 160, rx: 120, ry: 150 }} at={c('metro', 1.2)} width={1400} height={820} color={PALETTE.saffron} label={{ text: 'chandeliers', x: 960, y: 110, size: 58 }} />
        <HandDrawnAnnotation shape={{ type: 'circle', cx: 300, cy: 420, rx: 140, ry: 200 }} at={c('metro', 2.6)} width={1400} height={820} color={PALETTE.saffron} label={{ text: 'marble', x: 300, y: 690, size: 58 }} />
      </PhotoCutout>
      <Stamp text="UNDERGROUND PALACES" at={c('palaces')} fontSize={76} rotation={-6} color={PALETTE.saffron} style={{ left: 820, top: 820 }} />
    </>
  );

  const mountainsSection = (
    <>
      <PhotoCutout {...photoProps('P16')} width={1500} height={860} enterAt={c('tianShan')} from="none" rotation={-1} seed="p16" style={{ left: 210, top: 110 }} kenBurns={{ from: { scale: 1.0, focus: [0.4, 0.5] }, to: { scale: 1.15, focus: [0.3, 0.35] }, at: c('tianShan'), duration: c('fergana') - c('tianShan') }}>
        <HandDrawnAnnotation shape={{ type: 'arrow', from: [740, 120], to: [520, 250] }} at={c('tianShan', 0.6)} width={1500} height={860} color={PALETTE.lapis} />
      </PhotoCutout>
      <Between from={c('tianShan', 0.6)}>
        <div style={{ position: 'absolute', left: 900, top: 150 }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: 2, color: PALETTE.lapis }}>TIAN SHAN PEAKS</div>
          <BigCounter to={4000} suffix="+ M" at={c('tianShan', 0.6)} duration={40} fontSize={140} color={PALETTE.lapis} />
        </div>
      </Between>
      <Cutout enterAt={c('twoHours') - 6} from="right" rotation={2} seed="amirsoy" style={{ left: 1240, top: 590 }} background="#FBFAF6">
        <div style={{ width: 520, height: 340, position: 'relative' }}>
          <RouteMap
            width={520}
            height={340}
            fitBounds={{ west: 68.8, east: 70.6, south: 40.9, north: 41.9 }}
            padding={[20, 20]}
            resolution="50m"
            land="#E4DED2"
            nodes={[
              { id: 'tas', lonLat: [69.24, 41.31], label: 'TASHKENT', at: c('twoHours'), color: PALETTE.lapis },
              { id: 'mtn', lonLat: [70.03, 41.52], label: 'AMIRSOY', at: c('twoHours', 0.4), color: PALETTE.terracotta, dx: -16 },
            ]}
            routes={[{ id: 'drive', points: [[69.24, 41.31], [69.7, 41.45], [70.03, 41.52]], at: c('twoHours', 0.2), duration: 30, color: PALETTE.terracotta, width: 6, style: 'dashed' }]}
          />
          <div style={{ position: 'absolute', left: 16, bottom: 12, display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: F.mono, fontSize: 22, color: PALETTE.greyDark }}>
            <BigCounter to={tianShan.data.driveKm} suffix=" KM" at={c('twoHours', 0.4)} duration={24} fontSize={44} color={PALETTE.ink} />
            · UNDER
            <BigCounter to={2} suffix=" H" at={c('twoHours', 0.6)} duration={14} fontSize={44} color={PALETTE.ink} />
          </div>
        </div>
      </Cutout>
    </>
  );

  const ferganaSection = (
    <>
      <WorldMap
        fitBounds={{ west: 69.4, east: 73.8, south: 39.6, north: 41.9 }}
        resolution="50m"
        land="#E4DED2"
        highlight={[{ iso: '860', at: c('fergana') - 6, color: '#CFE6E2' }]}
        overlay={(api) => {
          const pts: Array<[string, [number, number], number]> = [
            ['MARGILAN · SILK', [71.72, 40.47], c('fergana', 0.6)],
            ['RISHTAN · CERAMICS', [71.28, 40.36], c('ceramics')],
          ];
          return (
            <>
              {pts.map(([label, ll, at]) => {
                const p = api.project(ll)!;
                const s = spring({ frame: frame - at, fps, config: SPRINGS.cutout });
                return s > 0.01 ? (
                  <g key={label} transform={`translate(${p[0]} ${p[1]})`}>
                    <circle r={14 * s} fill={PALETTE.terracotta} stroke="#FBFAF6" strokeWidth={4} />
                    <text y={56} textAnchor="middle" fontFamily={F.mono} fontWeight={500} fontSize={26} fill={PALETTE.ink} opacity={s}>
                      {label}
                    </text>
                  </g>
                ) : null;
              })}
            </>
          );
        }}
      />
      <div style={{ position: 'absolute', left: 120, top: 80, fontFamily: F.headline, fontWeight: 700, fontSize: 96, color: PALETTE.ink, opacity: interpolate(frame, [c('fergana'), c('fergana') + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        FERGANA VALLEY
      </div>
      <PhotoCutout {...photoProps('P17')} width={620} height={466} enterAt={c('fergana', 0.8)} from="left" rotation={-4} seed="p17" style={{ left: 110, top: 470 }} />
      <PhotoCutout {...photoProps('P18')} width={620} height={466} enterAt={c('ceramics', 0.3)} from="right" rotation={3} seed="p18" style={{ left: 1200, top: 420 }} />
    </>
  );

  const moynaqSection = (
    <>
      <PhotoCutout
        {...photoProps('P19')}
        width={1300}
        height={800}
        enterAt={c('moynaq')}
        from="none"
        rotation={-1}
        seed="p19"
        style={{ left: 120, top: 140 }}
        treatment={{ type: 'duotone', colors: ['#1E2733', '#D8D2C4'], amount: 0.9 }}
        kenBurns={{ from: { scale: 1.0, focus: [0.5, 0.5] }, to: { scale: 1.2, focus: [0.48, 0.58] }, at: c('moynaq'), duration: c('montage') - c('moynaq') }}
      >
        <HandDrawnAnnotation shape={{ type: 'circle', cx: 640, cy: 470, rx: 300, ry: 160 }} at={c('ships')} width={1300} height={800} color={PALETTE.questionRed} label={{ text: 'once a fishing port', x: 640, y: 250, size: 60 }} />
      </PhotoCutout>
      <div style={{ position: 'absolute', left: 150, top: 60, fontFamily: F.mono, fontSize: 30, letterSpacing: 3, color: PALETTE.ink, opacity: interpolate(frame, [c('oldPort'), c('oldPort') + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        MOYNAQ · KARAKALPAKSTAN
      </div>
      <Between from={c('aral') - 4}>
        <Cutout enterAt={c('aral')} from="right" rotation={2} seed="aral" style={{ left: 1260, top: 220 }} background="#FBFAF6">
          <div style={{ position: 'relative', width: 560, height: 600 }}>
            <AralShrink at={c('aral') + 4} step={18} x={-60} y={-40} scale={0.85} moynaq={[300, 650]} />
          </div>
        </Cutout>
        <div style={{ position: 'absolute', left: 1290, top: 830 }}>
          <BigCounter to={moynaq.data.kmToShore} suffix=" KM" at={c('aral', 1.6)} duration={26} fontSize={90} color={PALETTE.questionRed} />
          <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: 2, color: PALETTE.greyDark }}>FROM THE SHIPS TO TODAY'S SHORE</div>
        </div>
      </Between>
    </>
  );

  const collage = (
    <WorldMap
      fitBounds={{ west: 55.8, east: 73.3, south: 37.0, north: 45.7 }}
      padding={[120, 120]}
      resolution="50m"
      land="rgba(0,0,0,0)"
      borders={false}
      overlay={(api) => {
        const d = api.countryPath('860');
        const tile = { w: 230, h: 154 };
        const cols = 8;
        const rows = 6;
        const x0 = 960 - (cols * tile.w) / 2;
        const y0 = 540 - (rows * tile.h) / 2;
        const outline = interpolate(frame, [c('oneCountry') - 10, c('oneCountry') + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <>
            <defs>
              <clipPath id="uz-collage">
                <path d={d} />
              </clipPath>
            </defs>
            <path d={d} fill="#D8D0BF" />
            <g clipPath="url(#uz-collage)">
              {Array.from({ length: cols * rows }, (_, i) => {
                const id = COLLAGE[i % COLLAGE.length];
                const col = i % cols;
                const row = Math.floor(i / cols);
                const at = collageIn + ((col + row * 3) % 14) * 2;
                const s = spring({ frame: frame - at, fps, config: SPRINGS.snappy });
                if (s <= 0.01) return null;
                const x = x0 + col * tile.w;
                const y = y0 + row * tile.h;
                return (
                  <g key={i} transform={`translate(${x + tile.w / 2} ${y + tile.h / 2}) scale(${0.3 + 0.7 * s}) rotate(${(1 - s) * 20})`} opacity={Math.min(1, s * 2)}>
                    <image href={photoSrc(id)} x={-tile.w / 2} y={-tile.h / 2} width={tile.w} height={tile.h} preserveAspectRatio="xMidYMid slice" />
                    <rect x={-tile.w / 2} y={-tile.h / 2} width={tile.w} height={tile.h} fill="none" stroke="#FBFAF6" strokeWidth={4} />
                  </g>
                );
              })}
            </g>
            <path d={d} fill="none" stroke={PALETTE.saffron} strokeWidth={6 + outline * 4} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - outline} />
          </>
        );
      }}
    />
  );

  return (
    <UzScene
      id="s08"
      pushIn={0.03}
      moves={[
        { at: c('palaces') - 20, scale: 1.1, focus: [960, 380], duration: 30 },
        { at: c('tianShan') - 6, scale: 1.0, focus: [960, 540], duration: 10 },
        { at: c('haunting'), scale: 1.08, focus: [800, 560], duration: 40 },
        { at: collageIn - 10, scale: 1.0, focus: [960, 540], duration: 10 },
        { at: c('montage', 3), scale: 1.05, focus: [960, 520], duration: 50 },
        { at: c('oneCountry'), scale: 1.1, focus: [960, 540], duration: 40 },
      ]}
      overlay={
        <>
          <QuestionPin at={0} outAt={collageIn - 30} />
          <Between from={c('food')} to={c('tashkent') - 6}>
            <SourceTag dataset={plov} />
          </Between>
          <Between from={c('tianShan')} to={c('fergana') - 6}>
            <SourceTag dataset={tianShan} />
          </Between>
          <Between from={c('moynaq')} to={collageIn - 6}>
            <SourceTag dataset={moynaq} text={`${moynaq.sourceTag} · ARAL MAP STYLIZED, NOT TO SCALE`} />
          </Between>
          <Between from={collageIn}>
            <SourceTag prefix="PHOTOS:" text="WIKIMEDIA COMMONS CONTRIBUTORS · CC BY / CC BY-SA / CC0 · FULL CREDITS IN THE DESCRIPTION" align="right" />
          </Between>
        </>
      }
    >
      <WhipPan
        at={c('tashkent') - 6}
        from={plovSection}
        to={
          <WhipPan
            at={c('tianShan') - 8}
            vertical
            from={tashkentSection}
            to={
              <WhipPan
                at={c('fergana') - 8}
                from={mountainsSection}
                to={<WhipPan at={c('moynaq') - 8} vertical from={ferganaSection} to={<WhipPan at={collageIn} from={moynaqSection} to={collage} />} />}
              />
            }
          />
        }
      />
    </UzScene>
  );
};
