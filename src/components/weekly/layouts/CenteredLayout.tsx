import type { ReactNode } from "react";

export interface CenteredLayoutProps {
    children: ReactNode; // exactly one child — the thing to center
    // Inset around the centered child. Unlike RowLayout/ColumnLayout, this
    // defaults to **0**, not `theme.spacing.md`: those two apply padding to
    // panes they create, whereas a CenteredLayout usually *is* a pane and has
    // already been given the parent's padding. Defaulting it to anything else
    // would silently double the inset everywhere it's nested.
    //
    // Reach for it when a CenteredLayout is a region in its own right — a
    // full-bleed hero directly under a `padding={0}` layout, say, where there
    // is no parent pane to inherit an inset from. Takes a CSS string for the
    // asymmetric case ("24px 48px"), the same as <ImageFrame padding>.
    padding?: number | string;
}

// A single slot centered in the remaining space, with no prompt slot. The
// Solution-image shape, and also usable for any pane that just needs its one
// child centered.
export function CenteredLayout({ children, padding = 0 }: CenteredLayoutProps) {
    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 0,
                padding,
                // So the padding comes out of the pane rather than adding to
                // it — a `flex: 1` box in a fixed-height frame has no room to
                // grow, and without this a padded hero overflows the canvas.
                boxSizing: "border-box",
            }}
        >
            {children}
        </div>
    );
}
