import { useId } from "react";
import { samplePoints } from "../../../utils/mlp";
import { theme } from "../dsl/theme";

export type PlotBorder = "full" | "axes" | "none";

export interface FunctionPlotProps {
    fn: (x: number) => number;
    domain?: readonly [number, number];
    range?: readonly [number, number];
    width?: number;
    height?: number;
    showAxisTicks?: boolean;
    // How many equal intervals to divide each axis into — 1 (the default) is
    // endpoints only, 4 puts ticks at 0, ¼, ½, ¾, 1. Per-axis, because the two
    // rarely want the same treatment: an x axis is a domain the reader is
    // being asked to locate a feature along, a y axis is usually just a scale.
    tickCount?: { x?: number; y?: number };
    // Whether the intermediate ticks get labels or stay bare marks. Bare marks
    // give the eye something to measure against without adding four more
    // numbers to read — usually what you want once `tickCount` is above 2.
    tickLabels?: "all" | "ends";
    strokeColor?: string;
    sampleCount?: number;
    // "full": all four sides. "axes": left/bottom/right only. "none": no
    // border at all, just the tick marks and labels.
    border?: PlotBorder;
    rounded?: boolean;
    cornerRadius?: number;
    // Gap between the plotted data area and the border box. Only matters
    // when `rounded`, where without it a corner cuts across the curve.
    // Defaults to `cornerRadius + 2` when rounded, 0 otherwise.
    padding?: number;
    // Defaults to a size that suits the live page. Export call sites should
    // pass `theme.font.size.caption` — see the note there.
    tickFontSize?: number;
    // Fill the container instead of rendering at exactly `width`x`height`,
    // which then describe only the coordinate space and the aspect ratio.
    // Everything scales together, tick labels included, so a plot handed a
    // bigger pane gets bigger type without anyone re-tuning it.
    fluid?: boolean;
}

const tickProtrusion = 8; // how far a tick mark pokes past the border box
const labelGap = 6; // gap between a tick mark's outer end and its label
// Intermediate marks are shorter than the endpoint ones, so an axis with five
// ticks still reads as "an axis from 0 to 1" rather than as a ruler.
const minorTickProtrusion = 5;
// Rough advance width of a digit as a fraction of the font size. Only used to
// size margins so labels aren't clipped; measuring real text would mean a DOM
// round-trip, and these plots have to render identically in a single paint.
const digitWidthRatio = 0.55;

// `count` equal intervals across [min, max], so count + 1 values including
// both ends. Rounded, because 0.1 + 0.2 lands at 0.30000000000000004 and that
// reaches the label.
function tickValues(min: number, max: number, count: number): number[] {
    const n = Math.max(1, Math.round(count));
    return Array.from({ length: n + 1 }, (_, i) => {
        const v = min + ((max - min) * i) / n;
        return Number(v.toFixed(6));
    });
}

// "0", "1", "0.25" — never "0.2500" or "0.30000000000000004".
export function formatTick(value: number): string {
    return String(Number(value.toFixed(4)));
}

// Rough advance width of a label, estimated rather than measured — see
// `digitWidthRatio`.
const labelWidth = (text: string, tickFontSize: number) =>
    text.length * tickFontSize * digitWidthRatio;

// The inset FunctionPlot leaves left of its data area for the y tick marks and
// their labels. `<FunctionPlot>` uses it for its own margin, and it's exported
// because a caller stacking text *above* a plot needs the same number: the
// plot's box edge is this far right of the svg's edge, so text set flush to
// the svg reads as hanging off the drawing rather than aligned to it.
//
// `yTickLabels` is what the axis will actually print. Pass the formatted
// strings, since a two-character label like "-1" is wider than the font-size
// floor and pushes the margin out.
export function plotLeftMargin({
    showAxisTicks = false,
    rounded = false,
    cornerRadius = 6,
    padding,
    tickFontSize = 12,
    yTickLabels = [],
}: {
    showAxisTicks?: boolean;
    rounded?: boolean;
    cornerRadius?: number;
    padding?: number;
    tickFontSize?: number;
    yTickLabels?: string[];
}): number {
    const boxPad = padding ?? (rounded ? cornerRadius + 2 : 0);
    if (!showAxisTicks) return boxPad;
    const widest = Math.max(0, ...yTickLabels.map((t) => labelWidth(t, tickFontSize)));
    return boxPad + tickProtrusion + labelGap + Math.max(tickFontSize, widest);
}

// The SVG line-plot primitive behind every plot on the page. Pure and
// presentational, so it renders identically in the live solver and the
// single-paint DSL export.
export function FunctionPlot({
    fn,
    domain = [0, 1],
    range,
    width = 160,
    height = 100,
    showAxisTicks = false,
    tickCount,
    tickLabels = "all",
    strokeColor = theme.color.accent,
    sampleCount = 500,
    border = "full",
    rounded = false,
    cornerRadius = 6,
    padding,
    tickFontSize = 12,
    fluid = false,
}: FunctionPlotProps) {
    const clipId = useId();
    // Margins and label baselines are all measured off cap-height, so it has
    // to track the font size rather than sit at a constant.
    const labelCapHeight = Math.round(tickFontSize * 0.72);
    const points = samplePoints(fn, domain, sampleCount);

    let [yMin, yMax] = range ?? [Infinity, -Infinity];
    if (!range) {
        for (const { y } of points) {
            if (y < yMin) yMin = y;
            if (y > yMax) yMax = y;
        }
        if (yMin === yMax) {
            yMin -= 1;
            yMax += 1;
        }
        const pad = (yMax - yMin) * 0.1;
        yMin -= pad;
        yMax += pad;
    }

    const [xMin, xMax] = domain;
    const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const scaleY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    const path = points
        .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x).toFixed(2)},${scaleY(p.y).toFixed(2)}`)
        .join(" ");

    const r = rounded ? cornerRadius : 0;
    // The data area never moves; the border box is drawn `boxPad` outside
    // it, so a rounded corner has room to curve without slicing the plot.
    const boxPad = padding ?? (rounded ? cornerRadius + 2 : 0);

    // Ticks live entirely outside the border box, starting at the box edge
    // rather than the data edge — otherwise they'd be drawn through the
    // box's interior whenever there's padding.
    const tickStart = boxPad;
    const tickReach = boxPad + tickProtrusion;

    // Tick positions, in data units. The endpoints are always drawn; the
    // interior ones only exist when `tickCount` asks for them.
    const xTicks = tickValues(xMin, xMax, tickCount?.x ?? 1);
    const yTicks = tickValues(yMin, yMax, tickCount?.y ?? 1);
    const isEnd = (i: number, ticks: number[]) => i === 0 || i === ticks.length - 1;
    const isLabelled = (i: number, ticks: number[]) =>
        tickLabels === "all" || isEnd(i, ticks);

    // Widest label on each axis, estimated rather than measured — see
    // `digitWidthRatio`. The y labels sit left of the box and are right-
    // aligned, so the left margin has to clear the widest of them (that part
    // lives in `plotLeftMargin` above, which callers also read); only the
    // final x label overhangs the right edge, by half its width.
    const yTickLabelText = yTicks
        .filter((_, i) => isLabelled(i, yTicks))
        .map((v) => formatTick(v));
    const lastXLabel = isLabelled(xTicks.length - 1, xTicks)
        ? labelWidth(formatTick(xTicks[xTicks.length - 1]), tickFontSize)
        : 0;

    // Margins have to clear the labels themselves: the top label's ascender
    // rises above its baseline, and the right-hand label is centered on its
    // tick so half its width hangs past the edge. A margin sized only for
    // boxPad would clip both, and boxPad is 0 on a borderless plot.
    // The `tickFontSize` floor is the pre-existing single-digit allowance,
    // kept so a default plot's geometry is byte-identical to what it was
    // before multi-character labels were possible.
    const marginLeft = plotLeftMargin({
        showAxisTicks,
        rounded,
        cornerRadius,
        padding,
        tickFontSize,
        yTickLabels: yTickLabelText,
    });
    const marginRight = showAxisTicks
        ? Math.max(boxPad, labelCapHeight, lastXLabel / 2)
        : boxPad;
    const marginTop = showAxisTicks ? Math.max(boxPad, labelCapHeight) : boxPad;
    const marginBottom = showAxisTicks
        ? tickReach + labelGap + labelCapHeight + Math.round(labelCapHeight / 2)
        : boxPad;

    const svgWidth = width + marginLeft + marginRight;
    const svgHeight = height + marginTop + marginBottom;

    const boxX0 = -boxPad + 0.5;
    const boxY0 = -boxPad + 0.5;
    const boxX1 = width + boxPad - 0.5;
    const boxY1 = height + boxPad - 0.5;

    const tickStyle = {
        // Inherited, not named: the same plot renders inside an <ImageFrame>
        // (serif) and inside the live solver (sans), and its tick labels
        // should follow whichever it's in.
        fontFamily: "inherit",
        fontSize: tickFontSize,
        fill: theme.color.muted,
    } as const;

    return (
        <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            {...(fluid
                ? { style: { width: "100%", height: "100%", display: "block" } }
                : { width: svgWidth, height: svgHeight, style: { flexShrink: 0 } })}
        >
            <g transform={`translate(${marginLeft}, ${marginTop})`}>
                <defs>
                    {/* Clips to the data area, not the padded border box —
                        otherwise a value outside the plotted range rides
                        through the padding and crosses a rounded corner. */}
                    <clipPath id={clipId}>
                        <rect x={0} y={0} width={width} height={height} />
                    </clipPath>
                </defs>
                {border === "full" &&
                    (r > 0 ? (
                        <rect
                            x={boxX0}
                            y={boxY0}
                            width={boxX1 - boxX0}
                            height={boxY1 - boxY0}
                            rx={r}
                            ry={r}
                            fill="none"
                            stroke={theme.color.divider}
                        />
                    ) : (
                        <rect
                            x={boxX0}
                            y={boxY0}
                            width={boxX1 - boxX0}
                            height={boxY1 - boxY0}
                            fill="none"
                            stroke={theme.color.divider}
                        />
                    ))}
                {border === "axes" &&
                    (r > 0 ? (
                        <path
                            d={`M${boxX0},${boxY0} L${boxX0},${boxY1 - r} Q${boxX0},${boxY1} ${boxX0 + r},${boxY1} L${boxX1 - r},${boxY1} Q${boxX1},${boxY1} ${boxX1},${boxY1 - r} L${boxX1},${boxY0}`}
                            fill="none"
                            stroke={theme.color.divider}
                        />
                    ) : (
                        <path
                            d={`M${boxX0},${boxY0} L${boxX0},${boxY1} L${boxX1},${boxY1} L${boxX1},${boxY0}`}
                            fill="none"
                            stroke={theme.color.divider}
                        />
                    ))}
                <path
                    d={path}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={2.5}
                    clipPath={`url(#${clipId})`}
                />
                {showAxisTicks && (
                    <>
                        {/* x axis: marks below the box, labels below those.
                            Every label sits at its own tick's x, and the two
                            endpoints keep the full-length mark. */}
                        {xTicks.map((value, i) => {
                            const x = scaleX(value);
                            const reach =
                                boxPad +
                                (isEnd(i, xTicks) ? tickProtrusion : minorTickProtrusion);
                            return (
                                <g key={`x-${value}`}>
                                    <line
                                        x1={x}
                                        y1={height + tickStart}
                                        x2={x}
                                        y2={height + reach}
                                        stroke={theme.color.muted}
                                    />
                                    {isLabelled(i, xTicks) && (
                                        <text
                                            {...tickStyle}
                                            x={x}
                                            y={height + tickReach + labelGap + labelCapHeight}
                                            textAnchor="middle"
                                        >
                                            {formatTick(value)}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                        {/* y axis: marks left of the box, labels right-aligned
                            outside those, each centred on its own tick. */}
                        {yTicks.map((value, i) => {
                            const y = scaleY(value);
                            const reach =
                                boxPad +
                                (isEnd(i, yTicks) ? tickProtrusion : minorTickProtrusion);
                            return (
                                <g key={`y-${value}`}>
                                    <line
                                        x1={-tickStart}
                                        y1={y}
                                        x2={-reach}
                                        y2={y}
                                        stroke={theme.color.muted}
                                    />
                                    {isLabelled(i, yTicks) && (
                                        <text
                                            {...tickStyle}
                                            x={-(tickReach + labelGap)}
                                            y={y + labelCapHeight / 2}
                                            textAnchor="end"
                                        >
                                            {formatTick(value)}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </>
                )}
            </g>
        </svg>
    );
}
