/**
 * captions.ts — burned-in / toggleable subtitles for "Why Japan Is Losing Millions of People".
 *
 * Text is the FINAL narration, verbatim, split at phrase boundaries.
 * Rules: max 2 lines, ≤ 42 characters per line, lines balanced.
 *
 * Timing is PROVISIONAL: each chunk is placed inside its scene's storyboard frame range
 * (6-frame lead-in/out, 2-frame gap) with duration proportional to its length (min 36 frames).
 * Once voiceover.mp3 is recorded, re-time against the audio (e.g. run Whisper word timestamps
 * and snap each chunk's `from`/`to` to its first/last word) — keep the text unchanged.
 *
 * `from` is inclusive, `to` is exclusive, both absolute frames at 30 fps on the root timeline.
 */

export const CAPTION_FPS = 30;
export const CAPTION_MAX_CHARS_PER_LINE = 42;

export interface Caption {
  /** Storyboard scene number (1–8). */
  scene: number;
  /** Absolute start frame (inclusive). */
  from: number;
  /** Absolute end frame (exclusive). */
  to: number;
  /** 1 or 2 lines. */
  lines: [string] | [string, string];
}

export const SCENE_RANGES: Record<number, { from: number; to: number }> = {
  1: { from: 0, to: 750 },
  2: { from: 750, to: 1800 },
  3: { from: 1800, to: 3300 },
  4: { from: 3300, to: 4500 },
  5: { from: 4500, to: 6300 },
  6: { from: 6300, to: 7800 },
  7: { from: 7800, to: 8550 },
  8: { from: 8550, to: 9000 },
};

export const captions: Caption[] = [
  { scene: 1, from: 6, to: 100, lines: ["Last year, Japan lost", "nearly a million people."] },
  { scene: 1, from: 102, to: 176, lines: ["Not to war. Not to a disaster."] },
  { scene: 1, from: 178, to: 237, lines: ["Not to emigration."] },
  { scene: 1, from: 239, to: 313, lines: ["They simply… weren't replaced."] },
  { scene: 1, from: 315, to: 407, lines: ["In 2025, Japan recorded", "1.59 million deaths,"] },
  { scene: 1, from: 409, to: 475, lines: ["and just 671,000 births."] },
  { scene: 1, from: 477, to: 564, lines: ["That's a city the size of Austin, Texas,"] },
  { scene: 1, from: 566, to: 640, lines: ["disappearing in twelve months."] },
  { scene: 1, from: 642, to: 744, lines: ["And it's been happening for", "nineteen years in a row."] },
  { scene: 2, from: 756, to: 900, lines: ["For most of the 20th century,", "Japan's story was growth."] },
  { scene: 2, from: 902, to: 1026, lines: ["After World War Two,", "the population exploded,"] },
  { scene: 2, from: 1028, to: 1123, lines: ["from around 83 million in 1950"] },
  { scene: 2, from: 1125, to: 1234, lines: ["to over 120 million by the mid-1980s."] },
  { scene: 2, from: 1236, to: 1376, lines: ["Then, in 2008, it peaked at", "about 128 million people."] },
  { scene: 2, from: 1378, to: 1455, lines: ["And it began to fall."] },
  { scene: 2, from: 1457, to: 1550, lines: ["Slowly at first. Then faster."] },
  { scene: 2, from: 1552, to: 1692, lines: ["Today, Japan has already", "lost millions from its peak,"] },
  { scene: 2, from: 1694, to: 1794, lines: ["and the decline is accelerating."] },
  { scene: 3, from: 1806, to: 1915, lines: ["To understand why, we need", "to look at this shape."] },
  { scene: 3, from: 1917, to: 2017, lines: ["This is Japan's population", "pyramid in 1950:"] },
  { scene: 3, from: 2019, to: 2141, lines: ["lots of children at the bottom,", "few old people at the top."] },
  { scene: 3, from: 2143, to: 2206, lines: ["A classic pyramid."] },
  { scene: 3, from: 2208, to: 2278, lines: ["Now watch what happens."] },
  { scene: 3, from: 2280, to: 2376, lines: ["These two bulges are Japan's baby booms,"] },
  { scene: 3, from: 2378, to: 2480, lines: ["2.5 million births a", "year in the late 1940s,"] },
  { scene: 3, from: 2482, to: 2578, lines: ["over 2 million again in the early 1970s."] },
  { scene: 3, from: 2580, to: 2671, lines: ["As they age, they climb up the chart."] },
  { scene: 3, from: 2673, to: 2785, lines: ["But the generations below", "them never replaced them."] },
  { scene: 3, from: 2787, to: 2890, lines: ["Today, the pyramid has", "become something else:"] },
  { scene: 3, from: 2892, to: 2985, lines: ["narrow at the bottom, wide at the top."] },
  { scene: 3, from: 2987, to: 3068, lines: ["By 2070, it looks like an urn."] },
  { scene: 3, from: 3070, to: 3173, lines: ["Nearly four in ten", "Japanese would be over 65."] },
  { scene: 3, from: 3175, to: 3294, lines: ["And a pyramid standing on its", "head is not a stable shape."] },
  { scene: 4, from: 3306, to: 3397, lines: ["Here's the engine of the decline."] },
  { scene: 4, from: 3399, to: 3483, lines: ["Two lines: births and deaths."] },
  { scene: 4, from: 3485, to: 3595, lines: ["In the 1970s, births", "far outnumbered deaths."] },
  { scene: 4, from: 3597, to: 3718, lines: ["Then births started sliding,", "every year since 1975."] },
  { scene: 4, from: 3720, to: 3816, lines: ["They fell below one million in 2016,"] },
  { scene: 4, from: 3818, to: 3897, lines: ["and below 700,000 in 2024."] },
  { scene: 4, from: 3899, to: 4019, lines: ["Meanwhile, as the boomers", "age, deaths keep rising."] },
  { scene: 4, from: 4021, to: 4102, lines: ["In 2007, the lines crossed."] },
  { scene: 4, from: 4104, to: 4215, lines: ["Everything in red is", "Japan's natural decline."] },
  { scene: 4, from: 4217, to: 4367, lines: ["And the government's own forecasters", "didn't see it coming this fast:"] },
  { scene: 4, from: 4369, to: 4494, lines: ["they hadn't expected births", "this low until the 2040s."] },
  { scene: 5, from: 4506, to: 4609, lines: ["So why aren't Japanese", "people having children?"] },
  { scene: 5, from: 4611, to: 4688, lines: ["The key number is this: 2.1."] },
  { scene: 5, from: 4690, to: 4829, lines: ["That's the fertility rate a country", "needs to keep its population stable"] },
  { scene: 5, from: 4831, to: 4896, lines: ["without immigration."] },
  { scene: 5, from: 4898, to: 4977, lines: ["Japan's is 1.14, a record low."] },
  { scene: 5, from: 4979, to: 5051, lines: ["In Tokyo, it's below one."] },
  { scene: 5, from: 5053, to: 5124, lines: ["The reasons are tangled."] },
  { scene: 5, from: 5126, to: 5268, lines: ["Cost: housing, education and raising", "a child in big cities are expensive,"] },
  { scene: 5, from: 5270, to: 5355, lines: ["while wages stagnated for decades."] },
  { scene: 5, from: 5357, to: 5478, lines: ["Work culture: long hours leave", "little room for family life."] },
  { scene: 5, from: 5480, to: 5610, lines: ["Marriage: in Japan, almost all", "children are born within marriage,"] },
  { scene: 5, from: 5612, to: 5713, lines: ["and people are marrying", "later, or not at all."] },
  { scene: 5, from: 5715, to: 5828, lines: ["And gender roles: many women", "still face a hard choice"] },
  { scene: 5, from: 5830, to: 5909, lines: ["between a career and a family,"] },
  { scene: 5, from: 5911, to: 6022, lines: ["because childcare and", "housework fall mostly on them."] },
  { scene: 5, from: 6024, to: 6106, lines: ["None of these alone explains it."] },
  { scene: 5, from: 6108, to: 6202, lines: ["Together, they make having a child feel,"] },
  { scene: 5, from: 6204, to: 6294, lines: ["for many young people, like a luxury."] },
  { scene: 6, from: 6306, to: 6407, lines: ["The consequences are already visible."] },
  { scene: 6, from: 6409, to: 6519, lines: ["In the countryside, villages are emptying."] },
  { scene: 6, from: 6521, to: 6619, lines: ["Schools close for lack of students."] },
  { scene: 6, from: 6621, to: 6760, lines: ["Japan now has around 9 million", "vacant homes, called akiya,"] },
  { scene: 6, from: 6762, to: 6855, lines: ["some offered for almost nothing."] },
  { scene: 6, from: 6857, to: 6937, lines: ["The economy feels it too."] },
  { scene: 6, from: 6939, to: 7053, lines: ["Fewer workers have to", "support more retirees,"] },
  { scene: 6, from: 7055, to: 7172, lines: ["through pensions,", "healthcare and elderly care."] },
  { scene: 6, from: 7174, to: 7272, lines: ["Hospitals, construction, logistics:"] },
  { scene: 6, from: 7274, to: 7377, lines: ["entire sectors struggle to find staff."] },
  { scene: 6, from: 7379, to: 7500, lines: ["In rural areas, shops and", "train lines shut down,"] },
  { scene: 6, from: 7502, to: 7632, lines: ["which pushes more young", "people to move to the cities,"] },
  { scene: 6, from: 7634, to: 7735, lines: ["where fertility is the lowest of all."] },
  { scene: 6, from: 7737, to: 7794, lines: ["It's a loop."] },
  { scene: 7, from: 7806, to: 7885, lines: ["Japan isn't standing still."] },
  { scene: 7, from: 7887, to: 8026, lines: ["The government spends trillions", "of yen a year on family policies:"] },
  { scene: 7, from: 8028, to: 8159, lines: ["child allowances, free childcare,", "support for young couples."] },
  { scene: 7, from: 8161, to: 8257, lines: ["Foreign residents are at record highs."] },
  { scene: 7, from: 8259, to: 8363, lines: ["And Japan leads the", "world in care robotics."] },
  { scene: 7, from: 8365, to: 8469, lines: ["But so far, nothing", "has reversed the trend."] },
  { scene: 7, from: 8471, to: 8544, lines: ["At best, it may slow it."] },
  { scene: 8, from: 8556, to: 8608, lines: ["If current trends continue,"] },
  { scene: 8, from: 8610, to: 8678, lines: ["Japan could fall to around", "87 million people by 2070."] },
  { scene: 8, from: 8680, to: 8755, lines: ["Japan is the first major country", "to face this, but not the last."] },
  { scene: 8, from: 8757, to: 8823, lines: ["South Korea, Italy and", "China are on the same path."] },
  { scene: 8, from: 8825, to: 8888, lines: ["The question isn't", "whether Japan will shrink."] },
  { scene: 8, from: 8890, to: 8945, lines: ["It's whether it can shrink well."] },
  { scene: 8, from: 8947, to: 8994, lines: ["What would you do?"] },
];

/** Caption active at an absolute frame, or null. */
export const captionAt = (frame: number): Caption | null =>
  captions.find((c) => frame >= c.from && frame < c.to) ?? null;

/**
 * Captions for one scene with frames rebased to the scene's start —
 * use inside a <Series.Sequence>, where useCurrentFrame() starts at 0.
 */
export const captionsForScene = (scene: number): Caption[] => {
  const offset = SCENE_RANGES[scene].from;
  return captions
    .filter((c) => c.scene === scene)
    .map((c) => ({ ...c, from: c.from - offset, to: c.to - offset }));
};
