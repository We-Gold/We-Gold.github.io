import { ProblemImage } from "../../../components/weekly/ProblemImage";
import { SolutionImage } from "../../../components/weekly/SolutionImage";
import { BandHeader } from "../../../components/weekly/dsl/BandHeader";
import { CtaBadge } from "../../../components/weekly/dsl/CtaBadge";
import { ImageFrame } from "../../../components/weekly/dsl/ImageFrame";
import { Math } from "../../../components/weekly/dsl/Math";
import { PartPanel } from "../../../components/weekly/dsl/PartPanel";
import { theme } from "../../../components/weekly/dsl/theme";
import { NetworkSolver } from "../../../components/weekly/interactive/NetworkSolver";
import { ColumnLayout } from "../../../components/weekly/layouts/ColumnLayout";
import { RowLayout } from "../../../components/weekly/layouts/RowLayout";
import { CenteredLayout } from "../../../components/weekly/layouts/CenteredLayout";
import { NetworkDiagram, WGridPlot, WeightsNetworkDiagram } from "./_visuals";
import {
    SOLUTION_HIDDEN_UNITS,
    SOLUTION_OUTPUT_BIAS,
    SOLUTION_OUTPUT_WEIGHTS,
} from "./_solution";

const slug = "001-easy-win";

interface WeekProps {
    week: number;
    title: string;
    preview?: boolean;
}

export function Problem({ week, title, preview }: WeekProps) {
    return (
        <ProblemImage
            slug={slug}
            preview={preview}
            usesMath
            canvas={theme.canvasPresets.poster}
            skeleton="band"
        >
            <ImageFrame
                week={week}
                title={title}
                canvas={theme.canvasPresets.poster}
                padding={0}
                header={
                    <BandHeader week={week} title={title}>
                        <CtaBadge
                            label="Solve interactively on"
                            url="weavergoldman.com/weekly"
                        />
                    </BandHeader>
                }
            >
                <ColumnLayout separator={false} padding={0} weights={[5, 5]}>
                    <CenteredLayout padding={30}>
                        <WGridPlot tickCount={{ x: 10, y: 10 }} tickLabels="ends" tickFontSize={40} />
                    </CenteredLayout>
                    <RowLayout separator={false} padding={0}>
                        <PartPanel number={1} tone="strong" diagram={<NetworkDiagram />}>
                            How many hidden ReLU units <Math>{"n"}</Math> does it take to draw
                            this W?
                        </PartPanel>
                        <PartPanel
                            number={2}
                            tone="soft"
                            diagram={<WeightsNetworkDiagram />}
                        >
                            Find the weights and biases needed to produce the W.
                        </PartPanel>
                    </RowLayout>
                </ColumnLayout>
            </ImageFrame>
        </ProblemImage>
    );
}

export function Solution({ week, title, preview }: WeekProps) {
    return (
        <SolutionImage
            slug={slug}
            preview={preview}
            usesMath
            canvas={theme.canvasPresets.poster}
            skeleton="band"
        >
            <ImageFrame
                week={week}
                title={title}
                canvas={theme.canvasPresets.poster}
                padding={0}
                header={
                    <BandHeader week={week} title={title}>
                        <CtaBadge
                            label="Full write-up on"
                            url="weavergoldman.com/weekly"
                        />
                    </BandHeader>
                }
            >
                <CenteredLayout padding={30}>
                    <NetworkSolver
                        hiddenUnits={SOLUTION_HIDDEN_UNITS}
                        outputWeights={SOLUTION_OUTPUT_WEIGHTS}
                        outputBias={SOLUTION_OUTPUT_BIAS}
                        readOnly
                        orientation="vertical"
                        showInputNode={false}
                        // Every size below is cut against `textScale` 2 and
                        // the body box the band leaves — 1114px tall, 1020
                        // wide inside this pane's inset. The solver is a
                        // measured composition, not a fluid one, so none of it
                        // reflows on its own; changing any one of these means
                        // re-checking the rest.
                        textScale={2}
                        // Four panels across 1020: 4x240 plus three 20px gaps.
                        // At 2x the plot's own tick labels claim ~63px of that
                        // panel, which is why `plotSize` is *narrower* than it
                        // was at 1x while the panel around it grew.
                        panelWidth={240}
                        panelGap={16}
                        // Taller than wide, unlike the 1x version: width is
                        // rationed by the four-across row, height isn't, so
                        // the unit plots buy their extra size on the axis
                        // that's free — paid for by the output plot below.
                        plotSize={{ width: 155, height: 170 }}
                        // Still smaller than the panels' share of the canvas
                        // would suggest — the W is one shape and reads fine,
                        // whereas the four unit plots are what a reader has to
                        // compare — but it takes back the line `c = 0` was
                        // spending below.
                        outputPlotSize={{ width: 375, height: 375 }}
                        // The fan and the gaps around it are one budget: this
                        // takes back most of the 48px the two 32px stack gaps
                        // were spending, so the lines run longer without the
                        // stack outgrowing the 1054px the body box leaves
                        // inside its 30px padding (417 + 160 + 440 + 2x16).
                        connectorLength={160}
                        stackGap={8}
                        // The fan is part of the answer here: it's what says
                        // which unit carries which weight. At `divider` grey
                        // it read as a printing artifact.
                        connectorColor={theme.color.guide}
                        // c is 0 for this week, so the label is a line of
                        // vertical space spent on nothing.
                        showOutputBias={false}
                    />
                </CenteredLayout>
            </ImageFrame>
        </SolutionImage>
    );
}
