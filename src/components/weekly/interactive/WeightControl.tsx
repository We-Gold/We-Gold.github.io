import { useState, useEffect } from "react";
import { theme } from "../dsl/theme";
import { Math } from "../dsl/Math";

export interface WeightControlProps {
    label: string; // LaTeX, e.g. "w", "v_1", "c"
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

const labelColumnWidth = 20;
const numberInputWidth = 56;

// One labeled slider and numeric-input pair. Editable only: a read-only
// parent swaps it out for plain text rather than disabling it.
export function WeightControl({
    label,
    value,
    onChange,
    min = -10,
    max = 10,
    step = 0.1,
}: WeightControlProps) {
    // Tracked as local text so a partial edit like "-" isn't clobbered by
    // the numeric `value` prop mid-keystroke. Commits on blur or Enter.
    const [text, setText] = useState(String(value));
    useEffect(() => setText(String(value)), [value]);

    // The `min`/`max` attributes below only govern the number input's own
    // spinner and validity — a typed "50" still arrives here — so the commit
    // clamps to the same range the slider enforces. Without it the two halves
    // of the pair disagree: the field reads 50 while the slider, which can't
    // represent it, sits pinned at 10.
    // (`Math` in this file is the KaTeX component, hence the ternaries.)
    const clamp = (v: number) => (v < min ? min : v > max ? max : v);

    const commit = () => {
        const parsed = Number.parseFloat(text);
        if (Number.isFinite(parsed)) {
            const clamped = clamp(parsed);
            setText(String(clamped));
            onChange(clamped);
        } else {
            setText(String(value));
        }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: theme.font.body,
            }}
        >
            {/* An inline <span> ignores `width`, so labels of different
                KaTeX-intrinsic widths would each start the slider at a
                different x. inline-flex makes the width apply. */}
            <span
                style={{
                    display: "inline-flex",
                    justifyContent: "center",
                    width: labelColumnWidth,
                    flexShrink: 0,
                }}
            >
                <Math fontSize={14} color={theme.color.muted}>
                    {label}
                </Math>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number.parseFloat(e.target.value))}
                // `min-width: auto` resolves to a range input's intrinsic
                // width, not 0, so without this the slider refuses to shrink
                // and spills the row past its container.
                style={{ accentColor: theme.color.accent, flex: 1, minWidth: 0 }}
            />
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => e.key === "Enter" && commit()}
                style={{
                    boxSizing: "border-box",
                    width: numberInputWidth,
                    flexShrink: 0,
                    fontFamily: theme.font.code,
                    fontSize: 13,
                    color: theme.color.ink,
                    border: `1px solid ${theme.color.divider}`,
                    borderRadius: 4,
                    padding: "2px 4px",
                }}
            />
        </div>
    );
}
