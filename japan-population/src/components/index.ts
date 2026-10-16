/**
 * Components available to the Japan scenes: the shared library (../../../shared/components) plus the
 * Japan-only components in this folder.
 */
export { AnimatedLineChart, drawSpan, makeChartScales, revealX, seriesTip } from '../../../shared/components/AnimatedLineChart';
export type { ChartArea, ChartMarker, ChartMilestone, ChartProps, ChartScales, ChartSeries } from '../../../shared/components/AnimatedLineChart';
export { PopulationPyramid, pyramidGeometry, pyramidStateAt, boomIndexAt } from './PopulationPyramid';
export type { PyramidKeyframe, PyramidProps } from './PopulationPyramid';
export { BigCounter, useCountValue } from '../../../shared/components/BigCounter';
export { JapanMap, villagePoints, prefectureCentroid, PREFECTURE_IDS } from './JapanMap';
export { WorldMap } from '../../../shared/components/WorldMap';
export type { WorldDot } from '../../../shared/components/WorldMap';
export { IconCard, pinOffset, ICON_CARD_WIDTH } from '../../../shared/components/IconCard';
export { AnimatedIcon } from '../../../shared/components/icons';
export type { IconName } from '../../../shared/components/icons';
export { Stamp, useStampShake } from '../../../shared/components/Stamp';
export { LoopDiagram } from '../../../shared/components/LoopDiagram';
export { KineticTitle } from '../../../shared/components/KineticTitle';
export { PaperBackground } from '../../../shared/components/PaperBackground';
export type { PaperVariant } from '../../../shared/components/PaperBackground';
export { CameraRig, ParallaxLayer, useCamera } from '../../../shared/components/CameraRig';
export { Highlighter } from '../../../shared/components/Highlighter';
export { HandDrawnAnnotation } from '../../../shared/components/HandDrawnAnnotation';
export type { AnnotationShape, AnnotationLabel } from '../../../shared/components/HandDrawnAnnotation';
export { Cutout, useEnter } from '../../../shared/components/Cutout';
export type { EnterFrom } from '../../../shared/components/Cutout';
export { DocumentCard } from '../../../shared/components/DocumentCard';
export type { DocumentVariant, Paragraph, Segment } from '../../../shared/components/DocumentCard';
export { ChapterCard } from '../../../shared/components/ChapterCard';
export { SourceTag } from '../../../shared/components/SourceTag';
export { RedString } from '../../../shared/components/RedString';
export { SceneTransition } from '../../../shared/components/SceneTransition';
export type { TransitionType } from '../../../shared/components/SceneTransition';
export { Captions } from './Captions';
