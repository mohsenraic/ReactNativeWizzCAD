/**
 * <IconCard> — pinned collage card: animated ink icon, Oswald label, short handwritten note.
 * The red pin's position is exported (`pinOffset`) so <RedString> can tie cards together.
 *
 * @example
 * <IconCard icon="work" label="WORK CULTURE" note="long hours" enterAt={30}
 *   style={{ left: 600, top: 180 }} seed="work" />
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../theme';
import { Cutout, EnterFrom } from './Cutout';
import { AnimatedIcon, IconName } from './icons';

export const ICON_CARD_WIDTH = 340;
/** Pin position relative to the card's top-left corner (before rotation). */
export const pinOffset: [number, number] = [ICON_CARD_WIDTH / 2 + 6, 10];

export const IconCard: React.FC<{
  icon: IconName | React.ReactNode;
  label: string;
  note?: string;
  enterAt?: number;
  from?: EnterFrom;
  exitAt?: number;
  rotation?: number;
  seed?: string;
  pin?: boolean;
  style?: React.CSSProperties;
}> = ({ icon, label, note, enterAt = 0, from = 'top', exitAt, rotation, seed = 'icon', pin = true, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - enterAt - 8;

  return (
    <Cutout enterAt={enterAt} from={from} exitAt={exitAt} rotation={rotation} seed={seed} style={style} background="#FBFAF6">
      <div style={{ width: ICON_CARD_WIDTH, padding: '34px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {pin && (
          <div
            style={{
              position: 'absolute',
              top: -8,
              left: '50%',
              width: 30,
              height: 30,
              marginLeft: -15,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, #F05A6E, ${COLORS.red} 55%, #7A0A1C)`,
              boxShadow: '2px 4px 4px rgba(0,0,0,0.35)',
            }}
          />
        )}
        {typeof icon === 'string' ? <AnimatedIcon name={icon as IconName} t={t} fps={fps} /> : icon}
        <div style={{ fontFamily: FONTS.headline, fontWeight: 700, fontSize: 46, color: COLORS.ink, letterSpacing: 1.5, marginTop: 8 }}>{label}</div>
        {note && <div style={{ fontFamily: FONTS.hand, fontWeight: 700, fontSize: 36, color: COLORS.red, marginTop: 2 }}>{note}</div>}
      </div>
    </Cutout>
  );
};
