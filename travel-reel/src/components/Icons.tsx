import React from 'react';
import type {FactIcon} from '../data/types';

/** Simple line icons (24×24 grid) */
export const FactIconSvg: React.FC<{icon: FactIcon; size: number; color: string}> = ({icon, size, color}) => {
  const common = {fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {icon === 'wave' ? (
        <g {...common}>
          <path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0 2 1 2 1" />
          <path d="M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0 2 1 2 1" />
          <path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0 2 1 2 1" />
        </g>
      ) : null}
      {icon === 'swim' ? (
        <g {...common}>
          <circle cx="17" cy="6" r="2" />
          <path d="M3 13l5-4 4 3 3-2" />
          <path d="M2 18c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0" />
          <path d="M2 21.5c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0" />
        </g>
      ) : null}
      {icon === 'column' ? (
        <g {...common}>
          <path d="M3 7l9-4 9 4" />
          <path d="M4 7h16" />
          <path d="M6 7v11M10 7v11M14 7v11M18 7v11" />
          <path d="M4 18h16M3 21h18" />
        </g>
      ) : null}
      {icon === 'price' ? (
        <g {...common}>
          <path d="M12.6 2.6H20a1.4 1.4 0 0 1 1.4 1.4v7.4L11.4 21.4a1.4 1.4 0 0 1-2 0L2.6 14.6a1.4 1.4 0 0 1 0-2z" />
          <circle cx="16.5" cy="7.5" r="1.6" />
          <path d="M8.5 12.5l3 3" />
        </g>
      ) : null}
    </svg>
  );
};
