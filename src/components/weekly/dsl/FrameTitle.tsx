import { theme } from "./theme";

// The problem's own title, pinned left in the header row. Matched to
// <WeaverWeeklyLabel> opposite it so the header reads as one balanced line;
// the Prompt below the divider is what carries the weight. Long titles wrap
// rather than shrink.
export function FrameTitle({ children }: { children: string }) {
    return (
        <span
            style={{
                fontFamily: theme.font.label,
                fontWeight: 600,
                fontSize: theme.font.size.header,
                lineHeight: 1.15,
                color: theme.color.headerInk,
                letterSpacing: "-0.01em",
                minWidth: 0,
            }}
        >
            {children}
        </span>
    );
}
