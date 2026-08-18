import { FunctionPlot } from "../../../components/weekly/interactive/FunctionPlot";
import { theme } from "../../../components/weekly/dsl/theme";
import { KatexSvgStyle } from "../../../components/weekly/dsl/KatexSvgStyle";
import { Math } from "../../../components/weekly/dsl/Math";
import { ScaledSvg } from "../../../components/weekly/dsl/ScaledSvg";
import { targetW } from "./_solution";

// One-off visuals for this week's Problem image, kept local per
// docs/weekly/extending-the-dsl.md.

export interface WGridPlotProps {
    // Passed straight to <FunctionPlot>. `{ x: 4 }` is the useful setting
    // here: the W's breakpoints sit at 0, ¼, ½, ¾, 1, so four intervals put a
    // tick on every vertex and the reader can find them by eye instead of
    // estimating. Off by default — the Problem image asks how *many* units
    // there are, and marking every breakpoint hands over part of that.
    tickCount?: { x?: number; y?: number };
    tickLabels?: "all" | "ends";
    // In the plot's own coordinate space (the svg is 560 wide), not CSS px, so
    // it scales with the pane like everything else in the frame.
    tickFontSize?: number;
}

// The target W curve, in the same teal as every other plotted curve on the
// page so Problem and Solution read as one visual language.
export function WGridPlot({
    tickCount,
    tickLabels,
    tickFontSize = theme.font.size.caption,
}: WGridPlotProps = {}) {
    return (
        <FunctionPlot
            fn={targetW}
            domain={[0, 1]}
            range={[0, 1]}
            tickCount={tickCount}
            tickLabels={tickLabels}
            // `fluid`, so these set the aspect and the coordinate space, not
            // the size — the plot fills whatever pane it's given. Square, so
            // the W isn't stretched horizontally; the pane is the tight axis
            // vertically, so the plot ends up narrower than the pane and the
            // svg's own `preserveAspectRatio` centres it in the slack.
            fluid
            width={560}
            height={560}
            showAxisTicks
            border="none"
            strokeColor={theme.color.accent}
            tickFontSize={tickFontSize}
        />
    );
}

// The one topology both question diagrams draw: input, two hidden units, an
// ellipsis standing in for the rest, output. Shared as a single object rather
// than duplicated per diagram because the two images sit side by side in the
// poster and any drift between them reads as a difference in the *network*
// rather than in what each question is asking about it.
// Hoisted out of `net` below only so the rest can be derived from them — an
// object literal can't reference its own keys.
const inputX = 40;
// Leaves room for the v/c labels, which sit to the right of the node.
const outputX = 372;
const radius = 26;
const hiddenYs = [72, 144] as const;
const ellipsisY = 192;
// The outer ellipsis dots' offset from `ellipsisY`, and their radius. Here
// rather than inside <HiddenEllipsis> because the network's drawn extent
// depends on them.
const ellipsisSpread = 13;
const ellipsisDotRadius = 3.5;

// The bracket the first diagram draws around the hidden layer, and the `n=?`
// label above it. Up here for the same reason: the vertical space the two
// diagrams share has to be sized around the label, which is the furthest
// either of them reaches beyond the network itself.
const bracketTop = hiddenYs[0] - 46;
const bracketBottom = ellipsisY + 25;
const countLabelHeight = 30;
const countLabelGap = 18;
const countLabelY = bracketTop - countLabelGap - countLabelHeight / 2;

// The network as actually drawn — top of the upper hidden node down through
// the lowest ellipsis dot.
const networkTop = hiddenYs[0] - radius;
const networkBottom = ellipsisY + ellipsisSpread + ellipsisDotRadius;

// Reserved above and below the network. Both diagrams use the same values, so
// they place their skeleton at the same height — that shared placement is what
// keeps the two networks on one horizon in the poster's side-by-side panels.
// An earlier version centred each diagram's *own* content instead, which left
// the one carrying an extra label sitting 30 units lower than its neighbour.
//
// The two margins are deliberately *unequal*. Alignment only needs the two
// diagrams to agree, not the network to be centred, and the annotations aren't
// symmetric: the `n=?` label reaches 68 above the network, while the furthest
// anything descends below it is the bracket at 8.5. Matching the bottom to the
// top would pad the canvas with ~60 units of empty band and shrink both
// networks in their panels to pay for it.
//
// `overhangPad` is breathing room — without it each margin comes out flush
// against the content it clears.
const overhangPad = 6;
const netMarginTop = networkTop - (countLabelY - countLabelHeight / 2) + overhangPad;
// The bracket is the lowest thing either diagram draws — the second diagram's
// deepest label, the lower unit's `b=?`, bottoms out at 205 against its 217.
const netMarginBottom = bracketBottom - networkBottom + overhangPad;

// Applied by *both* diagrams, so their networks land identically: it drops the
// network below the top margin. The x counterpart is per-diagram and lives in
// `unlabelledOffsetX` below.
//
// Baked into the coordinates below rather than applied as a `<g transform>`,
// which is what it used to be. WebKit ignores every SVG coordinate-system
// transform between the <svg> root and a <foreignObject> when it *paints* the
// HTML inside — an ancestor <g transform>, a non-zero viewBox origin, and a
// transform on the foreignObject itself all fail the same way. Layout is
// unaffected, so Safari's inspector reports the right box and only the glyphs
// land somewhere else: here, up and to the left by exactly this offset. The
// constants above stay unshifted because the margin arithmetic is expressed in
// the network's own space; `net` below is the drawn space.
// See docs/weekly/troubleshooting.md.
const contentOffsetY = netMarginTop - networkTop;

const net = {
    // Coordinate space and aspect, not size — both svgs fill their slot.
    width: 460,
    height: networkBottom - networkTop + netMarginTop + netMarginBottom,
    inputX,
    outputX,
    // Midway between input and output, derived rather than picked. It was 190,
    // 16px left of centre, for the same reason the whole diagram was: the
    // asymmetric right margin `outputX` reserves for the second diagram's
    // labels makes the true midpoint look further right than it is. The
    // dashed box, the ellipsis and the `n=?` label all hang off this, so they
    // move with it.
    hiddenX: (inputX + outputX) / 2,
    midY: 108 + contentOffsetY,
    // The two drawn hidden units, and the ellipsis below them.
    hiddenYs: hiddenYs.map((y) => y + contentOffsetY) as unknown as typeof hiddenYs,
    ellipsisY: ellipsisY + contentOffsetY,
    ellipsisSpread,
    ellipsisDotRadius,
    // Big enough that the node labels can be set at reading size rather than
    // shrunk to fit the circle.
    radius,
} as const;

// SVG `<text>` can't lay out KaTeX's HTML output, so math labels in these
// diagrams go through a `foreignObject` instead. Every svg using this must
// also render <KatexSvgStyle /> once, or the labels export wrong — see that
// component.
function SvgMath({
    x,
    y,
    tex,
    fontSize = 16,
    color = theme.color.ink,
    width = 90,
    height = 30,
    align = "center",
}: {
    x: number;
    y: number;
    tex: string;
    fontSize?: number;
    color?: string;
    width?: number;
    height?: number;
    align?: "center" | "start";
}) {
    return (
        <foreignObject
            x={align === "center" ? x - width / 2 : x}
            y={y - height / 2}
            width={width}
            height={height}
            style={{ overflow: "visible" }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: align === "center" ? "center" : "flex-start",
                }}
            >
                <Math fontSize={fontSize} color={color}>
                    {tex}
                </Math>
            </div>
        </foreignObject>
    );
}

function Node({ cx, cy, label }: { cx: number; cy: number; label?: string }) {
    return (
        <g>
            <circle
                cx={cx}
                cy={cy}
                r={net.radius}
                fill={theme.canvas.background}
                // `muted` rather than `divider`: at this radius a hairline in
                // the divider grey reads as a smudge, not as a circle, and it
                // has to hold up over the poster's tinted panels too.
                stroke={theme.color.muted}
                strokeWidth={2.5}
            />
            {label && <SvgMath x={cx} y={cy} tex={label} fontSize={26} />}
        </g>
    );
}

function Edge({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.color.muted} strokeWidth={2.5} />;
}

// The ellipsis standing in for the hidden units that aren't drawn. Drawn as
// three circles rather than set as "⋮": the glyph comes out small and faint
// at any font-size that doesn't also overshoot the layout, and drawing it
// keeps its weight tied to the nodes it stands in for.
function HiddenEllipsis({ offsetX = 0 }: { offsetX?: number }) {
    return (
        <g fill={theme.color.muted}>
            {[-net.ellipsisSpread, 0, net.ellipsisSpread].map((dy) => (
                <circle
                    key={dy}
                    cx={net.hiddenX + offsetX}
                    cy={net.ellipsisY + dy}
                    r={net.ellipsisDotRadius}
                />
            ))}
        </g>
    );
}

// The edges and nodes both diagrams share. The per-question labels are drawn
// by the callers on top of this.
// `offsetX` is added to every coordinate rather than wrapped around them in a
// <g transform>, so the `foreignObject` node labels stay in the root
// coordinate system — see `contentOffsetY`.
function NetworkSkeleton({
    outputLabel = "y",
    offsetX = 0,
}: {
    outputLabel?: string;
    offsetX?: number;
}) {
    return (
        <>
            {net.hiddenYs.map((y, i) => (
                <Edge
                    key={`in-${i}`}
                    x1={net.inputX + offsetX}
                    y1={net.midY}
                    x2={net.hiddenX + offsetX}
                    y2={y}
                />
            ))}
            {net.hiddenYs.map((y, i) => (
                <Edge
                    key={`out-${i}`}
                    x1={net.hiddenX + offsetX}
                    y1={y}
                    x2={net.outputX + offsetX}
                    y2={net.midY}
                />
            ))}
            <Node cx={net.inputX + offsetX} cy={net.midY} label="x" />
            {net.hiddenYs.map((y, i) => (
                <Node key={i} cx={net.hiddenX + offsetX} cy={y} />
            ))}
            <HiddenEllipsis offsetX={offsetX} />
            <Node cx={net.outputX + offsetX} cy={net.midY} label={outputLabel} />
        </>
    );
}

// `net.outputX` reserves space to the right of the output node for the second
// diagram's v/c labels. A diagram that draws no labels there inherits that
// reservation as dead margin — 62px against 14px on the left — and reads as
// left-aligned in its panel rather than centred. Shifting its contents by the
// difference restores optical centre.
//
// A nudge rather than a tighter viewBox of its own: the two diagrams sit in
// adjacent panels, and since each svg fills its slot, a narrower viewBox would
// scale one network visibly larger than the other. Same coordinate space, same
// scale, contents moved.
const unlabelledOffsetX =
    (net.width - (net.outputX + net.radius) - (net.inputX - net.radius)) / 2;

// The architecture question's graphic: topology and node count only, no
// weight values — those belong to the second question. The count is asked by
// bracketing the whole hidden layer and labelling the bracket, rather than by
// drawing an "n?" node, so the drawn network stays the same network the
// second diagram draws.
export function NetworkDiagram() {
    const boxX = net.hiddenX + unlabelledOffsetX - 54;
    const boxW = 108;

    return (
        <ScaledSvg width={net.width} height={net.height}>
            <KatexSvgStyle />
            <rect
                x={boxX}
                y={bracketTop + contentOffsetY}
                width={boxW}
                height={bracketBottom - bracketTop}
                rx={12}
                fill="none"
                stroke={theme.color.ink}
                strokeWidth={2.5}
                strokeDasharray="7 6"
            />
            <NetworkSkeleton offsetX={unlabelledOffsetX} />
            <SvgMath
                x={net.hiddenX + unlabelledOffsetX}
                y={countLabelY + contentOffsetY}
                height={countLabelHeight}
                tex="n=?"
                fontSize={30}
                color={theme.color.ink}
            />
        </ScaledSvg>
    );
}

// The weights question's graphic: the same network, annotated. Every value is
// a literal "?" and the real n stays hidden behind the ellipsis, so the
// diagram doesn't give either answer away. The labels are the subject of this
// diagram rather than captions on it, so they're set in ink at node-label
// size and bolded, not in `muted`.
export function WeightsNetworkDiagram() {
    return (
        <ScaledSvg width={net.width} height={net.height}>
            <KatexSvgStyle />
            {/* No wrapping <g transform>: the y offset is baked into `net`'s
                coordinates instead, because WebKit paints foreignObject
                content as if ancestor transforms were not there. There is no x
                offset — this is the diagram `outputX`'s right-hand margin was
                reserved for, so its contents already sit centred. */}
            <NetworkSkeleton />
            {net.hiddenYs.map((y, i) => {
                // Stacked clear of the node's own outgoing edge rather than
                // centred on it: the edge to the output leaves the top unit
                // downwards and the bottom unit upwards, so each unit's pair
                // of labels sits on its outward side and nothing is drawn
                // through. `w` stays above `b` either way.
                const outward = i === 0 ? -1 : 1;
                const near = y + outward * 14;
                const far = y + outward * 46;
                return (
                    <g key={i}>
                        <SvgMath
                            x={net.hiddenX + 38}
                            y={outward === -1 ? far : near}
                            tex="\boldsymbol{w=?}"
                            fontSize={26}
                            align="start"
                        />
                        <SvgMath
                            x={net.hiddenX + 38}
                            y={outward === -1 ? near : far}
                            tex="\boldsymbol{b=?}"
                            fontSize={26}
                            align="start"
                        />
                    </g>
                );
            })}
            <SvgMath
                x={net.outputX + 14}
                y={net.midY - 38}
                tex="\boldsymbol{v=?}"
                fontSize={26}
                align="start"
            />
            <SvgMath
                x={net.outputX + 14}
                y={net.midY + 42}
                tex="\boldsymbol{c=?}"
                fontSize={26}
                align="start"
            />
        </ScaledSvg>
    );
}
