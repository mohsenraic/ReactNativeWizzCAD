import React from 'react';
import {Sequence} from 'remotion';
import {FPS} from '../lib/constants';
import {Shot, TRANSITION_SECONDS} from '../lib/timeline';
import {PhotoScene} from './PhotoScene';

const T = TRANSITION_SECONDS;

/** Chains the photo shots with their transitions, synced to the voice */
export const PhotoTrack: React.FC<{shots: Shot[]; time: number}> = ({shots, time}) => (
  <>
    {shots.map((s, i) => {
      const isFirst = i === 0;
      const isLast = i === shots.length - 1;
      // the first shot (the reveal) is already fully there under the map's iris
      const from = s.start - (isFirst ? 0.05 : T / 2);
      const to = s.end + (isLast ? 0.4 : T / 2);
      if (time < from || time > to) return null;
      const enterP = isFirst ? 1 : (time - from) / T;
      const exitP = isLast ? 0 : (time - (s.end - T / 2)) / T;
      return (
        <Sequence key={i} from={Math.floor(from * FPS)} durationInFrames={Math.ceil((to - from) * FPS)} layout="none">
          <PhotoScene
            src={s.src}
            focus={s.focus}
            motion={s.motion}
            progress={(time - from) / (to - from)}
            enterP={Math.min(1, Math.max(0, enterP))}
            enterType={s.enter}
            exitP={Math.min(1, Math.max(0, exitP))}
            exitType={s.exit}
          />
        </Sequence>
      );
    })}
  </>
);
