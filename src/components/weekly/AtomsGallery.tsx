import { ExportableImage } from "./dsl/ExportableImage";
import { ImageFrame } from "./dsl/ImageFrame";
import { Prompt } from "./dsl/Prompt";
import { Stat } from "./dsl/Stat";
import { Table } from "./dsl/Table";
import { Code } from "./dsl/Code";
import { Chart } from "./dsl/Chart";
import { UnitGrid } from "./dsl/UnitGrid";
import { Math } from "./dsl/Math";
import { QuestionBlock } from "./dsl/QuestionBlock";
import { BandHeader } from "./dsl/BandHeader";
import { CtaBadge } from "./dsl/CtaBadge";
import { PartPanel } from "./dsl/PartPanel";
import { FlowArrow } from "./dsl/FlowArrow";
import { theme } from "./dsl/theme";
import { StackedLayout } from "./layouts/StackedLayout";
import { RowLayout } from "./layouts/RowLayout";
import { ColumnLayout } from "./layouts/ColumnLayout";
import { SplitLayout } from "./layouts/SplitLayout";
import { CenteredLayout } from "./layouts/CenteredLayout";

const trainTestSplitSnippet = `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2
)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.fit_transform(X_test)  # bug`;

// Stand-in diagram for the QuestionBlock demo — the real ones are
// week-specific.
function DemoDot({ color }: { color: string }) {
    return (
        <svg width={64} height={64} style={{ flexShrink: 0 }}>
            <circle cx={32} cy={32} r={24} fill={color} />
        </svg>
    );
}

export function AtomsGallery() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            <ExportableImage filename="demo-table">
                <ImageFrame week={13} title="Reading a Metrics Table">
                    <StackedLayout>
                        <Prompt>Which model has the best F1 score?</Prompt>
                        <Table
                            headers={["Model", "Precision", "Recall", "F1"]}
                            rows={[
                                ["Logistic Regression", "0.81", "0.74", "0.77"],
                                ["Random Forest", "0.85", "0.79", "0.82"],
                                ["XGBoost", "0.88", "0.83", "0.85"],
                            ]}
                        />
                    </StackedLayout>
                </ImageFrame>
            </ExportableImage>

            <ExportableImage filename="demo-code">
                <ImageFrame week={13} title="Spot the Leakage">
                    <StackedLayout>
                        <Prompt>What's wrong with this train/test split?</Prompt>
                        <Code language="python">{trainTestSplitSnippet}</Code>
                    </StackedLayout>
                </ImageFrame>
            </ExportableImage>

            <ExportableImage filename="demo-chart">
                <ImageFrame week={13} title="Per-Class Accuracy">
                    <StackedLayout>
                        <Prompt>Which class is the model struggling with?</Prompt>
                        <Chart
                            data={[
                                { label: "Class A", value: 92 },
                                { label: "Class B", value: 88 },
                                { label: "Class C", value: 41 },
                            ]}
                            highlightLabel="Class C"
                        />
                    </StackedLayout>
                </ImageFrame>
            </ExportableImage>

            {/* Both arrangements in one frame: choosing between them is the
                only real decision `UnitGrid` asks of an author. */}
            <ExportableImage filename="demo-unit-grid">
                <ImageFrame week={13} title="Unit Grid: Two Arrangements">
                    <StackedLayout>
                        <Prompt>
                            Same 99 / 1 split — proportion or incidence?
                        </Prompt>
                        <div style={{ display: "flex", gap: 96 }}>
                            <UnitGrid
                                groups={[
                                    { count: 99, color: theme.color.divider },
                                    { count: 1, color: theme.color.accent },
                                ]}
                            />
                            <UnitGrid
                                arrangement="scattered"
                                groups={[
                                    { count: 99, color: theme.color.divider },
                                    { count: 1, color: theme.color.accent },
                                ]}
                            />
                        </div>
                    </StackedLayout>
                </ImageFrame>
            </ExportableImage>

            <ExportableImage filename="demo-math" usesMath>
                <ImageFrame week={13} title="How Many Hidden Units?">
                    <StackedLayout>
                        <Prompt>
                            <Math>{"n"}</Math> hidden ReLU units feed one linear
                            output. How small can <Math>{"n"}</Math> be?
                        </Prompt>
                        <Math displayMode fontSize={28}>
                            {"y = \\sum_{i=1}^{n} v_i \\cdot \\mathrm{relu}(w_i x + b_i) + c"}
                        </Math>
                    </StackedLayout>
                </ImageFrame>
            </ExportableImage>

            <ExportableImage filename="demo-row-layout">
                <ImageFrame week={13} title="RowLayout: Weighted Row">
                    <RowLayout weights={[1, 2]}>
                        <Stat value="0.85" label="Precision" />
                        <Table
                            headers={["Model", "F1"]}
                            rows={[
                                ["Logistic Regression", "0.77"],
                                ["Random Forest", "0.82"],
                            ]}
                        />
                    </RowLayout>
                </ImageFrame>
            </ExportableImage>

            {/* The shape 001-easy-win's Problem image uses, and the default on
                a 4:5 canvas: a weighted vertical stack with a hero pane on
                top. Weights are what keep the hero from being one of n equal
                slices. */}
            <ExportableImage filename="demo-column-layout">
                <ImageFrame week={13} title="ColumnLayout: Weighted Stack">
                    <ColumnLayout weights={[3, 1, 1]}>
                        <CenteredLayout>
                            <Chart
                                data={[
                                    { label: "A", value: 92 },
                                    { label: "B", value: 41 },
                                ]}
                            />
                        </CenteredLayout>
                        <Stat value="0.82" label="Recall" />
                        <Stat value="0.79" label="F1" />
                    </ColumnLayout>
                </ImageFrame>
            </ExportableImage>

            {/* Horizontal splitting still works, but on a portrait canvas it
                buys less than stacking — each pane is narrow. */}
            <ExportableImage filename="demo-split-layout">
                <ImageFrame week={13} title="SplitLayout: Nested Panes">
                    <SplitLayout weights={[2, 3]}>
                        <CenteredLayout>
                            {/* Chart's 700px default overflows a 2/5 pane on
                                this canvas — it takes an explicit size. */}
                            <Chart
                                width={330}
                                height={260}
                                data={[
                                    { label: "A", value: 92 },
                                    { label: "B", value: 41 },
                                ]}
                            />
                        </CenteredLayout>
                        <ColumnLayout>
                            <Stat value="99%" label="Class A" />
                            <Stat value="1%" label="Class B" />
                        </ColumnLayout>
                    </SplitLayout>
                </ImageFrame>
            </ExportableImage>

            {/* No Prompt slot — the Solution-image shape, as distinct from
                StackedLayout's prompt-on-top-of-body. */}
            <ExportableImage filename="demo-centered-layout">
                <ImageFrame week={13} title="CenteredLayout: No Prompt">
                    <CenteredLayout>
                        <Stat value="4" label="hidden units" />
                    </CenteredLayout>
                </ImageFrame>
            </ExportableImage>

            <ExportableImage filename="demo-question-block" usesMath>
                <ImageFrame week={13} title="QuestionBlock: Numbered Questions">
                    <ColumnLayout>
                        <QuestionBlock number={1} diagram={<DemoDot color={theme.color.accent} />}>
                            What is <Math>{"\\pi"}</Math> rounded to two decimals?
                        </QuestionBlock>
                        <QuestionBlock number={2} diagram={<DemoDot color={theme.color.muted} />}>
                            How many sides does this circle have?
                        </QuestionBlock>
                    </ColumnLayout>
                </ImageFrame>
            </ExportableImage>

            {/* The banded poster chrome, all four atoms at once — they're only
                really legible together, since each one is a piece of the same
                full-bleed treatment. Note `padding={0}` on the frame and
                `separator={false}` on every layout: the band edge and the
                panel tints carry the structure that padding and divider rules
                carry on the standard canvas. */}
            <ExportableImage
                filename="demo-band-poster"
                canvas={theme.canvasPresets.poster}
                skeleton="band"
                usesMath
            >
                <ImageFrame
                    week={13}
                    title="BandHeader: Poster Chrome"
                    canvas={theme.canvasPresets.poster}
                    padding={0}
                    header={
                        <BandHeader week={13} title="BandHeader: Poster Chrome">
                            <CtaBadge
                                label="Solve interactively on"
                                url="weavergoldman.com/weekly"
                            />
                        </BandHeader>
                    }
                >
                    <ColumnLayout separator={false} padding={0} weights={[609, 505]}>
                        <RowLayout separator={false} padding={0} weights={[5, 4]}>
                            <CenteredLayout>
                                <Chart
                                    width={330}
                                    height={260}
                                    data={[
                                        { label: "A", value: 92 },
                                        { label: "B", value: 41 },
                                    ]}
                                />
                            </CenteredLayout>
                            <ColumnLayout separator={false} padding={0} weights={[1, 1, 2]}>
                                <CenteredLayout>
                                    <Stat value="0.85" label="Precision" />
                                </CenteredLayout>
                                <CenteredLayout>
                                    <FlowArrow direction="down" />
                                </CenteredLayout>
                                <CenteredLayout>
                                    <DemoDot color={theme.color.muted} />
                                </CenteredLayout>
                            </ColumnLayout>
                        </RowLayout>
                        <RowLayout separator={false} padding={0}>
                            <PartPanel
                                number={1}
                                tone="strong"
                                diagram={<DemoDot color={theme.color.accent} />}
                            >
                                What is <Math>{"\\pi"}</Math> rounded to two decimals?
                            </PartPanel>
                            <PartPanel
                                number={2}
                                tone="soft"
                                diagram={<DemoDot color={theme.color.muted} />}
                            >
                                How many sides does this circle have?
                            </PartPanel>
                        </RowLayout>
                    </ColumnLayout>
                </ImageFrame>
            </ExportableImage>
        </div>
    );
}
