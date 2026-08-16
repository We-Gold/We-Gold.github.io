import type { ReactNode } from "react";
import { RowLayout } from "./RowLayout";
import { theme } from "../dsl/theme";
import { markAsDividerLayout } from "./layoutMarker";

export interface SplitLayoutProps {
    // 2+ panes, positional. A pane is a bare atom, or a nested layout if it
    // needs its own internal arrangement.
    children: ReactNode;
    padding?: number;
    weights?: number[]; // e.g. [2, 3] for a 2:3 split
    separator?: boolean;
}

// A named entry point for a two(+)-pane split image, built on RowLayout
// rather than reimplementing its flex/divider logic. Reach for RowLayout
// instead when "row of N things" fits better than "split into panes". Marked
// as a divider layout even though it renders no <Divider> itself, since it
// forwards straight through to one.
function SplitLayoutImpl({ children, padding = theme.spacing.md, weights, separator = true }: SplitLayoutProps) {
    return (
        <RowLayout padding={padding} weights={weights} separator={separator}>
            {children}
        </RowLayout>
    );
}

export const SplitLayout = markAsDividerLayout(SplitLayoutImpl);
