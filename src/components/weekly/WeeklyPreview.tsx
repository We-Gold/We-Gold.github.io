import type { ComponentType } from "react";

type ProblemComponent = ComponentType<{
    week: number;
    title: string;
    preview?: boolean;
}>;

// Every week's composition file. The glob lives here, inside React, rather
// than in the .astro index: Astro resolves a client: directive by looking up
// the export at build time, so a dynamically referenced component fails with
// "Unable to resolve a valid export". Doing the lookup on this side means
// Astro only ever hydrates this one statically-imported component.
const compositions = import.meta.glob<{ Problem: ProblemComponent }>(
    "../../content/weekly/*/_index.tsx",
    { eager: true }
);

// Renders a week's real Problem image as its index-card thumbnail, so the
// listing can never show something that has drifted from what gets posted.
export function WeeklyPreview({
    slug,
    week,
    title,
}: {
    slug: string;
    week: number;
    title: string;
}) {
    // The entry's slug is its directory name.
    const found = Object.entries(compositions).find(([path]) =>
        path.endsWith(`/${slug}/_index.tsx`)
    );
    if (!found) return null;
    const Problem = found[1].Problem;
    return <Problem week={week} title={title} preview />;
}
