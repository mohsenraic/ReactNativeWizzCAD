/**
 * captions.ts — toggleable subtitles for "Why Japan Is Losing Millions of People".
 *
 * Text is the FINAL narration, verbatim, split at phrase boundaries.
 * Rules: max 2 lines, ≤ 42 characters per line, lines balanced.
 *
 * Timing is PROVISIONAL: each chunk sits inside its scene's narration window from timeline.ts
 * (6-frame lead-in, 2-frame gaps, min 36 frames, duration ∝ length). Scene 8 captions end before
 * the 10 s end screen. Once voiceover.mp3 exists, re-time against the audio (e.g. Whisper word
 * timestamps → snap each chunk's from/to to its first/last word); keep the text unchanged.
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
  { scene: 1, from: 6, to: 100, lines: ["Last year, Japan lost", "nearly a million people."] },
  { scene: 1, from: 102, to: 176, lines: ["Not to war. Not to a disaster."] },
  { scene: 1, from: 178, to: 237, lines: ["Not to emigration."] },
  { scene: 1, from: 239, to: 313, lines: ["They simply… weren't replaced."] },
  { scene: 1, from: 315, to: 407, lines: ["In 2025, Japan recorded", "1.59 million deaths,"] },
  { scene: 1, from: 409, to: 475, lines: ["and just 671,000 births."] },
  { scene: 1, from: 477, to: 564, lines: ["That's a city the size of Austin, Texas,"] },
  { scene: 1, from: 566, to: 640, lines: ["disappearing in twelve months."] },
  { scene: 1, from: 642, to: 744, lines: ["And it's been happening for", "nineteen years in a row."] },
  { scene: 2, from: 756, to: 877, lines: ["For most of the 20th century,", "Japan's story was growth."] },
  { scene: 2, from: 879, to: 984, lines: ["After World War Two,", "the population exploded,"] },
  { scene: 2, from: 986, to: 1068, lines: ["from around 83 million in 1950"] },
  { scene: 2, from: 1070, to: 1163, lines: ["to over 120 million by the mid-1980s."] },
  { scene: 2, from: 1165, to: 1283, lines: ["Then, in 2008, it peaked at", "about 128 million people."] },
  { scene: 2, from: 1285, to: 1353, lines: ["And it began to fall."] },
  { scene: 2, from: 1355, to: 1436, lines: ["Slowly at first. Then faster."] },
  { scene: 2, from: 1438, to: 1556, lines: ["Today, Japan has already", "lost millions from its peak,"] },
  { scene: 2, from: 1558, to: 1644, lines: ["and the decline is accelerating."] },
  { scene: 3, from: 1656, to: 1765, lines: ["To understand why, we need", "to look at this shape."] },
  { scene: 3, from: 1767, to: 1867, lines: ["This is Japan's population", "pyramid in 1950:"] },
  { scene: 3, from: 1869, to: 1991, lines: ["lots of children at the bottom,", "few old people at the top."] },
  { scene: 3, from: 1993, to: 2056, lines: ["A classic pyramid."] },
  { scene: 3, from: 2058, to: 2128, lines: ["Now watch what happens."] },
  { scene: 3, from: 2130, to: 2226, lines: ["These two bulges are Japan's baby booms,"] },
  { scene: 3, from: 2228, to: 2330, lines: ["2.5 million births a", "year in the late 1940s,"] },
  { scene: 3, from: 2332, to: 2428, lines: ["over 2 million again in the early 1970s."] },
  { scene: 3, from: 2430, to: 2521, lines: ["As they age, they climb up the chart."] },
  { scene: 3, from: 2523, to: 2635, lines: ["But the generations below", "them never replaced them."] },
  { scene: 3, from: 2637, to: 2740, lines: ["Today, the pyramid has", "become something else:"] },
  { scene: 3, from: 2742, to: 2835, lines: ["narrow at the bottom, wide at the top."] },
  { scene: 3, from: 2837, to: 2918, lines: ["By 2070, it looks like an urn."] },
  { scene: 3, from: 2920, to: 3023, lines: ["Nearly four in ten", "Japanese would be over 65."] },
  { scene: 3, from: 3025, to: 3144, lines: ["And a pyramid standing on its", "head is not a stable shape."] },
  { scene: 4, from: 3156, to: 3236, lines: ["Here's the engine of the decline."] },
  { scene: 4, from: 3238, to: 3313, lines: ["Two lines: births and deaths."] },
  { scene: 4, from: 3315, to: 3410, lines: ["In the 1970s, births", "far outnumbered deaths."] },
  { scene: 4, from: 3412, to: 3517, lines: ["Then births started sliding,", "every year since 1975."] },
  { scene: 4, from: 3519, to: 3603, lines: ["They fell below one million in 2016,"] },
  { scene: 4, from: 3605, to: 3676, lines: ["and below 700,000 in 2024."] },
  { scene: 4, from: 3678, to: 3781, lines: ["Meanwhile, as the boomers", "age, deaths keep rising."] },
  { scene: 4, from: 3783, to: 3855, lines: ["In 2007, the lines crossed."] },
  { scene: 4, from: 3857, to: 3954, lines: ["Everything in red is", "Japan's natural decline."] },
  { scene: 4, from: 3956, to: 4084, lines: ["And the government's own forecasters", "didn't see it coming this fast:"] },
  { scene: 4, from: 4086, to: 4194, lines: ["they hadn't expected births", "this low until the 2040s."] },
  { scene: 5, from: 4206, to: 4309, lines: ["So why aren't Japanese", "people having children?"] },
  { scene: 5, from: 4311, to: 4388, lines: ["The key number is this: 2.1."] },
  { scene: 5, from: 4390, to: 4529, lines: ["That's the fertility rate a country", "needs to keep its population stable"] },
  { scene: 5, from: 4531, to: 4596, lines: ["without immigration."] },
  { scene: 5, from: 4598, to: 4677, lines: ["Japan's is 1.14, a record low."] },
  { scene: 5, from: 4679, to: 4751, lines: ["In Tokyo, it's below one."] },
  { scene: 5, from: 4753, to: 4824, lines: ["The reasons are tangled."] },
  { scene: 5, from: 4826, to: 4968, lines: ["Cost: housing, education and raising", "a child in big cities are expensive,"] },
  { scene: 5, from: 4970, to: 5055, lines: ["while wages stagnated for decades."] },
  { scene: 5, from: 5057, to: 5178, lines: ["Work culture: long hours leave", "little room for family life."] },
  { scene: 5, from: 5180, to: 5310, lines: ["Marriage: in Japan, almost all", "children are born within marriage,"] },
  { scene: 5, from: 5312, to: 5413, lines: ["and people are marrying", "later, or not at all."] },
  { scene: 5, from: 5415, to: 5528, lines: ["And gender roles: many women", "still face a hard choice"] },
  { scene: 5, from: 5530, to: 5609, lines: ["between a career and a family,"] },
  { scene: 5, from: 5611, to: 5722, lines: ["because childcare and", "housework fall mostly on them."] },
  { scene: 5, from: 5724, to: 5806, lines: ["None of these alone explains it."] },
  { scene: 5, from: 5808, to: 5902, lines: ["Together, they make having a child feel,"] },
  { scene: 5, from: 5904, to: 5994, lines: ["for many young people, like a luxury."] },
  { scene: 6, from: 6006, to: 6097, lines: ["The consequences are already visible."] },
  { scene: 6, from: 6099, to: 6198, lines: ["In the countryside, villages are emptying."] },
  { scene: 6, from: 6200, to: 6288, lines: ["Schools close for lack of students."] },
  { scene: 6, from: 6290, to: 6412, lines: ["Japan now has around 9 million", "vacant homes, called akiya,"] },
  { scene: 6, from: 6414, to: 6498, lines: ["some offered for almost nothing."] },
  { scene: 6, from: 6500, to: 6573, lines: ["The economy feels it too."] },
  { scene: 6, from: 6575, to: 6677, lines: ["Fewer workers have to", "support more retirees,"] },
  { scene: 6, from: 6679, to: 6784, lines: ["through pensions,", "healthcare and elderly care."] },
  { scene: 6, from: 6786, to: 6874, lines: ["Hospitals, construction, logistics:"] },
  { scene: 6, from: 6876, to: 6969, lines: ["entire sectors struggle to find staff."] },
  { scene: 6, from: 6971, to: 7079, lines: ["In rural areas, shops and", "train lines shut down,"] },
  { scene: 6, from: 7081, to: 7196, lines: ["which pushes more young", "people to move to the cities,"] },
  { scene: 6, from: 7198, to: 7289, lines: ["where fertility is the lowest of all."] },
  { scene: 6, from: 7291, to: 7344, lines: ["It's a loop."] },
  { scene: 7, from: 7356, to: 7435, lines: ["Japan isn't standing still."] },
  { scene: 7, from: 7437, to: 7576, lines: ["The government spends trillions", "of yen a year on family policies:"] },
  { scene: 7, from: 7578, to: 7709, lines: ["child allowances, free childcare,", "support for young couples."] },
  { scene: 7, from: 7711, to: 7807, lines: ["Foreign residents are at record highs."] },
  { scene: 7, from: 7809, to: 7913, lines: ["And Japan leads the", "world in care robotics."] },
  { scene: 7, from: 7915, to: 8019, lines: ["But so far, nothing", "has reversed the trend."] },
  { scene: 7, from: 8021, to: 8094, lines: ["At best, it may slow it."] },
  { scene: 8, from: 8106, to: 8173, lines: ["If current trends continue,"] },
  { scene: 8, from: 8175, to: 8272, lines: ["Japan could fall to around", "87 million people by 2070."] },
  { scene: 8, from: 8274, to: 8383, lines: ["Japan is the first major country", "to face this, but not the last."] },
  { scene: 8, from: 8385, to: 8478, lines: ["South Korea, Italy and", "China are on the same path."] },
  { scene: 8, from: 8480, to: 8567, lines: ["The question isn't", "whether Japan will shrink."] },
  { scene: 8, from: 8569, to: 8642, lines: ["It's whether it can shrink well."] },
  { scene: 8, from: 8644, to: 8700, lines: ["What would you do?"] },
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
