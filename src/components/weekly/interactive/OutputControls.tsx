import { theme } from "../dsl/theme";
import { Math } from "../dsl/Math";
import { WeightControl } from "./WeightControl";

export interface OutputControlsProps {
    weights: number[];
    bias: number;
    onChange?: (weights: number[], bias: number) => void;
    readOnly?: boolean;
}

// The output "neuron": one weight per hidden unit plus a bias, combined
// linearly. No ReLU, which is why there's no activation curve here.
export function OutputControls({
    weights,
    bias,
    onChange,
    readOnly = false,
}: OutputControlsProps) {
    const setWeight = (i: number, v: number) => {
        const next = weights.slice();
        next[i] = v;
        onChange?.(next, bias);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                border: `2px solid ${theme.color.accent}`,
                borderRadius: 8,
                padding: 10,
                minWidth: 150,
            }}
        >
            <span
                style={{
                    fontFamily: theme.font.label,
                    fontWeight: 600,
                    fontSize: 15,
                    color: theme.color.ink,
                }}
            >
                Output perceptron
            </span>
            {readOnly ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {weights.map((v, i) => (
                        <Math key={i} fontSize={13} color={theme.color.muted}>
                            {`v_{${i + 1}} = ${v}`}
                        </Math>
                    ))}
                    <Math fontSize={13} color={theme.color.muted}>
                        {`c = ${bias}`}
                    </Math>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {weights.map((v, i) => (
                        <WeightControl
                            key={i}
                            label={`v_{${i + 1}}`}
                            value={v}
                            onChange={(next) => setWeight(i, next)}
                        />
                    ))}
                    <WeightControl
                        label="c"
                        value={bias}
                        onChange={(c) => onChange?.(weights, c)}
                    />
                </div>
            )}
        </div>
    );
}
