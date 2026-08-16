import type { ReactNode } from "react";
import { theme } from "./theme";

// Looks like a link (teal, underlined) but renders as a plain span — these
// images are exported to PNG, so an actual <a> would never be clickable.
export function LinkText({ children }: { children: ReactNode }) {
    return (
        <span
            style={{
                color: theme.color.accent,
                textDecoration: "underline",
            }}
        >
            {children}
        </span>
    );
}
