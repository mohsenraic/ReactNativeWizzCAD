import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {COLORS, HOOK, SCENES} from '../config';
import {AnimatedWords} from '../components/AnimatedWords';
import {Background} from '../components/Background';
import {splitWords} from '../lib/text';
import {progress, useSceneTime} from '../lib/time';

/** Scène 1 — Accroche : texte mot par mot, zoom lent */
export const HookScene: React.FC = () => {
  const {t} = useSceneTime();
  const duration = SCENES.hook.end - SCENES.hook.start;
  const zoom = interpolate(t, [0, duration], [1, HOOK.zoomTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const lastWordAt = HOOK.firstWordDelay + (splitWords(HOOK.text).length - 1) * HOOK.wordInterval;
  const line = progress(t, lastWordAt, lastWordAt + 0.7);

  return (
    <AbsoluteFill>
      <Background stars time={t} glowY={860} />
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 140,
        }}
      >
        <AnimatedWords
          text={HOOK.text}
          accentWords={HOOK.accentWords}
          time={t}
          startAt={HOOK.firstWordDelay}
          interval={HOOK.wordInterval}
          fontSize={96}
          fontWeight={900}
          maxWidth={880}
          lineHeight={1.1}
          letterSpacing={-1.5}
        />
        <div
          style={{
            marginTop: 48,
            height: 4,
            width: 260 * line,
            borderRadius: 2,
            background: `linear-gradient(90deg, rgba(245,184,65,0), ${COLORS.accent}, rgba(245,184,65,0))`,
            opacity: line,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
