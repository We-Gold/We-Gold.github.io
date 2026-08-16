import { theme } from "./theme";

export function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
                style={{
                    fontFamily: theme.font.label,
                    fontWeight: 600,
                    fontSize: 96,
                    color: theme.color.accent,
                    lineHeight: 1,
                }}
            >
                {value}
            </span>
            <span
                style={{
                    fontSize: 20,
                    color: theme.color.muted,
                }}
            >
                {label}
            </span>
        </div>
    );
}
