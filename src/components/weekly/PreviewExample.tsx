import { ExportableImage } from "./dsl/ExportableImage";
import { ImageFrame } from "./dsl/ImageFrame";
import { Prompt } from "./dsl/Prompt";
import { Stat } from "./dsl/Stat";
import { StackedLayout } from "./layouts/StackedLayout";

export function PreviewExample() {
    return (
        <ExportableImage filename="weekly-12-problem">
            <ImageFrame week={12} title="Is 99% Accuracy Actually Good?">
                <StackedLayout>
                    <Prompt>
                        A model hits 99% accuracy on a dataset that&rsquo;s 99%
                        one class. Is it good?
                    </Prompt>
                    <Stat
                        value="No"
                        label="Accuracy is misleading on imbalanced data"
                    />
                </StackedLayout>
            </ImageFrame>
        </ExportableImage>
    );
}
