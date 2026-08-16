import "prismjs/themes/prism-tomorrow.css";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import { theme } from "./theme";

export function Code({
    language = "python",
    children,
}: {
    language?: string;
    children: string;
}) {
    const grammar = Prism.languages[language] ?? Prism.languages.markup;
    const html = Prism.highlight(children.trim(), grammar, language);

    return (
        <pre
            style={{
                fontFamily: theme.font.code,
                fontSize: 22,
                lineHeight: 1.6,
                background: "#0f172a",
                borderRadius: 10,
                padding: "20px 24px",
                margin: 0,
                overflow: "hidden",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
    );
}
