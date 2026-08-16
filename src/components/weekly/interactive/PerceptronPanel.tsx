import type { HiddenUnit } from "../../../utils/mlp";
import { perceptron } from "../../../utils/mlp";
import { theme } from "../dsl/theme";
import { Math } from "../dsl/Math";
import { FunctionPlot, formatTick, plotLeftMargin } from "./FunctionPlot";
import { WeightControl } from "./WeightControl";

export interface PerceptronPanelProps {
    index: number;
    unit: HiddenUnit;
    onChange?: (unit: HiddenUnit) => void;
    readOnly?: boolean;
    domain?: readonly [number, number];
    plotWidth?: number;
    plotHeight?: number;
    // Multiplies the type — see the same prop on <NetworkSolver>, which is
    // where it's set. The plot's own size stays under `plotWidth`/`plotHeight`,
    // since a panel's type and its drawing don't grow at the same rate.
    textScale?: number;
}

const plotFn = (unit: HiddenUnit) => (x: number) => perceptron(x, unit);

// One hidden unit's block: label, ReLU-curve plot, and either editable
// controls or plain read-only text. Read-only renders themed text rather
// than disabled inputs, because this block is captured verbatim into a PNG
// and disabled form chrome reads as a broken form, not a diagram.
//
// Both variants stack — label and values above the plot — so a row of panels
// reads as a row of like-shaped blocks. Read-only drops the border, since
// there are no controls for it to group.
export function PerceptronPanel({
    index,
    unit,
    onChange,
    readOnly = false,
    domain = [0, 1],
    plotWidth = 160,
    plotHeight = 100,
    textScale = 1,
}: PerceptronPanelProps) {
    const tickFontSize = 12 * textScale;

    if (readOnly) {
        // The plot's data area starts this far right of the svg's own left
        // edge — the y ticks and their labels live in that gutter. The text
        // above is indented to match, so the stack aligns on the box the
        // reader sees rather than on the axis marks hanging off it.
        const textIndent = plotLeftMargin({
            showAxisTicks: true,
            rounded: true,
            tickFontSize,
            yTickLabels: [domain[0], domain[1]].map(formatTick),
        });

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6 * textScale,
                    padding: 10,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6 * textScale,
                        paddingLeft: textIndent,
                    }}
                >
                    <Math fontSize={15 * textScale} color={theme.color.ink}>
                        {`h_{${index}}`}
                    </Math>
                    <Math fontSize={13 * textScale} color={theme.color.muted}>
                        {`w = ${unit.w}`}
                    </Math>
                    <Math fontSize={13 * textScale} color={theme.color.muted}>
                        {`b = ${unit.b}`}
                    </Math>
                </div>
                <FunctionPlot
                    fn={plotFn(unit)}
                    domain={domain}
                    range={domain}
                    showAxisTicks
                    rounded
                    width={plotWidth}
                    height={plotHeight}
                    // The plot's ticks are type too, and left at their default
                    // they'd be the one thing in the panel that didn't grow.
                    // Note this widens the plot's own margins, so a scaled
                    // panel needs a smaller `plotWidth` to fit the same box.
                    tickFontSize={tickFontSize}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                border: `1px solid ${theme.color.divider}`,
                borderRadius: 8,
                padding: 10,
            }}
        >
            <Math fontSize={15} color={theme.color.ink}>
                {`h_{${index}}`}
            </Math>
            <FunctionPlot
                fn={plotFn(unit)}
                domain={domain}
                range={domain}
                showAxisTicks
                rounded
                width={plotWidth}
                height={plotHeight}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <WeightControl label="w" value={unit.w} onChange={(w) => onChange?.({ ...unit, w })} />
                <WeightControl label="b" value={unit.b} onChange={(b) => onChange?.({ ...unit, b })} />
            </div>
        </div>
    );
}
