import type { ReactNode } from "react";
import { textRole, theme } from "./theme";

// The band's height is fixed rather than derived from its type, because
// FrameSkeleton has to reproduce it before any type has loaded. Exported so
// the two can't drift.
export const bandHeaderHeight = 149;

// Matches the title's left inset. The Figma reference insets the badge only
// 12px from the right edge, which reads as a nudge rather than an intent —
// the two sides are squared up here.
const inset = 31;

export interface BandHeaderProps {
    week: number;
    title: string;
    // Optional right-hand slot — a <CtaBadge>, typically. Vertically centered
    // against the band rather than against the title, so a taller badge grows
    // symmetrically instead of pushing the text off-centre.
    children?: ReactNode;
}

// The full-bleed counterpart to <ImageFrame>'s default header row: a solid
// accent band with the title and series mark stacked on the left, rather than
// ink-on-white with the mark opposed across a divider. Pass it to
// <ImageFrame header={…}>, which is what puts it flush against the canvas
// edges.
//
// The mark is one string here — "Weaver's Weekly #3" — instead of the
// <WeaverWeeklyLabel>/<WeekBadge> pair, since nothing sits between the two
// halves to separate them.
export function BandHeader({ week, title, children }: BandHeaderProps) {
    return (
        <div
            style={{
                height: bandHeaderHeight,
                flexShrink: 0,
                background: theme.color.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: theme.spacing.md,
                padding: `0 ${inset}px`,
                boxSizing: "border-box",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span
                    style={{
                        ...textRole.posterTitle,
                        lineHeight: 1.15,
                        color: theme.color.onAccent,
                    }}
                >
                    {title}
                </span>
                <span
                    style={{
                        ...textRole.posterSubhead,
                        lineHeight: 1.15,
                        color: theme.color.onAccent,
                    }}
                >
                    Weaver&rsquo;s Weekly #{week}
                </span>
            </div>
            {children}
        </div>
    );
}
