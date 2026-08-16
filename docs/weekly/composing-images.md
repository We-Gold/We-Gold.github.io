# Composing images

Every image is the same four nested layers:

```
ProblemImage / SolutionImage   ← export buttons + responsive scaling
  ImageFrame                   ← the 1080×1350 canvas, header, divider
    StackedLayout              ← spatial arrangement of the slots
      Prompt                   ← slot 1: the question
      <a body atom>            ← slot 2: the visual
```

Never skip a layer. `ImageFrame` without an export wrapper gives you an image
you can't download; a layout without `ImageFrame` loses the branding header
and the fixed canvas size.

The third layer can itself nest — a pane of `SplitLayout`/`RowLayout` can
hold another layout (a `ColumnLayout` stacking two things, a `CenteredLayout`
centering one) instead of a bare atom. See "Nesting layouts" below.

---

## The two rules

### 1. Compose in `_index.tsx`, never inline in `.mdx`

The entire tree above must live in one real `.tsx` file, rendered into the MDX
through a single component with a single `client:load`.

This isn't style. Astro resolves the children of a framework component invoked
from `.astro`/`.mdx` markup through *its own* renderer, not React's. For a
component that forwards `{children}` untouched — like `ImageFrame` — that's
invisible and everything looks fine. For any component that needs to
*distinguish* between its children — like `StackedLayout`, which splits them
into prompt and body — it's fatal: `Children.toArray(children)` returns a
single merged blob, and the body slot renders empty.

The symptom is subtle. The image still appears, so it reads as a CSS problem
rather than a structural one. If a layout's slots look collapsed or the body
isn't centered, check that the composition isn't in the MDX before touching
any styles.

### 2. Pass slots as children, not as props

```tsx
// Wrong — crashes React SSR
<StackedLayout prompt={<Prompt>…</Prompt>} body={<Stat … />} />

// Right
<StackedLayout>
    <Prompt>…</Prompt>
    <Stat … />
</StackedLayout>
```

A prop holding JSX compiles to Astro's vnode format rather than a React
element when it's written in `.astro`/`.mdx`, and React can't render it —
`Objects are not valid as a React child (found: object with keys {astro:jsx,
type, props})`. Nested children compile correctly either way, so children are
the only safe interface. Any layout you add must follow this too.

---

## Layouts

Layouts control **spatial arrangement** — where the prompt sits relative to
the body, how the space is divided. They don't care what kind of content goes
in the slots; swapping a chart for a code block is just changing which body
atom you render.

- **`StackedLayout`** — exactly two children: prompt on top, body centered
  in the remaining space.
- **`RowLayout`** — N children in a row, optional per-child `weights`,
  optional separator line between each pair (default on).
- **`ColumnLayout`** — same, stacked vertically.
- **`SplitLayout`** — a two(+)-pane horizontal split, built on `RowLayout`.
  Nest a `ColumnLayout`/`CenteredLayout` inside a pane for that pane's own
  internal arrangement — `SplitLayout` itself has no opinion about what's
  inside a pane.
- **`CenteredLayout`** — a single child, centered, no prompt slot. The
  Solution-image shape. Its `padding` defaults to `0` rather than
  `theme.spacing.md`, because it's usually a pane that already carries the
  parent's inset; pass one only when it's a standalone region under a
  `padding={0}` layout.

The canvas is 4:5 portrait, so **`ColumnLayout` is the default and
`SplitLayout` the exception.** A horizontal split on a 1080-wide canvas
leaves each pane narrow; stacking gives every element the full width. Reach
for `SplitLayout` when two things genuinely belong side by side, not as the
default shape of a Problem image.

```tsx
<StackedLayout>
    <Prompt>{promptText}</Prompt>
    <Table headers={…} rows={…} />
</StackedLayout>
```

Adding more: see [extending the DSL](extending-the-dsl.md#level-3-a-new-layout).

### Nesting layouts

A pane doesn't have to hold a bare atom — it can hold another layout, which
is how a Problem image gets a hero plot above a run of questions while one
pane still centers its own contents. Sketch of the padded-chrome shape — a
hero over a run of questions and a tip box:

```tsx
<ColumnLayout padding={24} weights={[11, 4, 4, 2]}>
    <CenteredLayout>
        <WGridPlot />
    </CenteredLayout>
    <QuestionBlock number={1} diagram={<NetworkDiagram />}>
        How many hidden ReLU units <Math>{"n"}</Math> does it take to draw
        this <Math>{"W"}</Math>?
    </QuestionBlock>
    <QuestionBlock number={2} diagram={<WeightsNetworkDiagram />}>
        Find the weights and biases needed to produce the <Math>{"W"}</Math>.
    </QuestionBlock>
    <TipBox>...</TipBox>
</ColumnLayout>
```

`ColumnLayout` only knows it has four panes at an 11:4:4:2 ratio with dividers
between them; it doesn't know the first is a centered plot or that two of the
rest are question blocks — each pane's own content owns that.

The weights are the only size knob here, and that's the point: `WGridPlot`
and both diagrams are fluid, so they fill whatever pane they're handed. Change
a weight and the drawings resize with it. Nothing in this composition names a
pixel size for a drawing.

Do note the padding arithmetic — in a column, every pane's padding comes off
the top before any weighting, so four panes at `padding={24}` reserve 192px
before the weights see a single pixel. The formula is in
[reference](reference.md#structural-components).

**Padding and connecting divider lines.** Every pane in `RowLayout`/
`ColumnLayout`/`SplitLayout` gets the layout's `padding` value on all four
sides, uniformly — same amount whether that side faces a divider, another
pane, or the outer edge of the image, and the same regardless of which of
the three layouts you're using, since they all default `padding` to
`theme.spacing.md`. The one exception: a pane that is itself a `RowLayout`,
`ColumnLayout`, or `SplitLayout` gets **zero** padding on all sides instead —
it fills its box completely so its own separator line reaches every edge and
connects to whatever's outside it, rather than leaving a gap where the two
should visually meet. In the example above nothing triggers it — the
`CenteredLayout` pane around the plot draws no divider of its own, so there's
nothing to connect to and it keeps normal padding on all sides. It matters
when you nest a divider-drawing layout inside a pane: a `ColumnLayout` inside
a `SplitLayout` pane fills its box so its horizontal rules meet the split's
vertical one flush, instead of stopping short of it. This is automatic, based
on which component you nest; nothing to opt into at the call site.

### The banded poster shape

The four-layer stack above assumes `ImageFrame`'s default chrome: a padded
frame with a title row and a divider. A frame can also be **full-bleed**, which
is what `001-easy-win` uses, for both its `Problem` and its `Solution`:

```tsx
<ProblemImage slug={slug} usesMath
              canvas={theme.canvasPresets.poster} skeleton="band">
    <ImageFrame
        week={week} title={title}
        canvas={theme.canvasPresets.poster}
        padding={0}
        header={
            <BandHeader week={week} title={title}>
                <CtaBadge label="Solve interactively on" url="weavergoldman.com/weekly" />
            </BandHeader>
        }
    >
        <ColumnLayout separator={false} padding={0} weights={[5, 5]}>
            …body…
            <RowLayout separator={false} padding={0}>
                <PartPanel number={1} tone="strong" diagram={<NetworkDiagram />}>…</PartPanel>
                <PartPanel number={2} tone="soft" diagram={<WeightsNetworkDiagram />}>…</PartPanel>
            </RowLayout>
        </ColumnLayout>
    </ImageFrame>
</ProblemImage>
```

Three things travel together here and none of them work alone:

- **`padding={0}` on the frame**, so the band and the panels reach the canvas
  edges. Each region then owns its own inset — `BandHeader` and `PartPanel`
  both do.
- **`separator={false}` and `padding={0}` on every layout.** The band edge and
  the panel tints carry the separation that `Divider` carries otherwise;
  leaving the defaults on gives you both, which reads as indecision.
- **`canvas` passed twice** — to `ImageFrame` and to `ProblemImage` — plus
  `skeleton="band"`. See [reference](reference.md#canvases).

The Figma reference splits the body 609px of hero over a 505px panel band, and
weights taken straight from a fixed composition (`[609, 505]`) are usually more
legible than a reduced fraction. `001-easy-win` ended up at an even `[5, 5]`
anyway — the hero is a square plot that gains nothing from the extra 50px, and
the panels use it.

**Don't reach for a blend mode to sit a diagram on a tint.** The panel diagrams
are inline SVG with transparent backgrounds, so they composite as-is;
`mix-blend-multiply` — which is what you'd need for a *screenshot* with a white
background — would tint the node fills, which are deliberately
`theme.canvas.background`.

## Choosing a body atom

| Atom | Use when |
|---|---|
| `Stat` | One number or one word is the whole point. Strongest default for a reveal. |
| `Table` | Comparing 3–4 rows across a few columns. More than ~5 rows won't fit legibly. |
| `Code` | The question is about a snippet. Python highlighting only, out of the box. |
| `Chart` | A shape or an outlier is the point. Bar chart, with one bar highlightable. |
| `UnitGrid` | The *count* is the point, not the magnitude. Base rates, class imbalance, "1 in 100". |
| custom | Nothing above makes the point directly. See [extending the DSL](extending-the-dsl.md). |

`Chart` and `UnitGrid` look interchangeable and aren't. A bar encodes a
magnitude as a length, which is right for comparing quantities; a unit grid
gives every observation its own cell, which is right when the reader is meant to
*count* — and when the point is that a proportion feels different once you can.
A 99/1 split is a nearly invisible sliver as a bar and unmistakable as a grid.

Prefer the one that makes the answer legible without a caption. When a stock
atom needs a paragraph of explanation to land, that's the signal to build a
one-off visual instead.

Props for each: [reference](reference.md#atoms).

### Composing a body from parts

The body slot is one child, but that child can be anything — including a small
local component combining several pieces:

```tsx
function GridWithCaption({ value, label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
            <ImbalanceGrid />
            <Stat value={value} label={label} />
        </div>
    );
}
```

Since this is a real React file, ordinary composition works. Define these
above the `Problem`/`Solution` exports in `_index.tsx`.

---

## Problem / solution pairing

The pair should be the same image with one thing changed. Same prompt, same
layout, same body component — only the value revealed differs. That's what
makes the reveal legible when the two appear days apart in a feed.

The `imbalanced-accuracy` entry is the worked example: identical grid, `Stat`
goes from `"?"` to `"No"`, caption changes from setup to payoff.

When the answer genuinely can't reuse the question's body — `001-easy-win`
answers two questions with one solved network, which is neither of the
diagrams it asked them with — hold the **chrome** constant instead: same
canvas, same `BandHeader`, same badge shape, and let only the body and the
badge's wording change. The frame is what carries the pairing.

---

## Styling

Use inline `style` objects with values from `theme`, matching the existing
atoms. Not Tailwind classes.

The images are captured by `html-to-image`, which serializes computed styles —
inline styles are the reliable path, and the images are deliberately fixed
artifacts that shouldn't inherit the site's theming or dark mode. Import
tokens from `../../../components/weekly/dsl/theme`; don't hardcode hex values.
