import type { CollectionEntry } from "astro:content";

// The week number has to be in the directory name (to sort, and for the URL)
// and in frontmatter (to render), so the two can drift. This enforces
// agreement: a mismatch fails the build rather than shipping a URL that
// contradicts the badge on the page.
//
// Lives here rather than in `[slug].astro` because Astro lifts
// `getStaticPaths` into its own scope, where a function declared in the
// component frontmatter isn't visible. Imports are hoisted, so this is.
export function assertWeekMatchesSlug(entry: CollectionEntry<"weekly">) {
    const prefix = entry.slug.match(/^(\d+)-/)?.[1];
    if (!prefix) {
        throw new Error(
            `Weekly entry "${entry.slug}" must live in a directory named ` +
                `NNN-<name> (e.g. 012-imbalanced-accuracy).`
        );
    }
    if (Number(prefix) !== entry.data.week) {
        throw new Error(
            `Weekly entry "${entry.slug}" is numbered ${Number(prefix)} but ` +
                `its frontmatter says week: ${entry.data.week}. Rename the ` +
                `directory or fix the frontmatter so they agree.`
        );
    }
}
