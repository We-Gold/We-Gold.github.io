import { Children, Fragment, type ReactNode } from "react";
import { Divider } from "../dsl/Divider";
import { theme } from "../dsl/theme";
import { isFlushChild, markAsDividerLayout } from "./layoutMarker";

export interface ColumnLayoutProps {
    children: ReactNode; // arbitrary count, positional — one pane per child
    padding?: number;
    weights?: number[]; // index-parallel flex weight per child; missing entries default to 1
    separator?: boolean; // draw a horizontal rule between each adjacent pair
}

// Vertical mirror of RowLayout — see that file for the per-child wrapper and
// the uniform-padding/flush rule.
function ColumnLayoutImpl({ children, padding = theme.spacing.md, weights, separator = true }: ColumnLayoutProps) {
    const items = Children.toArray(children);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, minHeight: 0 }}>
            {items.map((child, i) => {
                const pad = isFlushChild(child) ? 0 : padding;
                return (
                    <Fragment key={i}>
                        {i > 0 && separator && <Divider orientation="horizontal" />}
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

export const ColumnLayout = markAsDividerLayout(ColumnLayoutImpl);
