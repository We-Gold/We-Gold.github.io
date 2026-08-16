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

export function KatexSvgStyle() {
    return <style dangerouslySetInnerHTML={{ __html: katexCss }} />;
}
