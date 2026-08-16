import { theme } from "./theme";

// Placeholder shown in an ImageFrame's place until the frame is measured and
// its fonts have loaded.
//
// Every dimension is a percentage or aspect-ratio, never a pixel: a
// pixel-based skeleton would need the very measurement it is covering for.
// Percentages resolve against the container's *width* on all four sides, so
// even the vertical ones divide by the canvas width, never its height.
const pctOf = (canvasWidth: number) => (px: number) => `${(px / canvasWidth) * 100}%`;

// ImageFrame's own `padding: 32px 40px`, for the default variant.
const padding = { v: 32, h: 40 };

// Placeholder title and label bars, as a fraction of the canvas width paired
// with the px height they stand in for — FrameTitle at lineHeight 1.15, and
// the label/badge group opposite it.
const bar = {
    title: { width: 0.42, height: Math.round(theme.font.size.header * 1.15) },
    label: { width: 0.34, height: Math.round(theme.font.size.header * 1.15) },
};

// The banded variant's own bars, sized against the poster scale rather than
// the header one, and stacked rather than opposed.
const bandBar = {
    title: { width: 0.5, height: Math.round(theme.font.size.poster.lead * 1.15) },
    mark: { width: 0.3, height: Math.round(theme.font.size.poster.subhead * 1.15) },
};

// ImageFrame's banded geometry: the header band's height and the part-panel
// band's, both of which are structural enough that a skeleton missing them
// reads as a different image rather than as the same one loading.
const band = { header: 149, panels: 505 };

export interface FrameSkeletonProps {
    // Must match the canvas of the frame this is covering, since every
    // percentage below resolves against its width.
    canvas?: { width: number; height: number };
    // "divider": ImageFrame's default padded header row over a soft body.
    // "band": the full-bleed accent header and tinted part panels.
    variant?: "divider" | "band";
}

// Only ImageFrame's own geometry is reproduced. Between the chrome every week
// composes something different, so the body is one soft block.
export function FrameSkeleton({
    canvas = theme.canvas,
    variant = "divider",
}: FrameSkeletonProps = {}) {
    const pct = pctOf(canvas.width);

    if (variant === "band") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: theme.canvas.background,
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                }}
            >
                <PulseKeyframes />
                <div
                    style={{
                        height: pct(band.header),
                        flexShrink: 0,
                        background: theme.color.accent,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: pct(10),
                        padding: `0 ${pct(31)}`,
                        boxSizing: "border-box",
                    }}
                >
                    <Bar {...bandBar.title} canvasWidth={canvas.width} onAccent />
                    <Bar {...bandBar.mark} canvasWidth={canvas.width} onAccent />
                </div>
                <div
                    style={{
                        flex: 1,
                        margin: `${pct(24)} ${pct(48)}`,
                        borderRadius: 6,
                        background: theme.color.divider,
                        animation: "wwSkeletonPulse 1.4s ease-in-out infinite",
                    }}
                />
                <div style={{ height: pct(band.panels), flexShrink: 0, display: "flex" }}>
                    <div style={{ flex: 1, background: theme.color.panelStrong }} />
                    <div style={{ flex: 1, background: theme.color.panelSoft }} />
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: theme.canvas.background,
                display: "flex",
                flexDirection: "column",
                padding: `${pct(padding.v)} ${pct(padding.h)}`,
                boxSizing: "border-box",
            }}
        >
            <PulseKeyframes />
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: pct(32),
                    paddingBottom: pct(16),
                    borderBottom: `1px solid ${theme.color.divider}`,
                }}
            >
                <Bar {...bar.title} canvasWidth={canvas.width} />
                <Bar {...bar.label} canvasWidth={canvas.width} />
            </div>
            <div
                style={{
                    flex: 1,
                    marginTop: pct(20),
                    borderRadius: 6,
                    background: theme.color.divider,
                    animation: "wwSkeletonPulse 1.4s ease-in-out infinite",
                }}
            />
        </div>
    );
}

function PulseKeyframes() {
    return <style>{`@keyframes wwSkeletonPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>;
}

// `width` is a fraction of the canvas width, `height` the px height it stands
// in for. Expressed as an `aspectRatio` rather than a height, which would have
// to resolve a percentage against the parent's height. `onAccent` swaps the
// fill for one that reads against an accent band rather than white.
function Bar({
    width,
    height,
    canvasWidth,
    onAccent = false,
}: {
    width: number;
    height: number;
    canvasWidth: number;
    onAccent?: boolean;
}) {
    return (
        <div
            style={{
                width: `${width * 100}%`,
                aspectRatio: `${(width * canvasWidth) / height}`,
                borderRadius: 4,
                background: onAccent ? theme.color.onAccentBorder : theme.color.divider,
                animation: "wwSkeletonPulse 1.4s ease-in-out infinite",
            }}
        />
    );
}
