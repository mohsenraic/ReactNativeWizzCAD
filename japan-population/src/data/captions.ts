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
  { scene: 1, from: 112, to: 185, lines: ["Not to war. Not to a disaster."] },
  { scene: 1, from: 194, to: 244, lines: ["Not to emigration."] },
  { scene: 1, from: 244, to: 313, lines: ["They simply… weren't replaced."] },
  { scene: 1, from: 322, to: 437, lines: ["In 2025, Japan recorded", "1.59 million deaths,"] },
  { scene: 1, from: 446, to: 522, lines: ["and just 671,000 births."] },
  { scene: 1, from: 531, to: 595, lines: ["That's a city the size of Austin, Texas,"] },
  { scene: 1, from: 595, to: 641, lines: ["disappearing in twelve months."] },
  { scene: 1, from: 650, to: 719, lines: ["And it's been happening for", "nineteen years in a row."] },
  { scene: 2, from: 761, to: 846, lines: ["For most of the 20th century,", "Japan's story was growth."] },
  { scene: 2, from: 855, to: 928, lines: ["After World War Two,", "the population exploded,"] },
  { scene: 2, from: 933, to: 1000, lines: ["from around 83 million in 1950"] },
  { scene: 2, from: 1000, to: 1084, lines: ["to over 120 million by the mid-1980s."] },
  { scene: 2, from: 1093, to: 1215, lines: ["Then, in 2008, it peaked at", "about 128 million people."] },
  { scene: 2, from: 1224, to: 1252, lines: ["And it began to fall."] },
  { scene: 2, from: 1261, to: 1341, lines: ["Slowly at first. Then faster."] },
  { scene: 2, from: 1350, to: 1433, lines: ["Today, Japan has already", "lost millions from its peak,"] },
  { scene: 2, from: 1443, to: 1500, lines: ["and the decline is accelerating."] },
  { scene: 3, from: 1542, to: 1603, lines: ["To understand why, we need", "to look at this shape."] },
  { scene: 3, from: 1612, to: 1701, lines: ["This is Japan's population", "pyramid in 1950:"] },
  { scene: 3, from: 1710, to: 1805, lines: ["lots of children at the bottom,", "few old people at the top."] },
  { scene: 3, from: 1809, to: 1838, lines: ["A classic pyramid."] },
  { scene: 3, from: 1847, to: 1877, lines: ["Now watch what happens."] },
  { scene: 3, from: 1889, to: 1967, lines: ["These two bulges are Japan's baby booms,"] },
  { scene: 3, from: 1967, to: 2052, lines: ["2.5 million births a", "year in the late 1940s,"] },
  { scene: 3, from: 2057, to: 2132, lines: ["over 2 million again in the early 1970s."] },
  { scene: 3, from: 2141, to: 2204, lines: ["As they age, they climb up the chart."] },
  { scene: 3, from: 2213, to: 2294, lines: ["But the generations below", "them never replaced them."] },
  { scene: 3, from: 2303, to: 2366, lines: ["Today, the pyramid has", "become something else:"] },
  { scene: 3, from: 2375, to: 2443, lines: ["narrow at the bottom, wide at the top."] },
  { scene: 3, from: 2452, to: 2509, lines: ["By 2070, it looks like an urn."] },
  { scene: 3, from: 2518, to: 2607, lines: ["Nearly four in ten", "Japanese would be over 65."] },
  { scene: 3, from: 2616, to: 2707, lines: ["And a pyramid standing on its", "head is not a stable shape."] },
  { scene: 4, from: 2749, to: 2792, lines: ["Here's the engine of the decline."] },
  { scene: 4, from: 2802, to: 2871, lines: ["Two lines: births and deaths."] },
  { scene: 4, from: 2880, to: 2961, lines: ["In the 1970s, births", "far outnumbered deaths."] },
  { scene: 4, from: 2970, to: 3089, lines: ["Then births started sliding,", "every year since 1975."] },
  { scene: 4, from: 3098, to: 3159, lines: ["They fell below one million in 2016,"] },
  { scene: 4, from: 3169, to: 3244, lines: ["and below 700,000 in 2024."] },
  { scene: 4, from: 3253, to: 3337, lines: ["Meanwhile, as the boomers", "age, deaths keep rising."] },
  { scene: 4, from: 3346, to: 3409, lines: ["In 2007, the lines crossed."] },
  { scene: 4, from: 3418, to: 3509, lines: ["Everything in red is", "Japan's natural decline."] },
  { scene: 4, from: 3518, to: 3603, lines: ["And the government's own forecasters", "didn't see it coming this fast:"] },
  { scene: 4, from: 3612, to: 3689, lines: ["they hadn't expected births", "this low until the 2040s."] },
  { scene: 5, from: 3731, to: 3800, lines: ["So why aren't Japanese", "people having children?"] },
  { scene: 5, from: 3810, to: 3897, lines: ["The key number is this: 2.1."] },
  { scene: 5, from: 3906, to: 4000, lines: ["That's the fertility rate a country", "needs to keep its population stable"] },
  { scene: 5, from: 4000, to: 4036, lines: ["without immigration."] },
  { scene: 5, from: 4045, to: 4151, lines: ["Japan's is 1.14, a record low."] },
  { scene: 5, from: 4160, to: 4209, lines: ["In Tokyo, it's below one."] },
  { scene: 5, from: 4218, to: 4254, lines: ["The reasons are tangled."] },
  { scene: 5, from: 4263, to: 4396, lines: ["Cost: housing, education and raising", "a child in big cities are expensive,"] },
  { scene: 5, from: 4403, to: 4462, lines: ["while wages stagnated for decades."] },
  { scene: 5, from: 4471, to: 4578, lines: ["Work culture: long hours leave", "little room for family life."] },
  { scene: 5, from: 4587, to: 4703, lines: ["Marriage: in Japan, almost all", "children are born within marriage,"] },
  { scene: 5, from: 4704, to: 4774, lines: ["and people are marrying", "later, or not at all."] },
  { scene: 5, from: 4783, to: 4884, lines: ["And gender roles: many women", "still face a hard choice"] },
  { scene: 5, from: 4884, to: 4924, lines: ["between a career and a family,"] },
  { scene: 5, from: 4924, to: 5011, lines: ["because childcare and", "housework fall mostly on them."] },
  { scene: 5, from: 5020, to: 5070, lines: ["None of these alone explains it."] },
  { scene: 5, from: 5079, to: 5147, lines: ["Together, they make having a child feel,"] },
  { scene: 5, from: 5147, to: 5208, lines: ["for many young people, like a luxury."] },
  { scene: 6, from: 5250, to: 5301, lines: ["The consequences are already visible."] },
  { scene: 6, from: 5310, to: 5379, lines: ["In the countryside, villages are emptying."] },
  { scene: 6, from: 5388, to: 5443, lines: ["Schools close for lack of students."] },
  { scene: 6, from: 5452, to: 5582, lines: ["Japan now has around 9 million", "vacant homes, called akiya,"] },
  { scene: 6, from: 5582, to: 5630, lines: ["some offered for almost nothing."] },
  { scene: 6, from: 5639, to: 5702, lines: ["The economy feels it too."] },
  { scene: 6, from: 5702, to: 5782, lines: ["Fewer workers have to", "support more retirees,"] },
  { scene: 6, from: 5783, to: 5852, lines: ["through pensions,", "healthcare and elderly care."] },
  { scene: 6, from: 5861, to: 5925, lines: ["Hospitals, construction, logistics:"] },
  { scene: 6, from: 5931, to: 5996, lines: ["entire sectors struggle to find staff."] },
  { scene: 6, from: 6005, to: 6091, lines: ["In rural areas, shops and", "train lines shut down,"] },
  { scene: 6, from: 6102, to: 6175, lines: ["which pushes more young", "people to move to the cities,"] },
  { scene: 6, from: 6180, to: 6232, lines: ["where fertility is the lowest of all."] },
  { scene: 6, from: 6241, to: 6260, lines: ["It's a loop."] },
  { scene: 7, from: 6302, to: 6349, lines: ["Japan isn't standing still."] },
  { scene: 7, from: 6358, to: 6452, lines: ["The government spends trillions", "of yen a year on family policies:"] },
  { scene: 7, from: 6461, to: 6578, lines: ["child allowances, free childcare,", "support for young couples."] },
  { scene: 7, from: 6587, to: 6638, lines: ["Foreign residents are at record highs."] },
  { scene: 7, from: 6647, to: 6720, lines: ["And Japan leads the", "world in care robotics."] },
  { scene: 7, from: 6729, to: 6808, lines: ["But so far, nothing", "has reversed the trend."] },
  { scene: 7, from: 6808, to: 6892, lines: ["At best, it may slow it."] },
  { scene: 8, from: 6933, to: 6978, lines: ["If current trends continue,"] },
  { scene: 8, from: 6989, to: 7100, lines: ["Japan could fall to around", "87 million people by 2070."] },
  { scene: 8, from: 7109, to: 7212, lines: ["Japan is the first major country", "to face this, but not the last."] },
  { scene: 8, from: 7221, to: 7321, lines: ["South Korea, Italy and", "China are on the same path."] },
  { scene: 8, from: 7330, to: 7391, lines: ["The question isn't", "whether Japan will shrink."] },
  { scene: 8, from: 7400, to: 7456, lines: ["It's whether it can shrink well."] },
  { scene: 8, from: 7465, to: 7485, lines: ["What would you do?"] },
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
