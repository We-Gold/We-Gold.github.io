# Extending the DSL

Three escalating levels. Start at the lowest one that works.

---

## Level 1: a one-off visual for a single week

Define it in `_index.tsx`, above the `Problem`/`Solution` exports. Don't put
it in `dsl/` — this is the escape hatch, and most weeks that need a custom
visual need it exactly once.

Worked example, from `012-imbalanced-accuracy/_index.tsx` — 100 cells with one
highlighted, making a 99:1 class imbalance immediately legible in a way no
chart or table would:

```tsx
import { theme } from "../../../components/weekly/dsl/theme";

// One-off custom visual for this specific problem — not a general DSL atom.
function ImbalanceGrid() {
    const cells = Array.from({ length: 100 });
    const minorityIndex = 47;
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 5,
            width: 260,
        }}>
            {cells.map((_, i) => (
                <div key={i} style={{
                    aspectRatio: "1 / 1",
                    borderRadius: 3,
                    background: i === minorityIndex
                        ? theme.color.accent
                        : theme.color.divider,
                }} />
            ))}
        </div>
    );
}
```

Rules: pull colors and fonts from `theme`, use inline styles, and leave a
comment saying it's deliberately local. It renders in the body slot like any
stock atom.

## Level 2: promote to a reusable atom

When a third week wants the same visual, move it to
`src/components/weekly/dsl/<Name>.tsx`.

Two weeks is not enough evidence — the second usage usually reveals that the
two cases wanted different things, and a prematurely generalized atom grows
configuration props that no one can remember. Wait for the third — unless
it's an explicit call to generalize a pattern from day one (e.g.
`QuestionBlock`, promoted after only one week because the numbered
diagram+question shape was clearly meant to be reused, not a one-off).

An atom:

- lives in `src/components/weekly/dsl/`, one named export matching the filename
- takes plain data props (`headers`/`rows`, `data`), not JSX props — except a
  slot that holds prose the reader will actually read, which should take
  `children: ReactNode` rather than a plain string, so it can embed `<Math>`
  or other inline JSX later without a breaking API change (`QuestionBlock`'s
  and `PartPanel`'s question text, `Prompt`)
- imports every color and dimension from `theme`, including text sizes
  (`theme.font.size.*`) — the scale is calibrated for how the image is viewed
  in a feed, and a hand-picked px value almost always lands too small. There
  are now **two** scales: the original four (`caption`/`body`/`title`/`header`)
  and `font.size.poster`. Pick the one matching the chrome your atom is built
  for and stay in it — an atom mixing the two makes a frame look like two
  designs. A second scale rather than a retune, because the two treatments
  differ in how much the image chooses to say, not in how it should be read;
  see [reference](reference.md#design-tokens)
- on the **standard** canvas, sets **no `fontFamily` at all**: `ImageFrame`
  sets the image's font on the frame root and an atom inherits it, so an image
  stays in one family. An atom that also renders on the live page uses
  `fontFamily: "inherit"` rather than naming one. The exception is a deliberate
  departure — `Code`'s monospace, `Stat`'s display serif
- on the **poster** canvas, spreads a `textRole` instead. That design is
  bi-family on purpose — serif band, Inter body — so inheritance can't carry
  it, and a role names the family, weight and size as one unit. Reach for
  `textRole.posterProse` and friends rather than assembling
  `font.body` + `font.weight.light` + `font.size.poster.prose` by hand; see
  [reference](reference.md#text-roles)
- styles inline, and hardcodes nothing the theme already defines
- if it *draws* something, is fluid rather than a fixed px size — see below

Then add it to the gallery in `src/components/weekly/AtomsGallery.tsx` so
`/weekly/preview` covers it, and to the table in
[reference](reference.md#atoms).

### Fluid atoms

The layouts (`ImageFrame`, `RowLayout`, `ColumnLayout`, `ScaleToFit`) are all
flex and percentages, so they adapt to any canvas for free. For a while the
*leaves* didn't: `FunctionPlot` and the week-local diagrams emitted
`<svg width={440} height={440}>`, absolute constants picked by eye. The cost
showed up when the canvas moved from 1200×628 to 1080×1350 — the panes grew,
the drawings inside them stayed exactly the same size, and the only lever
left was hand-fitting pixel constants one at a time.

So: an atom that draws takes a `viewBox` and fills its container.

```tsx
<svg
    viewBox={`0 0 ${width} ${height}`}
    style={{ width: "100%", height: "100%", display: "block" }}
>
```

`width`/`height` then describe the **coordinate space and aspect ratio**, not
the size. The pane's weight decides how big it renders, and everything inside
— stroke widths, node radii, tick labels — scales with it.

Two consequences worth knowing:

- **Text inside a fluid SVG no longer honours `theme.font.size`.** A
  `fontSize` there is in the drawing's coordinate space, so it scales with the
  box. That's usually what you want (a bigger plot gets bigger labels), but it
  means the feed-legibility scale governs HTML atoms only.
- **The container must have a definite size.** Filling a parent that sizes
  itself to its content is circular. Inside a layout pane this is satisfied
  already; on the live page it usually isn't, which is why `FunctionPlot`
  makes it opt-in via `fluid` and defaults to fixed.

**If the drawing labels anything with `Math`**, SVG `<text>` can't lay KaTeX
out, so the label goes in a `<foreignObject>` — and then the svg must also
render `<KatexSvgStyle />` once as its first child. Export copies an svg
subtree verbatim without inlining computed styles, and KaTeX's appearance is
entirely classes; skip it and the PNG shows every label twice, in body type.

A `foreignObject` also constrains how the drawing is allowed to be fluid:
build it with **`ScaledSvg`**, not `<svg viewBox=… style={{ width: "100%" }}>`.
WebKit paints foreignObject content in the wrong place whenever the svg's
viewBox scale isn't exactly 1, and stretching a viewBox to fill a container is
precisely how that scale stops being 1. `ScaledSvg` keeps it at 1 and fits with
a CSS transform instead — see
[troubleshooting](troubleshooting.md#math-labels-sit-off-their-anchors-in-safari-but-are-correct-in-chrome).

Worked example: `NetworkDiagram` in `001-easy-win/_visuals.tsx`.

## Level 3: a new layout

Layouts go in `src/components/weekly/layouts/`. They arrange slots; they don't
know what's in them.

The interface is fixed by
[rule 2](composing-images.md#2-pass-slots-as-children-not-as-props): **take
positional children, never JSX props.** A plain data prop like `weights:
number[]` is fine alongside `children` — the rule only forbids passing *JSX*
through a named prop, and an array of numbers isn't JSX.

The worked example is `RowLayout` (`src/components/weekly/layouts/RowLayout.tsx`):
arbitrary N positional children, an optional `weights` array for per-child
flex sizing, a `padding` applied uniformly to every leaf pane (default
`theme.spacing.md` — pull a new layout's default from `theme.spacing` rather
than inventing another hardcoded number, so padding stays consistent no
matter which layout an author reaches for), and an optional `separator`
(default `true`) drawing a rule between each adjacent pair via the shared
`Divider` atom (`src/components/weekly/dsl/Divider.tsx`) rather than a
hand-rolled div — pulling the rule color from `theme.color.divider` this way
is what keeps a future layout from drifting into a hardcoded hex.

`ColumnLayout` is `RowLayout`'s vertical mirror. `SplitLayout` is a
specialization built *on top of* `RowLayout` — it forwards `padding`/
`weights`/`separator` straight through and just gives the "two-pane split"
case a more discoverable name:

```tsx
export function SplitLayout({ children, padding = theme.spacing.md, weights, separator = true }: SplitLayoutProps) {
    return (
        <RowLayout padding={padding} weights={weights} separator={separator}>
            {children}
        </RowLayout>
    );
}
```

If a new layout is a specialization of an existing one, build it by composing
that layout, the way `SplitLayout` composes `RowLayout`, rather than copying
its internals — the divider/weights/minHeight logic should only exist in one
place.

Notes that matter:

- `flex: 1` plus `minHeight: 0` on anything that must shrink. `ImageFrame`
  gives the layout a fixed-height flex parent, and without `minHeight: 0` a
  tall body will overflow the canvas instead of fitting. This has to hold at
  every level of nesting — a layout dropped in as another layout's child
  needs the same `flex: 1, minHeight: 0` contract to actually fill its pane.
- Document the child order in a comment. It's positional and therefore
  invisible at the call site.
- Test it in `AtomsGallery.tsx` before using it in a real week.
- If the new layout draws its own `Divider` between children, call
  `markAsDividerLayout` on its export (`src/components/weekly/layouts/layoutMarker.ts`),
  the same way `RowLayout`/`ColumnLayout`/`SplitLayout` do. That's what lets
  it render flush — no padding — when nested as a pane inside another
  divider-drawing layout, so the two separator lines connect instead of
  leaving a gap. Skip it if the layout never renders a divider of its own
  (`CenteredLayout`, `StackedLayout`) — it should still get normal padding
  when nested, like any other leaf content.

---

## Adding a language to `Code`

`Code` registers Python only. To add another, import its Prism grammar as a
side effect in `src/components/weekly/dsl/Code.tsx`:

```tsx
import "prismjs/components/prism-sql";
```

Unregistered languages silently fall back to `Prism.languages.markup`, which
renders as near-unhighlighted plain text rather than erroring — so if a
snippet looks flat, this is why.

---

## Interactive components

Not one of the three levels above — a different kind of thing. `dsl/` atoms
are export-only and gated behind a "does a third week want this" rule;
`layouts/` arrange fixed slots. Neither fits a component that has to work two
ways at once: hydrated and editable on the live page, and read-only inside a
static PNG export.

`src/components/weekly/interactive/` (worked example: `001-easy-win`, an
MLP weight solver) is for exactly that — components shared between a
`client:load` island and the static `Solution` export, which both exist in
the same week. The usual rule (wait for a third user before promoting) still
doesn't apply here even for the *first* week that needs one, because the two
call sites — the live solver and the static export — exist simultaneously
from day one; splitting them into two parallel visual trees instead would let
them silently drift apart.

An interactive component:

- lives in `src/components/weekly/interactive/`
- takes a `readOnly?: boolean` (default `false`) rather than being a
  separate read-only component — a `readOnly` render should use plain themed
  text, not a disabled form control, since the same markup is captured
  verbatim into a PNG and disabled inputs read as "broken form" there, not
  "value in a diagram"
- still pulls colors/fonts from `theme`, same as a `dsl/` atom
- measures real layout (`ResizeObserver` / `getBoundingClientRect`) instead
  of hardcoding pixel constants for anything that depends on sibling
  content's actual size (e.g. connector lines to a stack of panels whose
  height isn't fixed) — a guessed constant silently drifts from reality the
  moment content changes
- is never registered in `AtomsGallery.tsx` or promoted into `dsl/`; nothing
  about the live/read-only duality applies to a pure export atom

Week-specific data backing an interactive component (a target function, a
worked answer) belongs in that week's own `_solution.ts`, not in a shared
util — see [authoring a week](authoring-a-week.md).
