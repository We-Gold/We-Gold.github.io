# Reference

## File map

```
src/content/weekly/
  NNN-<name>/                    one directory per week; NNN must equal `week`
    index.mdx                    the post; slug is the directory name
    _index.tsx                   the images (underscore required)
    _<name>.csv                  optional: a reader-downloadable file. Ships
                                 only if imported with `?url`; see authoring
    _solution.ts                 optional: week-specific worked-answer data
                                 (target values, solved weights) — kept out
                                 of src/utils/ because it's this problem's
                                 answer, not a general utility; see
                                 001-easy-win/_solution.ts
    _work/                       optional: notebooks + data the problem came
                                 from; underscore hides it from Astro. Never
                                 emitted — src/content/ isn't a copy root
  ../config.ts                   collection schema

src/components/weekly/
  ProblemImage.tsx               ExportableImage + "<slug>-problem"
  SolutionImage.tsx              ExportableImage + "<slug>-solution"
  SolutionSection.astro          "Reveal solution" toggle; also the marker
                                 that a solution exists at all
  WeeklyCard.astro               /weekly gallery tile
  WeeklyPreview.tsx              renders a week's Problem as its gallery tile preview
  PreviewExample.tsx             sample composition for /weekly/preview
  AtomsGallery.tsx               atom demos for /weekly/preview
  dsl/
    theme.ts                     design tokens + @fontsource imports
    ImageFrame.tsx               the canvas + header; 1080×1350 by default
    FrameTitle.tsx               the problem title, header left
    WeaverWeeklyLabel.tsx        the wordmark, header right
    WeekBadge.tsx                "#12", header right
    ExportableImage.tsx          export buttons + ScaleToFit + skeleton
    ScaleToFit.tsx               true-size DOM, scaled visually
    ScaledSvg.tsx                a fluid <svg> whose viewBox scale stays 1, so
                                 WebKit paints foreignObject labels in place
    FrameSkeleton.tsx            %-based placeholder, correct at first paint
    useFontsReady.ts             resolves when the DSL webfonts have loaded;
                                 takes an optional extra font-spec list (see
                                 katexFontLoadSpecs) on top of the DSL's own
    Prompt.tsx  Stat.tsx  Table.tsx  Code.tsx  Chart.tsx  UnitGrid.tsx  Math.tsx
    KatexSvgStyle.tsx              KaTeX's rules, carried inside an <svg> so a
                                   foreignObject label survives export
    QuestionBlock.tsx  LinkText.tsx
    Divider.tsx                    orientation-aware rule line, theme.color.divider
    BandHeader.tsx                 full-bleed accent band, alternative to the
                                   default header row (exports bandHeaderHeight)
    CtaBadge.tsx                   the outlined call to action, for the band
    PartPanel.tsx                  tinted full-bleed question panel
                                   (exports partPanelHeight)
    FlowArrow.tsx                  fluid directional arrow between two visuals
  layouts/
    StackedLayout.tsx              prompt on top, body centered below
    RowLayout.tsx                  N children in a row, weights + separator
    ColumnLayout.tsx               N children in a column, weights + separator
    SplitLayout.tsx                two(+)-pane split, built on RowLayout
    CenteredLayout.tsx             single centered child, no prompt slot
    layoutMarker.ts                internal: tags RowLayout/ColumnLayout/
                                   SplitLayout so nested dividers connect;
                                   not a component
  interactive/
    FunctionPlot.tsx              SVG line-plot primitive; see below
    InputNode.tsx                 "0 → 1" badge for the scalar input
    WeightControl.tsx             labeled slider + numeric input, editable-only
    NStepper.tsx                  integer stepper with +/- buttons
    PerceptronPanel.tsx           one hidden unit: label, plot, editable/
                                  read-only weights
    OutputControls.tsx            the linear output node: weights + bias
    ConnectorLines.tsx            fan of lines from the panels to the output
                                  node, either axis, from measured positions
    NetworkSolver.tsx             composition core shared by the static
                                  Solution export and the live island
    InteractiveNetworkSolver.tsx  page-level React island; owns all state

src/layouts/WeeklyLayout.astro   post chrome
src/utils/weeklyLabels.ts        raw frontmatter → badge display text
src/utils/formatDate.ts          frontmatter date → display string (UTC; see file)
src/utils/weeklyEntry.ts         build-time check that NNN- matches `week`
src/utils/mlp.ts                 generic MLP math (relu, perceptron,
                                 networkOutput, samplePoints) backing the
                                 interactive/ components — no week-specific
                                 data; that belongs in a week's own
                                 _solution.ts
src/pages/weekly/
  index.astro                    gallery grid of all weeks
  [slug].astro                   entry route
src/dev/
  weekly-preview.astro           component sandbox; injected at
                                 /weekly/preview in dev only, never built
```

## Frontmatter

Defined in `src/content/config.ts`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Also the image header, via `title={frontmatter.title}` |
| `week` | number | yes | Single source of truth; flows to the image via `week={frontmatter.week}` |
| `type` | `"short"` \| `"deep-dive"` | yes | |
| `pubDate` | date | yes | Sorts the index |
| `difficulty` | `"easy"` \| `"medium"` \| `"hard"` | yes | |
| `tags` | string[] | no | Defaults to `[]` |
| `dataset` | string | no | Stored, unused |
| `interactive` | `"sql"` \| `"python"` | no | Stored, unused |
| `linkedinProblemUrl` | url | no | Renders a "Discuss on LinkedIn" link; backfill after posting |
| `linkedinSolutionUrl` | url | no | Same, alongside the problem link |

`week` is not derived from the filename or auto-incremented, so set it by hand
— but set it in exactly one place. The `.mdx` passes it into `Problem` and
`Solution`, which pass it to `ImageFrame`, so the image badge, the post chrome,
and the index listing all read the same number. `title` travels the same path
for the same reason: it's the header of the image as well as the heading of the
post, and the two must not drift.

## Design tokens

`src/components/weekly/dsl/theme.ts`. Fixed values; not dark-mode aware, by
design — exports are static artifacts.

```
canvas.width       1080
canvas.height      1350      4:5 portrait — the tallest LinkedIn shows uncropped
canvas.background  #ffffff

canvasPresets.poster  1080×1263   the banded poster canvas — see "Canvases" below

color.accent       #0d9488   teal-600, matches the site
color.ink          #171717   primary text
color.headerInk    #374151   the header row, softer than ink
color.muted        #6b7280   secondary text
color.divider      #e5e7eb   rules, inactive fills
color.guide        #b3b7bd   large connective shapes — an arrow between two visuals

color.onAccent        #ffffff                 text on an accent fill
color.onAccentBorder  rgba(255,255,255,.43)   hairlines on an accent fill
color.panelStrong     rgba(13,148,136,.42)    accent at 42% — a part panel's tint
color.panelSoft       rgba(13,148,136,.29)    accent at 29% — the adjacent panel

spacing.sm         16
spacing.md         32        shared default for RowLayout/ColumnLayout/SplitLayout's `padding`
spacing.lg         48

font.label         'Fraunces Variable', serif   the standard frame; the poster's band
font.body          'Inter', sans-serif          the live page; the poster below the band
font.code          'Roboto Mono', monospace
font.wonk          { fontVariationSettings: '"WONK" 1' }   spread wherever the serif is set

font.weight.extralight 200   Inter only, and only the poster's "Part N" numerals
font.weight.light      300
font.weight.regular    400
font.weight.semibold   600

font.size.caption  22        tick labels, question numbers, secondary text
font.size.body     28        question and body text
font.size.title    34        prompts and headings
font.size.header   38        the frame's header row

font.size.poster.badge    27   the header band's call-to-action lines
font.size.poster.subhead  37   "Weaver's Weekly #N" under a banded title
font.size.poster.prose    48   a part panel's question text
font.size.poster.lead     50   the problem title, banded
font.size.poster.display  60   "Part N", and standalone display labels
```

### Text roles

`textRole` (exported from `theme.ts` alongside `theme`) bundles family, weight
and size into the poster design's named type styles. Spread one instead of
picking the three tokens separately:

```
textRole.posterTitle     Fraunces 600 / 50, WONK   the band's title line
textRole.posterSubhead   Fraunces 300 / 37, WONK   "Weaver's Weekly #N"
textRole.posterBadge     Inter 300 / 27            the CTA box's two lines
textRole.posterDisplay   Inter 200 / 60            "Part N"
textRole.posterProse     Inter 300 / 48            a part panel's question text
```

The tokens above let an atom pair any family with any size, and nothing stops
it setting the serif at the prose size — the drift that had the part panels in
Fraunces when the design calls for Inter. A role can't come apart that way.

The families are not interchangeable. On the **standard** canvas `ImageFrame`
sets `font.label` on the frame root, so the image is serif throughout and
matches its own header. On the **poster** canvas the split is deliberate: the
band is serif, everything under it is Inter, and that contrast is what makes
the header read as a printed masthead over an interface. `font.body` is also
what the live page below the image uses.

`font.wonk` only does anything on the serif — it's a Fraunces variable axis,
and Inter has no equivalent. See "Fonts" below for why the family is named
`'Fraunces Variable'`.

That means **components rendered inside a frame should not name a
`fontFamily` at all** — they inherit it. `html-to-image` serializes *computed*
styles, so inheritance survives the capture; the "inline styles only" rule is
about not relying on stylesheets, not about restating inherited values. A
component that renders in both places (`FunctionPlot`) uses
`fontFamily: "inherit"` so it follows whichever context it's in.

`font.size.header` sits above `title` on purpose: the header is the one line
that has to survive a thumbnail. At 0.36x it lands around 14px where `title`
would be ~12px.

The `font.size` scale is sized for the canvas as it is actually *viewed*, not
as it is authored. LinkedIn renders a feed image at roughly 390px on a phone,
a ~0.36x scale, so anything below `caption` lands under ~8px and is
unreadable. Pick from this scale rather than eyeballing a px value against
the 1080px canvas at full size.

The scale governs HTML text only. Text inside a fluid SVG scales with its
viewBox, so a `fontSize` there is in the drawing's coordinate space, not px —
see "Fluid atoms" below.

`font.size.poster` is a **second scale, not a retune of the first**. The four
sizes above fit a dense image — hero plus two questions plus a tip box — where
a larger size would cost a pane. The banded poster treatment moves the call to
action into the header and gives each question a whole panel, so it has the
room to set everything roughly 1.5x larger. Both are legible at 0.36x; they
differ in how much the image chooses to say. Pick one scale per image and stay
in it — mixing them is what makes a frame look like two designs.

### Canvases

`theme.canvas` (1080×1350) is the default and what `ImageFrame`,
`ExportableImage`, and `FrameSkeleton` all assume when nothing is passed.
`theme.canvasPresets` holds the alternatives, currently just `poster`
(1080×1263) — 87px shorter, because its full-bleed band and panels carry the
structure that padding and divider rules carry on the taller canvas.

A non-default canvas has to be passed **twice**: to `<ImageFrame canvas={…}>`,
which sizes the frame, and to the surrounding `<ProblemImage canvas={…}>`,
which sizes the export capture and the on-page scale box. They're separate
props rather than one because the frame and its export wrapper are separate
components; a mismatch shows up as a cropped or letterboxed PNG, so set both
or neither. Pass `skeleton="band"` alongside them when the frame uses a
`BandHeader`, or the placeholder visibly changes shape as the frame fades in.

### Fonts

`theme.ts` owns both the `@font-face` imports and the matching
`document.fonts.load()` shorthands in `fontLoadSpecs`. **The two lists have to
stay in sync** — `useFontsReady` gates the export on the specs, so a face that
is imported but unlisted can still be mid-fetch when the frame captures.

Fraunces comes from `@fontsource-variable/fraunces/wonk.css`, not the static
`@fontsource/fraunces`. Two consequences worth knowing:

- **The family is `'Fraunces Variable'`, not `'Fraunces'`.** A load spec naming
  the latter matches nothing, resolves to a fallback, and reports ready
  instantly — so the check passes while the image captures in the wrong face.
  If the serif ever exports looking like Times, check this first.
- **`font.wonk` only works because the build is variable.** A static instance
  has its axes baked at their defaults (`WONK 0`), so `fontVariationSettings`
  on one is silently inert. The `wonk` subset carries `wght` + `WONK`; the
  `full` subset adds `opsz` and `SOFT` for roughly 3x the bytes, and neither
  axis is used here.

Inter is loaded at 200/300/400/600 — the first two exist for the poster's
numerals and prose respectively.

`katexFontLoadSpecs` (also exported from `theme.ts`) lists the KaTeX webfont
specs that `useFontsReady` needs when a frame renders `Math` — see
`usesMath` under [structural components](#structural-components). Inline
variables in poster prose go through `Math`/KaTeX, not Inter's italic, so no
italic face is loaded for either family.

## Atoms

| Component | Props | Notes |
|---|---|---|
| `Prompt` | `children: ReactNode` | 34px, weight 600. The question. |
| `Stat` | `value: string`, `label: string` | 96px Fraunces value in accent, 20px muted label. |
| `Table` | `headers: string[]`, `rows: (string \| number)[][]` | 22px. ~5 rows max before it stops fitting. |
| `Code` | `children: string`, `language?: string` | Default `"python"`; only Python is registered. Dark `#0f172a` background. |
| `Chart` | `data: {label, value}[]`, `width?`, `height?`, `highlightLabel?` | visx bars, default 700×380. `highlightLabel` paints one bar in accent. |
| `UnitGrid` | `groups: {count, color}[]`, `columns?`, `cellSize?`, `gap?`, `arrangement?`, `seed?` | One cell per observation. Total is derived from `groups` — never passed. Defaults 10 cols / 22px / 5px gap. |
| `Math` | `children: string` (LaTeX), `displayMode?`, `color?`, `fontSize?` | KaTeX, via `katex.renderToString` (not `react-katex`). Inline by default; `displayMode` centers it as its own block. `fontSize` is unset by default, so inline math inherits the size of whatever it's dropped into (e.g. inside `Prompt`); pass it explicitly for standalone math or small UI labels outside sized prose. A rendering primitive like `Code`, shared from day one rather than waiting for a third week. |
| `KatexSvgStyle` | none | Also **audits its own svg in dev** for the WebKit foreignObject paint bug — viewBox scale, viewBox origin, and any ancestor `transform` — and `console.error`s a diagnosis. KaTeX's stylesheet as a `<style>` element, for placing **inside** an `<svg>` that renders `Math` in a `foreignObject`. Required there: html-to-image deep-clones an svg verbatim without inlining computed styles, so a label whose entire appearance is classes exports doubled (`n?n?`, the un-clipped MathML) and in body type. Render it once as the svg's first child; on the page it's a no-op. `@font-face` is stripped — those URLs are relative and would both fail and shadow the data-URI faces html-to-image embeds. See [troubleshooting](troubleshooting.md#exported-math-is-doubled-nn-and-set-in-body-type). |
| `BandHeader` | `week: number`, `title: string`, `children?: ReactNode` | The full-bleed accent band, as an alternative to `ImageFrame`'s default header row. Title and series mark stack on the left in `onAccent`; `children` is an optional right-hand slot (a `CtaBadge`, typically), centered against the band rather than the title. The mark is one string — `Weaver's Weekly #N` — rather than the `WeaverWeeklyLabel`/`WeekBadge` pair, since nothing separates the halves here. Pass it to `<ImageFrame header={…}>` with `padding={0}`, which is what puts it flush to the canvas edges. Exports `bandHeaderHeight` (149) so `FrameSkeleton` can reproduce it before any type has loaded. |
| `CtaBadge` | `label: string`, `url: string` | The call to action as an outlined box for the header band; `url` is underlined on a second line. Plain text, not an `href` — nothing in an exported PNG is clickable, same reasoning as `LinkText`. Styled for an accent background, which is why it doesn't reuse `LinkText` (teal-on-teal would vanish). Replaces the in-body tip-box pattern, which spends a whole pane on a line the reader needs once. Its padding is optical rather than a `spacing` token, partly so a normal-length title still fits on one line beside it. |
| `PartPanel` | `number: number`, `tone: "strong" \| "soft"`, `diagram: ReactNode`, `children: ReactNode` | The tinted, full-bleed counterpart to `QuestionBlock` — same job, arranged for a canvas that gives each question a whole panel: the number becomes a `Part N` heading at `poster.display`, the diagram sits above the text rather than beside it, and the tint carries the separation a `Divider` carries otherwise. Adjacent panels take different `tone`s so the split reads without a rule between them. Sets **no blend mode**: the diagrams are inline SVG with transparent backgrounds, and `mix-blend-multiply` would tint the node fills, which are deliberately the canvas background. Exports `partPanelHeight` (505). |
| `FlowArrow` | `direction?: "down" \| "left" \| "up" \| "right"` (default `"down"`), `color?: string` | A plain directional arrow for an image that has to say "this becomes this" without a caption. Fluid — authored pointing down in a 58×128 viewBox and rotated, so all four directions stay one shape. Defaults to `color.guide`, not `muted`: filled across a few thousand square pixels, `muted` reads as a third subject rather than as a pointer. |
| `QuestionBlock` | `number: number`, `diagram: ReactNode`, `children: ReactNode`, `weights?: [number, number]` | A numbered question. The number is absolutely positioned top-left, out of flow, so it can't push the row down or steal height from it; a `paddingTop` gutter keeps the row clear of it. Diagram and text split the row by `weights` (default `[2, 3]`) rather than by their own sizes — so a **fluid** diagram grows with the pane instead of the pane shrinking to a fixed drawing, and two questions' text columns start at the same x even when their diagrams differ. Sizes come from `theme.font.size` (`caption` for the number, `body` for the question), with `lineHeight` pinned so inline KaTeX can't inflate the line boxes. `children` (not a string prop) so a question can embed `<Math>` inline. Promoted to `dsl/` ahead of the usual third-week rule — worked example: `001-easy-win/_index.tsx`. |

### `UnitGrid` arrangement

`arrangement="grouped"` (default) leaves cells in group order, so each group is
one contiguous block and the grid reads as a **proportion** — a stacked bar made
of countable units. `arrangement="scattered"` permutes them, so a small group
reads as **incidence**: needles through a haystack. Same numbers, different
claim; pick the one matching the sentence you'd write underneath.

Scatter is seeded (`seed`, default `1`) and never uses `Math.random`. These
frames get re-exported whenever a title or number is corrected, and a re-export
has to match what was already posted — a random layout would let the live page
and the posted PNG disagree with nothing to catch it. Bump `seed` to reroll a
placement you don't like; the result is stable forever after.

A plain shuffle can still clump — at 5-of-100 the default seed leaves a mild
left-column bias. Reroll rather than reaching for a stratified layout.

The grid grows with the count instead of shrinking to fit, so a unit is the same
size in every week it appears. Past roughly 250 cells at the default `cellSize`
it outgrew the old 628px canvas; the 1350px portrait canvas raises that
ceiling considerably, but nothing warns, so check the frame.

## Structural components

| Component | Props | Notes |
|---|---|---|
| `ProblemImage` / `SolutionImage` | `slug: string`, `preview?: boolean`, `usesMath?: boolean`, `canvas?`, `skeleton?`, `children` | Wrap `ExportableImage`, derive the filename. `canvas`/`skeleton` forward straight through — see [Canvases](#canvases). |
| `ExportableImage` | `filename: string`, `preview?: boolean`, `usesMath?: boolean`, `canvas?: {width, height}`, `skeleton?: "divider" \| "band"`, `children` | 1x/2x/4x buttons, dev only. `canvas` (default `theme.canvas`) sizes the capture, the aspect box the frame is scaled into, and the skeleton covering it — it must match the wrapped `ImageFrame`'s. Adds a page-only drop shadow around the frame. `preview` drops both (used by index thumbnails). `usesMath` makes export also wait on KaTeX's fonts — set it whenever the frame renders `Math`, otherwise leave it off so weeks without math skip that font fetch. |
| `WeeklyPreview` | `slug: string`, `week: number`, `title: string` | Looks the week's `Problem` up by slug and renders it as the `/weekly` gallery tile preview. |
| `ImageFrame` | `week: number`, `title: string`, `children`, `canvas?: {width, height}`, `padding?: number \| string`, `header?: ReactNode` | The canvas, header, divider. The default header is the title left, `Weaver's Weekly #NN` right. Also **the one font decision for an image**: sets `theme.font.label` on the frame root for everything inside to inherit. `canvas` defaults to `theme.canvas`; `padding` defaults to `"32px 40px"` and takes `0` for a full-bleed frame, where each region owns its inset instead; `header` replaces the default row wholesale (a `BandHeader` goes here). It still takes `week`/`title` when `header` is passed, so a caller can't forget to thread them. |
| `FrameTitle` | `children: string` | `font.size.header` Fraunces in `headerInk`. The header's left side; matched in size and weight to `WeaverWeeklyLabel`/`WeekBadge` opposite it — change one and change all three. |
| `ScaleToFit` | `width: number`, `height: number`, `onMeasured?: () => void`, `children` | True DOM size, visual downscale, never above 1x. `onMeasured` fires once, on first measurement. Scale is driven by container **width** only — with a 4:5 canvas the image fills its column and runs ~1.25x that wide in height. Don't add a viewport-height cap to "fix" that: it silently shrinks the image well below the column width, which is the opposite of what portrait is for. Its container also sets **`minWidth: 0`**: the children are laid out at full size and only shrunk by a transform, so without it their intrinsic width propagates upward as a min-content floor and widens the whole page on a phone instead of scaling the frame — see [troubleshooting](troubleshooting.md). |
| `ScaledSvg` | `width: number`, `height: number`, `children` | A fluid `<svg>` for drawings that label themselves with `Math`. Renders the svg at **exactly** its viewBox size and does the fitting with a CSS `transform` on a wrapper, so the svg's internal viewBox scale is always 1. That is not a style preference: WebKit mis-paints `<foreignObject>` content whenever the viewBox scale is anything but 1 — the box is laid out correctly and Safari's inspector reports it correctly, but the glyphs are *painted* offset toward the origin. `viewBox` + `width: 100%`, the obvious way to make a drawing fluid, triggers it on nearly every container size. The wrapper takes `width: 100%` plus a matching `aspect-ratio`, i.e. the same intrinsic sizing the svg itself had, so it occupies the identical box and scales by **width** only — fitting by `min(width, height)` instead letterboxes the drawing and silently shrinks every exported poster. See [troubleshooting](troubleshooting.md#math-labels-sit-off-their-anchors-in-safari-but-are-correct-in-chrome). |
| `FrameSkeleton` | `canvas?: {width, height}`, `variant?: "divider" \| "band"` | Placeholder while a frame settles. All percentages/aspect-ratios, never px — see the source for why, and note they resolve against the canvas **width** on all four sides, which is why `canvas` has to match. `variant` picks which chrome to imitate: the default padded header row, or the accent band over tinted panels. |
| `SolutionSection` | `children` (slot) | `.astro`, not React — a native `<details>`, so the reveal works without JS and the `<Solution>` island inside stays its own island. |
| `StackedLayout` | `children` (exactly 2, positional) | Prompt on top, body centered below. |
| `RowLayout` | `children` (N, positional), `padding?` (default `theme.spacing.md`), `weights?: number[]`, `separator?` | N children in a row. `weights[i]` sets that child's flex weight (default 1). Every leaf pane gets `padding` on all four sides, uniformly; a pane that's itself a `RowLayout`/`ColumnLayout`/`SplitLayout` gets zero instead, so it fills its box and its own `separator` (default `true`) vertical `Divider` connects flush to whatever's outside it. |
| `ColumnLayout` | `children` (N, positional), `padding?` (default `theme.spacing.md`), `weights?: number[]`, `separator?` | Vertical mirror of `RowLayout`; separator is a horizontal `Divider`, same uniform-padding/flush rule. The vertical case has a gotcha the horizontal one doesn't: panes are `border-box` with `flex-basis: 0`, so **each pane's padding comes off the top before any weighting**. A 4-pane column at `padding={24}` reserves 4×48 = 192px, and only the remainder is split by weight — `paneHeight = 2·padding + (available − 2·padding·n)·wᵢ/Σw`. Solve against that when a stack is tight, rather than guessing at weights. |
| `SplitLayout` | `children` (2+, positional), `padding?` (default `theme.spacing.md`), `weights?`, `separator?` | The two(+)-pane split for a Problem image. Forwards straight through to `RowLayout` — nest a `ColumnLayout`/`CenteredLayout` inside a pane for that pane's own arrangement. |
| `CenteredLayout` | `children` (exactly 1), `padding?: number \| string` | Single child, centered, no prompt slot — the Solution-image shape (the composition inside it owns its own arrangement). `padding` defaults to **`0`**, not `theme.spacing.md` like the other layouts: those apply padding to panes they create, while a `CenteredLayout` usually *is* a pane and has already been handed the parent's. Set it when the layout is a region in its own right — a full-bleed hero directly under a `padding={0}` layout, where there's no parent pane to inherit an inset from. `border-box`, so the inset comes out of the pane rather than overflowing a fixed-height frame. |
| `Divider` | `orientation?: "vertical" \| "horizontal"` (default `"vertical"`) | 1px rule from `theme.color.divider`. Used internally by `RowLayout`/`ColumnLayout`; not week-specific. |

## Interactive components

`src/components/weekly/interactive/` — client-hydrated (or read-only static)
components with a live/read-only duality, distinct from `dsl/`'s atoms
(export-only, promoted after a third week wants one). See
[extending the DSL](extending-the-dsl.md#interactive-components) for when a
new one belongs here.

| Component | Props | Notes |
|---|---|---|
| `FunctionPlot` | `fn: (x: number) => number`, `domain?`, `range?`, `width?`, `height?`, `showAxisTicks?`, `tickCount?`, `tickLabels?`, `strokeColor?`, `sampleCount?`, `border?`, `rounded?`, `cornerRadius?`, `tickFontSize?`, `fluid?` | The line-plot primitive behind every plot in `interactive/`. Also exports **`plotLeftMargin({ showAxisTicks, rounded, cornerRadius, padding, tickFontSize, yTickLabels })`** — the inset it leaves left of the data area for the y ticks and their labels, which it uses for its own margin. Read it when stacking text above a plot: the plot's box edge is that far right of the svg's, so text set flush to the svg hangs off the drawing instead of aligning to it (`PerceptronPanel`'s read-only variant indents by exactly this). `range` defaults to auto-fitting the sampled output — **pass it explicitly** (usually equal to `domain`) whenever the plot is meant to make magnitude/slope comparable across edits; auto-fit always stretches the current output to fill the box, so a slider drag can look like it does nothing even though the underlying value changed a lot. `border`: `"full"` (all 4 sides, default), `"axes"` (left/bottom/right, open top), or `"none"` (no border lines, only tick marks when `showAxisTicks` is set). `rounded` rounds the box's corners (bottom corners only when `border="axes"`). Tick labels (`showAxisTicks`) render outside the plot box, never overlapping the curve or border; Tick labels take `font-family: inherit`, so they're serif inside an `ImageFrame` and sans in the live solver — don't name a family for them. `tickCount` (`{ x?, y? }`, default 1 each) divides an axis into that many equal intervals, so `{ x: 4 }` puts ticks at 0, ¼, ½, ¾, 1; intermediate marks are drawn shorter than the endpoints, so the axis still reads as an axis rather than a ruler. `tickLabels` (`"all"` default, or `"ends"`) decides whether those intermediate ticks get numbers — `"ends"` once you're past two intervals, since bare marks give the eye something to measure against without adding four more numbers to read. Labels are derived from `domain`/`range`, so a plot on a domain other than `[0, 1]` labels itself correctly. `tickFontSize` defaults to a size suited to the live page, so **export call sites should pass `theme.font.size.caption`** — the default is illegible once the image is scaled into a feed. All the plot's margins derive from it, so it scales the surrounding space too. `fluid` makes the plot fill its container — `width`/`height` then set only the coordinate space and aspect ratio, and everything including tick labels scales with the box. Export call sites generally want it; the live page does not, since its plots sit in unconstrained flow. |
| `InputNode` | `domain?` | The "0 → 1" input badge. |
| `WeightControl` | `label: string` (LaTeX), `value`, `onChange`, `min?`, `max?`, `step?` | Slider + numeric input pair (`min`/`max` default ±10, `step` 0.1). Editable only — a read-only parent renders plain `Math` text instead of a disabled instance of this. Both halves share one range: the number input carries the same `min`/`max` attributes, and since those only govern its spinner and validity, the commit clamps typed values too — otherwise the field could read 50 while the slider, unable to represent it, sat pinned at 10. The field holds its text locally and commits on blur or Enter, so a half-typed `-` isn't clobbered by the numeric prop mid-keystroke. |
| `NStepper` | `value`, `onChange`, `min?`, `max?` | Integer +/- stepper, e.g. for choosing hidden-unit count `n`. |
| `PerceptronPanel` | `index`, `unit: HiddenUnit`, `onChange?`, `readOnly?`, `domain?`, `plotWidth?`, `plotHeight?`, `textScale?` | One hidden unit: label, `w`/`b` values, `FunctionPlot`. Read-only indents its text block by `plotLeftMargin`, so the stack aligns on the plot box the reader sees rather than on the tick marks hanging off it. Both variants stack text above the plot, so a row of panels reads as a row of like-shaped blocks; `readOnly` drops the border (no controls to group) and renders themed text rather than disabled inputs, since disabled form chrome captured into a PNG reads as a broken form. |
| `OutputControls` | `weights`, `bias`, `onChange?`, `readOnly?` | The linear output node (no ReLU) — one weight per hidden unit plus a bias. |
| `ConnectorLines` | `centers: number[]`, `outputCenter`, `span`, `length?`, `orientation?`, `strokeColor?`, `labels?`, `textScale?`, `stretch?` | The fan of curves from each panel to the output node. Axis-neutral: `centers`/`outputCenter` are y positions when horizontal and x positions when vertical, `span` is the cross-axis extent, `length` the fan's own run. Takes real measured pixel positions, not a guessed pitch — see below. **`stretch`** (horizontal only) makes the svg a growing flex item that measures its own laid-out width and redraws at that length, with `length` demoted to a floor for when wide `n` overflows the row. That's what lets the output column sit flush right without the lines ending in mid-air; the parent can't just compute a longer `length`, since the length it picks is what determines the width it would have to measure. Feeding the measured width back into the `width` attribute settles in one pass — growing the flex base by X takes X out of the row's free space. The curves' control-point pull is capped at `length / 2` rather than half the *drawn* run, so a stretched fan keeps the bend it has at the default length and the extra distance coasts; unstretched the two are equal, so existing compositions are byte-identical. |
| `NetworkSolver` | `hiddenUnits`, `outputWeights`, `outputBias`, `onHiddenUnitChange?`, `onOutputChange?`, `readOnly?`, `orientation?`, `domain?`, `showInputNode?`, `panelWidth?`, `panelGap?`, `plotSize?`, `outputPlotSize?`, `connectorLength?`, `stackGap?`, `stretchConnectors?`, `connectorColor?`, `showOutputBias?`, `textScale?` | The shared composition: input node → `PerceptronPanel`s → `ConnectorLines` → `OutputControls` → output `FunctionPlot`. One component serves both the static Solution export and the live island, so the two can't visually drift apart. **`orientation`** picks the axis: `"horizontal"` (default) puts panels in a column with the fan running right to the output — the live island, whose sliders need the row width; `"vertical"` puts panels in a row with the fan running *down* to the output beneath, which is what fills a portrait canvas, where height is the spare axis; `"stacked"` puts panels in a column with the output directly beneath and **no fan at all**, for a container too narrow to hold two columns side by side (phones — see `InteractiveNetworkSolver` below). The fan is the one part that can't survive the narrowing, since it needs horizontal room to be a fan; in the editable variant its labels are only `v_i` and those sliders are inside the output box anyway, so dropping it costs nothing a reader was using. Stacked also skips the measurement pass entirely (nothing to aim, and its offsets describe a two-column layout that isn't there) and stretches the panel group, each panel, and the output box to the container's width, so the sliders get the room the 220px `panelWidth` would otherwise leave as margin. The measurement pass is shared between the other two and just reads the other axis. `sideOffsets` (centering the input/output columns against the panel column) is horizontal-only: in a column, `alignItems: center` already centers every child against the container's own width. Panels size to their own content; `ConnectorLines`' endpoints come from `ResizeObserver` + `getBoundingClientRect()` measured after layout, not a fixed/guessed panel size — an earlier fixed-size version caused panels to visually overlap when their real content didn't match the guess. The fan's `span` is the furthest *column* reach (panels, output column, input node), **not** the container's own height: the svg is a flex child sized to `span`, so measuring the container would have it holding up the height it's measured against — a ratchet where the composition grew with `n` but never shrank back when `n` came down. **`textScale`** (default 1) multiplies every type size in the composition — unit labels, `w`/`b` values, connector weights, output bias, and both plots' tick labels — plus the gaps between them, threading down to `PerceptronPanel` and `ConnectorLines`. One knob rather than a size per role, so the hierarchy survives. 1 is the live island, read at 100% in a browser; the Solution export sets **2**, because native 11–15px type inside a 1080px canvas lands under 5px once a feed scales the image to ~0.36x. It is *not* a zoom: the plots keep whatever `plotSize`/`outputPlotSize` say, and scaled tick labels widen a plot's own margins — so a scaled panel needs a *narrower* `plotWidth` to fit the same box. Re-cut the sizes whenever you change it; it also thickens the connector stroke, since a 1.5px hairline that reads as a line beside 11px labels reads as a scratch beside 26px ones. **`connectorColor`** defaults to `divider`, which keeps the fan out of the way on the live page where the sliders are the subject; an export where the fan carries meaning (which unit holds which weight) should pass `color.guide`. **`stackGap`** (default 16, scaled by `textScale`) is the space between the stack's three parts — panels, fan, output. It trades directly against `connectorLength`: a long fan reads as its own section without much whitespace around it, so dropping this by what you add to the length gives the lines more run at the same total height. `001`'s Solution runs 160/8 (i.e. a 160px fan with 16px gaps at 2x), which fills the 1054px the poster's body box leaves inside its 30px padding. **`stretchConnectors`** (horizontal only) hands the row's spare width to the fan so the output column ends flush with the container's right edge — the live island sets it, since its card is wider than the composition; a static export is sized to its content and has none to give. **`showOutputBias`** (read-only only) drops the `c = …` label — worth it when the bias is 0 and the line is space spent on nothing. The whole element is omitted rather than emptied, since an empty child still earns the column's `gap`. |
| `InteractiveNetworkSolver` | `initialN?` (default 2) | The page-level island — owns all mutable state, renders a "Solve interactively" heading + `NStepper` + `NetworkSolver` (with `stretchConnectors`, so the output column lands flush right under the stepper). Changing `n` only touches added/removed hidden-unit slots, so it doesn't lose in-progress edits on existing units. Wrap only the `NetworkSolver` row (not the whole island) in `overflow-x: auto` for wide `n` — setting only `overflowX` on a container with no explicit `overflowY` makes browsers coerce the vertical axis to `auto` too, trapping page scroll inside it. The outer container is unstyled apart from its flex column and `maxWidth`: it deliberately carries no border, radius, or padding, so the solver sits flush in the article column rather than reading as a card. **Narrow containers**: the island `ResizeObserver`s its own width and switches `NetworkSolver` to `orientation="stacked"` below `SIDE_BY_SIDE_MIN_WIDTH` (580 — the 220px panel column, the fan, and the ~224px output column, plus gaps and slack). Measured rather than a media query, because what has to fit is this island's column, which is narrower than the viewport by the page padding and differs between the article and `/weekly/preview`. It starts unstacked so the client's first render matches the server's, and corrects before paint. Stacked, it also passes an explicit `plotSize`/`outputPlotSize` derived from the measured width: the plots have the whole column instead of a 220px panel, and 160px is the smallest thing on a phone screen — but the cap is 280, well short of the column, because the unit plot repeats and at `n = 8` every pixel of panel height is paid for eight times in scrolling. |

`src/utils/mlp.ts` backs these: `HiddenUnit`, `relu`, `perceptron`,
`networkOutput`, `samplePoints`. Generic MLP math only — a week's actual
target shape and worked-answer weights belong in that week's own
`_solution.ts` (see [authoring a week](authoring-a-week.md)), not here.

## Commands

```bash
npm run dev       # dev server; export buttons live here only
npm run build     # should be warning-free
npm run preview   # serve the production build

npm run weekly:notebook <path>   # marimo, sandboxed; deps come from the
                                 # notebook's PEP 723 header, env from uv's
                                 # cache. Leaves nothing beside the script.
```

`weekly:notebook` needs [`uv`](https://docs.astral.sh/uv/) on `PATH` and nothing
else — no Python project files live in this repo.

## Versions

Astro 2.10.15, React 18, `@astrojs/react` 2.3.2 (pinned — 6.x targets Astro 5
and fails with `Invalid URL` here). Tailwind 3 + daisyUI 3. See `plans/` for
the upgrade discussion.
