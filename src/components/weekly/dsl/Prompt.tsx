import type { ReactNode } from "react";
import { theme } from "./theme";

export function Prompt({ children }: { children: ReactNode }) {
    return (
        <p
            style={{
                fontWeight: 600,
                fontSize: 34,
                lineHeight: 1.25,
                color: theme.color.ink,
                margin: 0,
            }}
        >
            {children}
        </p>
    );
}
