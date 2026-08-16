import { useEffect, useRef, useState } from "react";
import type { HiddenUnit } from "../../../utils/mlp";
import { theme } from "../dsl/theme";
import { NStepper } from "./NStepper";
import { NetworkSolver } from "./NetworkSolver";

export interface InteractiveNetworkSolverProps {
    initialN?: number;
}

const NEUTRAL_UNIT: HiddenUnit = { w: 0, b: 0 };

// What the side-by-side layout needs before it starts getting clipped: the
// 220px panel column, the fan, and the ~224px output column, plus the gaps
// between them, with a little slack. Below this the solver stacks instead.
const SIDE_BY_SIDE_MIN_WIDTH = 580;

// The page-level React island, owning all mutable state for the solver.
// Changing n only touches the added or removed slots, so stepping n up and
// down mid-experiment doesn't lose existing work.
export function InteractiveNetworkSolver({
    initialN = 2,
}: InteractiveNetworkSolverProps) {
    const [hiddenUnits, setHiddenUnits] = useState<HiddenUnit[]>(() =>
        Array.from({ length: initialN }, () => ({ ...NEUTRAL_UNIT }))
    );
    const [outputWeights, setOutputWeights] = useState<number[]>(() =>
        Array.from({ length: initialN }, () => 1)
    );
    const [outputBias, setOutputBias] = useState(0);

    // Measured rather than taken from a media query: what has to fit is this
    // island's own column, which is narrower than the viewport by the page
    // padding and differs between the article and the dev preview. Starting
    // false keeps the client's first render identical to the server's, and the
    // observer corrects it before paint on anything narrow.
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number | null>(null);
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            // A zero width is the island being measured while hidden, not a
            // container that narrow — latching it would stack everything.
            if (entry.contentRect.width === 0) return;
            setWidth(entry.contentRect.width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const stacked = width !== null && width < SIDE_BY_SIDE_MIN_WIDTH;
    // Stacked, a plot has the whole column instead of a 220px panel, so it
    // grows into it — the curve is what the sliders are for, and at 160px on a
    // phone it's the smallest thing on screen. Capped well short of the column
    // because these plots repeat: at n = 8 every pixel of panel height is paid
    // for eight times in scrolling.
    const stackedPlotWidth = stacked
        ? Math.min(Math.max((width as number) - 40, 160), 280)
        : null;
    const plotSize = stackedPlotWidth
        ? { width: stackedPlotWidth, height: Math.round(stackedPlotWidth * 0.62) }
        : undefined;

    const setN = (n: number) => {
        setHiddenUnits((prev) => {
            if (n <= prev.length) return prev.slice(0, n);
            return [
                ...prev,
                ...Array.from({ length: n - prev.length }, () => ({ ...NEUTRAL_UNIT })),
            ];
        });
        setOutputWeights((prev) => {
            if (n <= prev.length) return prev.slice(0, n);
            return [...prev, ...Array.from({ length: n - prev.length }, () => 1)];
        });
    };

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%",
                maxWidth: 960,
                minWidth: 0,
                fontFamily: theme.font.body,
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <span
                    style={{
                        fontFamily: theme.font.label,
                        fontWeight: 600,
                        fontSize: 20,
                        color: theme.color.ink,
                    }}
                >
                    Solve interactively
                </span>
                <NStepper value={hiddenUnits.length} onChange={setN} />
            </div>
            <div style={{ overflowX: "auto" }}>
                <NetworkSolver
                    hiddenUnits={hiddenUnits}
                    outputWeights={outputWeights}
                    outputBias={outputBias}
                    showInputNode={false}
                    orientation={stacked ? "stacked" : "horizontal"}
                    plotSize={plotSize}
                    // Left to its default the output plot is 1.4x the unit
                    // plots, which only has room when they're 160 wide. Stacked
                    // they already fill the column, so it matches them instead
                    // and buys its emphasis with height.
                    outputPlotSize={
                        stackedPlotWidth
                            ? {
                                  width: stackedPlotWidth,
                                  height: Math.round(stackedPlotWidth * 0.8),
                              }
                            : undefined
                    }
                    stretchConnectors
                    onHiddenUnitChange={(i, unit) =>
                        setHiddenUnits((prev) => prev.map((u, idx) => (idx === i ? unit : u)))
                    }
                    onOutputChange={(weights, bias) => {
                        setOutputWeights(weights);
                        setOutputBias(bias);
                    }}
                />
            </div>
        </div>
    );
}
