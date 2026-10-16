/**
 * Short.tsx — 30 s vertical (1080 × 1920) summary of the video, ending on a call to watch the full version.
 * Same visual system as the long video; layouts recomposed for portrait (not a crop of the 16:9 scenes).
 *
 *   hook      "11.7M" counts up over the Registan, RECORD stamp
 *   why       Uzbekistan outlined on the map, red "?" pinned
 *   domes     Gur-e-Amir's dome lifts off its photo, 600+ years
 *   cities    Samarkand / Bukhara / Khiva stack up, tile pattern draws behind
 *   closed    padlock + CLOSED → visas flip the world turquoise (~90) → Afrosiyob line → padlock opens
 *   fullStory Uzbekistan-shaped collage → "FULL VIDEO ON OUR CHANNEL" card, arrow down to the related-video link
 *
 * Audio: public/short/voiceover.wav (record from scripts/voiceover/short-narration.txt), music bed, sound effects.
 * Subtitles: ON for the Short (word-timed, see Subtitles.tsx; prop `subtitles`). The long video has none.
 */
import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BigCounter } from '../../../shared/components/BigCounter';
import { CameraRig, ParallaxLayer } from '../../../shared/components/CameraRig';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { PaperBackground } from '../../../shared/components/PaperBackground';
import { PhotoCutout, usePhotoReady } from '../../../shared/components/PhotoCutout';
import { RouteMap } from '../../../shared/components/RouteMap';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp } from '../../../shared/components/Stamp';
import { WorldMap } from '../../../shared/components/WorldMap';
import { SfxProvider } from '../../../shared/lib/sfx';
import { SPRINGS, ThemeProvider, useTheme } from '../../../shared/theme';
import { GeometricPattern, PatternWipe } from '../components/GeometricPattern';
import { SilkIcon } from '../components/silkIcons';
import { afrosiyob, arrivals2025, coldOpen, visaCount2025, visaFree } from '../data/data';
import { PHOTO_MASKS, PhotoId, photoProps, photoSrc } from '../data/photos';
import { Between, QuestionPin, s2f } from '../scenes/common';
import { PALETTE, uzbekistanTheme } from '../theme';
import { SHORT_FRAMES, SHORT_HEIGHT, SHORT_WIDTH, shortCue as c } from './timings';
import { Subtitles } from './Subtitles';

const W = SHORT_WIDTH;
const H = SHORT_HEIGHT;

export type ShortProps = { voiceover: boolean; music: boolean; musicVolume: number; sfx: boolean; subtitles: boolean };
export const defaultShortProps: ShortProps = { voiceover: true, music: true, musicVolume: 0.12, sfx: true, subtitles: true };

const has = (name: string) => {
  try {
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
};

const COLLAGE: PhotoId[] = ['P01', 'P04', 'P06', 'P11', 'P13', 'P14', 'P16', 'P17', 'P18', 'P19', 'P03', 'P08'];

const Label: React.FC<{ text: string; at: number; x: number; y: number; size?: number; color?: string; font?: 'headline' | 'mono' | 'hand'; align?: 'left' | 'center' }> = ({
  text,
  at,
  x,
  y,
  size = 72,
  color = PALETTE.ink,
  font = 'headline',
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const s = spring({ frame: frame - at, fps, config: SPRINGS.cutout });
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? 0 : x,
        right: align === 'center' ? 0 : undefined,
        top: y,
        textAlign: align,
        fontFamily: font === 'mono' ? F.mono : font === 'hand' ? F.hand : F.headline,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: font === 'mono' ? 3 : 1,
        color,
        transform: `translateY(${(1 - s) * 40}px)`,
        opacity: Math.min(1, s * 2),
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

const ShortBody: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  COLLAGE.forEach((id) => usePhotoReady(photoSrc(id))); // eslint-disable-line react-hooks/rules-of-hooks
  const dark = frame < c('domes') - 6 || (frame >= c('closed') - 6 && frame < c('fullStory') - 6);
  const lockOpen = frame >= c('opened');
  const lockS = spring({ frame: frame - (c('closed') - 4), fps, config: SPRINGS.stamp });
  const ctaIn = c('fullStory') - 4;

  return (
    <AbsoluteFill>
      <CameraRig pushIn={0.04} drift={[0, -14]}>
        <ParallaxLayer depth={0.3}>
          <PaperBackground tone={dark ? 'dark' : 'light'} seed="short" width={W} height={H} />
        </ParallaxLayer>
        <ParallaxLayer depth={1}>
          {/* ── hook: 11.7M ─────────────────────────────────────────────────────────────────────────── */}
          <Between from={0} to={c('domes') - 8} fade={6}>
            <GeometricPattern tiling="4.8.8" size={150} width={W} height={H} origin={[540, 560]} draw={{ at: 0, duration: 20, spread: 30 }} stroke={PALETTE.saffron} strokeWidth={3} opacity={0.35} />
            <Between from={0} to={c('why') - 4} fade={6}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center' }}>
                <BigCounter to={arrivals2025.data.totalM} decimals={1} suffix="M" at={c('hook')} duration={42} fontSize={300} color={PALETTE.onDark} clicks />
                <div style={{ fontFamily: F.mono, fontSize: 34, letterSpacing: 4, color: '#C9D2E6', marginTop: 10 }}>FOREIGN VISITORS · 2025</div>
              </div>
              <Stamp text="RECORD" at={c('record')} fontSize={120} rotation={-9} color={PALETTE.saffron} style={{ left: 250, top: 640 }} />
              <PhotoCutout {...photoProps('P01')} width={960} height={640} enterAt={c('hook', 0.6)} from="bottom" rotation={-2} seed="sh-p01" style={{ left: 60, top: 1000 }} kenBurns={{ from: { scale: 1.1, focus: [0.5, 0.5] }, to: { scale: 1.25, focus: [0.5, 0.42] }, at: 0, duration: c('why') }} />
            </Between>
            {/* why: Uzbekistan outlined */}
            <Between from={c('why') - 4} fade={6}>
              <div style={{ position: 'absolute', left: 0, top: 420, width: W, height: 1100, WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)', maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)' }}>
              <WorldMap
                width={W}
                height={1100}
                fitBounds={{ west: 44, east: 84, south: 30, north: 52 }}
                padding={[30, 30]}
                resolution="50m"
                land={PALETTE.landOnLapis}
                highlight={[{ iso: '860', at: c('why'), color: PALETTE.turquoise }]}
                overlay={(api) => {
                  const p = interpolate(frame, [c('why'), c('why', 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                  return <path d={api.countryPath('860')} fill="none" stroke={PALETTE.saffron} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />;
                }}
              />
              </div>
              <Label text="UZBEKISTAN" at={c('why', 0.6)} x={0} y={300} size={110} color={PALETTE.onDark} align="center" />
            </Between>
          </Between>

          {/* ── blue domes ──────────────────────────────────────────────────────────────────────────── */}
          <Between from={c('domes') - 8} to={c('cities') - 4} fade={6}>
            <PhotoCutout {...photoProps('P04')} width={980} height={1200} enterAt={c('domes') - 6} from="scale" rotation={1.5} seed="sh-p04" style={{ left: 50, top: 340 }} kenBurns={{ from: { scale: 1.0, focus: [0.38, 0.4] }, to: { scale: 1.08, focus: [0.38, 0.35] }, at: c('domes'), duration: 90 }} lift={{ path: PHOTO_MASKS.P04dome, at: c('domes', 0.4), by: 70 }}>
              <HandDrawnAnnotation shape={{ type: 'underline', x: 180, y: 1120, width: 620 }} at={c('domes', 0.9)} width={980} height={1200} color="#FBFAF6" label={{ text: '{n}+ years', x: 490, y: 1090, size: 90, count: { to: coldOpen.data.domeAgeYears } }} />
            </PhotoCutout>
          </Between>

          {/* ── three cities ────────────────────────────────────────────────────────────────────────── */}
          <Between from={c('cities') - 4} to={c('closed') - 6} fade={6}>
            <GeometricPattern tiling="3.12.12" size={60} width={W} height={H} origin={[540, 960]} draw={{ at: c('nothingElse'), duration: 24, spread: 40 }} stroke={PALETTE.saffron} strokeWidth={3} opacity={0.6} />
            {(
              [
                ['P01', 'SAMARKAND', 0.0],
                ['P06', 'BUKHARA', 0.5],
                ['P11', 'KHIVA', 1.0],
              ] as const
            ).map(([id, name, d], i) => (
              <PhotoCutout key={id} {...photoProps(id)} width={960} height={500} enterAt={c('cities', d)} from={i % 2 ? 'left' : 'right'} rotation={[-2, 2, -1.5][i]} seed={`sh-${id}`} style={{ left: 60, top: 230 + i * 540 }} kenBurns={{ from: { scale: 1.1, focus: [0.5, 0.5] }, to: { scale: 1.2, focus: [0.55, 0.45] }, at: c('cities', d), duration: 150 }}>
                <div style={{ position: 'absolute', left: 30, bottom: 30, background: '#FBFAF6', padding: '6px 22px', fontFamily: F.headline, fontWeight: 700, fontSize: 70, color: PALETTE.ink, letterSpacing: 2 }}>{name}</div>
              </PhotoCutout>
            ))}
          </Between>

          {/* ── closed → open ───────────────────────────────────────────────────────────────────────── */}
          <Between from={c('closed') - 6} to={ctaIn} fade={6}>
            <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
              <g transform={`translate(540 380) scale(${interpolate(lockS, [0, 1], [5, 2.6])})`} opacity={Math.min(1, lockS * 3)}>
                <SilkIcon name={lockOpen ? 'padlockOpen' : 'padlock'} size={150} />
              </g>
            </svg>
            {!lockOpen && <Stamp text="CLOSED" at={c('closed', 0.5)} fontSize={110} rotation={-10} color={PALETTE.questionRed} style={{ left: 300, top: 560 }} />}
            {lockOpen && <Stamp text="OPEN" at={c('opened')} fontSize={150} rotation={-8} color={PALETTE.turquoise} style={{ left: 330, top: 560 }} />}
            <Between from={c('visas') - 4}>
              <WorldMap
                width={W}
                height={620}
                style={{ top: 780 }}
                centerLon={60}
                padding={[20, 20]}
                land={PALETTE.landOnLapis}
                highlight={[{ iso: '860', at: 0, color: PALETTE.saffron }, ...visaFree.data.flatMap((s, si) => s.isos.map((iso, k) => ({ iso, at: c('visas') + si * 6 + Math.floor(k / 4), color: PALETTE.turquoise })))]}
              />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', opacity: interpolate(frame, [c('trains') - 8, c('trains')], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: 3, color: '#C9D2E6' }}>AROUND</div>
                <BigCounter to={visaCount2025.data.approxCountries} at={c('visas', 0.4)} duration={36} fontSize={150} color={PALETTE.turquoiseLight} />
                <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: 3, color: '#C9D2E6' }}>COUNTRIES WITH EASIER ENTRY</div>
              </div>
            </Between>
            <Between from={c('trains') - 4}>
              <div style={{ position: 'absolute', left: 60, top: 1250, width: 960, height: 560, background: '#F5F0E6', boxShadow: '0 14px 30px rgba(0,0,0,0.35)' }}>
                <RouteMap
                  width={960}
                  height={560}
                  fitBounds={{ west: 62.5, east: 71, south: 38.6, north: 42.4 }}
                  padding={[30, 30]}
                  resolution="50m"
                  land="#E4DED2"
                  nodes={afrosiyob.data.stops.map((s, i) => ({ id: s.id, lonLat: s.lonLat, label: s.name, at: c('trains') + i * 5, color: PALETTE.lapis, dy: s.id === 'bukhara' ? 36 : -16 }))}
                  routes={[{ id: 'hsr', points: afrosiyob.data.stops.map((s) => s.lonLat), at: c('trains'), duration: 30, color: PALETTE.turquoise, width: 10, bend: 0.04, markers: [{ at: c('trains') + 16, duration: 60, render: () => <SilkIcon name="train" size={90} /> }] }]}
                />
              </div>
            </Between>
          </Between>

          {/* ── call to action ──────────────────────────────────────────────────────────────────────── */}
          <Between from={ctaIn} fade={8}>
            <WorldMap
              width={W}
              height={900}
              style={{ top: 160 }}
              fitBounds={{ west: 55.8, east: 73.3, south: 37.0, north: 45.7 }}
              padding={[40, 40]}
              resolution="50m"
              land="rgba(0,0,0,0)"
              borders={false}
              overlay={(api) => {
                const d = api.countryPath('860');
                const tile = { w: 190, h: 130 };
                return (
                  <>
                    <defs>
                      <clipPath id="sh-collage">
                        <path d={d} />
                      </clipPath>
                    </defs>
                    <path d={d} fill="#D8D0BF" />
                    <g clipPath="url(#sh-collage)">
                      {Array.from({ length: 36 }, (_, i) => {
                        const col = i % 6;
                        const row = Math.floor(i / 6);
                        const s = spring({ frame: frame - (ctaIn + ((col + row * 2) % 10) * 2), fps, config: SPRINGS.snappy });
                        if (s <= 0.01) return null;
                        return (
                          <g key={i} transform={`translate(${-30 + col * tile.w + tile.w / 2} ${60 + row * tile.h + tile.h / 2}) scale(${0.3 + 0.7 * s})`}>
                            <image href={photoSrc(COLLAGE[i % COLLAGE.length])} x={-tile.w / 2} y={-tile.h / 2} width={tile.w} height={tile.h} preserveAspectRatio="xMidYMid slice" />
                            <rect x={-tile.w / 2} y={-tile.h / 2} width={tile.w} height={tile.h} fill="none" stroke="#FBFAF6" strokeWidth={3} />
                          </g>
                        );
                      })}
                    </g>
                    <path d={d} fill="none" stroke={PALETTE.saffron} strokeWidth={6} />
                  </>
                );
              }}
            />
            <div style={{ position: 'absolute', left: 90, right: 90, top: 1010, transform: `translateY(${(1 - spring({ frame: frame - c('channel'), fps, config: SPRINGS.cutout })) * 300}px)`, opacity: frame >= c('channel') ? 1 : 0 }}>
              <div style={{ background: PALETTE.terracotta, padding: '34px 30px', textAlign: 'center', boxShadow: '0 16px 32px rgba(0,0,0,0.3)', transform: 'rotate(-2deg)' }}>
                <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 92, color: '#FBFAF6', lineHeight: 1.05 }}>FULL VIDEO</div>
                <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 60, color: '#FBFAF6', opacity: 0.9 }}>ON OUR CHANNEL</div>
                <svg width={120} height={84} viewBox="0 0 120 84" style={{ marginTop: 18 }}>
                  <rect width={120} height={84} rx={20} fill="#FBFAF6" />
                  <path d="M48 24 L80 42 L48 60 Z" fill={PALETTE.terracotta} />
                </svg>
              </div>
            </div>
            <HandDrawnAnnotation shape={{ type: 'arrow', from: [540, 1600], to: [540, 1800] }} at={c('channel', 0.8)} width={W} height={H} color={PALETTE.terracotta} strokeWidth={9} />
          </Between>
        </ParallaxLayer>
      </CameraRig>
      {/* open loop: pinned from the question to the end of the cities */}
      <Between from={c('why')} to={c('closed')}>
        <QuestionPin at={c('why', 0.3)} left={830} top={120} />
      </Between>
      {/* transitions between blocks */}
      {[c('domes') - 9, c('closed') - 7, ctaIn - 1].map((at, i) => (
        <React.Fragment key={i}>
          <PatternWipe phase="cover" at={at - 14} frames={14} width={W} height={H} origin={[540, 960]} tiling={(['4.8.8', '6.6.6', '3.12.12'] as const)[i]} />
          <PatternWipe phase="reveal" at={at} frames={14} width={W} height={H} origin={[540, 960]} tiling={(['4.8.8', '6.6.6', '3.12.12'] as const)[i]} sound={false} />
        </React.Fragment>
      ))}
      <SourceTag text="NATIONAL STATISTICS COMMITTEE · UNESCO · TOURISM COMMITTEE" tone={dark ? 'dark' : 'light'} style={{ left: 40, bottom: 40, fontSize: 16 }} at={s2f(0.5)} />
    </AbsoluteFill>
  );
};

export const Short: React.FC<ShortProps> = ({ voiceover, music, musicVolume, sfx, subtitles }) => {
  const musicFile = has('short/music.mp3') ? 'short/music.mp3' : 'music.mp3';
  return (
  <ThemeProvider theme={uzbekistanTheme}>
    <SfxProvider enabled={sfx && has('sfx/paper-slide.mp3')} gain={0.6}>
      <AbsoluteFill style={{ backgroundColor: PALETTE.lapisPaper }}>
        <ShortBody />
        {subtitles && <Subtitles />}
        {voiceover && has('short/voiceover.wav') && <Audio src={staticFile('short/voiceover.wav')} />}
        {music && has(musicFile) && (
          <Audio src={staticFile(musicFile)} loop volume={(f) => musicVolume * interpolate(f, [0, 20, SHORT_FRAMES - 30, SHORT_FRAMES], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
        )}
      </AbsoluteFill>
    </SfxProvider>
  </ThemeProvider>
  );
};
