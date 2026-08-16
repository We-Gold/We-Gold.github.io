// Frontmatter stores weekly metadata lowercase (`deep-dive`, `easy`)
// because that reads well as data. These turn it into display text, so every
// badge capitalizes the same way.

export function weekLabel(week: number): string {
    return `Week ${week}`;
}

export function typeLabel(type: "short" | "deep-dive"): string {
    return type === "deep-dive" ? "Deep Dive" : "Short";
}

export function titleCase(value: string): string {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
}
