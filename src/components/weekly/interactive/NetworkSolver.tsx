import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HiddenUnit } from "../../../utils/mlp";
import { networkOutput } from "../../../utils/mlp";
import { theme } from "../dsl/theme";
import { Math as KaTeXMath } from "../dsl/Math";
import { ConnectorLines } from "./ConnectorLines";
import { FunctionPlot } from "./FunctionPlot";
import { InputNode } from "./InputNode";
import { OutputControls } from "./OutputControls";
import { PerceptronPanel } from "./PerceptronPanel";

// The measurement pass below has to run before paint, or the connector lines
// flash in at the wrong coordinates — so it wants `useLayoutEffect`. But this
// component is mounted with `client:load`, which server-renders it first, and
// React warns that a layout effect can't run on the server.
//
// The warning is about the general pattern, not a live bug here: `connectors`
// starts `null`, so the server emits the no-connectors state and the client's
// first render matches it exactly. The lines appear on the hydration pass.
// Falling back to `useEffect` on the server keeps that behaviour and drops the
// warning; nothing about the effect ran there to begin with.
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface NetworkSolverProps {
    hiddenUnits: HiddenUnit[];
    outputWeights: number[];
    outputBias: number;
    onHiddenUnitChange?: (index: number, unit: HiddenUnit) => void;
    onOutputChange?: (weights: number[], bias: number) => void;
    readOnly?: boolean;
    // "horizontal": panels in a column, fan running right to the output.
    // "vertical": panels in a row, fan running down to the output beneath —
    // which is what fills a portrait canvas, where height is the spare axis.
    // "stacked": panels in a column with the output directly beneath and no
    // fan at all, for a container too narrow to hold two columns side by side.
    // The fan is the one part that can't survive the narrowing — it needs
    // horizontal room to be a fan — but in the editable variant its labels are
    // only v_i, and those sliders are in the output box anyway.
    orientation?: "horizontal" | "vertical" | "stacked";
    domain?: readonly [number, number];
    showInputNode?: boolean;
    panelWidth?: number;
    panelGap?: number;
    plotSize?: { width: number; height: number };
    // Defaults to plotSize scaled up. Override to size the output plot
    // independently, e.g. bigger and square for the Solution export.
    outputPlotSize?: { width: number; height: number };
    connectorLength?: number;
    // The gap between the stack's three parts — panels, fan, output. Defaults
    // to 16, scaled by `textScale` like every other gap here. Lower it when the
    // fan is long enough to read as its own section without the whitespace
    // around it: the length and this gap trade against each other, so dropping
    // one by what you add to the other keeps the composition's total height.
    stackGap?: number;
    // Horizontal only. Lets the fan absorb the row's spare width so the output
    // column sits flush against the container's right edge — what the live
    // island wants, where the container is wider than the composition. A static
    // export is sized to its content and has no spare width to give.
    stretchConnectors?: boolean;
    // The fan's stroke. Defaults to `divider`, the hairline grey that keeps
    // the lines out of the way on the live page, where the sliders are the
    // subject. An export where the fan *is* part of the subject should pass
    // something stronger — `color.guide` is calibrated for exactly this.
    connectorColor?: string;
    // Whether the output bias is drawn beside the plot. Read-only only — the
    // editable variant always shows it, since it's a control. Turn it off
    // when the bias is 0 and says nothing: it costs a line of vertical space
    // and reads as a value worth studying.
    showOutputBias?: boolean;
    // Multiplies every type size in the composition — unit labels, their w/b
    // values, the connector weights, the output bias, and the plots' tick
    // labels — along with the gaps that separate them. One knob rather than a
    // size per role, so the hierarchy between them survives the change.
    //
    // 1 is the live page, where these sizes are read at 100% in a browser.
    // The Solution export needs far more: its sizes land in a 1080px canvas
    // that a feed shows at roughly 0.36x, where the native 11–15px type comes
    // out under 5px. Sizes here are still browser px, so this is not a zoom —
    // the plots keep whatever `plotSize`/`outputPlotSize` say, and a scaled
    // plot's tick labels widen its margins, which eats into the width its
    // panel has left. Re-cut those sizes when you change this.
    textScale?: number;
}

interface Connectors {
    centers: number[];
    outputCenter: number;
    span: number;
}

interface SideOffsets {
    input: number;
    output: number;
}

// The output column's gap at `textScale` 1. Read by the measurement pass as
// well as by the style below, so the two go through `columnGap` rather than
// either one hardcoding it.
const outputColumnGap = 12;

// The composition core shared by the live solver and the static Solution
// export. It doesn't own `n` — that's just `hiddenUnits.length`, driven from
// outside — which is what lets one component serve both.
//
// Panels grow to fit their own content rather than a fixed size, so the panel
// group and output plot are measured after layout (via ResizeObserver, since
// changing n or a value's text width can resize a panel at any point) and the
// connector lines drawn from real coordinates.
//
// The connectors point at the output plot rather than the output controls:
// the plot is what every hidden unit feeds, and the sliders are just knobs,
// so they stack beside it. Each line carries a v_i label so a reader can tell
// which weight belongs to which unit without the boxes being adjacent.
//
// Read-only drops the output box entirely, since a bordered box of sliders
// reads as UI chrome around static numbers. The weights go inline on their
// connector lines instead, and the bias becomes a plain label by the plot.
export function NetworkSolver({
    hiddenUnits,
    outputWeights,
    outputBias,
    onHiddenUnitChange,
    onOutputChange,
    readOnly = false,
    orientation = "horizontal",
    domain = [0, 1],
    showInputNode = true,
    panelWidth = 220,
    panelGap = 16,
    plotSize = { width: 160, height: 100 },
    outputPlotSize,
    connectorLength = 90,
    stackGap: stackGapBase = 16,
    stretchConnectors = false,
    connectorColor = theme.color.divider,
    showOutputBias = true,
    textScale = 1,
}: NetworkSolverProps) {
    const isVertical = orientation === "vertical";
    const isStacked = orientation === "stacked";
    // The gaps travel with the type: at 2x, gaps sized for 13px labels read as
    // the lines having been jammed together.
    const columnGap = outputColumnGap * textScale;
    const stackGap = stackGapBase * textScale;
    const containerRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const panelsGroupRef = useRef<HTMLDivElement>(null);
    const inputNodeRef = useRef<HTMLDivElement>(null);
    const outputControlsRef = useRef<HTMLDivElement>(null);
    const outputColumnRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const [connectors, setConnectors] = useState<Connectors | null>(null);
    // Horizontal only. Centering with `align-items` would center against
    // whichever sibling happens to be tallest, which drifts as the other
    // columns resize, so both sides center against the panel column's
    // measured height instead. The output side aligns on the plot's own
    // center rather than its column's, since the sliders sitting above the
    // plot move the two apart. Vertical needs none of this: `alignItems`
    // centers every child against the container's own width, which is stable.
    const [sideOffsets, setSideOffsets] = useState<SideOffsets>({ input: 0, output: 0 });

    useIsomorphicLayoutEffect(() => {
        const container = containerRef.current;
        const output = outputRef.current;
        const panelsGroup = panelsGroupRef.current;
        if (!container || !output || !panelsGroup) return;
        // Nothing to measure without a fan to aim, and the offsets it would
        // compute are for a two-column layout this one doesn't have.
        if (isStacked) return;

        const measure = () => {
            const containerRect = container.getBoundingClientRect();
            const outputRect = output.getBoundingClientRect();

            // Same measurement either way, just read off the other axis.
            const centerOf = (rect: DOMRect) =>
                isVertical
                    ? rect.left - containerRect.left + rect.width / 2
                    : rect.top - containerRect.top + rect.height / 2;

            // Horizontal span comes from how far the *columns* reach, not from
            // the container's own height. The svg is a flex child sized to the
            // span, so measuring the container would make it hold up the very
            // height it's being measured against: the height could then grow
            // with n but never shrink back when n came down again.
            const reachOf = (el: Element | null) =>
                el ? el.getBoundingClientRect().bottom - containerRect.top : 0;

            setConnectors({
                centers: rowRefs.current
                    .filter((el): el is HTMLDivElement => el !== null)
                    .map((el) => centerOf(el.getBoundingClientRect())),
                outputCenter: centerOf(outputRect),
                span: isVertical
                    ? containerRect.width
                    : Math.max(
                          reachOf(panelsGroup),
                          reachOf(outputColumnRef.current),
                          reachOf(inputNodeRef.current)
                      ),
            });

            if (isVertical) return;

            const panelsHeight = panelsGroup.getBoundingClientRect().height;
            const inputHeight = inputNodeRef.current?.getBoundingClientRect().height ?? 0;
            const controlsHeight = outputControlsRef.current?.getBoundingClientRect().height ?? 0;
            // Column top such that the plot's center, not the column's,
            // lands on the panel column's center.
            const columnTop =
                panelsHeight / 2 - controlsHeight - columnGap - outputRect.height / 2;
            setSideOffsets({
                input: Math.max(0, (panelsHeight - inputHeight) / 2),
                output: Math.max(0, columnTop),
            });
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        rowRefs.current.forEach((el) => el && observer.observe(el));
        observer.observe(output);
        observer.observe(panelsGroup);
        if (outputColumnRef.current) observer.observe(outputColumnRef.current);
        if (outputControlsRef.current) observer.observe(outputControlsRef.current);
        return () => observer.disconnect();
    }, [hiddenUnits.length, readOnly, isVertical, isStacked, columnGap, showOutputBias]);

    const weightLabels = hiddenUnits.map((_, i) =>
        readOnly ? `v_{${i + 1}} = ${outputWeights[i]}` : `v_{${i + 1}}`
    );
    const { width: outputPlotWidth, height: outputPlotHeight } =
        outputPlotSize ?? { width: plotSize.width * 1.4, height: plotSize.height * 1.4 };

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                flexDirection: isVertical || isStacked ? "column" : "row",
                alignItems: isVertical || isStacked ? "center" : "flex-start",
                gap: stackGap,
            }}
        >
            {showInputNode && (
                <div
                    ref={inputNodeRef}
                    style={{ marginTop: isVertical || isStacked ? 0 : sideOffsets.input }}
                >
                    <InputNode domain={domain} />
                </div>
            )}
            <div
                ref={panelsGroupRef}
                style={{
                    display: "flex",
                    flexDirection: isVertical ? "row" : "column",
                    alignItems: isVertical ? "flex-start" : "stretch",
                    gap: panelGap,
                    alignSelf: isStacked ? "stretch" : undefined,
                }}
            >
                {hiddenUnits.map((unit, i) => (
                    <div
                        key={i}
                        ref={(el) => {
                            rowRefs.current[i] = el;
                        }}
                        // Stacked, a panel has the whole column to itself, and
                        // its sliders are the better use of that width than
                        // the empty margin a fixed 220 would leave.
                        style={{ width: isStacked ? "100%" : panelWidth }}
                    >
                        <PerceptronPanel
                            index={i + 1}
                            unit={unit}
                            readOnly={readOnly}
                            domain={domain}
                            plotWidth={plotSize.width}
                            plotHeight={plotSize.height}
                            textScale={textScale}
                            onChange={
                                onHiddenUnitChange
                                    ? (next) => onHiddenUnitChange(i, next)
                                    : undefined
                            }
                        />
                    </div>
                ))}
            </div>
            {connectors && !isStacked && (
                <ConnectorLines
                    centers={connectors.centers}
                    outputCenter={connectors.outputCenter}
                    span={connectors.span}
                    length={connectorLength}
                    orientation={orientation}
                    labels={weightLabels}
                    strokeColor={connectorColor}
                    textScale={textScale}
                    stretch={stretchConnectors}
                />
            )}
            <div
                ref={outputColumnRef}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: columnGap,
                    alignItems: isVertical || isStacked ? "center" : "flex-end",
                    marginTop: isVertical || isStacked ? 0 : sideOffsets.output,
                    // Stacked, the output box is the width of the panels above
                    // it rather than of its own longest slider row, so the two
                    // halves of the network read as one column.
                    alignSelf: isStacked ? "stretch" : undefined,
                }}
            >
                {/* Omitted entirely rather than left empty: an empty child
                    still earns the column's `gap`, so a hidden bias would
                    leave its spacing behind. `controlsHeight` in the
                    measurement pass already tolerates a null ref. */}
                {(!readOnly || showOutputBias) && (
                    <div
                        ref={outputControlsRef}
                        style={{ alignSelf: isStacked ? "stretch" : undefined }}
                    >
                        {readOnly ? (
                            <KaTeXMath fontSize={13 * textScale} color={theme.color.muted}>
                                {`c = ${outputBias}`}
                            </KaTeXMath>
                        ) : (
                            <OutputControls
                                weights={outputWeights}
                                bias={outputBias}
                                readOnly={readOnly}
                                onChange={onOutputChange}
                            />
                        )}
                    </div>
                )}
                <div ref={outputRef}>
                    <FunctionPlot
                        fn={(x) => networkOutput(x, hiddenUnits, outputWeights, outputBias)}
                        domain={domain}
                        range={domain}
                        showAxisTicks
                        rounded
                        strokeColor={theme.color.accent}
                        width={outputPlotWidth}
                        height={outputPlotHeight}
                        tickFontSize={12 * textScale}
                    />
                </div>
            </div>
        </div>
    );
}
