# Troubleshooting

Symptoms first — these are the failure modes that have actually happened, with
the causes that were actually responsible.

---

## Dev server dies right after `npm install`

```
Error: The server is being restarted or closed. Request is outdated
ERR_CLOSED_SERVER
```

`npm install` touches `package.json`, the dev server watches it, and the
resulting hot-restart reliably crashes on Astro 2.10. Not caused by whatever
you installed.

```bash
pkill -f "astro dev"
rm -rf node_modules/.vite .astro
npm run dev
```

Install packages with the dev server stopped and this doesn't come up.

A related trap: after a crash the old log file stops being written while a new
process may still be serving. If output looks frozen, confirm what's actually
running before debugging the symptom.

## A layout's slots are collapsed / the body isn't centered

The composition is inline in `.mdx` instead of in `_index.tsx`. See
[rule 1](composing-images.md#1-compose-in-_indextsx-never-inline-in-mdx).

This one is worth internalizing because it mimics a styling bug — the image
renders, it just renders wrong, so the instinct is to reach for CSS. It isn't
CSS. `StackedLayout` received all its children as one merged blob and put
everything in the prompt slot.

Confirm rather than guess: view source and check whether the body `div` is
empty and whether there's an `astro-slot` wrapper inside the frame. An
`astro-slot` in there means Astro resolved the children, which means the tree
isn't a single React island.

## `Objects are not valid as a React child (found: object with keys {astro:jsx, type, props})`

A JSX-valued prop. See
[rule 2](composing-images.md#2-pass-slots-as-children-not-as-props) — pass
slots as children.

## Fonts render as fallbacks

Shouldn't happen. The `fontFamily` values in `theme` only *name* fonts, but the
`@fontsource/*` CSS carrying the actual `@font-face` rules is imported as a
side effect at the top of `src/components/weekly/dsl/theme.ts` — so any page
rendering any DSL component pulls the fonts in automatically, with nothing to
remember per page.

If fonts really are falling back, check that the component chain reaches
`theme.ts` at all. A component that hardcodes a font stack instead of reading
`theme.font.*` gets no `@font-face` rules with it.

The other version of this: text inside a frame comes out in the *right* family
but the wrong weight. `fontLoadSpecs` lists one entry per `@fontsource` import,
and the two lists have to stay in sync — a weight that's imported but unlisted
isn't waited on before capture, and a weight that's listed but not imported
never arrives. Both lists are at the top of `theme.ts`.

Worth a glance before exporting either way: a PNG captured with fallback fonts
looks only subtly off, and is easy to miss until it's already posted. The export
buttons stay disabled until the fonts have actually loaded, so the window where
that can happen is closed — but only for frames going through
`ExportableImage`.

## Exported math is doubled (`n?n?`) and set in body type

Only ever happens to math *inside an `<svg>`* — a `<foreignObject>` label in a
diagram — and only in the exported PNG; the page itself is fine. The svg is
missing `<KatexSvgStyle />`.

html-to-image inlines each element's computed style onto its clone, which is
what lets the DSL work in class-less inline styles. But it deep-clones an
`<svg>` verbatim and never walks into it (`clone-node.js`:
`node.cloneNode(isSVGElement(node))`, and `cloneChildren` returns early for an
svg), so HTML inside a `foreignObject` reaches the capture with no stylesheet
behind it — and KaTeX's output is nothing but classes. Both halves of the
symptom follow: `.katex-mathml` is what clips the accessibility copy out of
sight, so without it every label renders twice, and `.mathnormal` is what
selects `KaTeX_Math`, so without it the glyphs fall back to body type.

Render `<KatexSvgStyle />` once as the first child of any svg that hosts math.
It carries the rules inside the subtree that gets copied. On the live page it
changes nothing — the same rules are already loaded.

The same blind spot bites fonts from a different direction: html-to-image
decides which `@font-face` rules to embed by walking the tree for used
families, and that walk also stops at every svg
(`getUsedFonts` only recurses into `HTMLElement` children). A face used *only*
inside a diagram is never embedded. In practice the frames get away with it
because their prose renders the same families outside the svg — but a diagram
carrying a face nothing else uses will export in a fallback.

## The frame sits on its skeleton and never appears

`ExportableImage` shows `FrameSkeleton` until two things are true: `ScaleToFit`
has measured the container, and `useFontsReady` reports the webfonts loaded.

- **No JavaScript** — nothing resolves, by design. The frame needs hydration to
  be positioned at all, so there's no correct static state to fall back to.
- **A missing `client:*` directive** on the `Problem`/`Solution` in the `.mdx`,
  which is the same failure as above.
- **A font spec in `theme.ts`'s `fontLoadSpecs` naming a face that isn't
  imported** — it can never resolve. There's a 2.5s timeout that shows the frame
  anyway, so this presents as a consistent 2.5s delay rather than a hang.

## Build fails: "is numbered N but its frontmatter says week: M"

The directory (`012-imbalanced-accuracy`) and the `week` field disagree. Fix
whichever is wrong — they're both the series number, and the check in
`src/utils/weeklyEntry.ts` exists because nothing else can tell them apart.

The same check fires with "must live in a directory named NNN-<name>" if an
entry has no numeric prefix at all, which usually means a file was added
directly under `src/content/weekly/` instead of in its own directory.

## A date renders one day early

Write frontmatter dates unquoted and ISO: `pubDate: 2026-08-10`. A quoted date
(`"Jun 3 2024"`) reaches `new Date` as a string and is parsed as *local*
midnight, while `src/utils/formatDate.ts` formats in UTC — so the two disagree
by a day. Unquoted, YAML types it as a timestamp at UTC midnight and the two
agree everywhere. See the comment in `formatDate.ts` for the full chain.

## The post says the solution isn't posted yet, but it is

The check is `entry.body.includes("<SolutionSection")` in
`src/pages/weekly/[slug].astro`. It's a literal substring match on the raw
`.mdx`, so it misses an aliased import (`import Reveal from ...`) or a
differently-named wrapper. Use the component under its own name.

## The solution prose renders as one unformatted line

Missing blank lines inside `<SolutionSection>`. MDX only parses a JSX block's
contents as markdown when they're separated by blank lines from the tags.

## The image overflows its column / a scrollbar appears

`ScaleToFit` should prevent this. It renders children at true 1080×1350 while
CSS-scaling them down to the container width, never above 1x.

If it's overflowing, something is rendering `ImageFrame` outside an
`ExportableImage` (or `ProblemImage`/`SolutionImage`), which is where
`ScaleToFit` is applied. Don't fix it by widening the article or adding
`overflow-x-auto` — that hides the problem behind a scrollbar and leaves the
real cause in place.

## The whole *page* is wider than a phone, and the image didn't scale down

Different failure from the one above, and it looks like the image ignoring
`ScaleToFit` when it isn't: the frame did scale — to a column that had already
been widened past the viewport by the frame itself.

`ScaleToFit` lays its children out at true canvas size and only shrinks them
with a `transform`, which doesn't affect layout, so the subtree's intrinsic
width is still 1080. That width propagates up as a **min-content floor**:
`max-width` on an ancestor caps how wide it draws but not how wide it demands,
and daisyUI's `.drawer-content` is a grid item, whose default `min-width: auto`
resolves to exactly that floor. The article settles at its `max-w-[750px]`, the
page grows to hold it, and every element on it — header included — is laid out
against a 798px page on a 390px phone.

Two places break the chain, and both are in place:

- `minWidth: 0` on `ScaleToFit`'s own container, so a frame never exports its
  intrinsic width to its ancestors.
- `min-w-0` on `.drawer-content` in `BaseLayout.astro`, which stops *any* wide
  descendant — a fixed-size figure, a long unbroken code line — from widening
  the page instead of being clamped.

If a new page does this again, look for a fixed-size subtree that isn't behind
either guard rather than reaching for `overflow-x` on the article.

## Export buttons don't appear

- Production build — they're stripped by `import.meta.env.DEV` on purpose.
- Missing `client:load` on the component in the `.mdx`. Without hydration the
  markup renders but nothing wires up.

## Exported PNG is the wrong size

It shouldn't be. `toPng` is passed explicit `width`/`height` from
`ExportableImage`'s `canvas` (defaulting to `theme.canvas`) plus a
`pixelRatio`, so the on-screen scale doesn't affect the capture.

If the height is wrong specifically, and the frame is on a non-default canvas,
`canvas` was passed to one of `ImageFrame` / `ProblemImage` and not the other —
the frame renders at one size while the capture crops or pads to the other.
Both need it; see [reference](reference.md#canvases).

Otherwise check whether the captured subtree got an ancestor with a CSS
transform beyond `ScaleToFit`'s.

## Build warns about a file in `src/content/`

A non-content file without a leading underscore. Astro classifies it as
`"unsupported"`. Rename to `_<name>.tsx`, or — for the notebooks and data a
problem was built from — move it under `_work/`. The rule matches any path
*segment*, so hiding a whole directory takes one underscore rather than one per
file.

It's a tidiness warning, not a leak. Nothing under `src/content/` is emitted to
`dist/` regardless, since it isn't a static-copy root.

---

## `/weekly/preview` 404s

It's dev-only by design. The page lives at `src/dev/weekly-preview.astro` —
outside `src/pages/`, so it is not a route — and `astro.config.mjs` injects it
at `/weekly/preview` only when `command === 'dev'`. It never builds into
`dist/`.

If it 404s under `npm run dev`, the dev server likely started before the config
change; restart it. Note `npm run preview` serves the *production* build, so
the sandbox is correctly absent there.

## The week badge shows `#undefined`

`week` wasn't passed down. The `.mdx` must render
`<Problem client:load week={frontmatter.week} />` — the composition file takes
`week` as a prop and never hardcodes it.

## A slider changes a value but a `FunctionPlot` looks the same

`FunctionPlot`'s `range` prop defaults to auto-fitting the y-axis to the
current sampled output. That's fine for a plot shown once, but for an
interactive component where a reader compares magnitude across edits, it's
actively misleading: any output gets stretched to fill the box, so a small
change and a huge change to the same underlying value can render as visually
identical. Pass `range` explicitly (usually matching `domain`) whenever the
plot needs to make magnitude or slope comparable before and after an edit —
see `PerceptronPanel`'s call for the fixed-box pattern, in
[reference](reference.md#interactive-components).

## A horizontally-scrolling container also traps vertical page scroll

Setting `overflowX: "auto"` without an explicit `overflowY` on the same
element makes browsers coerce the other axis to `auto` too (per the CSS
overflow spec), turning the element into a full scroll container that
captures vertical wheel input meant for the page. Wrap only the specific
overflowing content (e.g. a wide `NetworkSolver` row) in the `overflow-x`
container, not the whole surrounding card, and don't set one axis without
deciding what the other should do.

## A measured child sized to its own container ratchets

`ConnectorLines` is sized to the composition's cross-axis extent and is also a
flex child of the box that extent was measured from. Measuring the *container*
made the svg hold up the height it was being measured against: the layout grew
when `n` went up and then refused to shrink when `n` came back down, since the
container could never measure smaller than the child it had already stretched.
Measure the siblings whose size is genuinely independent — here the panel
column, output column, and input node — and never the ancestor whose size the
measured element itself contributes to.

## Known warts

- **Two frontmatter fields are stored but unused**: `dataset` and `interactive`.
  They validate, and nothing reads them yet.
