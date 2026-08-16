import { textRole, theme } from "./theme";

export interface CtaBadgeProps {
    // The lead-in line, e.g. "Solve interactively on".
    label: string;
    // The destination, underlined on the line below. Plain text, not an href:
    // these frames are exported to PNG, so nothing in them is ever clickable —
    // same reasoning as <LinkText>.
    url: string;
}

// The call to action, as an outlined box for the header band. It replaces the
// in-body tip-box pattern: a tip box spends a whole pane on a line the reader
// only needs once, and moving it into the band gives that pane back.
//
// Styled for an accent background rather than white, which is why it doesn't
// reuse <LinkText> — teal-on-teal would vanish.
// Optical padding rather than a spacing token: the box is sized to hug two
// lines of text, and `spacing.sm` on all four sides leaves it noticeably
// slack. It also has to stay narrow enough that a normal-length title still
// fits on one line beside it.
const badgePadding = "10px 16px";

export function CtaBadge({ label, url }: CtaBadgeProps) {
    return (
        <div
            style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                border: `1px solid ${theme.color.onAccentBorder}`,
                borderRadius: 10,
                padding: badgePadding,
                ...textRole.posterBadge,
                lineHeight: 1.2,
                color: theme.color.onAccent,
            }}
        >
            <span>{label}</span>
            <span style={{ textDecoration: "underline" }}>{url}</span>
        </div>
    );
}
