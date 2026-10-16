/**
 * Scene 3 — The middle of the map (1:42–2:32). Chapter "2 — THE MIDDLE OF THE MAP".
 * Eurasia → zoom onto Uzbekistan. "Doubly landlocked" → the shortest way to the ocean, 2 borders numbered.
 * "Disadvantage" → stamped, then struck. Zoom back out: the Silk Road draws from China to the Mediterranean,
 * goods ride it, caravanserais drop on the route, Samarkand / Bukhara / Khiva pulse; zoom in on the three.
 * "Like nothing else on Earth" → a tile pattern starts drawing over the map, then the tile wipe.
 */
import React from 'react';
import { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
import { SourceTag } from '../../../shared/components/SourceTag';
import { Stamp } from '../../../shared/components/Stamp';
import { GeometricPattern } from '../components/GeometricPattern';
import { SilkRoadMap } from '../components/SilkRoadMap';
import { geography } from '../data/data';
import { PALETTE } from '../theme';
import { Between, QuestionPin, UzScene, useScene, Words, Beat } from './common';

/** Extra visual beats as [cue, offset s] (null = seconds from scene start) — checked by retentionGaps(). */
export const BEATS_S03: Beat<'s03'>[] = [['map', 0], ['middle', 0], ['middle', 0.8], ['doublyLandlocked', 0], ['twoBorders', 0], ['twoBorders', 1.2], ['disadvantage', 0], ['disadvantage', 2.4], ['disadvantage', 3.6], ['silkRoad', 0], ['network', 0], ['goods', 0], ['placesToStop', 0], ['richest', 0], ['threeStanding', 0], ['nothingElse', 0]];

export const Scene03SilkRoad: React.FC = () => {
  const { c, d } = useScene('s03');
  const zoomOut = c('disadvantage', 3.6);

  return (
    <UzScene
      id="s03"
      pushIn={0.02}
      overlay={
        <>
          <QuestionPin at={0} />
          <Between from={c('doublyLandlocked') - 10} to={zoomOut}>
            <SourceTag dataset={geography} />
          </Between>
          <Between from={c('silkRoad')}>
            <SourceTag text="ROUTES SIMPLIFIED · CITY-TO-CITY" />
          </Between>
        </>
      }
    >
      <SilkRoadMap
        uzbekistanAt={c('middle')}
        zoomKeys={[
          { at: c('middle') - 6, duration: 50, scale: 1.9, center: [61.5, 36.5] },
          { at: zoomOut, duration: 50, scale: 1 },
          { at: c('threeStanding'), duration: 50, scale: 3.4 },
        ]}
        landlockedAt={c('doublyLandlocked')}
        landlockedOutAt={zoomOut - 10}
        routesAt={c('silkRoad')}
        routesDuration={110}
        goodsAt={c('goods')}
        caravanseraiAt={c('placesToStop')}
        citiesAt={c('richest')}
        overlay={(api) => {
          const gulf = api.project([56.3, 27.2]);
          const regions: Array<[string, [number, number]]> = [
            ['CHINA', [104, 32]],
            ['PERSIA', [54, 32.5]],
            ['MIDDLE EAST', [41, 29]],
            ['EUROPE', [16, 49]],
          ];
          return (
            <>
              {gulf && (
                <foreignObject x={gulf[0] - 40} y={gulf[1] + 20} width={420} height={120}>
                  <Words words={['to the ocean:', '2 borders']} at={c('twoBorders')} outAt={zoomOut - 10} stagger={10} size={52} color={PALETTE.questionRed} gap={14} style={{ left: 0, top: 0 }} />
                </foreignObject>
              )}
              {regions.map(([name, ll], i) => {
                const p = api.project(ll);
                return p ? (
                  <foreignObject key={name} x={p[0] - 150} y={p[1] - 24} width={300} height={60}>
                    <Words words={[name]} at={c('network') + i * 8} outAt={c('threeStanding') - 10} font="mono" size={26} color={PALETTE.greyDark} style={{ left: 0, right: 0, justifyContent: 'center' }} />
                  </foreignObject>
                ) : null;
              })}
            </>
          );
        }}
      />
      {/* "the middle of Eurasia": cross-hair */}
      <Between from={c('middle', 0.8)} to={c('doublyLandlocked') - 6}>
        <HandDrawnAnnotation shape={{ type: 'circle', cx: 1020, cy: 400, rx: 240, ry: 170 }} at={c('middle', 0.8)} color={PALETTE.terracotta} label={{ text: 'the middle of Eurasia', x: 1020, y: 200, size: 64 }} />
      </Between>
      {/* the only other doubly landlocked country */}
      <Between from={c('twoBorders', 1.2)} to={zoomOut - 10}>
        <Words words={['DOUBLY LANDLOCKED:', 'UZBEKISTAN', '+ LIECHTENSTEIN']} at={c('twoBorders', 1.2)} font="mono" size={30} stagger={8} gap={18} color={PALETTE.ink} style={{ left: 140, top: 120 }} />
      </Between>
      {/* "a disadvantage" — stamped, then struck out: for 2,000 years it was the opposite */}
      <Between from={c('disadvantage') - 2} to={zoomOut + 20}>
        <Stamp text="DISADVANTAGE?" at={c('disadvantage')} fontSize={92} rotation={-7} color={PALETTE.greyDark} style={{ left: 1100, top: 170 }} />
        <HandDrawnAnnotation shape={{ type: 'x', cx: 1420, cy: 260, size: 240 }} at={c('disadvantage', 2.4)} strokeWidth={9} />
      </Between>
      {/* goods list */}
      <Words words={['silk', 'spices', 'paper', 'glass', 'horses', '+ ideas']} at={c('goods')} outAt={c('placesToStop') + 60} stagger={9} size={62} color={PALETTE.terracotta} style={{ left: 140, top: 880 }} />
      {/* "like nothing else on Earth": the tile pattern starts to draw over the map */}
      <Between from={c('nothingElse')} fade={6}>
        <GeometricPattern tiling="3.12.12" size={70} origin={[1180, 420]} draw={{ at: c('nothingElse'), duration: 26, spread: d - 18 - c('nothingElse') - 10 }} stroke={PALETTE.saffron} strokeWidth={3} opacity={0.75} />
      </Between>
    </UzScene>
  );
};
