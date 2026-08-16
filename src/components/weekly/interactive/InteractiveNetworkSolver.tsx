import { useState } from "react";
import type { HiddenUnit } from "../../../utils/mlp";
import { theme } from "../dsl/theme";
import { NStepper } from "./NStepper";
import { NetworkSolver } from "./NetworkSolver";

export interface InteractiveNetworkSolverProps {
    initialN?: number;
}

const NEUTRAL_UNIT: HiddenUnit = { w: 0, b: 0 };

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
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%",
                maxWidth: 960,
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
