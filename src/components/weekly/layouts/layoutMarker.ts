import { isValidElement, type ReactNode } from "react";

// Lets RowLayout/ColumnLayout tell whether a pane is itself a layout that
// draws its own separator, so the two lines can meet flush. A Symbol rather
// than a prop, so it can't collide with a real one.
const DIVIDER_LAYOUT_MARKER = Symbol("dividerLayout");

type MarkedComponent = { [DIVIDER_LAYOUT_MARKER]?: true };

// Apply to a layout's export only if it renders its own <Divider> between
// children. CenteredLayout/StackedLayout stay unmarked, since a pane holding
// one of those still needs normal padding.
export function markAsDividerLayout<T extends (props: never) => ReactNode>(component: T): T {
    return Object.assign(component, { [DIVIDER_LAYOUT_MARKER]: true } satisfies MarkedComponent);
}

// True only for a marked layout whose `separator` isn't explicitly false: a
// `<ColumnLayout separator={false}>` has no line to connect, so it's an
// ordinary leaf.
export function isFlushChild(node: ReactNode): boolean {
    if (!isValidElement(node) || typeof node.type !== "function") return false;
    const marked = (node.type as MarkedComponent)[DIVIDER_LAYOUT_MARKER] === true;
    if (!marked) return false;
    return (node.props as { separator?: boolean }).separator !== false;
}
