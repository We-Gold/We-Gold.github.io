import { Children, type ReactNode } from "react";

// Takes exactly two children: the prompt (headline, up top) and the body
// (centered below). Positional children rather than JSX props because a prop
// written inline in an .astro/.mdx file compiles to Astro's own vnode format,
// which React can't render. Nested children compile correctly either way.
export function StackedLayout({ children }: { children: ReactNode }) {
    const [prompt, body] = Children.toArray(children);
    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 28,
                minHeight: 0,
            }}
        >
            <div>{prompt}</div>
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 0,
                }}
            >
                {body}
            </div>
        </div>
    );
}
