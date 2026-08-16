import { theme } from "./theme";

// The drawing's coordinate space and aspect, not its size — the svg fills its
// container, per the fluid-atom rule in docs/weekly/extending-the-dsl.md.
const span = 128;
const headWidth = 58;
const headLength = 42;
const shaft = 11;

const rotation = {
    down: 0,
    left: 90,
    up: 180,
    right: 270,
} as const;

export interface FlowArrowProps {
    // Which way it points. The drawing is authored pointing down and rotated,
    // so all four directions stay one shape.
    direction?: keyof typeof rotation;
    color?: string;
}

// A plain directional arrow, for an image that has to say "this becomes this"
// without a caption. Deliberately blunt and soft-coloured: it's connective
// tissue between two visuals, not a third visual competing with them.
export function FlowArrow({ direction = "down", color = theme.color.guide }: FlowArrowProps) {
    const mid = headWidth / 2;

    return (
        <svg
            viewBox={`0 0 ${headWidth} ${span}`}
            style={{
                width: "100%",
                height: "100%",
                display: "block",
                transform: `rotate(${rotation[direction]}deg)`,
            }}
        >
            <rect
                x={mid - shaft / 2}
                y={0}
                width={shaft}
                height={span - headLength}
                fill={color}
            />
            <polygon
                points={`${mid},${span} 0,${span - headLength} ${headWidth},${span - headLength}`}
                fill={color}
            />
        </svg>
    );
}
