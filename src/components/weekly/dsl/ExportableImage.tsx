import { useCallback, useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { theme, katexFontLoadSpecs } from "./theme";
import { FrameSkeleton } from "./FrameSkeleton";
import { ScaleToFit } from "./ScaleToFit";
import { useFontsReady } from "./useFontsReady";

const SCALES = [1, 2, 4] as const;

// Lifts the frame off the page so a white canvas doesn't dissolve into a white
// article column. Not a theme token: the theme describes the exported artifact,
// and this shadow only exists on the page. It sits on a wrapper outside the
// captured node, so `toPng` never sees it.
const PAGE_SHADOW = "0 2px 12px 0 rgba(23, 23, 23, 0.16)";

// Renders an <ImageFrame> scaled to fit its container and, in `astro dev`
// only, shows export buttons that capture the frame at its native canvas size
// regardless of the current visual scale. `preview` suppresses the buttons
// for thumbnails like the /weekly index cards.
export function ExportableImage({
    filename,
    preview = false,
    usesMath = false,
    canvas = theme.canvas,
    skeleton = "divider",
    children,
}: {
    filename: string;
    preview?: boolean;
    // Set when the frame renders `dsl/Math`, so export waits on KaTeX's
    // fonts too. Opt-in so pages without math never fetch them.
    usesMath?: boolean;
    // Must match the canvas the wrapped <ImageFrame> was given. It sizes the
    // capture, the aspect box the frame is scaled into, and the skeleton
    // covering it — a mismatch shows up as a cropped or letterboxed export.
    canvas?: { width: number; height: number };
    // Which chrome the placeholder should imitate — see FrameSkeleton. Match
    // it to the header the wrapped <ImageFrame> renders, or the frame visibly
    // changes shape as it fades in.
    skeleton?: "divider" | "band";
    children: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [busyScale, setBusyScale] = useState<number | null>(null);

    // A frame is only fit to show once both things that move it have settled:
    // the container measurement that positions it, and the webfonts that lay
    // its text out. Either one alone still leaves a visible jump.
    const [measured, setMeasured] = useState(false);
    const onMeasured = useCallback(() => setMeasured(true), []);
    const fontsReady = useFontsReady(usesMath ? katexFontLoadSpecs : []);
    const ready = measured && fontsReady;

    async function handleExport(scale: number) {
        if (!ref.current) return;
        setBusyScale(scale);
        try {
            const dataUrl = await toPng(ref.current, {
                width: canvas.width,
                height: canvas.height,
                pixelRatio: scale,
            });
            const link = document.createElement("a");
            link.download = `${filename}@${scale}x.png`;
            link.href = dataUrl;
            link.click();
        } finally {
            setBusyScale(null);
        }
    }

    return (
        <div>
            <div
                style={{
                    position: "relative",
                    maxWidth: canvas.width,
                    boxShadow: preview ? undefined : PAGE_SHADOW,
                }}
            >
                <ScaleToFit
                    width={canvas.width}
                    height={canvas.height}
                    onMeasured={onMeasured}
                >
                    {/* The fade sits outside the node `ref` points at, so an
                        export started mid-fade can't capture a translucent
                        frame. */}
                    <div
                        style={{
                            opacity: ready ? 1 : 0,
                            transition: "opacity 200ms ease-in",
                        }}
                    >
                        <div ref={ref}>{children}</div>
                    </div>
                </ScaleToFit>
                {/* Overlaid rather than swapped in: ScaleToFit needs a real
                    box to measure, so the frame has to stay laid out. */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: ready ? 0 : 1,
                        transition: "opacity 200ms ease-out",
                        pointerEvents: "none",
                    }}
                >
                    <FrameSkeleton canvas={canvas} variant={skeleton} />
                </div>
            </div>
            {import.meta.env.DEV && !preview && (
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 16,
                        marginBottom: 32,
                    }}
                >
                    {SCALES.map((scale) => (
                        <button
                            key={scale}
                            onClick={() => handleExport(scale)}
                            // Disabled until `ready` too — capturing early
                            // bakes fallback type into the PNG.
                            disabled={busyScale !== null || !ready}
                            style={{
                                fontFamily: theme.font.body,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#ffffff",
                                background:
                                    busyScale !== null || !ready
                                        ? theme.color.muted
                                        : theme.color.accent,
                                border: "none",
                                borderRadius: 6,
                                padding: "8px 14px",
                                cursor:
                                    busyScale !== null || !ready
                                        ? "default"
                                        : "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {busyScale === scale ? "Exporting…" : `${scale}x`}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
