import type { HiddenUnit } from "../../../utils/mlp";

// The fixed target: peaks at 1 (x = 0, 0.5, 1) and valleys at 0 (x = 0.25,
// 0.75), across four equal segments of [0,1]. Matches `_work/problem.py`.
export function targetW(x: number): number {
    if (x <= 0.25) return 1 - x / 0.25;
    if (x <= 0.5) return (x - 0.25) / 0.25;
    if (x <= 0.75) return 1 - (x - 0.5) / 0.25;
    return (x - 0.75) / 0.25;
}

// The notebook's worked n=4 solution (`_work/problem.py`), as data. Each
// unit's switch-on point (x = -b/w) is pinned to a breakpoint: units 1-2 at
// x=0.25, unit 3 at x=0.5, unit 4 at x=0.75. Two units sharing the first
// breakpoint is not a typo — that's what forms the initial swing.
export const SOLUTION_HIDDEN_UNITS: HiddenUnit[] = [
    { w: -4, b: 1 },
    { w: 4, b: -1 },
    { w: 8, b: -4 },
    { w: 8, b: -6 },
];
export const SOLUTION_OUTPUT_WEIGHTS = [1, 1, -1, 1];
export const SOLUTION_OUTPUT_BIAS = 0;
