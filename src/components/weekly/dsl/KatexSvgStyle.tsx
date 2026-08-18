import { useEffect, useRef } from "react";

// The raw stylesheet text, not the side-effect import in `Math.tsx`. That one
// puts KaTeX's rules in the *page*; this one puts them in the *element tree*,
// which is what an export needs — see below.
import rawKatexCss from "katex/dist/katex.min.css?raw";

// html-to-image inlines each element's computed style onto its clone, which is
// why the DSL can rely on class-less inline styles everywhere else. But it
// deep-clones an <svg> subtree verbatim and never walks into it
// (`clone-node.js`: `node.cloneNode(isSVGElement(node))`, and `cloneChildren`
// returns early for an svg). So HTML inside a <foreignObject> reaches the PNG
// with *no* stylesheet behind it — and KaTeX's output is nothing but classes.
//
// Two symptoms, one cause:
//   - `.katex-mathml` is hidden by a clip rect in CSS. Without it, the MathML
//     copy renders next to the visual one and every label doubles: `n?n?`.
//   - `.mathnormal` is what sets `font-family: KaTeX_Math`. Without it, math
//     comes out in plain body text.
//
// The fix is to put the rules somewhere the verbatim clone will carry along:
// a <style> inside the svg itself. Render this once as the first child of any
// <svg> that hosts math in a foreignObject. It changes nothing on the live
// page — the same rules are already loaded — it only survives the copy.
//
// @font-face is stripped. The URLs in it are relative (`url(fonts/…)`) and
// would resolve against the capture's data: URL and fail; worse, they'd sit
// *after* the data-URI faces html-to-image embeds at the clone root and win on
// document order, breaking math that renders correctly today.
const katexCss = rawKatexCss.replace(/@font-face\{[^}]*\}/g, "");

// Anything further from 1 than this is a real scale, not float noise.
const SCALE_EPSILON = 0.001;

// A dev-only audit of the svg this <style> was dropped into, for the WebKit
// bug documented in troubleshooting.md: Safari *lays out* a <foreignObject>
// correctly but *paints* its HTML as though every SVG coordinate-system
// transform between the svg root and the foreignObject were absent. Chrome and
// Firefox are unaffected, the DOM geometry is right in all three, and the
// inspector agrees with the DOM — so the only signal is looking at Safari.
// Nothing about authoring a diagram hints at the constraint, which is why it
// is checked here rather than left to be rediscovered.
//
// This is the right chokepoint because every svg hosting math has to render
// <KatexSvgStyle /> anyway or its export comes out doubled and in body type —
// so a diagram cannot opt out of the check without already being broken.
function auditForeignObjectPaint(style: Element) {
    // `closest`, not `ownerSVGElement`: React types a <style> element as an
    // HTMLStyleElement wherever it is rendered, svg included.
    const svg = style.closest("svg");
    if (!svg) return;

    const labels = svg.querySelectorAll("foreignObject");
    if (labels.length === 0) return;

    const problems: string[] = [];

    // 1. viewBox scale. Compare against the svg's *layout* width, not its
    //    bounding box: a CSS transform on an ancestor scales the box but not
    //    the viewBox mapping, and CSS transforms are painted correctly.
    const box = svg.viewBox.baseVal;
    if (box && box.width > 0) {
        const layoutWidth = parseFloat(getComputedStyle(svg).width);
        // 0 means the diagram is inside something `display: none`; there is
        // nothing to measure and nothing on screen to be wrong.
        if (layoutWidth > 0) {
            const scale = layoutWidth / box.width;
            if (Math.abs(scale - 1) > SCALE_EPSILON) {
                problems.push(
                    `its viewBox scale is ${scale.toFixed(4)}, not 1 ` +
                        `(viewBox is ${box.width} wide, rendered at ${layoutWidth}px). ` +
                        `Build it with <ScaledSvg> instead of viewBox + width: 100%.`,
                );
            }
        }
        if (box.x !== 0 || box.y !== 0) {
            problems.push(
                `its viewBox origin is (${box.x}, ${box.y}), not (0, 0). ` +
                    `Bake the offset into the coordinates instead.`,
            );
        }
    }

    // 2. Transforms anywhere between a label and the svg root, the label
    //    included — all of them paint wrong, in Safari only.
    for (const label of labels) {
        for (let el: Element | null = label; el && el !== svg; el = el.parentElement) {
            if (el.hasAttribute("transform")) {
                problems.push(
                    `a <foreignObject> label sits under <${el.tagName.toLowerCase()} ` +
                        `transform="${el.getAttribute("transform")}">. ` +
                        `Bake the offset into the coordinates instead.`,
                );
                break;
            }
        }
    }

    // One line per distinct fault, not per label: a single <g transform>
    // wrapping a whole diagram otherwise reports itself once per label under
    // it, which buries how few things are actually wrong.
    const distinct = [...new Set(problems)];

    if (distinct.length > 0) {
        console.error(
            `[weekly] This svg's math labels will be painted in the wrong place in Safari:\n` +
                distinct.map((p) => `  - ${p}`).join("\n") +
                `\nSee docs/weekly/troubleshooting.md#math-labels-sit-off-their-anchors-in-safari-but-are-correct-in-chrome`,
            svg,
        );
    }
}

export function KatexSvgStyle() {
    const ref = useRef<HTMLStyleElement>(null);

    useEffect(() => {
        if (!import.meta.env.DEV) return;
        const style = ref.current;
        if (!style) return;
        // After a frame, so the measurement sees settled layout rather than
        // first paint — <ScaledSvg> and friends resize on a ResizeObserver.
        const frame = requestAnimationFrame(() => auditForeignObjectPaint(style));
        return () => cancelAnimationFrame(frame);
    }, []);

    return <style ref={ref} dangerouslySetInnerHTML={{ __html: katexCss }} />;
}
