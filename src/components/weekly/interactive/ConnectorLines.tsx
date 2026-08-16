import { useEffect, useRef, useState } from "react";
import { theme } from "../dsl/theme";
import { KatexSvgStyle } from "../dsl/KatexSvgStyle";
import { Math } from "../dsl/Math";

export interface ConnectorLinesProps {
    // Each panel's center along the cross axis, and the output plot's center
    // on that same axis: y for a horizontal fan, x for a vertical one.
    centers: number[];
    outputCenter: number;
    // Cross-axis extent of the svg — the container's height when horizontal,
    // its width when vertical.
    span: number;
    // How far the fan runs along its own axis. With `stretch`, this is only
    // the floor — the drawn length is whatever flexbox hands the svg.
    length?: number;
    // Horizontal only. Lets the fan grow into the row's spare width so the
    // output column can sit flush against the container's right edge with the
    // lines still arriving at it. The svg measures its own laid-out width and
    // redraws, rather than the parent guessing a length — a guess would have
    // to know the width the guess itself produces.
    stretch?: boolean;
    orientation?: "horizontal" | "vertical";
    strokeColor?: string;
    // LaTeX label per line, rendered near each curve's midpoint. Just "v_1"
    // in the live solver; "v_1 = 1.5" read-only, where there's no output box
    // for the value to live in.
    labels?: string[];
    // Multiplies the label type and the box reserved for it — see the same
    // prop on <NetworkSolver>.
    textScale?: number;
}

const labelWidth = 52;
const labelHeight = 16;

// The fan of lines from each perceptron panel to the output node. Takes
// measured centers rather than a guessed pitch, since panels grow to fit
// their own content and have no fixed size to derive endpoints from.
export function ConnectorLines({
    centers,
    outputCenter,
    span,
    length = 90,
    orientation = "horizontal",
    strokeColor = theme.color.divider,
    labels,
    textScale = 1,
    stretch = false,
}: ConnectorLinesProps) {
    const isVertical = orientation === "vertical";
    const svgRef = useRef<SVGSVGElement>(null);
    const [stretchedLength, setStretchedLength] = useState<number | null>(null);
    const canStretch = stretch && !isVertical;

    // Feeding the measured width back into the `width` attribute settles in one
    // pass: growing the flex base by X takes X out of the row's free space, so
    // the item's final size doesn't move.
    useEffect(() => {
        const svg = svgRef.current;
        if (!canStretch || !svg) return;
        const measure = () => setStretchedLength(svg.getBoundingClientRect().width);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(svg);
        return () => observer.disconnect();
    }, [canStretch]);

    const runLength = canStretch && stretchedLength ? stretchedLength : length;
    const half = runLength / 2;
    const boxWidth = labelWidth * textScale;
    const boxHeight = labelHeight * textScale;

    return (
        <svg
            ref={svgRef}
            width={isVertical ? span : runLength}
            height={isVertical ? length : span}
            style={{
                // The floor keeps the fan readable once wide `n` overflows the
                // row and there is no free space left to grow into.
                flex: canStretch ? `1 0 ${length}px` : "0 0 auto",
                overflow: "visible",
            }}
        >
            {/* The labels below are KaTeX in a foreignObject, so the exported
                Solution image needs the rules carried inside the svg. */}
            {labels && <KatexSvgStyle />}
            {centers.map((c, i) => {
                const mid = (c + outputCenter) / 2;
                // Two symmetric S-curves: the control points pull along the
                // fan's own axis, so lines leave each panel and arrive at the
                // output square-on rather than at an angle.
                //
                // The pull is capped rather than always half the run: on a
                // stretched fan, control points at the midpoint turn the S into
                // a long slack curve. Capped, the bend keeps the shape it has
                // at the default length and the extra run coasts between the
                // two ends. Unstretched, `length / 2` *is* `half`, so every
                // existing composition draws exactly the curve it did before.
                // (`Math` is the KaTeX component here, not the global.)
                const pull = half < length / 2 ? half : length / 2;
                const d = isVertical
                    ? `M${c},0 C${c},${pull} ${outputCenter},${length - pull} ${outputCenter},${length}`
                    : `M0,${c} C${pull},${c} ${runLength - pull},${outputCenter} ${runLength},${outputCenter}`;
                return (
                    <g key={i}>
                        {/* Weight travels with the type: a 1.5px hairline that
                            reads as a line beside 11px labels reads as a
                            scratch beside 26px ones. */}
                        <path
                            d={d}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={1.5 * textScale}
                        />
                        {labels?.[i] && (
                            <foreignObject
                                x={isVertical ? mid - boxWidth / 2 : half - boxWidth / 2}
                                y={isVertical ? half - boxHeight / 2 : mid - boxHeight}
                                width={boxWidth}
                                height={boxHeight}
                                style={{ overflow: "visible" }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                        height: "100%",
                                        // Opaque, so a label sitting on its
                                        // own curve stays readable.
                                        background: theme.canvas.background,
                                    }}
                                >
                                    <Math fontSize={11 * textScale} color={theme.color.muted}>
                                        {labels[i]}
                                    </Math>
                                </div>
                            </foreignObject>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
