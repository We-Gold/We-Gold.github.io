import type { ReactNode } from "react";
import { FrameTitle } from "./FrameTitle";
import { theme } from "./theme";
import { WeaverWeeklyLabel } from "./WeaverWeeklyLabel";
import { WeekBadge } from "./WeekBadge";

export interface ImageFrameProps {
    week: number;
    title: string;
    children: ReactNode;
    // Defaults to `theme.canvas`. Pass a `theme.canvasPresets` entry for a
    // frame on a different canvas — and pass the *same* value to the
    // surrounding <ProblemImage>/<SolutionImage>, which is what sizes the
    // export and the on-page scaling.
    canvas?: { width: number; height: number };
    // The frame's own inset. `0` gives a full-bleed frame, where each region
    // owns its padding instead — what a banded header or a tinted panel
    // reaching the canvas edge needs.
    padding?: number | string;
    // Replaces the default title/divider header row wholesale. A <BandHeader>
    // goes here; the default row is what you get by leaving it off. It still
    // takes `week`/`title` above so a caller can't forget to thread them.
    header?: ReactNode;
}

// `title` comes from the entry's frontmatter, threaded through like `week`,
// so the image header and the post title can't drift apart.
export function ImageFrame({
    week,
    title,
    children,
    canvas = theme.canvas,
    padding = "32px 40px",
    header,
}: ImageFrameProps) {
    return (
        <div
            style={{
                width: canvas.width,
                height: canvas.height,
                background: theme.canvas.background,
                display: "flex",
                flexDirection: "column",
                padding,
                boxSizing: "border-box",
                // The one font decision for an exported image. Everything
                // inside — question text, tip box, plot tick labels — inherits
                // this rather than naming a family, so the image is serif
                // throughout and matches its own header. `html-to-image`
                // serializes *computed* styles, so inheritance survives the
                // capture; there's no need to inline it at every leaf.
                fontFamily: theme.font.label,
            }}
        >
            {header ?? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 32,
                        paddingBottom: 16,
                        borderBottom: `1px solid ${theme.color.divider}`,
                    }}
                >
                    <FrameTitle>{title}</FrameTitle>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 8,
                            flexShrink: 0,
                        }}
                    >
                        <WeaverWeeklyLabel />
                        <WeekBadge week={week} />
                    </div>
                </div>
            )}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    minHeight: 0,
                }}
            >
                {children}
            </div>
        </div>
    );
}
