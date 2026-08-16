export interface HiddenUnit {
    w: number;
    b: number;
}

export const relu = (x: number): number => Math.max(0, x);

// A single hidden unit's activation: relu(w*x + b).
export function perceptron(x: number, unit: HiddenUnit): number {
    return relu(unit.w * x + unit.b);
}

// Full network output for one input: sum_i(v_i * h_i(x)) + c.
// `outputWeights[i]` must line up 1:1 with `hiddenUnits[i]`.
export function networkOutput(
    x: number,
    hiddenUnits: HiddenUnit[],
    outputWeights: number[],
    outputBias: number
): number {
    return (
        hiddenUnits.reduce(
            (sum, unit, i) => sum + outputWeights[i] * perceptron(x, unit),
            0
        ) + outputBias
    );
}

// Evenly sampled (x, y) pairs of `fn` over `domain`, for building an SVG path.
export function samplePoints(
    fn: (x: number) => number,
    domain: readonly [number, number],
    count = 100
): { x: number; y: number }[] {
    const [start, end] = domain;
    const step = (end - start) / (count - 1);
    return Array.from({ length: count }, (_, i) => {
        const x = start + i * step;
        return { x, y: fn(x) };
    });
}
