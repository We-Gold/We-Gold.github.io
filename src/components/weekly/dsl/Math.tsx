import "katex/dist/katex.min.css";
import katex from "katex";
import { theme } from "./theme";

// A rendering primitive like `Code.tsx`, shared from day one rather than
// waiting for a third week. Uses `katex` directly because `renderToString` is
// all `react-katex` adds. Importing katex and its CSS only from this file is
// what keeps it out of pages that don't render math, since Astro code-splits
// per page.
export function Math({
    children,
    displayMode = false,
    color = theme.color.ink,
    fontSize,
}: {
    children: string;
    displayMode?: boolean;
    color?: string;
    // Omitted means "inherit the surrounding font-size" — KaTeX sizes
    // everything in `em`s, so inline math tracks its context. Pass it only
    // for standalone/display math, or small UI labels outside sized prose.
    fontSize?: number;
}) {
    const html = katex.renderToString(children, {
        throwOnError: false,
        displayMode,
    });

    return (
        <span
            style={{ color, fontSize, lineHeight: 1 }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
