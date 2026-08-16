import { Children, Fragment, type ReactNode } from "react";
import { Divider } from "../dsl/Divider";
import { theme } from "../dsl/theme";
import { isFlushChild, markAsDividerLayout } from "./layoutMarker";

export interface RowLayoutProps {
    children: ReactNode; // arbitrary count, positional — one pane per child
    padding?: number;
    weights?: number[]; // index-parallel flex weight per child; missing entries default to 1
    separator?: boolean; // draw a vertical rule between each adjacent pair
}

// Lays out any number of children left-to-right. Each child gets its own
// flex/minHeight:0 pane, so a nested layout can flex to fill it.
//
// Every leaf pane gets `padding` on all four sides, so padding doesn't depend
// on which layout you reached for. A pane that is itself a divider-drawing
// layout (see layoutMarker.ts) gets zero instead, so its own separator sits
// flush against the outer one rather than leaving a gap. The container's gap
// is always 0 — spacing comes entirely from pane padding.
function RowLayoutImpl({ children, padding = theme.spacing.md, weights, separator = true }: RowLayoutProps) {
    const items = Children.toArray(children);

    return (
        <div style={{ flex: 1, display: "flex", gap: 0, minHeight: 0 }}>
            {items.map((child, i) => {
                const pad = isFlushChild(child) ? 0 : padding;
                return (
                    <Fragment key={i}>
                        {i > 0 && separator && <Divider orientation="vertical" />}
                        <div
                            style={{
                                flex: weights?.[i] ?? 1,
                                minHeight: 0,
                                display: "flex",
                                flexDirection: "column",
                                padding: pad,
                            }}
                        >
                            {child}
                        </div>
                    </Fragment>
                );
            })}
        </div>
    );
}

export const RowLayout = markAsDividerLayout(RowLayoutImpl);
