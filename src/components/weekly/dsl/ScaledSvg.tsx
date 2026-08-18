import { useEffect, useRef, useState, type ReactNode } from "react";

// An <svg> that fills its container *without* ever scaling its own viewBox.
//
// WebKit has a paint bug in <foreignObject>: whenever the svg's internal
// viewBox scale is anything other than exactly 1, the HTML inside a
// foreignObject is laid out in the right place but *painted* somewhere else,
// offset toward the origin in proportion to the scale error. Safari's
// inspector reports the correct box; only the glyphs are wrong. Chrome and
// Firefox paint it correctly, so the bug is invisible outside WebKit.
//
// The usual way to make a drawing fluid — `viewBox` plus `width: 100%` — is
// exactly what triggers it, because the rendered size then almost never equals
// the viewBox size. The two network diagrams hit this at a scale of 1.0565
// (a 460-unit viewBox stretched into a 486px panel), which pulled every KaTeX
// label up and to the left of the node it belonged to.
//
// So the fit is done the other way round: the svg is rendered at exactly its
// viewBox dimensions, where the internal scale is 1 by construction, and a CSS
// transform on the wrapper scales the result. WebKit paints foreignObject
// correctly under a CSS transform — it is specifically viewBox scaling it gets
// wrong.
//
// The wrapper carries the same intrinsic sizing an <svg> with a viewBox has
// — `width: 100%` plus an aspect ratio — so it occupies exactly the box the
// svg used to, and its container reacts to it exactly as before. The scale is
// therefore driven by width alone, which is what the browser was already
// doing: the drawing filled its slot horizontally and the slot grew to take
// the resulting height. Fitting by `min(width, height)` instead would
// letterbox the drawing and silently shrink every exported poster.
export function ScaledSvg({
    width,
    height,
    children,
}: {
    width: number;
    height: number;
    children: ReactNode;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    // 1 until measured. The diagrams sit within a few percent of their natural
    // size, so the pre-hydration frame is not a visible jump — and unlike a 0
    // it renders something correct if the observer never runs.
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const w = entry.contentRect.width;
            // A zero measurement is an absence of one — the diagram is inside
            // something `display: none`, like a collapsed <SolutionSection>.
            // Latching it would pin the drawing at nothing.
            if (w === 0) return;
            setScale(w / width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [width]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                aspectRatio: `${width} / ${height}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // The svg keeps its full layout box and is only resized by a
                // transform, so without this its intrinsic width acts as a
                // min-content floor on every ancestor.
                minWidth: 0,
            }}
        >
            <div
                style={{
                    width,
                    height,
                    flexShrink: 0,
                    transform: `scale(${scale})`,
                }}
            >
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    style={{ display: "block" }}
                >
                    {children}
                </svg>
            </div>
        </div>
    );
}
