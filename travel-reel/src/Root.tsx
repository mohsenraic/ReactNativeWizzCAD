import {getAudioDurationInSeconds} from '@remotion/media-utils';
import React from 'react';
import {Composition, staticFile} from 'remotion';
import {DATA} from './data';
import type {ReelProps, Word} from './data/types';
import {FPS, HEIGHT, WIDTH} from './lib/constants';
import {Reel} from './Reel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id={DATA.compositionId}
    component={Reel}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={30 * FPS}
    defaultProps={{audioDuration: 30, words: null} as ReelProps}
    calculateMetadata={async ({props}) => {
      // Duration = voiceover + end card tail
      const audioDuration = await getAudioDurationInSeconds(staticFile(DATA.audio.voiceover));
      // Per-word timestamps (optional): drive subtitles and scene sync
      let words: Word[] | null = null;
      try {
        const res = await fetch(staticFile(DATA.audio.words));
        if (res.ok) words = (await res.json()).words as Word[];
      } catch {
        words = null;
      }
      return {
        durationInFrames: Math.ceil((audioDuration + DATA.tailSeconds) * FPS),
        props: {...props, audioDuration, words},
      };
    }}
  />
);
