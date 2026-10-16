/**
 * <CommodityCards> — six pinned commodity cards (cocoa, coffee, palm oil, rice, sugar, fishmeal) built from
 * the shared <IconCard> (itself a <Cutout>), each with a small hand-drawn upward price arrow.
 * No price numbers: the narration gives none and none are sourced.
 *
 * `commodityPin(i, layout)` returns each card's pin position so the scene can run <RedString> from the card
 * to its producing regions on a map.
 *
 * @example
 * <CommodityCards layout={layout} enterAt={[20, 30, 40, 50, 60, 70]} arrowsAt={140} />
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { HandDrawnAnnotation, IconCard, ICON_CARD_WIDTH, pinOffset } from '../../../shared/components';
import { commodities } from '../data/elnino';
import { CommodityIcon } from './commodityIcons';

export interface CardSlot {
  /** Top-left of the (unscaled) card. */
  x: number;
  y: number;
}

export interface CommodityLayout {
  slots: CardSlot[];
  /** Uniform scale applied to every card. */
  scale: number;
}

/** Pin position (screen px) of card `i`. */
export const commodityPin = (i: number, layout: CommodityLayout): [number, number] => {
  const s = layout.slots[i];
  return [s.x + pinOffset[0] * layout.scale, s.y + pinOffset[1] * layout.scale];
};

export const CommodityCards: React.FC<{
  layout: CommodityLayout;
  /** Frame each card drops in (same order as `commodities.data`). */
  enterAt: number[];
  /** Frame the price arrows draw. Omit for none. */
  arrowsAt?: number;
  exitAt?: number;
}> = ({ layout, enterAt, arrowsAt, exitAt }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {commodities.data.map((c, i) => {
        const s = layout.slots[i];
        const at = enterAt[i] ?? enterAt[enterAt.length - 1];
        const w = ICON_CARD_WIDTH * layout.scale;
        return (
          <React.Fragment key={c.id}>
            <div style={{ position: 'absolute', left: s.x, top: s.y, transform: `scale(${layout.scale})`, transformOrigin: '0 0' }}>
              <IconCard
                icon={<CommodityIcon id={c.id} t={frame - at - 8} size={200} />}
                label={c.label}
                note={c.note}
                enterAt={at}
                exitAt={exitAt}
                seed={`card-${c.id}`}
                style={{ left: 0, top: 0 }}
              />
            </div>
            {arrowsAt !== undefined && (exitAt === undefined || frame < exitAt + 12) && (
              <HandDrawnAnnotation
                style={{ opacity: exitAt === undefined ? 1 : Math.max(0, 1 - (frame - exitAt) / 10) }}
                shape={{ type: 'arrow', from: [s.x + w + 14, s.y + 210 * layout.scale], to: [s.x + w + 26, s.y + 70 * layout.scale], bend: -0.12, headSize: 18 }}
                at={arrowsAt + i * 5}
                duration={14}
                strokeWidth={6}
                seed={`price-${c.id}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
