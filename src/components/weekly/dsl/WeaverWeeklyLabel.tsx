import { theme } from "./theme";

// The series text mark. It sits on the right of the header row alongside
// <WeekBadge>, matched in size and colour to the <FrameTitle> opposite it.
export function WeaverWeeklyLabel() {
    return (
        <span
            style={{
                fontFamily: theme.font.label,
                fontWeight: 600,
                fontSize: theme.font.size.header,
                color: theme.color.headerInk,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
            }}
        >
            Weaver&rsquo;s Weekly
        </span>
    );
}
