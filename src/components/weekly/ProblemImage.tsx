import type { ReactNode } from "react";
import { ExportableImage } from "./dsl/ExportableImage";

export function ProblemImage({
    slug,
    preview = false,
    usesMath = false,
    canvas,
    skeleton,
    children,
}: {
    slug: string;
    preview?: boolean;
    usesMath?: boolean;
    // Both default in <ExportableImage>. Pass them together with the matching
    // props on the wrapped <ImageFrame> when a week is on a non-default
    // canvas — see dsl/ExportableImage.tsx.
    canvas?: { width: number; height: number };
    skeleton?: "divider" | "band";
    children: ReactNode;
}) {
    return (
        <ExportableImage
            filename={`${slug}-problem`}
            preview={preview}
            usesMath={usesMath}
            canvas={canvas}
            skeleton={skeleton}
        >
            {children}
        </ExportableImage>
    );
}
