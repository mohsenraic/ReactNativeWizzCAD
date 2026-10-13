/**
 * captions.ts — toggleable subtitles for "Why Japan Is Losing Millions of People".
 *
 * Text is the FINAL narration, verbatim, split at phrase boundaries.
 * Rules: max 2 lines, ≤ 42 characters per line, lines balanced.
 *
 * Timing comes from the recorded voiceover: word timestamps from offline speech recognition
 * (Vosk small-en-us), aligned to this exact script, then placed on the scene timeline
 * (0.4 s lead-in per scene). Every visual cue reads these frames via cue(), so the animation
 * follows the voice. Re-run the alignment if the narration is re-recorded; keep the text unchanged.
 *
 * `from` inclusive, `to` exclusive — absolute frames at 30 fps on the root timeline.
 */
import { SCENES, sceneById } from '../timeline';

export const CAPTION_MAX_CHARS_PER_LINE = 42;

export interface Caption {
  /** Scene number (1–8). */
  scene: number;
  /** Absolute start frame (inclusive). */
  from: number;
  /** Absolute end frame (exclusive). */
  to: number;
  /** 1 or 2 lines. */
  lines: [string] | [string, string];
}

export const captions: Caption[] = [
  { scene: 1, from: 12, to: 103, lines: ["Last year, Japan lost", "nearly a million people."] },
  { scene: 1, from: 120, to: 193, lines: ["Not to war. Not to a disaster."] },
  { scene: 1, from: 207, to: 257, lines: ["Not to emigration."] },
  { scene: 1, from: 257, to: 326, lines: ["They simply… weren't replaced."] },
  { scene: 1, from: 355, to: 470, lines: ["In 2025, Japan recorded", "1.59 million deaths,"] },
  { scene: 1, from: 482, to: 558, lines: ["and just 671,000 births."] },
  { scene: 1, from: 582, to: 646, lines: ["That's a city the size of Austin, Texas,"] },
  { scene: 1, from: 646, to: 692, lines: ["disappearing in twelve months."] },
  { scene: 1, from: 710, to: 779, lines: ["And it's been happening for", "nineteen years in a row."] },
  { scene: 2, from: 861, to: 946, lines: ["For most of the 20th century,", "Japan's story was growth."] },
  { scene: 2, from: 966, to: 1039, lines: ["After World War Two,", "the population exploded,"] },
  { scene: 2, from: 1044, to: 1111, lines: ["from around 83 million in 1950"] },
  { scene: 2, from: 1111, to: 1195, lines: ["to over 120 million by the mid-1980s."] },
  { scene: 2, from: 1215, to: 1337, lines: ["Then, in 2008, it peaked at", "about 128 million people."] },
  { scene: 2, from: 1358, to: 1386, lines: ["And it began to fall."] },
  { scene: 2, from: 1409, to: 1489, lines: ["Slowly at first. Then faster."] },
  { scene: 2, from: 1508, to: 1591, lines: ["Today, Japan has already", "lost millions from its peak,"] },
  { scene: 2, from: 1601, to: 1658, lines: ["and the decline is accelerating."] },
  { scene: 3, from: 1743, to: 1804, lines: ["To understand why, we need", "to look at this shape."] },
  { scene: 3, from: 1818, to: 1907, lines: ["This is Japan's population", "pyramid in 1950:"] },
  { scene: 3, from: 1922, to: 2017, lines: ["lots of children at the bottom,", "few old people at the top."] },
  { scene: 3, from: 2021, to: 2050, lines: ["A classic pyramid."] },
  { scene: 3, from: 2067, to: 2097, lines: ["Now watch what happens."] },
  { scene: 3, from: 2114, to: 2192, lines: ["These two bulges are Japan's baby booms,"] },
  { scene: 3, from: 2192, to: 2277, lines: ["2.5 million births a", "year in the late 1940s,"] },
  { scene: 3, from: 2282, to: 2357, lines: ["over 2 million again in the early 1970s."] },
  { scene: 3, from: 2383, to: 2446, lines: ["As they age, they climb up the chart."] },
  { scene: 3, from: 2466, to: 2547, lines: ["But the generations below", "them never replaced them."] },
  { scene: 3, from: 2567, to: 2630, lines: ["Today, the pyramid has", "become something else:"] },
  { scene: 3, from: 2644, to: 2712, lines: ["narrow at the bottom, wide at the top."] },
  { scene: 3, from: 2731, to: 2788, lines: ["By 2070, it looks like an urn."] },
  { scene: 3, from: 2807, to: 2896, lines: ["Nearly four in ten", "Japanese would be over 65."] },
  { scene: 3, from: 2915, to: 3006, lines: ["And a pyramid standing on its", "head is not a stable shape."] },
  { scene: 4, from: 3137, to: 3180, lines: ["Here's the engine of the decline."] },
  { scene: 4, from: 3195, to: 3264, lines: ["Two lines: births and deaths."] },
  { scene: 4, from: 3285, to: 3366, lines: ["In the 1970s, births", "far outnumbered deaths."] },
  { scene: 4, from: 3382, to: 3501, lines: ["Then births started sliding,", "every year since 1975."] },
  { scene: 4, from: 3521, to: 3582, lines: ["They fell below one million in 2016,"] },
  { scene: 4, from: 3592, to: 3667, lines: ["and below 700,000 in 2024."] },
  { scene: 4, from: 3690, to: 3774, lines: ["Meanwhile, as the boomers", "age, deaths keep rising."] },
  { scene: 4, from: 3792, to: 3855, lines: ["In 2007, the lines crossed."] },
  { scene: 4, from: 3873, to: 3964, lines: ["Everything in red is", "Japan's natural decline."] },
  { scene: 4, from: 3987, to: 4072, lines: ["And the government's own forecasters", "didn't see it coming this fast:"] },
  { scene: 4, from: 4088, to: 4165, lines: ["they hadn't expected births", "this low until the 2040s."] },
  { scene: 5, from: 4272, to: 4341, lines: ["So why aren't Japanese", "people having children?"] },
  { scene: 5, from: 4357, to: 4444, lines: ["The key number is this: 2.1."] },
  { scene: 5, from: 4462, to: 4556, lines: ["That's the fertility rate a country", "needs to keep its population stable"] },
  { scene: 5, from: 4556, to: 4592, lines: ["without immigration."] },
  { scene: 5, from: 4621, to: 4727, lines: ["Japan's is 1.14, a record low."] },
  { scene: 5, from: 4740, to: 4789, lines: ["In Tokyo, it's below one."] },
  { scene: 5, from: 4821, to: 4857, lines: ["The reasons are tangled."] },
  { scene: 5, from: 4884, to: 5017, lines: ["Cost: housing, education and raising", "a child in big cities are expensive,"] },
  { scene: 5, from: 5024, to: 5083, lines: ["while wages stagnated for decades."] },
  { scene: 5, from: 5119, to: 5226, lines: ["Work culture: long hours leave", "little room for family life."] },
  { scene: 5, from: 5256, to: 5372, lines: ["Marriage: in Japan, almost all", "children are born within marriage,"] },
  { scene: 5, from: 5373, to: 5443, lines: ["and people are marrying", "later, or not at all."] },
  { scene: 5, from: 5484, to: 5585, lines: ["And gender roles: many women", "still face a hard choice"] },
  { scene: 5, from: 5585, to: 5625, lines: ["between a career and a family,"] },
  { scene: 5, from: 5625, to: 5712, lines: ["because childcare and", "housework fall mostly on them."] },
  { scene: 5, from: 5747, to: 5797, lines: ["None of these alone explains it."] },
  { scene: 5, from: 5815, to: 5883, lines: ["Together, they make having a child feel,"] },
  { scene: 5, from: 5883, to: 5944, lines: ["for many young people, like a luxury."] },
  { scene: 6, from: 6115, to: 6166, lines: ["The consequences are already visible."] },
  { scene: 6, from: 6187, to: 6256, lines: ["In the countryside, villages are emptying."] },
  { scene: 6, from: 6268, to: 6323, lines: ["Schools close for lack of students."] },
  { scene: 6, from: 6343, to: 6473, lines: ["Japan now has around 9 million", "vacant homes, called akiya,"] },
  { scene: 6, from: 6473, to: 6521, lines: ["some offered for almost nothing."] },
  { scene: 6, from: 6553, to: 6616, lines: ["The economy feels it too."] },
  { scene: 6, from: 6616, to: 6696, lines: ["Fewer workers have to", "support more retirees,"] },
  { scene: 6, from: 6697, to: 6766, lines: ["through pensions,", "healthcare and elderly care."] },
  { scene: 6, from: 6788, to: 6852, lines: ["Hospitals, construction, logistics:"] },
  { scene: 6, from: 6858, to: 6923, lines: ["entire sectors struggle to find staff."] },
  { scene: 6, from: 6954, to: 7040, lines: ["In rural areas, shops and", "train lines shut down,"] },
  { scene: 6, from: 7051, to: 7124, lines: ["which pushes more young", "people to move to the cities,"] },
  { scene: 6, from: 7129, to: 7181, lines: ["where fertility is the lowest of all."] },
  { scene: 6, from: 7205, to: 7224, lines: ["It's a loop."] },
  { scene: 7, from: 7340, to: 7387, lines: ["Japan isn't standing still."] },
  { scene: 7, from: 7403, to: 7497, lines: ["The government spends trillions", "of yen a year on family policies:"] },
  { scene: 7, from: 7511, to: 7628, lines: ["child allowances, free childcare,", "support for young couples."] },
  { scene: 7, from: 7647, to: 7698, lines: ["Foreign residents are at record highs."] },
  { scene: 7, from: 7722, to: 7795, lines: ["And Japan leads the", "world in care robotics."] },
  { scene: 7, from: 7820, to: 7899, lines: ["But so far, nothing", "has reversed the trend."] },
  { scene: 7, from: 7899, to: 7983, lines: ["At best, it may slow it."] },
  { scene: 8, from: 8051, to: 8096, lines: ["If current trends continue,"] },
  { scene: 8, from: 8107, to: 8218, lines: ["Japan could fall to around", "87 million people by 2070."] },
  { scene: 8, from: 8249, to: 8352, lines: ["Japan is the first major country", "to face this, but not the last."] },
  { scene: 8, from: 8376, to: 8476, lines: ["South Korea, Italy and", "China are on the same path."] },
  { scene: 8, from: 8505, to: 8566, lines: ["The question isn't", "whether Japan will shrink."] },
  { scene: 8, from: 8581, to: 8637, lines: ["It's whether it can shrink well."] },
  { scene: 8, from: 8677, to: 8697, lines: ["What would you do?"] },
];

/** Caption active at an absolute frame, or null. */
export const captionAt = (frame: number): Caption | null =>
  captions.find((c) => frame >= c.from && frame < c.to) ?? null;

/**
 * Captions for one scene with frames rebased to the scene's start —
 * use inside a <Series.Sequence>, where useCurrentFrame() starts at 0.
 */
export const captionsForScene = (scene: number): Caption[] => {
  const offset = sceneById(scene).from;
  return captions
    .filter((c) => c.scene === scene)
    .map((c) => ({ ...c, from: c.from - offset, to: c.to - offset }));
};

/** Dev check: every caption inside its scene, ordered, within the line limit. Returns problems. */
export const validateCaptions = (): string[] => {
  const problems: string[] = [];
  let prevTo = -1;
  for (const c of captions) {
    const s = SCENES.find((x) => x.id === c.scene);
    if (!s) problems.push(`unknown scene ${c.scene}`);
    else if (c.from < s.from || c.to > s.from + s.durationInFrames) problems.push(`out of scene: ${c.lines[0]}`);
    if (c.from < prevTo || c.to <= c.from) problems.push(`order/overlap: ${c.lines[0]}`);
    for (const l of c.lines) if (l.length > CAPTION_MAX_CHARS_PER_LINE) problems.push(`too long: ${l}`);
    prevTo = c.to;
  }
  return problems;
};
