import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AxisBottom } from "@visx/axis";
import { theme } from "./theme";

interface DataPoint {
    label: string;
    value: number;
}

export function Chart({
    data,
    width = 700,
    height = 380,
    highlightLabel,
}: {
    data: DataPoint[];
    width?: number;
    height?: number;
    highlightLabel?: string;
}) {
    const margin = { top: 30, right: 10, bottom: 40, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = scaleBand<string>({
        domain: data.map((d) => d.label),
        range: [0, innerWidth],
        padding: 0.3,
    });
    const yScale = scaleLinear<number>({
        domain: [0, Math.max(...data.map((d) => d.value))],
        range: [innerHeight, 0],
        nice: true,
    });

    return (
        <svg width={width} height={height}>
            <Group left={margin.left} top={margin.top}>
                {data.map((d) => {
                    const barWidth = xScale.bandwidth();
                    const barHeight = innerHeight - (yScale(d.value) ?? 0);
                    const barX = xScale(d.label) ?? 0;
                    const barY = innerHeight - barHeight;
                    const isHighlighted = d.label === highlightLabel;
                    return (
                        <Group key={d.label}>
                            <Bar
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                fill={
                                    isHighlighted
                                        ? theme.color.accent
                                        : theme.color.divider
                                }
                                rx={4}
                            />
                            <text
                                x={barX + barWidth / 2}
                                y={barY - 10}
                                textAnchor="middle"
                                fontSize={18}
                                fontWeight={600}
                                fill={theme.color.ink}
                            >
                                {d.value}
                            </text>
                        </Group>
                    );
                })}
                <AxisBottom
                    top={innerHeight}
                    scale={xScale}
                    stroke={theme.color.muted}
                    tickStroke={theme.color.muted}
                    tickLabelProps={() => ({
                        fill: theme.color.muted,
                        fontSize: 16,
                        textAnchor: "middle",
                    })}
                />
            </Group>
        </svg>
    );
}
