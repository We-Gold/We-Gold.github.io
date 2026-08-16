import { theme } from "../dsl/theme";
// Aliased, since the bare name would shadow the global `Math`.
import { Math as KaTeXMath } from "../dsl/Math";

export interface NStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

// Integer stepper with +/- buttons for choosing n (hidden unit count).
export function NStepper({
    value,
    onChange,
    min = 2,
    max = 8,
}: NStepperProps) {
    // Sized up from 28px: this is the one control that changes the shape of
    // the whole network, so the whole cluster — label included — should read
    // as more than a footnote beside the heading.
    const buttonStyle = {
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${theme.color.divider}`,
        background: theme.canvas.background,
        color: theme.color.accent,
        fontFamily: theme.font.body,
        fontSize: 20,
        lineHeight: 1,
        cursor: "pointer",
    } as const;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: theme.font.body,
                    fontSize: 17,
                    color: theme.color.muted,
                }}
            >
                <KaTeXMath fontSize={17} color={theme.color.muted}>
                    n
                </KaTeXMath>
                (hidden units)
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                style={{ ...buttonStyle, opacity: value <= min ? 0.4 : 1 }}
            >
                &minus;
            </button>
            <span
                style={{
                    fontFamily: theme.font.code,
                    fontSize: 22,
                    fontWeight: 600,
                    color: theme.color.ink,
                    minWidth: 24,
                    textAlign: "center",
                }}
            >
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                style={{ ...buttonStyle, opacity: value >= max ? 0.4 : 1 }}
            >
                +
            </button>
        </div>
    );
}
