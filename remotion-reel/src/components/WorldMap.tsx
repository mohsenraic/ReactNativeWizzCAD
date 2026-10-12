import {geoCentroid, geoGraticule10, geoPath, GeoProjection} from 'd3-geo';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {Camera, COLORS, MAP, PLACE, VIDEO} from '../config';
import {bodyFont} from '../lib/fonts';
import {borders, getCountry, land, makeProjection} from '../lib/geo';

const graticule = geoGraticule10();
const SPHERE = {type: 'Sphere'} as const;

type Props = {
  camera: Camera;
  /** 0 -> 1 : mise en valeur du pays cible */
  highlight?: number;
  /** Opacité du quadrillage */
  graticuleOpacity?: number;
  /** Opacité du halo atmosphérique autour du globe */
  atmosphere?: number;
  /** Opacité du nom du pays */
  countryLabel?: number;
  /** Calques dessinés au-dessus de la carte (pin, étiquettes…) */
  children?: (projection: GeoProjection) => React.ReactNode;
};

/** Carte SVG (d3-geo + world-atlas) en projection orthographique */
export const WorldMap: React.FC<Props> = ({
  camera,
  highlight = 0,
  graticuleOpacity = 0,
  atmosphere = 1,
  countryLabel = 0,
  children,
}) => {
  const target = useMemo(() => getCountry(PLACE.countryIsoNumeric), []);
  const targetCentroid = useMemo(() => (target ? geoCentroid(target) : null), [target]);

  const projection = makeProjection(camera).clipExtent([
    [-40, -40],
    [VIDEO.width + 40, VIDEO.height + 40],
  ]);
  const path = geoPath(projection);

  const cx = VIDEO.width / 2;
  const cy = MAP.centerY;
  const r = camera.scale;
  const landFill = interpolateColors(highlight, [0, 1], [COLORS.land, '#1F2F4E']);
  const labelPos = targetCentroid ? projection(targetCentroid) : null;

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <radialGradient id="ocean" cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#12264A" />
            <stop offset="75%" stopColor={COLORS.ocean} />
            <stop offset="100%" stopColor="#0A1428" />
          </radialGradient>
          <radialGradient id="atmo" cx={cx} cy={cy} r={r * 1.18} gradientUnits="userSpaceOnUse">
            <stop offset="80%" stopColor="#4C8DE0" stopOpacity={0} />
            <stop offset="85%" stopColor="#4C8DE0" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4C8DE0" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="shade" cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 1.4} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.07} />
            <stop offset="60%" stopColor="#000000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.45} />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Halo atmosphérique */}
        {atmosphere > 0 ? <circle cx={cx} cy={cy} r={r * 1.18} fill="url(#atmo)" opacity={atmosphere} /> : null}

        {/* Océan */}
        <path d={path(SPHERE) ?? ''} fill="url(#ocean)" />

        {/* Quadrillage */}
        {graticuleOpacity > 0 ? (
          <path
            d={path(graticule) ?? ''}
            fill="none"
            stroke={COLORS.graticule}
            strokeWidth={1}
            opacity={0.35 * graticuleOpacity}
          />
        ) : null}

        {/* Terres */}
        <path
          d={path(land) ?? ''}
          fill={landFill}
          stroke={COLORS.border}
          strokeOpacity={0.25}
          strokeWidth={1}
        />

        {/* Pays cible */}
        {target && highlight > 0 ? (
          <path
            d={path(target) ?? ''}
            fill={COLORS.landHighlight}
            fillOpacity={highlight}
            stroke={COLORS.borderHighlight}
            strokeOpacity={highlight}
            strokeWidth={2.4}
            filter="url(#glow)"
          />
        ) : null}

        {/* Frontières lumineuses */}
        <path
          d={path(borders) ?? ''}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={1.2}
          strokeOpacity={0.6}
          filter="url(#glow)"
        />

        {/* Ombrage de volume du globe */}
        {atmosphere > 0 ? <path d={path(SPHERE) ?? ''} fill="url(#shade)" opacity={atmosphere} /> : null}

        {labelPos && countryLabel > 0 ? (
          <text
            x={labelPos[0]}
            y={labelPos[1]}
            textAnchor="middle"
            fontFamily={bodyFont}
            fontWeight={700}
            fontSize={34}
            letterSpacing={14}
            fill={COLORS.text}
            opacity={0.55 * countryLabel}
          >
            {PLACE.country.toUpperCase()}
          </text>
        ) : null}

        {children ? children(projection) : null}
      </svg>
    </AbsoluteFill>
  );
};
