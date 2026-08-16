import type { ReactNode } from "react";
import { theme } from "./theme";

export interface QuestionBlockProps {
    number: number;
    diagram: ReactNode;
    children: ReactNode; // the question text — JSX so it can embed <Math>, links, etc.
    weights?: [number, number]; // diagram's share of the row vs the text's
}

// A numbered question. The number is taken out of flow (absolute, top-left)
// so it can't push the row down or steal height from it; `numberGutter` is
// what keeps the row clear of it.
//
// Diagram and text split the row by weight rather than by their own sizes, so
// a fluid diagram grows with the pane instead of the pane shrinking to a
// fixed-size drawing. `children` rather than a string prop so a question can
// embed <Math> inline — see extending-the-dsl.md.
const numberGutter = 30;

export function QuestionBlock({ number, diagram, children, weights = [2, 3] }: QuestionBlockProps) {
    return (
        <div
            style={{
                position: "relative",
                flex: 1,
                display: "flex",
                minHeight: 0,
                paddingTop: numberGutter,
            }}
        >
            <span
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    fontSize: theme.font.size.caption,
                    color: theme.color.muted,
                }}
            >
                {number}
            </span>
            <div style={{ flex: weights[0], display: "flex", minWidth: 0, minHeight: 0 }}>
                {diagram}
            </div>
            <div
                style={{
                    flex: weights[1],
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    paddingLeft: 16,
                }}
            >
                <p
                    style={{
                        // No `fontFamily`: the containing <ImageFrame> sets
                        // the image's font and this inherits it.
                        fontSize: theme.font.size.body,
                        color: theme.color.ink,
                        // Pinned, because inline KaTeX otherwise inflates the
                        // line boxes of any question containing math.
                        lineHeight: 1.4,
                        margin: 0,
                    }}
                >
                    {children}
                </p>
            </div>
        </div>
    );
}
