import type { ReactNode } from "react";
import { textRole, theme } from "./theme";

// The panel band's height, and the prose measure inside it. Both fixed rather
// than derived: the band is structural (FrameSkeleton reproduces it) and the
// measure is what keeps a three-line question from becoming a two-line one on
// a slightly wider panel.
export const partPanelHeight = 505;
const proseMeasure = 485;

// Split out of the shorthand so the number can be pinned to the same insets
// the panel pads by — the two have to agree, or the number sits off the
// panel's own left margin.
const panelPad = { top: 23, side: 27, bottom: 56 } as const;

// The diagram area's own vertical padding. The number is positioned out of
// flow (see below), so without this the drawing would centre against the
// panel's full height and ride up behind it. Less than the number's 60px box
// on purpose: that reclaimed space is the point, and the drawings carry
// internal margins of their own, so this only has to clear the number's
// visual weight rather than its full line box. Tune here.
const diagramPad = { top: 20, bottom: 32 } as const;

// Height reserved for the question text, fixed rather than left to the text
// itself. The diagram band is `flex: 1` — leftover space — so *any* variation
// in prose height lands in the diagram, and because each drawing is an svg at
// `height: 100%` letterboxed by its viewBox, a shorter band doesn't just crop
// the drawing, it scales the whole thing down.
//
// That is how two panels drawing the same network ended up with it at
// different sizes: the first question contains inline <Math> and the second
// doesn't, KaTeX overrides the pinned `lineHeight` below with its own
// (1.21em font-size, 1.2 line-height), and the ~15px that costs came out of
// the first panel's diagram alone. Both questions wrap to three lines, so line
// count was never the difference.
//
// Sized for three lines with an allowance for one of them carrying math. A
// longer question overflows toward the panel's bottom padding rather than
// clipping — visible, and it can no longer silently resize the diagram.
const proseReserve = 168;

const tint = {
    strong: theme.color.panelStrong,
    soft: theme.color.panelSoft,
} as const;

export interface PartPanelProps {
    number: number;
    // Which of the two tints to fill with. Adjacent panels take different
    // tones so the split reads without a divider rule between them.
    tone: keyof typeof tint;
    // The panel's visual. A ReactNode prop rather than a second child, the
    // same way <QuestionBlock> takes one — the children-as-slots rule is about
    // composition written in .mdx/.astro, and a panel is composed in a real
    // .tsx.
    diagram: ReactNode;
    // The question text — JSX so it can embed <Math>.
    children: ReactNode;
}

// A tinted, full-bleed alternative to <QuestionBlock>. Same job — a numbered
// question with a diagram — but arranged for a canvas that gives each question
// a whole panel rather than a band: the number is set at display size in the
// top-left corner, the diagram sits above the text instead of beside it, and
// the tint carries the separation that a <Divider> carries otherwise.
//
// Nothing here sets a blend mode. The diagrams are inline SVG with transparent
// backgrounds, so they composite over the tint as-is; `mix-blend-multiply`
// would tint the node fills, which are deliberately the canvas background.
export function PartPanel({ number, tone, diagram, children }: PartPanelProps) {
    return (
        <div
            style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                background: tint[tone],
                padding: `${panelPad.top}px ${panelPad.side}px ${panelPad.bottom}px`,
                boxSizing: "border-box",
                // Anchors the number below.
                position: "relative",
            }}
        >
            <span
                style={{
                    // Out of flow, pinned to the panel's own padding insets.
                    // In flow it reserved a full 60px line box across the
                    // panel's whole width, and the diagram had to centre in
                    // whatever was left — which pushed the drawing down and
                    // squeezed it. Nothing sits to the number's right, so the
                    // band it occupied was almost entirely empty; taking it
                    // out of flow hands that height back to the diagram.
                    position: "absolute",
                    top: panelPad.top,
                    left: panelPad.side,
                    ...textRole.posterDisplay,
                    lineHeight: 1,
                    color: theme.color.ink,
                }}
            >
                {number}
            </span>
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: diagramPad.top,
                    paddingBottom: diagramPad.bottom,
                }}
            >
                {diagram}
            </div>
            <p
                style={{
                    flexShrink: 0,
                    // Fixed, not natural — see `proseReserve`.
                    height: proseReserve,
                    maxWidth: proseMeasure,
                    margin: 0,
                    ...textRole.posterProse,
                    // Pinned tight, because inline KaTeX otherwise inflates
                    // the line boxes of any question containing math — at this
                    // size that drift is ~20px a line, enough to push a
                    // three-line question off the panel. It reduces the drift
                    // but can't remove it; `proseReserve` absorbs the rest.
                    lineHeight: 1.05,
                    color: theme.color.ink,
                }}
            >
                {children}
            </p>
        </div>
    );
}
