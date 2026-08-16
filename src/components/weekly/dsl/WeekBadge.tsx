import { theme } from "./theme";

// Renders directly after <WeaverWeeklyLabel>, and matched to its size and
// weight, so the right side of the header reads as one mark.
export function WeekBadge({ week }: { week: number }) {
    return (
        <span
            style={{
                fontFamily: theme.font.label,
                fontWeight: 600,
                fontSize: theme.font.size.header,
                color: theme.color.headerInk,
                whiteSpace: "nowrap",
            }}
        >
            #{week}
        </span>
    );
}
