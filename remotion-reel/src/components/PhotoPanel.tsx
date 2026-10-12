import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {COLORS, KenBurns, VIDEO, WINTER} from '../config';

type ImageProps = {
  src: string;
  kenBurns: KenBurns;
  /** 0 -> 1 : progression du mouvement Ken Burns */
  progress: number;
  /** 0 -> 1 : refroidissement hivernal (désaturation + teinte glacée) */
  winter?: number;
  style?: React.CSSProperties;
};

/** Photo en `cover` avec mouvement Ken Burns autour d'un point focal */
export const KenBurnsImage: React.FC<ImageProps> = ({src, kenBurns, progress, winter = 0, style}) => {
  const kb = kenBurns;
  const scale = interpolate(progress, [0, 1], [kb.fromScale, kb.toScale]);
  const x = interpolate(progress, [0, 1], [kb.from.x, kb.to.x]);
  const y = interpolate(progress, [0, 1], [kb.from.y, kb.to.y]);
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: `${x}% ${y}%`,
        transform: `scale(${scale})`,
        transformOrigin: `${x}% ${y}%`,
        filter: `saturate(${1 - 0.65 * winter}) brightness(${1 - 0.12 * winter}) contrast(${1 + 0.08 * winter})`,
        ...style,
      }}
    />
  );
};

type PanelProps = {
  src: string;
  kenBurns: KenBurns;
  progress: number;
  /** Centre vertical du bandeau (px) */
  centerY?: number;
  /** Hauteur du bandeau (px) */
  height?: number;
  /** 0 -> 1 : assombrissement (pour poser un graphique ou du texte dessus) */
  darken?: number;
  winter?: number;
};

/**
 * Photo paysage présentée dans un format vertical : bandeau net pleine largeur
 * aux bords fondus, posé sur une copie floutée et assombrie de la même photo.
 */
export const PhotoPanel: React.FC<PanelProps> = ({
  src,
  kenBurns,
  progress,
  centerY = 860,
  height = 760,
  darken = 0,
  winter = 0,
}) => {
  const fade = 'linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)';
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.background}}>
      {/* Fond flou */}
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <KenBurnsImage
          src={src}
          kenBurns={kenBurns}
          progress={progress}
          winter={winter}
          style={{filter: `blur(36px) brightness(0.62) saturate(${1 - 0.6 * winter})`, transform: 'scale(1.25)'}}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.background} 0%, rgba(11,20,38,0.35) 32%, rgba(11,20,38,0.35) 68%, ${COLORS.background} 100%)`,
        }}
      />

      {/* Bandeau net */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: VIDEO.width,
          top: centerY - height / 2,
          height,
          overflow: 'hidden',
          WebkitMaskImage: fade,
          maskImage: fade,
        }}
      >
        <KenBurnsImage src={src} kenBurns={kenBurns} progress={progress} winter={winter} />
        {/* Étalonnage : ombres bleu nuit pour rester dans la charte */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, rgba(11,20,38,0.35) 0%, rgba(11,20,38,0) 40%, rgba(11,20,38,0.45) 100%)`,
          }}
        />
        <AbsoluteFill style={{background: '#16305C', mixBlendMode: 'soft-light', opacity: 0.6}} />
        {winter > 0 ? (
          <AbsoluteFill style={{background: WINTER.tint, mixBlendMode: 'color', opacity: winter * 0.45}} />
        ) : null}
        {darken > 0 ? <AbsoluteFill style={{background: COLORS.background, opacity: darken}} /> : null}
      </div>
    </AbsoluteFill>
  );
};
