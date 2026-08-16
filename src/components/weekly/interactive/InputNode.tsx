import { theme } from "../dsl/theme";

export interface InputNodeProps {
    domain?: readonly [number, number];
}

// Small "0 → 1" badge for the scalar input, shared between the Solution
// export and the live solver so the two read as the same diagram.
export function InputNode({ domain = [0, 1] }: InputNodeProps) {
    const [start, end] = domain;
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    fontFamily: theme.font.body,
                    fontSize: 13,
                    color: theme.color.muted,
                }}
            >
                input
            </span>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    border: `1px solid ${theme.color.divider}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontFamily: theme.font.code,
                    fontSize: 15,
                    color: theme.color.ink,
                }}
            >
                <span>{start}</span>
                <span style={{ color: theme.color.muted }}>&rarr;</span>
                <span>{end}</span>
            </div>
        </div>
    );
}
