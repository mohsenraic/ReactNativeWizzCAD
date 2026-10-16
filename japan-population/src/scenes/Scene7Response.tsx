/**
 * Scene 7 — What's being done (4:05–4:30). Policy brief, immigration report and robotics article,
 * each with one highlighted counting number; the red stamp "TREND: NOT REVERSED" thuds across them.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigCounter, DocumentCard, HandDrawnAnnotation, SourceTag, Stamp, useStampShake } from '../components';
import { foreignResidents, policySpending, robotics } from '../data/japan';
import { COLORS, FONTS } from '../../../shared/theme';
import { sceneById } from '../timeline';
import { SceneShell, cue } from './helpers';

export const SCENE_7_DURATION = sceneById(7).durationInFrames;

const S = 7;

const KeyNumber: React.FC<{ children: React.ReactNode; caption: string }> = ({ children, caption }) => (
  <div style={{ margin: '22px 0 6px' }}>
    <span style={{ display: 'inline-block', background: COLORS.highlighter, padding: '2px 10px' }}>{children}</span>
    <div style={{ fontFamily: FONTS.mono, fontSize: 18, letterSpacing: 1.5, color: COLORS.greyDark, marginTop: 12 }}>{caption}</div>
  </div>
);

export const Scene7Response: React.FC = () => {
  const frame = useCurrentFrame();
  const policyAt = cue(S, 'trillions of yen');
  const allowancesAt = cue(S, 'child allowances');
  const immigrationAt = cue(S, 'Foreign residents');
  const roboticsAt = cue(S, 'care robotics');
  const reversedAt = cue(S, 'nothing has reversed', 18);
  const slowAt = cue(S, 'At best');
  const shake = useStampShake(reversedAt, 12);

  return (
    <SceneShell
      id={S}
      paper="light"
      enter="whip"
      exit="whip"
      overlay={<SourceTag dataset={policySpending} also={[foreignResidents, robotics]} at={policyAt} />}
    >
      <AbsoluteFill style={{ transform: frame >= reversedAt ? shake : undefined }}>
        <DocumentCard variant="brief" kicker="Policy brief" title="Children’s Future Strategy" paragraphs={['Child allowances, free childcare, support for young couples.']} highlightAt={allowancesAt} fillerPerParagraph={1} enterAt={policyAt} from="bottom" width={520} rotation={-2.5} style={{ left: 110, top: 170 }} seed="s7-policy">
          <KeyNumber caption={policySpending.data.displaySuffix}>
            <BigCounter to={policySpending.data.displayValue} decimals={1} prefix="¥" at={policyAt + 14} duration={40} fontSize={100} color={COLORS.ink} />
          </KeyNumber>
        </DocumentCard>
        <DocumentCard variant="report" meta={foreignResidents.data.asOf.toUpperCase()} kicker="Immigration report" title="Foreign residents at a record high" paragraphs={[]} fillerPerParagraph={0} enterAt={immigrationAt} from="bottom" width={540} rotation={1.5} style={{ left: 690, top: 210 }} seed="s7-immig">
          <KeyNumber caption="FOREIGN RESIDENTS · 4TH RECORD IN A ROW">
            <BigCounter to={foreignResidents.data.count} at={immigrationAt + 12} duration={50} fontSize={84} color={COLORS.ink} />
          </KeyNumber>
        </DocumentCard>
        <DocumentCard variant="article" kicker="Technology" title="Built in Japan: the robot makers" paragraphs={['Care robots are one of the industry’s big bets.']} fillerPerParagraph={1} enterAt={roboticsAt} from="bottom" width={520} rotation={-1.5} style={{ left: 1290, top: 150 }} seed="s7-robot">
          <KeyNumber caption={robotics.data.label}>
            <BigCounter to={robotics.data.displayValue} suffix="%" at={roboticsAt + 12} duration={40} fontSize={100} color={COLORS.ink} />
          </KeyNumber>
        </DocumentCard>
        <Stamp text="TREND: NOT REVERSED" at={reversedAt} fontSize={136} rotation={-8} style={{ left: 250, top: 400 }} />
      </AbsoluteFill>
      <HandDrawnAnnotation shape={{ type: 'underline', x: 760, y: 1000, width: 400 }} at={slowAt + 6} duration={12} color="ink" seed="s7-slow" label={{ text: 'at best, it may slow it', x: 960, y: 975, size: 56 }} />
    </SceneShell>
  );
};
