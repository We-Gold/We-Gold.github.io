import { theme } from "./theme";

export interface DividerProps {
    orientation?: "vertical" | "horizontal";
}

// A single rule between items in RowLayout/ColumnLayout. `alignSelf:
// "stretch"` rather than a 100% size, which would depend on the parent having
// an explicit size in that axis.
export function Divider({ orientation = "vertical" }: DividerProps) {
    const isVertical = orientation === "vertical";
    return (
        <div
            style={{
                alignSelf: "stretch",
                width: isVertical ? 1 : "auto",
                height: isVertical ? "auto" : 1,
                flexShrink: 0,
                backgroundColor: theme.color.divider,
            }}
        />
    );
}
