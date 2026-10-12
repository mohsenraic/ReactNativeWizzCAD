import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SAFE_ZONE, SUBTITLES} from '../config';

/** Aide visuelle : zones masquées par l'interface Instagram / YouTube */
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: SAFE_ZONE.top, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: SAFE_ZONE.bottom, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', top: SUBTITLES.centerY, left: 0, right: 0, height: 2, background: 'rgba(0,255,120,0.6)'}} />
  </AbsoluteFill>
);
