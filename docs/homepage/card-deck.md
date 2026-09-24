# Homepage card deck

The "What I Build" section on the homepage (`src/pages/index.astro`) is a
scroll-stacked deck: each card pins near the top of the viewport and the next
one slides up over it. Each card argues for one skill, with evidence.

The homepage is deliberately short: a one-paragraph hero with the LinkedIn
button, the deck, then a "Learn More" row of three link cards (Experience,
Resume, GitHub), each with a one-line reason to click. Those links live in
the `nextSteps` array at the top of `index.astro`. Don't restate resume
details in the hero; the cards and the experience page carry them.

## Files

| File | What it does |
|---|---|
| `src/components/deck/CardDeck.astro` | The container. Sticky stacking (only when cards fit), the "cover" shrink/dim, and adding `is-dealt` when a card scrolls into view. |
| `src/components/deck/DeckCard.astro` | The standard card layout. The text props are fixed; the visual is a named slot. |
| `src/components/deck/cards/<Name>Card.astro` | One file per card: its copy plus its visual. |
| `public/content/deck/<name>/` | Images for that card (webp). |

## Adding a card

1. Copy `cards/TeamGraduateCard.astro` to `cards/<Name>Card.astro`.
2. Fill in the props. Keep to the lengths in `DeckCard.astro`'s `Props`
   comments (title ~40 chars, summary ~220, four bullets ~130 each). The card
   must stay around **620px tall at 1440×900**. Anything taller can't show
   fully while pinned, so trim the copy, not the check.
   - `eyebrow` is the skill ("LLM products"), not the job title.
   - `summary` is why it mattered. `metric` is the single strongest number.
   - Bullets say what *you* did, with verbs and specifics.
3. Build the visual inside `<div slot="visual">`. `accent` sets the panel
   background, so pick the project's own brand color if it has one.
4. Add `<NameCard />` inside `<CardDeck>` in `index.astro`, in story order.
   Stack offsets are assigned automatically from DOM order.

## Visuals

- Every card needs at least one real visual: a screenshot, figure, or a small
  diagram/animation drawn in code.
- Existing cards: `TeamGraduateCard` (screenshot fan), `OuroborosCard`
  (a four-step strip whose grid columns are sized by image aspect ratio, plus
  a to-scale size bar chart), and `DiffusionCard` (an SVG line chart computed
  in the frontmatter from the report's tables, with direct labels, `<title>`
  hover tooltips and an `sr-only` data table), `MedtronicCard` (a generic
  SVG system diagram plus a "details withheld" notice), and `RegeneronCard`
  (two synthetic-data illustrations: question grids and drifting
  distributions). Copy whichever is closest.
- Synthetic-data illustrations must say so on the card (the notice covers
  it), and any randomness is seeded so every build renders the same picture.
- Charts: keep the SVG `viewBox` near the panel's real width (~440 units) so
  11–12 unit text renders at a readable size, and keep labels inside the plot
  so nothing clips at the panel edge.
- **Only use public material.** For internal work (Regeneron, Medtronic),
  draw schematics or animations with synthetic data instead of screenshots.
  Build the diagram only from what the resume or experience page already says,
  and keep the lock-icon notice from `MedtronicCard` saying that details are
  withheld.
- To animate on arrival, style the "before" state normally and the "after"
  state under `:global(.is-dealt)`. `CardDeck` adds `is-dealt` once, when the
  card is 35% visible (immediately if the viewer prefers reduced motion).
  Wrap transitions in a `prefers-reduced-motion: reduce` override.
- Cropping images from a PDF: render the page with
  `pdftoppm -r 300 -png -f N -l N file.pdf out`, then
  `magick out-N.png -crop WxH+X+Y +repage -resize 900x -quality 82 name.webp`.
  Crop inside any rounded frame so the slide background doesn't leak in at
  the corners.

## Stacking behavior

- Cards pin only at `min-width: 768px` **and** when the tallest card fits
  below its pin offset. `CardDeck`'s script measures this and sets
  `data-stack="on"`, and re-checks on resize. Otherwise the deck is a plain
  list, since a pinned card taller than the viewport would hide its own
  bottom. Around 1050×770 (a small laptop) the cards are ~740px tall and fall
  back to the list. At 1440 wide the TeamGraduate card measured ~520px and stacks.
- The pin offset is `5rem` below `lg` (clears the mobile header), and `2rem` at
  `lg` and up. Each later card sits `0.875rem` lower so the deck's edges show.
- The homepage uses `BaseLayout wide fillWidth` so cards get ~1100px. The hero
  is capped at 900px separately to keep its lines readable.

## Checking a change

Automated or background browser tabs throttle `IntersectionObserver`, so a
card can look "undealt" in a test tab even though it works for real
visitors. Bring the tab to the front before judging the animation.

In the dev server, check 1440×900 (card height ≤ ~620px, fan inside its
panel), a phone width (no horizontal scroll, captions not colliding), and,
with more than one card, that scrolling stacks and dims the covered card. To
test stacking with only one card written, temporarily render it three times.
