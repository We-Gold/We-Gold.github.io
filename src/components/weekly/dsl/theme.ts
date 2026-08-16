// Design tokens for the Weaver's Weekly image system. Every image is a static
// export, so these are fixed — nothing here is dark-mode aware.

// The @font-face rules for the families named in `font` below. Kept here so
// any page rendering a DSL component gets the real fonts: the inline
// `fontFamily` styles only name a family, so without these the images render
// in fallback fonts.
// Fraunces comes from the *variable* build, not the static one. The design
// sets the serif with WONK on — the axis that swaps in Fraunces' single-storey
// `g` and flicked terminals — and a static instance has its axes already
// collapsed to WONK 0, so `fontVariationSettings` on a static face is inert.
// The `wonk` subset carries wght + WONK and nothing else; the `full` subset
// would add opsz and SOFT for 3x the bytes, and neither is used here. One
// 36KB file also replaces the three static normals it supersedes, which were
// 54KB between them.
import "@fontsource-variable/fraunces/wonk.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/roboto-mono/400.css";

// The faces above as `document.fonts.load()` shorthands, kept adjacent
// because the two lists have to stay in sync. The size in each shorthand is
// irrelevant — one load covers every size of that family+weight.
// Note the family name: the variable build registers itself as "Fraunces
// Variable", not "Fraunces". A spec naming the latter resolves to a fallback
// and reports ready immediately, so the check silently passes while the frame
// captures in the wrong face — hence `font.label` below names the same string.
// The three Fraunces specs all come out of one file, so listing each weight
// costs a match, not a fetch.
export const fontLoadSpecs = [
    "300 16px 'Fraunces Variable'",
    "400 16px 'Fraunces Variable'",
    "600 16px 'Fraunces Variable'",
    "200 16px Inter",
    "300 16px Inter",
    "400 16px Inter",
    "600 16px Inter",
    "400 16px 'Roboto Mono'",
] as const;

// KaTeX's faces, imported by dsl/Math.tsx. Kept out of `fontLoadSpecs`
// because that list loads on every page and most weeks never render math;
// `useFontsReady` takes this as an opt-in extra.
export const katexFontLoadSpecs = [
    "400 16px KaTeX_Main",
    "700 16px KaTeX_Main",
    "italic 400 16px KaTeX_Math",
    "400 16px KaTeX_Size1",
] as const;

export const theme = {
    canvas: {
        // 4:5 portrait, the tallest ratio a LinkedIn feed shows uncropped.
        // Almost everyone reads these on a phone, where a landscape image is
        // a thin band and everything inside it shrinks to nothing.
        width: 1080,
        height: 1350,
        background: "#ffffff",
    },
    // Canvases a frame can opt into instead of the default above, passed to
    // <ProblemImage canvas={…}> and on to <ImageFrame>. Kept as named presets
    // rather than free-form numbers so two weeks reaching for "the shorter
    // one" land on the same height.
    canvasPresets: {
        // The banded poster treatment: 87px shorter than the standard canvas,
        // because its full-bleed header band and part panels carry the
        // structure that padding and divider rules carry on the taller one.
        poster: { width: 1080, height: 1263 },
    },
    color: {
        accent: "#0d9488", // teal-600, matches the rest of the site
        ink: "#171717", // near-black, primary text
        // softer than ink, so the header row reads as chrome rather than
        // competing with the body below the divider
        headerInk: "#374151",
        muted: "#6b7280",
        divider: "#e5e7eb",
        // For large connective shapes — an arrow between two visuals, say.
        // `divider` is calibrated for hairlines and disappears at that size;
        // `muted` is calibrated for text and, filled across a few thousand
        // square pixels, reads as a third subject rather than as a pointer.
        guide: "#b3b7bd",
        // Text and hairlines sitting *on* an accent fill, for the banded
        // header. The border is deliberately translucent white rather than a
        // fixed hex, so it holds up on any accent it's drawn over.
        onAccent: "#ffffff",
        onAccentBorder: "rgba(255, 255, 255, 0.43)",
        // The two part-panel tints — `accent` at 42% and 29%. Written as rgba
        // of the same 13/148/136 rather than pre-blended hexes so they stay
        // tied to `accent`, and so they composite correctly over any
        // background rather than only over white.
        panelStrong: "rgba(13, 148, 136, 0.42)",
        panelSoft: "rgba(13, 148, 136, 0.29)",
    },
    spacing: {
        sm: 16,
        md: 32,
        lg: 48,
    },
    font: {
        // The serif the header is set in, and — since <ImageFrame> now sets
        // it frame-wide — the font of everything inside an exported image.
        // `body` is what the live, interactive page uses; the two differ on
        // purpose, so an image reads as a printed page and the page below it
        // reads as an app.
        label: "'Fraunces Variable', serif",
        body: "'Inter', sans-serif",
        code: "'Roboto Mono', monospace",
        // Applied wherever the serif is set. WONK 1 is the design's letterform
        // choice — single-storey `g`, flicked terminals — and is what the
        // variable build above exists to make reachable. Figma writes `SOFT 0`
        // alongside it, but 0 is that axis's default and the `wonk` subset
        // doesn't ship it, so naming it here would be noise.
        wonk: { fontVariationSettings: '"WONK" 1' },
        // The two weights the label serif is used at, plus its regular. Named
        // so an atom never hardcodes 300 — the light cut is what the banded
        // poster design is set in almost throughout, and it only exists
        // because the @fontsource import above loads it.
        weight: {
            // Inter's thinnest cut used here, and only for the poster's "Part
            // N" numerals — at 60px a 300 reads as heavy, and the design drops
            // a step to compensate. Too thin for anything at body size.
            extralight: 200,
            light: 300,
            regular: 400,
            semibold: 600,
        },
        // Sized for the canvas as it's actually viewed: LinkedIn shows a feed
        // image at roughly 390px on a phone, a ~0.36x scale. Anything below
        // `caption` lands under ~8px there and is unreadable.
        size: {
            caption: 22,
            body: 28,
            title: 34,
            // The header row. Larger than `title` because it's the one line
            // that has to survive a thumbnail — at 0.36x this is ~14px while
            // `title` would be ~12px.
            header: 38,
            // A second scale, not a retune of the four above. The scale above
            // fits a dense image — hero plus two questions plus a tip box —
            // where a bigger size would cost a pane. The banded poster design
            // drops the tip box, moves the call to action into the header,
            // and gives each part a whole panel, so it has the room to set
            // everything roughly 1.5x larger. Both scales are legible at
            // 0.36x; they differ in how much they choose to say.
            poster: {
                badge: 27, // the header's call-to-action lines
                subhead: 37, // "Weaver's Weekly #N" under the title
                // A part panel's question text. 48 rather than 44 to match the
                // Figma frame, where three lines at this size fill the 485px
                // measure to exactly the 144px the panel allots them — so it
                // fits, but with no slack for a fourth line.
                prose: 48,
                lead: 50, // the problem title
                display: 60, // "Part N", and standalone display math
            },
        },
    },
} as const;

// The poster design's type styles, as whole roles rather than loose tokens.
//
// The tokens above let an atom pick a family, a weight and a size
// independently, and nothing stops it pairing the serif with the prose size —
// which is exactly the drift that put the part panels in Fraunces when the
// design calls for Inter. Spread one of these instead and the three travel
// together.
//
// A separate const rather than `theme.font.role` only because an object
// literal can't reference its own siblings; treat it as part of the theme.
export const textRole = {
    // The two band-header lines. Serif, and the only place WONK shows up —
    // the rest of the poster is Inter, which has no such axis.
    posterTitle: {
        fontFamily: theme.font.label,
        fontWeight: theme.font.weight.semibold,
        fontSize: theme.font.size.poster.lead,
        ...theme.font.wonk,
    },
    posterSubhead: {
        fontFamily: theme.font.label,
        fontWeight: theme.font.weight.light,
        fontSize: theme.font.size.poster.subhead,
        ...theme.font.wonk,
    },
    // Everything below the band is Inter. The design reads as a printed page
    // at the top and an interface underneath, and the family split is what
    // carries that; setting the badge in the serif blurs the two.
    posterBadge: {
        fontFamily: theme.font.body,
        fontWeight: theme.font.weight.light,
        fontSize: theme.font.size.poster.badge,
    },
    posterDisplay: {
        fontFamily: theme.font.body,
        fontWeight: theme.font.weight.extralight,
        fontSize: theme.font.size.poster.display,
    },
    posterProse: {
        fontFamily: theme.font.body,
        fontWeight: theme.font.weight.light,
        fontSize: theme.font.size.poster.prose,
    },
} as const;
