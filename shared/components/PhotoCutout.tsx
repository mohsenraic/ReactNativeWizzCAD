/**
 * <PhotoCutout> — a real photo, Vox-treated: paper border + shadow (via <Cutout>), Ken Burns, optional
 * duotone / halftone / desaturate treatment (can sweep in), a lifted mask layer for parallax (e.g. a dome cut
 * out of the sky and raised on its own layer), a small "PHOTO: author / licence" credit, and children drawn on
 * top in photo-frame coordinates (annotations).
 *
 * Coordinates:
 *   - Ken Burns `focus` is a fraction of the source image (0–1, 0–1).
 *   - `lift.path` is an SVG path in SOURCE-IMAGE pixels (naturalSize), so it survives any crop or zoom.
 *   - children are positioned in the cutout's own box (0…width, 0…height).
 *
 * @example
 * <PhotoCutout src={photoSrc('P01')} naturalSize={[3752, 2530]} width={1300} height={760}
 *   credit="Ekrem Canli / CC BY-SA 3.0" enterAt={0} style={{ left: 310, top: 140 }}
 *   kenBurns={{ from: { scale: 1, focus: [0.5, 0.55] }, to: { scale: 1.18, focus: [0.48, 0.45] } }}
 *   treatment={{ type: 'duotone', colors: ['#1B2F5B', '#D9A441'], sweep: { at: 60, duration: 30 } }}
 *   lift={{ path: 'M1700,700 C…Z', at: 45, by: 46 }}>
 *   <HandDrawnAnnotation shape={{ type: 'circle', cx: 650, cy: 300, rx: 120, ry: 90 }} at={50} width={1300} height={760} />
 * </PhotoCutout>
 */
import React, { useEffect, useId, useState } from 'react';
import { continueRender, delayRender, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, useTheme } from '../theme';
import { Cutout, EnterFrom } from './Cutout';

export interface KenBurnsKey {
  /** ≥ 1: extra zoom on top of cover-fit. */
  scale: number;
  /** Point of the source image kept centred, as fractions [0–1, 0–1]. */
  focus: [number, number];
}

export type PhotoTreatment =
  | { type: 'none' }
  | {
      type: 'duotone' | 'halftone' | 'desaturate';
      /** Duotone shadow → highlight colours (default lapis → gold). Halftone uses colors[0] as ink. */
      colors?: [string, string];
      /** 0–1 strength (default 1). */
      amount?: number;
      /** Reveal the treatment with a left → right sweep instead of having it from the start. */
      sweep?: { at: number; duration?: number };
      /** Halftone dot pitch in screen px (default 9). */
      dot?: number;
    };

export const PhotoCutout: React.FC<{
  src: string;
  /** Pixel size of the source file — needed for cover-fit, Ken Burns and lift paths. */
  naturalSize: [number, number];
  width: number;
  height: number;
  /** "Author / Licence" — printed as "PHOTO: …". Omit only for public-domain images you credit elsewhere. */
  credit?: string;
  /** Where the credit goes: on the photo's bottom-right corner (default) or nowhere (scene prints it). */
  creditPlacement?: 'photo' | 'none';
  kenBurns?: { from: KenBurnsKey; to: KenBurnsKey; at?: number; duration?: number };
  treatment?: PhotoTreatment;
  /** A region of the photo lifted onto its own layer (parallax + shadow); `by` = px it rises. */
  lift?: { path: string; at: number; duration?: number; by?: number; scale?: number; hole?: 'paper' | 'none' };
  /** No paper border / shadow / rotation (full-bleed shots — keep them ≤ ~4 s). */
  bleed?: boolean;
  enterAt?: number;
  from?: EnterFrom;
  exitAt?: number;
  exitTo?: 'left' | 'right' | 'top' | 'bottom';
  rotation?: number;
  seed?: string;
  border?: number;
  style?: React.CSSProperties;
  /** Drawn on top of the photo in the cutout's coordinates (annotations, labels). */
  children?: React.ReactNode;
}> = ({
  src,
  naturalSize,
  width,
  height,
  credit,
  creditPlacement = 'photo',
  kenBurns,
  treatment = { type: 'none' },
  lift,
  bleed = false,
  enterAt = 0,
  from = 'bottom',
  exitAt,
  exitTo,
  rotation,
  seed = 'photo',
  border = 10,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors: C, fonts: F } = useTheme();
  const uid = useId().replace(/:/g, '');
  const [nw, nh] = naturalSize;
  usePhotoReady(src);

  // ── Ken Burns: cover-fit × extra scale, keep `focus` centred but never show an edge ──────────────────────
  const kbAt = kenBurns?.at ?? enterAt;
  const kbDur = kenBurns?.duration ?? Math.max(1, durationInFrames - kbAt);
  const t = kenBurns ? interpolate(frame, [kbAt, kbAt + kbDur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) }) : 0;
  const a = kenBurns?.from ?? { scale: 1, focus: [0.5, 0.5] as [number, number] };
  const b = kenBurns?.to ?? a;
  const s = a.scale + (b.scale - a.scale) * t;
  const fx = a.focus[0] + (b.focus[0] - a.focus[0]) * t;
  const fy = a.focus[1] + (b.focus[1] - a.focus[1]) * t;
  const K = Math.max(width / nw, height / nh) * s;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const tx = clamp(width / 2 - K * fx * nw, width - K * nw, 0);
  const ty = clamp(height / 2 - K * fy * nh, height - K * nh, 0);
  const imgTransform = `translate(${tx} ${ty}) scale(${K})`;

  // ── Treatment ────────────────────────────────────────────────────────────────────────────────────────
  const tr = treatment.type === 'none' ? null : treatment;
  const amount = tr?.amount ?? 1;
  const sweepP = tr?.sweep
    ? interpolate(frame, [tr.sweep.at, tr.sweep.at + (tr.sweep.duration ?? 24)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) })
    : 1;
  const [dark, light] = tr?.colors ?? [C.secondary, C.highlighter];
  const filterId = `${uid}-fx`;

  // ── Lift (masked parallax layer) ───────────────────────────────────────────────────────────────────────
  const liftS = lift ? spring({ frame: frame - lift.at, fps, config: SPRINGS.smooth, durationInFrames: lift.duration ?? 30 }) : 0;
  const liftY = -(lift?.by ?? 40) * liftS;
  const liftScale = 1 + ((lift?.scale ?? 1.04) - 1) * liftS;

  const image = <image href={src} x={0} y={0} width={nw} height={nh} preserveAspectRatio="none" />;
  const photo = (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        {tr && <TreatmentFilter id={filterId} type={tr.type} dark={dark} light={light} amount={amount} dot={(tr.type === 'halftone' ? tr.dot ?? 9 : 9) / K} />}
        {tr && sweepP < 1 && (
          <clipPath id={`${uid}-sweep`}>
            <rect x={0} y={0} width={width * sweepP} height={height} />
          </clipPath>
        )}
        {lift && (
          <clipPath id={`${uid}-lift`} clipPathUnits="userSpaceOnUse">
            <path d={lift.path} />
          </clipPath>
        )}
        {lift && (
          <filter id={`${uid}-liftShadow`} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx={0} dy={14 * liftS} stdDeviation={10} floodColor="#000" floodOpacity={0.35 * liftS} />
          </filter>
        )}
      </defs>
      {/* base photo, then the treated copy (fully or behind a sweep) */}
      <g transform={imgTransform}>{image}</g>
      {tr && sweepP > 0 && (
        <g clipPath={sweepP < 1 ? `url(#${uid}-sweep)` : undefined}>
          <g transform={imgTransform} filter={`url(#${filterId})`}>
            {image}
          </g>
        </g>
      )}
      {tr?.sweep && sweepP > 0 && sweepP < 1 && (
        <rect x={width * sweepP - 3} y={0} width={6} height={height} fill={light} opacity={0.85} />
      )}
      {lift && liftS > 0.001 && (
        <>
          {(lift.hole ?? 'paper') === 'paper' && (
            <g transform={imgTransform}>
              <path d={lift.path} fill={C.paper} opacity={Math.min(1, liftS * 1.5)} />
            </g>
          )}
          <g
            filter={`url(#${uid}-liftShadow)`}
            transform={`translate(0 ${liftY}) translate(${width / 2} ${height / 2}) scale(${liftScale}) translate(${-width / 2} ${-height / 2})`}
          >
            <g transform={imgTransform}>
              <g clipPath={`url(#${uid}-lift)`}>
                {image}
                {tr && sweepP > 0 && <g filter={`url(#${filterId})`}>{image}</g>}
              </g>
              <path d={lift.path} fill="none" stroke={C.cutoutBorder} strokeWidth={6 / K} strokeLinejoin="round" />
            </g>
          </g>
        </>
      )}
    </svg>
  );

  const creditTag =
    credit && creditPlacement === 'photo' ? (
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          padding: '4px 10px 3px',
          background: 'rgba(251,250,246,0.86)',
          fontFamily: F.mono,
          fontSize: 14,
          letterSpacing: 0.6,
          color: C.greyDark,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        PHOTO: {credit}
      </div>
    ) : null;

  const content = (
    <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      {photo}
      {children && <div style={{ position: 'absolute', inset: 0 }}>{children}</div>}
      {creditTag}
    </div>
  );

  if (bleed) {
    const o = interpolate(frame, [enterAt, enterAt + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ position: 'absolute', opacity: o, ...style }}>{content}</div>;
  }

  return (
    <Cutout enterAt={enterAt} from={from} exitAt={exitAt} exitTo={exitTo} rotation={rotation} seed={seed} border={border} style={style} background={C.cutoutBorder}>
      {content}
    </Cutout>
  );
};

/** SVG filter chain for each treatment (applied to the image group). */
const TreatmentFilter: React.FC<{ id: string; type: 'duotone' | 'halftone' | 'desaturate'; dark: string; light: string; amount: number; dot: number }> = ({
  id,
  type,
  dark,
  light,
  amount,
  dot,
}) => {
  const [dr, dg, db] = rgb(dark);
  const [lr, lg, lb] = rgb(light);
  // Luminance → grey (in R,G,B), keep alpha.
  const grey = '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0';
  if (type === 'desaturate')
    return (
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values={String(1 - 0.85 * amount)} />
        <feComponentTransfer>
          <feFuncR type="linear" slope={1 - 0.12 * amount} intercept={0.06 * amount} />
          <feFuncG type="linear" slope={1 - 0.12 * amount} intercept={0.05 * amount} />
          <feFuncB type="linear" slope={1 - 0.12 * amount} intercept={0.04 * amount} />
        </feComponentTransfer>
      </filter>
    );
  if (type === 'duotone')
    return (
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={grey} result="g" />
        <feComponentTransfer in="g" result="duo">
          <feFuncR type="table" tableValues={`${dr} ${lr}`} />
          <feFuncG type="table" tableValues={`${dg} ${lg}`} />
          <feFuncB type="table" tableValues={`${db} ${lb}`} />
        </feComponentTransfer>
        <feComposite in="duo" in2="SourceGraphic" operator="arithmetic" k1={0} k2={amount} k3={1 - amount} k4={0} />
      </filter>
    );
  // Halftone: grey image + tiled radial dot, thresholded → dots that grow in the shadows; ink = dark, paper = light-ish.
  const tile = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${dot}' height='${dot}'><defs><radialGradient id='r'><stop offset='0' stop-color='black'/><stop offset='1' stop-color='white'/></radialGradient></defs><rect width='${dot}' height='${dot}' fill='url(#r)'/></svg>`,
  )}`;
  return (
    <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
      <feColorMatrix type="matrix" values={grey} result="g" />
      <feImage href={tile} x={0} y={0} width={dot} height={dot} result="dotTile" preserveAspectRatio="none" />
      <feTile in="dotTile" result="dots" />
      <feComposite in="g" in2="dots" operator="arithmetic" k1={0} k2={1} k3={1} k4={-0.5} result="sum" />
      <feComponentTransfer in="sum" result="bw">
        <feFuncR type="discrete" tableValues="0 1" />
        <feFuncG type="discrete" tableValues="0 1" />
        <feFuncB type="discrete" tableValues="0 1" />
      </feComponentTransfer>
      <feComponentTransfer in="bw" result="ink">
        <feFuncR type="table" tableValues={`${dr} 0.96`} />
        <feFuncG type="table" tableValues={`${dg} 0.95`} />
        <feFuncB type="table" tableValues={`${db} 0.92`} />
      </feComponentTransfer>
      <feComposite in="ink" in2="SourceGraphic" operator="arithmetic" k1={0} k2={amount} k3={1 - amount} k4={0} />
    </filter>
  );
};

/** '#RRGGBB' → [r, g, b] in 0–1. */
const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) => +v.toFixed(3)) as [number, number, number];
};

/**
 * Hold the render until the photo is downloaded and decoded: an SVG <image> is not awaited by Remotion,
 * so without this a large file can be captured blank.
 */
export const usePhotoReady = (src: string) => {
  const [handle] = useState(() => delayRender(`PhotoCutout: ${src}`));
  useEffect(() => {
    const img = new Image();
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    img.onload = () => {
      img.decode().then(finish, finish);
    };
    img.onerror = finish;
    img.src = src;
    return finish;
  }, [src, handle]);
};
