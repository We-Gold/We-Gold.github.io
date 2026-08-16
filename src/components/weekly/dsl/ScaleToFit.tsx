import { useEffect, useRef, useState, type ReactNode } from "react";

// Renders children at their true `width`x`height` DOM size, so anything
// capturing them gets native resolution, then scales them down via CSS
// transform to fit the container. Never scales up past 1x.
//
// `onMeasured` fires once, on the first real measurement. Until then the scale
// is a placeholder 1, which on a narrow container renders the children
// oversized and clipped — callers use this to cover that intermediate state.
export function ScaleToFit({
    width,
    height,
    onMeasured,
    children,
}: {
    width: number;
    height: number;
    onMeasured?: () => void;
    children: ReactNode;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Held in a ref so an inline callback doesn't tear down the observer on
    // every render.
    const onMeasuredRef = useRef(onMeasured);
    onMeasuredRef.current = onMeasured;
    const hasMeasured = useRef(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            // A zero width is an absence of measurement, not a measurement —
            // the frame is inside something `display: none`, like a collapsed
            // <SolutionSection>. Latching it would pin the scale at 0 and mark
            // the frame measured, leaving nothing to correct on reveal.
            if (entry.contentRect.width === 0) return;
            setScale(Math.min(1, entry.contentRect.width / width));
            if (!hasMeasured.current) {
                hasMeasured.current = true;
                onMeasuredRef.current?.();
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [width, height]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                maxWidth: width,
                // The child is laid out at its full `width` and only shrunk by
                // a transform, so without this the frame's intrinsic width
                // propagates up as a min-content floor and widens every
                // ancestor — on a phone that pushes the whole page sideways
                // rather than scaling the frame down.
                minWidth: 0,
                aspectRatio: `${width} / ${height}`,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    width,
                    height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                {children}
            </div>
        </div>
    );
}
