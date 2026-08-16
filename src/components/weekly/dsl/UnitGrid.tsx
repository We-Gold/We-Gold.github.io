import { theme } from "./theme";

// A unit chart: one cell per observation, so the reader counts rather than
// compares lengths. The complement to `Chart` — bars for magnitudes, a unit
// grid for base rates, class imbalance, and "1 in 100".

export interface UnitGroup {
    count: number;
    color: string;
}

interface UnitGridProps {
    groups: UnitGroup[];
    columns?: number;
    cellSize?: number;
    gap?: number;
    arrangement?: "grouped" | "scattered";
    seed?: number;
}

// A deterministic PRNG (mulberry32). `Math.random` would be wrong here:
// frames get re-captured whenever a title or number is corrected, and a
// re-export has to be pixel-identical to what was already posted.
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function UnitGrid({
    groups,
    columns = 10,
    cellSize = 22,
    gap = 5,
    arrangement = "grouped",
    seed = 1,
}: UnitGridProps) {
    // The total is derived from the groups and never passed in — an API of
    // `total={100} highlight={1}` would put the same fact in two places and
    // let them disagree.
    const cells = groups.flatMap((group) =>
        Array.from({ length: group.count }, () => group.color)
    );

    // `grouped` leaves cells in group order, so the grid reads as a
    // proportion. `scattered` permutes them so a small group reads as
    // incidence instead — needles in a haystack. Same data, different claim.
    if (arrangement === "scattered") {
        const random = mulberry32(seed);
        // Fisher-Yates over positions, not colors, so every group is scattered
        // rather than just the last one.
        const positions = cells.map((_, i) => i);
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        const scattered = new Array<string>(cells.length);
        positions.forEach((position, i) => {
            scattered[position] = cells[i];
        });
        cells.splice(0, cells.length, ...scattered);
    }

    return (
        <div
            style={{
                display: "grid",
                // Explicit pixel tracks rather than `1fr`, so a unit is the
                // same size in every week it appears. The cost is that the
                // grid grows with the count: past roughly 250 cells at these
                // defaults it outgrows the canvas, so drop `cellSize`.
                gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
                gap,
            }}
        >
            {cells.map((color, i) => (
                <div
                    key={i}
                    style={{
                        width: cellSize,
                        height: cellSize,
                        borderRadius: 3,
                        background: color,
                    }}
                />
            ))}
        </div>
    );
}
