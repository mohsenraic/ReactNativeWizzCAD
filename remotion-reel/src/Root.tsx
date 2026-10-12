import React from 'react';
import {Composition} from 'remotion';
import {VIDEO} from './config';
import {Reel} from './Reel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={Math.round(VIDEO.durationInSeconds * VIDEO.fps)}
  />
);
