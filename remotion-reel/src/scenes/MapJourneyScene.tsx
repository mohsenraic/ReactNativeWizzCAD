import {geoDistance} from 'd3-geo';
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Camera, COLORS, MAP, PLACE, SCENES, VIDEO} from '../config';
import {Background} from '../components/Background';
import {Pin} from '../components/Pin';
import {WorldMap} from '../components/WorldMap';
import {bodyFont} from '../lib/fonts';
import {lerpCamera} from '../lib/geo';
import {progress, useSceneTime} from '../lib/time';

/** Caméra continue : rotation du globe -> arrêt sur la région -> zoom pays -> zoom lieu */
const cameraAt = (abs: number): Camera => {
  const c = MAP.camera;
  if (abs < MAP.zoomToCountry.start) {
    const p = progress(abs, SCENES.globe.start - 0.3, MAP.globeStopAt, Easing.out(Easing.cubic));
    return lerpCamera(c.globeStart, c.globeEnd, p);
  }
  if (abs < MAP.zoomToPlace.start) {
    const p = progress(abs, MAP.zoomToCountry.start, MAP.zoomToCountry.end, Easing.inOut(Easing.cubic));
    return lerpCamera(c.globeEnd, c.country, p);
  }
  const p = progress(abs, MAP.zoomToPlace.start, MAP.zoomToPlace.end, Easing.inOut(Easing.cubic));
  const cam = lerpCamera(c.country, c.place, p);
  // Lente poussée de caméra une fois arrivé
  const drift = interpolate(abs, [MAP.zoomToPlace.end, SCENES.zoom.end + 0.5], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {...cam, scale: cam.scale * drift};
};

/** Scènes 2 & 3 — Globe puis zoom sur le lieu */
export const MapJourneyScene: React.FC = () => {
  const {abs} = useSceneTime();
  const camera = cameraAt(abs);

  const z = MAP.zoomToCountry;
  const highlight = progress(abs, z.start + 0.6, z.end - 0.2);
  const graticule = 1 - progress(abs, z.start, z.start + 1.4);
  const atmosphere = 1 - progress(abs, z.start + 0.2, z.start + 1.6);
  const countryLabel =
    progress(abs, z.end - 1.0, z.end - 0.3) * (1 - progress(abs, MAP.zoomToPlace.start + 0.2, MAP.zoomToPlace.start + 0.8));
  const regionLabel =
    progress(abs, MAP.globeStopAt - 0.5, MAP.globeStopAt + 0.2) * (1 - progress(abs, z.start, z.start + 0.5));
  // Apparition douce du globe
  const intro = progress(abs, SCENES.globe.start - 0.3, SCENES.globe.start + 0.9, Easing.out(Easing.cubic));
  const crosshair = progress(abs, MAP.pinDropAt + 0.3, MAP.pinDropAt + 1.1);

  return (
    <AbsoluteFill>
      <Background stars time={abs} glowY={MAP.centerY} />
      <AbsoluteFill
        style={{
          opacity: intro,
          transform: `scale(${interpolate(intro, [0, 1], [0.88, 1])})`,
          transformOrigin: `50% ${(MAP.centerY / VIDEO.height) * 100}%`,
        }}
      >
        <WorldMap
          camera={camera}
          highlight={highlight}
          graticuleOpacity={graticule}
          atmosphere={atmosphere}
          countryLabel={countryLabel}
        >
          {(projection) => {
            const pt = projection([PLACE.lon, PLACE.lat]);
            const visible =
              geoDistance([PLACE.lon, PLACE.lat], [camera.lon, camera.lat]) < Math.PI / 2 - 0.05;
            if (!pt || !visible) return null;
            return (
              <>
                {/* Réticule fin */}
                {crosshair > 0 ? (
                  <g opacity={0.35 * crosshair} stroke={COLORS.accent} strokeWidth={1} strokeDasharray="6 10">
                    <line x1={0} x2={VIDEO.width} y1={pt[1]} y2={pt[1]} />
                    <line x1={pt[0]} x2={pt[0]} y1={pt[1] - 520 * crosshair} y2={pt[1] + 300 * crosshair} />
                  </g>
                ) : null}
                {regionLabel > 0 ? (
                  <g transform={`translate(${pt[0]}, ${pt[1]})`} opacity={regionLabel}>
                    <circle r={5} fill={COLORS.accent} />
                    <circle r={14} fill="none" stroke={COLORS.accent} strokeOpacity={0.6} strokeWidth={1.5} />
                    <text
                      x={0}
                      y={-34}
                      textAnchor="middle"
                      fontFamily={bodyFont}
                      fontWeight={700}
                      fontSize={28}
                      letterSpacing={10}
                      fill={COLORS.text}
                    >
                      {MAP.regionLabel}
                    </text>
                  </g>
                ) : null}
                <Pin x={pt[0]} y={pt[1]} time={abs} dropAt={MAP.pinDropAt} labelAt={MAP.labelAt} />
              </>
            );
          }}
        </WorldMap>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
