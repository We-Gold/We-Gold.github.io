# Authoring a week

The full path from empty folder to posted problem. Every week looks like this.

A week is **one directory** in `src/content/weekly/`, holding two published files
and, optionally, the working files the problem was derived from:

```
src/content/weekly/
  012-imbalanced-accuracy/
    index.mdx      ← the post: frontmatter + prose
    _index.tsx     ← the images: React composition
    _work/         ← optional: notebooks, data, scratch (never published)
```

The directory name is the entry's slug and its URL: `/weekly/012-imbalanced-accuracy`.
Astro special-cases `index.mdx`, so the slug is the directory, not `.../index`.

**`NNN` must equal the `week` frontmatter field**, zero-padded to three digits.
The two are checked against each other at build time
(`src/utils/weeklyEntry.ts`) and a mismatch fails the build — the number is in
the directory name so weeks sort and read in order, and in frontmatter so it can
be rendered, and there's no way to derive one from the other.

The leading underscore on `_index.tsx` is load-bearing. Astro classifies
non-content files in `src/content/` as `"unsupported"` and warns on them,
*unless* a path segment starts with `_`, which makes it `"ignored"`. Drop the
underscore and you get a build warning every time.

---

## 0. Work out the problem (optional)

Most weeks start in Python — a dataset to sanity-check, a number to verify
before it goes in a `<Stat>`. Those files live in `_work/` inside the week's own
directory, so the thing that produced a figure sits next to the figure.

The rule is the same underscore rule, applied to a *directory* segment: anything
under `_work/` is invisible to Astro. Loose files at the top of the week
directory are not, and warn on every build:

```
[content] Unsupported file types found. Prefix with an underscore (`_`) to ignore:
- weekly/012-imbalanced-accuracy/data.csv
```

Note what that warning is and isn't. Nothing under `src/content/` is emitted to
`dist/` in the first place — it is not a static-copy root, so an un-underscored
CSV is noisy, not published. The underscore buys a clean build, not privacy.

**These files are committed, not ignored.** A notebook that generates a problem
is the most valuable thing to still have in two years, when a number gets
challenged or a dataset is worth reusing.

### Notebooks

Use [marimo](https://marimo.io) in sandbox mode. Notebooks are plain `.py`, so
they diff in git and review like code — colocating `.ipynb` JSON next to the MDX
would be the one thing that makes a week directory worse to read.

```bash
npm run weekly:notebook src/content/weekly/012-imbalanced-accuracy/_work/generate.py
```

Dependencies are declared in the notebook itself, as
[PEP 723](https://peps.python.org/pep-0723/) inline metadata:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["pandas", "scikit-learn", "marimo"]
# ///
```

`uv` resolves that into an environment **in its own cache**, not beside the
script — a sandbox run leaves no `.venv`, no lockfile, nothing in the week
directory. So there is no per-week cleanup step and nothing to add to
`.gitignore`; if the cache itself gets large, that's global and uv owns it
(`uv cache prune`).

Pinning per notebook rather than per repo is deliberate: week 40 shouldn't break
because week 12 needed an old scikit-learn, and a Node project shouldn't carry a
root `pyproject.toml` for the sake of a few scripts.

### If readers need the data

Keep it colocated — it does not have to go in `public/`. Put the file beside
`index.mdx` with an underscore prefix and import it with `?url`:

```
012-imbalanced-accuracy/
  index.mdx
  _index.tsx
  _transactions.csv    ← the reader's copy
  _work/               ← how it was produced
```

```mdx
import datasetUrl from "./_transactions.csv?url";

<a href={datasetUrl} download="transactions.csv">Download the data</a>
```

Two independent systems have to be satisfied and both are: the underscore hides
the file from Astro's content classifier (no build warning), while Vite ignores
the underscore entirely and emits it as a content-hashed asset —
`dist/_astro/_transactions.c0282fa6.csv`, byte-identical, with the href
rewritten for the deployed base path.

**The `?url` suffix is required.** Without it Vite tries to parse the file as a
module.

**`download=` is required too**, and isn't decoration: the emitted filename is
hashed and underscore-prefixed, so without it the reader saves
`_transactions.c0282fa6.csv`.

**The import is the publication.** A colocated `_data.csv` that nothing imports
ships nothing — and warns about nothing, because the underscore silenced the one
message that would have mentioned it. This is the failure mode to watch for; it
is completely silent.

Files under 4 KB come out as inline `data:` URIs instead of separate assets
(Vite's `assetsInlineLimit`). Downloads still work — the `download` attribute
applies to data URIs — so this needs no handling, but it does mean a dataset can
change representation by crossing that threshold. Don't set
`assetsInlineLimit: 0` to force consistency: it's global, and would stop small
images and SVGs inlining across the whole site.

Keep the roles separate. `_work/` is *how the problem was made* and is never
emitted; the colocated copy is *what the reader gets*. Deriving the second from
the first is the point; serving out of the first isn't possible.

### If the answer is worked-out data, not prose

A week whose solution is a target function or a solved set of weights (rather
than a paragraph) should keep that data in a colocated `_solution.ts` —
underscore-hidden like everything else here — not in `src/utils/`. A shared
util is for math that's generic across weeks (`src/utils/mlp.ts`'s
`relu`/`perceptron`/`networkOutput`); a specific week's target shape or worked
answer is that problem's data, and mixing the two makes the util harder to
reuse for the next week that needs the general math but not this week's
numbers. See `001-easy-win/_solution.ts` for the pattern, and
[reference](reference.md#interactive-components) if the week also needs a
live/read-only component to go with it.

`public/weekly/<slug>/` remains the right home only for a file needing a stable,
unhashed, guessable URL — one to paste into a post directly rather than link
from the page.

## 1. Write the images first

Start with `_index.tsx`. The image is the thing that has to work as a
standalone artifact on someone's phone screen; the prose is support.

```tsx
import { ProblemImage } from "../../../components/weekly/ProblemImage";
import { SolutionImage } from "../../../components/weekly/SolutionImage";
import { ImageFrame } from "../../../components/weekly/dsl/ImageFrame";
import { Prompt } from "../../../components/weekly/dsl/Prompt";
import { Stat } from "../../../components/weekly/dsl/Stat";
import { StackedLayout } from "../../../components/weekly/layouts/StackedLayout";

const slug = "0NN-your-name"; // the containing directory
const promptText = "Your question, phrased so it fits in two lines.";

interface WeekProps {
    week: number;
    title: string;
    preview?: boolean;
}

export function Problem({ week, title, preview }: WeekProps) {
    return (
        <ProblemImage slug={slug} preview={preview}>
            <ImageFrame week={week} title={title}>
                <StackedLayout>
                    <Prompt>{promptText}</Prompt>
                    <Stat value="?" label="the setup, in a few words" />
                </StackedLayout>
            </ImageFrame>
        </ProblemImage>
    );
}

export function Solution({ week, title, preview }: WeekProps) {
    return (
        <SolutionImage slug={slug} preview={preview}>
            <ImageFrame week={week} title={title}>
                <StackedLayout>
                    <Prompt>{promptText}</Prompt>
                    <Stat value="No" label="the payoff, in a few words" />
                </StackedLayout>
            </ImageFrame>
        </SolutionImage>
    );
}
```

Both exports are required, and both must be named exactly `Problem` and
`Solution`.

`week` and `title` are props, never hardcoded — the `.mdx` passes them down from
frontmatter so what the image header shows can't drift from what the post chrome
and the index page show. `slug` drives the export filenames; set it once at the
top and keep it equal to the containing directory name (`012-imbalanced-accuracy`)
or the downloads get confusing.

Keep titles short enough to sit on one header line beside the `Weaver's Weekly
#NN` mark — roughly 50 characters. Longer ones wrap to a second line, which
eats into the content area rather than truncating.

`preview` is threaded through but never set by the `.mdx`. The `/weekly` index
sets it when rendering `Problem` as a card thumbnail, which drops the export
buttons. Keep it in the template — the index finds the composition by directory,
so a week that omits it renders buttons under its own index card.

Reuse `promptText` across both so the pair reads as one thought with a reveal.
See [composing images](composing-images.md) for what goes in the body slot.

## 2. Write the post

`index.mdx`, importing from the sibling:

```mdx
---
title: "Is 99% Accuracy Actually Good?"
week: 12
type: short
pubDate: 2026-08-10
tags: ["classification", "evaluation metrics"]
difficulty: easy
---

import { Problem, Solution } from "./_index";
import SolutionSection from "../../../components/weekly/SolutionSection.astro";

<Problem client:load week={frontmatter.week} title={frontmatter.title} />

<SolutionSection>

<Solution client:load week={frontmatter.week} title={frontmatter.title} />

Prose explaining the answer.

</SolutionSection>
```

`client:load` is required on both — without it the component renders on the
server only, and the export buttons never hydrate.

A week can render additional `client:load` islands beyond `Problem`/`Solution`
— e.g. a live solver a reader experiments with before revealing the answer
(`001-easy-win`'s `InteractiveNetworkSolver`). Put anything that helps find
the answer but doesn't show it **outside** `<SolutionSection>`, same as the
prose rule below: the toggle's contract is "everything behind it is the
answer," and a tool for finding the answer isn't the answer itself.

Everything that gives the answer away goes inside `<SolutionSection>`, which
renders it behind a "Reveal solution" toggle. Two things about it are load-
bearing:

- **The blank lines matter.** MDX only parses the contents of a JSX block as
  markdown when they're separated by blank lines. Without them the prose comes
  out as one literal line.
- **Its presence is the signal.** `[slug].astro` checks the raw body for
  `<SolutionSection`, and a post without one renders a "solution not posted
  yet" notice instead. So while the problem is up and the solution isn't
  written, just leave the whole block out — there's no flag to set, and no way
  for a flag to disagree with what's actually on the page.

Don't add a `## Solution` heading; the toggle is the heading.

`frontmatter` is a module-scope binding that Astro's MDX integration injects
into every entry, so it's available in the body with no import. Passing `week`
and `title` through it is what keeps the image and the page in sync; forget
`week` and the badge renders `#undefined`, which is at least obvious on sight.

Full frontmatter schema: [reference](reference.md#frontmatter). `title`,
`week`, `type`, `pubDate`, `difficulty` are required; everything else is
optional.

Write `pubDate` unquoted and ISO (`2026-08-10`). Quoting it changes how it's
parsed and renders the date a day early — see
[troubleshooting](troubleshooting.md#a-date-renders-one-day-early).

Write `tags` and `difficulty` lowercase. `src/utils/weeklyLabels.ts` title-cases
them at render, so capitalizing in frontmatter produces the same badge but makes
the data inconsistent between entries.

## 3. Preview

```bash
npm run dev
```

Then `/weekly/<slug>`. The images render inline in the post, scaled down to
fit the column but at true internal resolution.

Check on a narrow window too. The image is a fixed 1080×1350 that gets visually
scaled — LinkedIn renders it at roughly 390px on a phone, so everything is
divided by nearly three, and text that reads fine at full size can be
illegible in the feed. Size text from `theme.font.size`, which is calibrated
for that, rather than eyeballing px against the full-size canvas. If it's
tight, give the pane more room rather than dropping below the scale.

Don't set a `fontFamily` anywhere inside a frame. `ImageFrame` sets one on the
frame root and everything inherits it, which is what keeps an image in a single
family — see `theme.font` in [reference](reference.md#theme).

The canvas is 4:5 portrait, so **stacking is the default and horizontal
splitting is the exception** — `ColumnLayout` where you'd once have reached
for `SplitLayout`. Width is the plentiful axis and height the rationed one,
which is worth remembering when picking a shape: a square drawing in a wide
pane is capped by the pane's height and leaves the extra width empty. That's a
cost, not a bug — take it when the subject is genuinely square (`001`'s W plot,
where a wide aspect stretches the curve), and prefer a wide aspect when it
isn't. A fluid SVG's own `preserveAspectRatio` centres it in the leftover
width, so no centring layout is needed for that.

Anything that draws should be **fluid** — an SVG with a `viewBox` that fills
its pane, not a fixed `width={440}`. A fixed-size drawing doesn't grow when
you give it a bigger pane, which turns every layout change into hand-tuning
pixel constants. If you find yourself nudging numbers to make a drawing fit,
that's the signal it should be fluid instead. See "Fluid atoms" in
`extending-the-dsl.md`.

`/weekly/preview` renders the atoms gallery in isolation, which is faster for
iterating on a component than reloading a real entry. It exists only under
`npm run dev` — the page lives outside `src/pages/` and is injected as a route
in dev only, so it never ships.

## 4. Export

Each image has **1x / 2x / 4x** buttons beneath it in dev. They capture at a
the frame's true canvas size regardless of the current on-screen scale,
multiplied by the chosen pixel ratio.

Downloads land as `<slug>-problem@2x.png` / `<slug>-solution@2x.png` — so a
week rendering more than one treatment of the same image has to give the extra
one its own slug (`<ProblemImage slug={`${slug}-poster`}>`), or the second
download overwrites the first.

**2x is the default choice** for posting. 1x is soft on retina displays; 4x is
for when something needs to be cropped or blown up later.

The buttons are stripped from production builds (`import.meta.env.DEV`), so
they exist only while `astro dev` is running.

## 5. Post

Problem image goes out first. The solution image and the prose section go out
on the follow-up, linking back to the entry page.

Backfill `linkedinProblemUrl` once the problem post is up, and
`linkedinSolutionUrl` once the solution post is. Each renders a "Discuss on
LinkedIn" link at the foot of the entry as soon as it exists, so filling in only
the first is a normal intermediate state, not a half-finished one.

## 6. Ship

```bash
npm run build
```

Should complete clean with no warnings. A warning naming a file in
`src/content/` almost always means a missing underscore (step 1).
