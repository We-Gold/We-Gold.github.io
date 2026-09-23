# /// script
# dependencies = [
#     "marimo",
#     "matplotlib==3.11.1",
#     "numpy==2.5.2",
# ]
# requires-python = ">=3.13"
# ///

import marimo

__generated_with = "0.24.0"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def intro(mo):
    mo.md(r"""
    # Weaver's Weekly #2 - Gone Fishing

    Design notebook. You are anchored on a lake with a 360-imaging sonar and a
    crowd-sourced sightings app, and you get one cast at the monster.

    **The shape the problem has to keep:** three *different* answers.

    | source | says |
    |---|---|
    | the app alone | NE - the most reports |
    | the sonar alone | SW - the only strong return |
    | both, via Bayes | **SE** - a sector the sonar cannot even see |

    If Bayes agreed with either instrument, the problem would collapse into "trust
    the better one" and there would be nothing to reveal.

    **Calculator-free:** counts and likelihood ratios are chosen so
    `sum(count x LR) == 100`. The posterior is then the product read straight off
    as a percentage, with no division anywhere.

    ---

    ### Layout

    1. **The numbers** - the sector spec and the Bayes arithmetic.
    2. **The world** - a real bathymetric grid and real fish, as ground truth.
    3. **The sensor** - a viewshed cast from the transducer. The shadows are
       *measured*, not drawn.
    4. **The two finished visuals** - the simulated scope, and the app map.
    """)
    return


@app.cell
def _():
    import marimo as mo
    import numpy as np
    import matplotlib.pyplot as plt
    from matplotlib.colors import LinearSegmentedColormap
    from matplotlib.path import Path as MplPath
    from matplotlib.patches import Polygon as MplPolygon

    return LinearSegmentedColormap, mo, np, plt


@app.cell
def setting():
    # Invented so nothing collides with a real lake or a real cryptid.
    LAKE = "Lake Morrow"
    MONSTER = "the Morrow Monster"
    return LAKE, MONSTER


@app.cell
def sectors(np):
    # --- Sectors -------------------------------------------------------------
    # Six 60-degree sectors named by compass bearing. Bearing 0 = North = "up".
    # Everything here -- crowd counts, sonar readings, posterior -- bins into these.
    SECTORS = ["N", "NE", "SE", "S", "SW", "NW"]
    BEARINGS = {s: i * 60 for i, s in enumerate(SECTORS)}


    def to_math_angle(bearing_deg):
        """Compass bearing (0 = up, clockwise) -> matplotlib angle (0 = right, ccw)."""
        return np.deg2rad(90.0 - bearing_deg)

    return BEARINGS, SECTORS, to_math_angle


@app.cell(hide_code=True)
def md_numbers(mo):
    mo.md(r"""
    ## 1. The numbers

    The sector spec, and the Bayes arithmetic it produces. `check` verifies the
    three-answers shape and that the weights sum to 100.
    """)
    return


@app.cell
def engine():
    def posterior(counts, lrs):
        """Bayes over a ring of sectors, exactly one of which holds the monster.

        counts -- crowd-sourced sighting counts from the fishing app. Used
                  directly as the prior, since prior_i is proportional to counts_i
                  and the normalisation falls out at the end anyway.
        lrs    -- per-sector likelihood ratio for the sonar evidence:
                  P(this reading | monster here) / P(this reading | monster elsewhere).

        Returns (posterior, weights, Z). Every number set in this notebook is
        picked so Z == 100, which is what makes the arithmetic mental: the weight
        *is* the posterior in percent.
        """
        weights = [c * l for c, l in zip(counts, lrs)]
        Z = sum(weights)
        return [w / Z for w in weights], weights, Z


    def answers(spec):
        """The three answers that have to disagree for the problem to work."""
        post, weights, Z = posterior(spec["counts"], spec["lrs"])
        labels = spec["labels"]

        crowd = labels[max(range(len(labels)), key=lambda i: spec["counts"][i])]

        # What the sonar alone can say: the strongest target it actually detected.
        # A shadowed sector is the ABSENCE of a detection, so it is never the
        # sonar's own answer -- only Bayes can promote it.
        lit = [i for i in range(len(labels))
               if "NO RETURN" not in str(spec["readings"][i]).upper()]
        best_lr = max(spec["lrs"][i] for i in lit)
        sonar = [labels[i] for i in lit if spec["lrs"][i] == best_lr]

        bayes = labels[max(range(len(labels)), key=lambda i: weights[i])]
        return {"crowd": crowd, "sonar": sonar, "bayes": bayes,
                "post": post, "weights": weights, "Z": Z}

    return (answers,)


@app.cell
def check(answers, mo):
    def check(spec):
        """Does this variation hold the three-answers shape?"""
        res = answers(spec)
        labels = spec["labels"]
        rows = "\n".join(
            f"| **{labels[i]}** | {spec['counts'][i]} | {spec['readings'][i]} "
            f"| {spec['lrs'][i]:.2f} "
            f"| {spec['counts'][i]} x {spec['lrs'][i]:.2f} = **{res['weights'][i]:.1f}** "
            f"| {res['post'][i]:.0%} |"
            for i in range(len(labels))
        )
        sonar_ans = res["sonar"][0] if len(res["sonar"]) == 1 else \
            f"ambiguous -- {', '.join(res['sonar'])}"
        distinct = (res["crowd"] != res["bayes"]
                    and (len(res["sonar"]) > 1 or res["sonar"][0] != res["bayes"]))
        return mo.md(f"""
    ### {spec['name']}

    {spec['story']}

    | sector | sightings | sonar reading | consistency | product | posterior |
    |---|---|---|---|---|---|
    {rows}

    Total = **{res['Z']:.1f}** (whatever it happens to be -- you never divide by it
    to answer the question, you just take the largest product).

    - sightings alone -> **{res['crowd']}**
    - sonar alone -> **{sonar_ans}**
    - both -> **{res['bayes']}**

    {'three distinct answers' if distinct else 'COLLAPSED -- Bayes agrees with a single source'}
    """)

    return (check,)


@app.cell(hide_code=True)
def md_world(mo):
    mo.md(r"""
    ---
    ## 2. The world

    Everything above states an answer. What follows instead builds a world and
    **measures** it:

    - `BED` -- a real bathymetric grid, 0.25 ft per cell, with a rock ridge in it.
    - `FISH` -- real fish, as ellipsoids at real positions and depths. Exactly one
      of them is `MONSTER_FISH`, an 8.4 ft animal; the rest are ordinary 3 ft fish.

    That one-vs-many distinction is the crux. The sonar cannot make it. A tight
    school of ordinary fish at 40 ft smears into a single bright return that looks
    much like one big animal would -- which is why a STRONG reading earns a
    likelihood ratio of 8 and not infinity.

    **On where the monster is:** it sits in SE, the sector Bayes points at. That is
    one draw, chosen as the modal outcome, and it is *not* evidence the method
    works -- a 40% posterior is wrong more often than it is right. The ground truth
    is here to check that the simulated instruments behave, not to score the answer.
    """)
    return


@app.cell
def sim_world(np):
    # --- Ground truth: the lake bed ------------------------------------------
    SIM_RANGE = 60.0          # ft, what the 360 unit is set to
    GRID_EXT = 80.0           # ft, half-width of the bathymetry grid
    GRID_N = 641              # -> 0.25 ft per cell
    TRANSDUCER_DEPTH = 1.0    # ft below surface

    GX = np.linspace(-GRID_EXT, GRID_EXT, GRID_N)
    GXX, GYY = np.meshgrid(GX, GX)                    # boat at (0, 0)
    G_RANGE = np.hypot(GXX, GYY)
    G_BEARING = np.rad2deg(np.arctan2(GXX, GYY)) % 360.0     # 0 = +y = North


    def value_noise(n, cells, rng):
        """Smoothstep-interpolated value noise on an n x n grid."""
        g = rng.normal(0.0, 1.0, (cells + 1, cells + 1))
        t = np.linspace(0, cells, n)
        i0 = np.clip(np.floor(t).astype(int), 0, cells - 1)
        f = t - i0
        f = f * f * (3 - 2 * f)                        # C1 continuity
        rows = g[i0] * (1 - f)[:, None] + g[i0 + 1] * f[:, None]
        return rows[:, i0] * (1 - f)[None, :] + rows[:, i0 + 1] * f[None, :]


    def span_window(bearing, lo, hi, soft=7.0):
        """1 inside a bearing span, tapering to 0 across `soft` degrees at each end."""
        d1 = (bearing - lo) % 360.0
        width = (hi - lo) % 360.0
        edge = np.minimum(d1, width - d1)
        return np.where(d1 <= width, np.clip(edge / soft, 0.0, 1.0), 0.0)


    def build_bed(seed=17):
        """Depth below surface, in feet, positive down."""
        rng = np.random.default_rng(seed)
        # Deliberately smooth. High-frequency octaves here are not free detail --
        # every small bump casts its own micro-shadow in the viewshed, and the
        # scope ends up peppered with black specks that read as real occlusion.
        bed = (25.0
               + 5.0 * value_noise(GRID_N, 6, rng)
               + 1.0 * value_noise(GRID_N, 13, rng))

        # A rock ridge: a curved wall rising to within ~4 ft of the surface,
        # spanning the SE and S bearings. This is the only feature that matters.
        arc = (23.0
               + 3.0 * np.sin(np.deg2rad(G_BEARING) * 3.3)
               + 1.6 * np.cos(np.deg2rad(G_BEARING) * 7.1))
        amt = span_window(G_BEARING, 86.0, 214.0) * np.exp(-((G_RANGE - arc) / 5.5) ** 2)
        bed = bed * (1 - amt) + 4.0 * amt

        # A gentler hump NW, well inside the range -- it shadows almost nothing,
        # which is worth having so "raised bottom" does not read as "always blind".
        amt2 = span_window(G_BEARING, 288.0, 320.0) * np.exp(-((G_RANGE - 30.0) / 6.0) ** 2)
        bed = bed * (1 - amt2) + 15.0 * amt2
        return np.clip(bed, 2.0, None)


    BED = build_bed()


    def sample_bed(x, y, bed=None):
        """Bilinear lookup into a bathymetry grid, BED by default.
        Outside the grid it clamps to the edge."""
        bed = BED if bed is None else bed
        u = np.clip((np.asarray(x) + GRID_EXT) / (2 * GRID_EXT) * (GRID_N - 1), 0, GRID_N - 1)
        v = np.clip((np.asarray(y) + GRID_EXT) / (2 * GRID_EXT) * (GRID_N - 1), 0, GRID_N - 1)
        i0 = np.floor(u).astype(int); j0 = np.floor(v).astype(int)
        i1 = np.minimum(i0 + 1, GRID_N - 1); j1 = np.minimum(j0 + 1, GRID_N - 1)
        fu = u - i0; fv = v - j0
        # BED is indexed [row=y, col=x]
        return (bed[j0, i0] * (1 - fu) * (1 - fv) + bed[j0, i1] * fu * (1 - fv)
                + bed[j1, i0] * (1 - fu) * fv + bed[j1, i1] * fu * fv)

    return (
        BED,
        GRID_EXT,
        GRID_N,
        GXX,
        GYY,
        G_BEARING,
        G_RANGE,
        SIM_RANGE,
        TRANSDUCER_DEPTH,
        sample_bed,
        span_window,
        value_noise,
    )


@app.cell
def sim_fish(np, to_math_angle):
    # --- Ground truth: fish, logs, and one monster ---------------------------
    # There is exactly ONE monster. The rest are ordinary fish and two waterlogged
    # deadheads. The sonar can measure a target's apparent LENGTH; it cannot tell
    # one 8 ft animal from four 2 ft fish lying nose to tail, and it cannot tell a
    # fish from a log.
    def place_obj(bearing, rng_ft, depth, length, width, heading, tag,
             monster=False, kind="fish"):
        a = to_math_angle(bearing)
        return {"x": rng_ft * np.cos(a), "y": rng_ft * np.sin(a), "depth": depth,
                "length": length, "width": width, "heading": heading,
                "bearing": bearing, "range": rng_ft, "tag": tag,
                "monster": monster, "kind": kind,
                # wood and rock return harder than flesh
                "refl": 1.35 if kind == "log" else 1.0}


    FISH = [
        # --- SE (shadowed): the monster, plus company ------------------------
        place_obj(122, 40, 11.0, 8.4, 2.6, 70, "MONSTER", monster=True),
        place_obj(112, 34, 9.0, 3.4, 1.1, 45, "SE ordinary"),
        place_obj(133, 45, 12.5, 2.8, 1.0, 20, "SE ordinary"),

        # --- S (shadowed) -----------------------------------------------------
        place_obj(186, 41, 13.0, 3.0, 1.0, 15, "S ordinary"),
        place_obj(172, 36, 11.5, 2.6, 0.9, 60, "S ordinary"),

        # --- SW: reads LONG. A 6.5 ft deadhead with two fish alongside, which
        #     together smear into one ~9 ft return. Exactly what an 8.4 ft animal
        #     would look like, which is the entire trap.
        place_obj(240, 36, 13.0, 9.0, 1.8, 62, "SW deadhead", kind="log"),
        place_obj(243, 37, 12.4, 3.0, 1.0, 50, "SW school"),
        place_obj(237, 35, 13.6, 2.8, 0.9, 70, "SW school"),

        # --- NE: reads MEDIUM. Three small fish packed tight.
        place_obj(57.5, 33.0, 12.0, 2.8, 0.9, 55, "NE school"),
        place_obj(60.0, 33.4, 12.6, 2.8, 0.8, 48, "NE school"),
        place_obj(62.5, 32.8, 11.6, 2.8, 1.0, 62, "NE school"),
        place_obj(74.0, 48.0, 15.0, 2.2, 0.8, 30, "NE single"),

        # --- N: reads SHORT. Two well-separated singles.
        place_obj(5.0, 24.0, 8.5, 2.6, 0.9, 100, "N single"),
        place_obj(349.0, 31.0, 10.0, 2.2, 0.8, 130, "N single"),

        # --- NW: reads SHORT. Scattered singles and a small log.
        place_obj(300.0, 42.0, 16.0, 2.8, 1.0, 130, "NW single"),
        place_obj(288.0, 30.0, 11.0, 2.4, 0.8, 95, "NW single"),
        place_obj(315.0, 36.0, 13.0, 2.6, 0.9, 40, "NW deadhead", kind="log"),
    ]

    MONSTER_FISH = next(f for f in FISH if f["monster"])
    return FISH, MONSTER_FISH, place_obj


@app.cell(hide_code=True)
def md_sensor(mo):
    mo.md(r"""
    ## 3. The sensor

    A viewshed cast from the transducer. Nothing below is hand-placed: the shadows
    land wherever the ray-march says the ridge puts them, and a fish behind the
    crest disappears because the ray never reaches it.
    """)
    return


@app.cell
def sim_viewshed(
    BEARINGS,
    SECTORS,
    SIM_RANGE,
    TRANSDUCER_DEPTH,
    np,
    sample_bed,
    to_math_angle,
):
    # --- The sensor model: a viewshed cast from the transducer ---------------
    # Geometry. The transducer sits just under the surface. A target at range r and
    # depth D is seen along a ray whose depression ratio is (D - td) / r. That ray
    # clears the bottom only if it stays ABOVE every closer piece of terrain, i.e.
    # only if its ratio is smaller than (D' - td) / r' for every closer r'.
    #
    # So: march outward, keep the running minimum of the depression ratio, and a
    # sample is visible exactly when its own ratio does not exceed that minimum.
    # A ridge rising near the surface pins the minimum very low and everything
    # deeper behind it fails the test -- which is precisely an acoustic shadow.
    SIM_NTH, SIM_NR = 720, 420


    def cast_viewshed(n_th=SIM_NTH, n_r=SIM_NR, rmax=SIM_RANGE, bed=None):
        th_deg = np.linspace(0.0, 360.0, n_th, endpoint=False)
        r = np.linspace(0.6, rmax, n_r)
        TH, R = np.meshgrid(th_deg, r, indexing="ij")

        ang = to_math_angle(TH)
        X, Y = R * np.cos(ang), R * np.sin(ang)
        D = sample_bed(X, Y, bed=bed)

        ratio = (D - TRANSDUCER_DEPTH) / R
        run_min = np.minimum.accumulate(ratio, axis=1)
        # threshold set by everything STRICTLY closer than this sample
        horizon = np.concatenate([np.full((n_th, 1), np.inf), run_min[:, :-1]], axis=1)
        visible = ratio <= horizon + 1e-9
        return {"th_deg": th_deg, "r": r, "X": X, "Y": Y, "D": D,
                "ratio": ratio, "horizon": horizon, "visible": visible}


    VS = cast_viewshed()


    def fish_visible(f, vs=None):
        """Is this fish in line of sight? Same test, at the fish's own depth."""
        vs = vs or VS
        r_f = np.hypot(f["x"], f["y"])
        if r_f > vs["r"][-1]:
            return False
        b = np.rad2deg(np.arctan2(f["x"], f["y"])) % 360.0
        i = int(round(b / 360.0 * len(vs["th_deg"]))) % len(vs["th_deg"])
        j = int(np.searchsorted(vs["r"], r_f))
        j = min(max(j, 0), len(vs["r"]) - 1)
        return bool((f["depth"] - TRANSDUCER_DEPTH) / r_f <= vs["horizon"][i, j] + 1e-9)


    def sector_occlusion(vs=None):
        """Fraction of each sector's swept area that is in shadow -- measured from
        the viewshed, not asserted."""
        vs = vs or VS
        out = {}
        for s in SECTORS:
            lo = (BEARINGS[s] - 30) % 360
            d = (vs["th_deg"] - lo) % 360
            sel = d <= 60
            # area weight: a polar cell's area grows with r
            w = np.broadcast_to(vs["r"], vs["visible"].shape)[sel]
            out[s] = float(1.0 - (vs["visible"][sel] * w).sum() / w.sum())
        return out

    return VS, cast_viewshed, fish_visible, sector_occlusion


@app.cell
def sim_measure(FISH, SECTORS, fish_visible, mo, np, sector_occlusion):
    # Read the simulation back out: shadow per sector, and how many fish are
    # really there versus how many the sonar can actually reach.
    def fish_sector(f):
        b = np.rad2deg(np.arctan2(f["x"], f["y"])) % 360.0
        return SECTORS[int(((b + 30.0) % 360.0) // 60.0)]


    _occ = sector_occlusion()
    _rows = []
    for _s in SECTORS:
        _here = [f for f in FISH if fish_sector(f) == _s]
        _seen = [f for f in _here if fish_visible(f)]
        _rows.append(f"| {_s} | {_occ[_s] * 100:.0f}% | {len(_here)} | {len(_seen)} |")

    mo.md("### Measured from the ray-march\n\n"
          "| sector | shadowed | fish present (truth) | fish the sonar sees |\n"
          "|---|---|---|---|\n" + "\n".join(_rows))
    return


@app.cell
def sim_truth(
    BEARINGS,
    BED,
    FISH,
    GRID_EXT,
    GXX,
    GYY,
    SECTORS,
    SIM_RANGE,
    fish_visible,
    np,
    plt,
    to_math_angle,
):
    # --- Ground truth panel (design aid, never published) --------------------
    def draw_truth(ax, fish=None, rmax=None):
        """What is actually down there: the bed, and every fish, seen or not."""
        fish = FISH if fish is None else fish
        rmax = rmax or SIM_RANGE
        m = GRID_EXT
        im = ax.imshow(BED, origin="lower", extent=(-m, m, -m, m),
                       cmap="terrain_r", zorder=1)
        ax.contour(GXX, GYY, BED, levels=[6, 10, 15, 20, 25],
                   colors="#1e293b", linewidths=0.6, alpha=0.7, zorder=2)

        for f in fish:
            seen = fish_visible(f)
            ax.add_patch(plt.matplotlib.patches.Ellipse(
                (f["x"], f["y"]), f["length"], f["width"],
                angle=f["heading"], facecolor="#fde68a" if seen else "#ef4444",
                edgecolor="black", linewidth=2.0 if f["monster"] else 0.8, zorder=5))
            if f["monster"]:
                ax.annotate("THE MONSTER", (f["x"], f["y"]),
                            textcoords="offset points", xytext=(0, 14),
                            ha="center", fontsize=9, fontweight="bold",
                            color="#7f1d1d", zorder=8,
                            bbox=dict(boxstyle="round,pad=0.25", facecolor="white",
                                      edgecolor="#7f1d1d", linewidth=1.2, alpha=0.9))

        for s in SECTORS:
            a = to_math_angle(BEARINGS[s] - 30)
            ax.plot([0, rmax * np.cos(a)], [0, rmax * np.sin(a)],
                    color="#0f172a", lw=0.9, ls=(0, (5, 4)), zorder=4)
            c = to_math_angle(BEARINGS[s])
            ax.text(rmax * 0.78 * np.cos(c), rmax * 0.78 * np.sin(c), s,
                    ha="center", va="center", fontsize=10, fontweight="bold",
                    color="#0f172a", zorder=6)

        ring = np.linspace(0, 2 * np.pi, 200)
        ax.plot(rmax * np.cos(ring), rmax * np.sin(ring), color="#0f172a",
                lw=1.4, ls=(0, (6, 4)), zorder=4)
        ax.plot([0], [0], marker="o", markersize=10, color="#0f172a", zorder=7)

        ax.set_xlim(-rmax * 1.12, rmax * 1.12); ax.set_ylim(-rmax * 1.12, rmax * 1.12)
        ax.set_aspect("equal"); ax.set_xticks([]); ax.set_yticks([])
        ax.set_title("GROUND TRUTH - bed depth + every fish\n"
                     "(yellow = sonar sees it, red = it does not)",
                     fontsize=9.5, fontweight="bold", pad=8)
        return im

    return (draw_truth,)


@app.cell
def truth_output(draw_truth, plt):
    # Design aid, never published: what is actually down there.
    _fig_truth, _ax_truth = plt.subplots(figsize=(7.2, 7.2), facecolor="white")
    draw_truth(_ax_truth)
    _fig_truth.tight_layout()
    _fig_truth
    return


@app.cell
def sim_render(
    BEARINGS,
    FISH,
    LinearSegmentedColormap,
    SECTORS,
    SIM_RANGE,
    TRANSDUCER_DEPTH,
    VS,
    np,
    value_noise,
):
    # The amber palette a real unit uses: black water, copper bottom return,
    # pale yellow for the hardest returns.
    SONAR_CMAP = LinearSegmentedColormap.from_list("sonar", [
        (0.00, "#05070a"), (0.18, "#2b1a08"), (0.38, "#7a3d05"),
        (0.58, "#c46a06"), (0.78, "#f0a81e"), (0.92, "#ffd970"),
        (1.00, "#fff6d5"),
    ])


    # --- Rendering the simulated scope ---------------------------------------
    def _blur_polar(img, k_th, k_r):
        """Box blur. Wraps in bearing, clamps in range. This is what turns an
        exact simulation into a low-resolution sonar picture."""
        out = img
        if k_th > 1:
            k_th |= 1
            ker = np.ones(k_th) / k_th
            pad = k_th // 2
            ext = np.concatenate([out[-pad:], out, out[:pad]], axis=0)
            out = np.stack([np.convolve(ext[:, j], ker, "valid")
                            for j in range(out.shape[1])], axis=1)
        if k_r > 1:
            k_r |= 1
            ker = np.ones(k_r) / k_r
            pad = k_r // 2
            ext = np.pad(out, ((0, 0), (pad, pad)), mode="edge")
            out = np.stack([np.convolve(ext[i], ker, "valid")
                            for i in range(out.shape[0])], axis=0)
        return out


    def sim_scope_image(vs=None, fish=None, seed=23, blur=(3, 3), beam_deg=3.5,
                        target_gain=1.45):
        """Turn the viewshed + targets into a return-strength image.

        The bed and the targets are rendered on SEPARATE layers, and only the
        targets get the beam smear. That is not a cheat -- it is why fish show as
        arches on a 2D unit and as smeared arcs on side-scan. A beam of finite
        width spreads an isolated point target across its whole footprint, while a
        continuous textured bottom barely changes. Keeping the bed and the shadow
        edges crisp is what preserves the *appearance* of resolution while making
        target length genuinely ambiguous.
        """
        vs = vs or VS
        fish = FISH if fish is None else fish
        rng = np.random.default_rng(seed)
        R, X, Y = vs["r"][None, :] * np.ones_like(vs["D"]), vs["X"], vs["Y"]

        # ---- layer 1: the bottom, kept sharp -------------------------------
        dDdr = np.gradient(vs["D"], vs["r"], axis=1)
        # Saturating response, NOT raw slope: a bare np.clip lets a steep ridge
        # face run to several ft/ft, which pins the image at white.
        slope = np.clip(-dDdr, 0.0, None)
        facing = 1.0 - np.exp(-slope / 0.22)
        texture = 0.07 * value_noise(max(vs["D"].shape), 60, rng)[:vs["D"].shape[0],
                                                                  :vs["D"].shape[1]]
        # The floor matters as much as the ceiling: insonified-but-dim bottom has
        # to stay clearly brighter than shadow, or a flat far field reads as
        # occluded when it is simply far away.
        texture *= np.clip((R - 1.5) / 6.0, 0.0, 1.0)   # kill the
        # starburst: polar-indexed noise goes wedge-shaped near r=0
        bottom = 0.34 + 0.30 * facing + texture
        bottom *= np.clip(1.10 - 0.004 * R, 0.72, 1.0)          # range gain
        bed = np.where(vs["visible"], bottom, 0.012)            # shadow near-black
        bed += 0.030 * rng.normal(0, 1, bed.shape)              # speckle
        bed = _blur_polar(bed, *blur)

        return np.clip(bed + target_gain * build_target_layer(vs, fish, beam_deg),
                       0.0, 1.0)


    def build_target_layer(vs=None, fish=None, beam_deg=3.5):
        """Targets alone, smeared across the beam footprint.

        Kept separate from the bed because it is also what the unit's target
        matcher works on -- the apparent length of a contact is measured off this
        layer, not off the bottom.
        """
        vs = vs or VS
        fish = FISH if fish is None else fish
        R, X, Y = vs["r"][None, :] * np.ones_like(vs["D"]), vs["X"], vs["Y"]
        targets = np.zeros_like(R)
        for f in fish:
            ang = np.deg2rad(f["heading"])
            u = (X - f["x"]) * np.cos(ang) + (Y - f["y"]) * np.sin(ang)
            v = -(X - f["x"]) * np.sin(ang) + (Y - f["y"]) * np.cos(ang)
            q = (u / (f["length"] / 2)) ** 2 + (v / (f["width"] / 2)) ** 2
            shell = np.exp(-((q - 1.0) / 0.55) ** 2)
            fill = 0.38 * np.exp(-1.4 * q)
            seen = (f["depth"] - TRANSDUCER_DEPTH) / R <= vs["horizon"] + 1e-9
            targets += np.where(seen, f["refl"] * (shell + fill), 0.0)

        # A fixed angular width in bearing is a footprint that GROWS with range,
        # which is exactly the beam's behaviour.
        k_beam = int(round(beam_deg / 360.0 * vs["D"].shape[0])) | 1
        return _blur_polar(targets, max(k_beam, 3), 5)


    def draw_sim_scope(ax, img=None, vs=None, readings=None, key=None,
                       label_color="#cbd5e1",
                       title="360 IMAGING    RANGE 60 ft    GAIN 7"):
        vs = vs or VS
        img = sim_scope_image(vs) if img is None else img
        th = np.deg2rad(vs["th_deg"])
        r = vs["r"]

        ax.set_theta_zero_location("N")
        ax.set_theta_direction(-1)
        ax.pcolormesh(th, r, img.T, cmap=SONAR_CMAP, shading="gouraud",
                      vmin=0.0, vmax=1.0, zorder=1)

        ax.set_xticks([]); ax.set_yticks([])
        ax.set_ylim(0, SIM_RANGE * 1.38)
        ax.spines["polar"].set_visible(False)
        ax.set_facecolor("#05070a")

        ring_th = np.linspace(0, 2 * np.pi, 240)
        for ring in (15, 30, 45, 60):
            ax.plot(ring_th, np.full_like(ring_th, ring), color="#64748b",
                    lw=0.7, ls=(0, (4, 5)), zorder=4)
            ax.text(np.deg2rad(205), ring, f"{ring}", color="#94a3b8", fontsize=7,
                    ha="center", va="center", zorder=6, fontfamily="monospace",
                    bbox=dict(boxstyle="round,pad=0.14", facecolor="#05070a",
                              edgecolor="none", alpha=0.75))

        # Sector lines, drawn over the image.
        for s in SECTORS:
            edge = np.deg2rad(BEARINGS[s] - 30)
            ax.plot([edge, edge], [0, SIM_RANGE], color="#94a3b8", lw=1.0,
                    ls=(0, (6, 4)), zorder=5, alpha=0.85)

        # The readout is the datum the reader actually works from, so it gets a
        # boxed, high-contrast label rather than a caption.
        for s in SECTORS:
            if readings is None:
                ax.text(np.deg2rad(BEARINGS[s]), SIM_RANGE * 1.16, s, ha="center",
                        va="center", fontsize=12, color=label_color,
                        fontweight="bold", zorder=6)
                continue
            shadowed = "NO RETURN" in str(readings[s]).upper()
            ax.text(np.deg2rad(BEARINGS[s]), SIM_RANGE * 1.19,
                    f"{s}\n{readings[s]}", ha="center", va="center",
                    fontsize=12.5, fontweight="bold", zorder=6, linespacing=1.5,
                    color="#7f1d1d" if shadowed else "#0f172a",
                    bbox=dict(boxstyle="round,pad=0.34",
                              facecolor="#cbd5e1" if shadowed else "#f8fafc",
                              edgecolor="#7f1d1d" if shadowed else "#0f172a",
                              linewidth=1.8))



        ax.scatter([0], [0], s=150, marker="o", color="#e2e8f0", zorder=9,
                   edgecolors="#0b0e13", linewidths=2)
        if title:
            ax.set_title(title, color="#f0a81e", fontsize=10.5, fontweight="bold",
                         pad=26, fontfamily="monospace")
        return ax

    return SONAR_CMAP, build_target_layer, draw_sim_scope, sim_scope_image


@app.cell
def sim_measure_targets(
    BEARINGS,
    SECTORS,
    VS,
    build_target_layer,
    np,
    sector_occlusion,
):
    # --- What the unit measures ----------------------------------------------
    def _run_extent(profile, i0, thresh):
        """Contiguous run around index i0 where profile stays above thresh."""
        lo = i0
        while lo - 1 >= 0 and profile[lo - 1] >= thresh:
            lo -= 1
        hi = i0
        while hi + 1 < len(profile) and profile[hi + 1] >= thresh:
            hi += 1
        return lo, hi


    def measure_sectors(vs=None, fish=None, beam_deg=3.5, frac=0.5, band_ft=6.0):
        """Per sector: the apparent length of the strongest contact, measured off
        the target layer the way the unit would.

        Find the brightest cell, then walk outward in bearing while the return
        stays above half peak. The walk has to be CONTIGUOUS -- simply taking every
        bright cell in the sector welds separate contacts into one, which reports a
        trio of scattered singles as a single 19 ft target.
        """
        vs = vs or VS
        T = build_target_layer(vs, fish, beam_deg)
        occ = sector_occlusion(vs)
        out = {}
        for s in SECTORS:
            lo_b = (BEARINGS[s] - 30) % 360
            rel = (vs["th_deg"] - lo_b) % 360
            sel = rel <= 60
            sub, rel_in = T[sel], np.deg2rad(rel[sel])
            peak = float(sub.max())
            if peak < 0.08:
                out[s] = {"length": 0.0, "range": None, "peak": peak, "occ": occ[s]}
                continue
            bi, ri = np.unravel_index(int(np.argmax(sub)), sub.shape)
            r_peak = float(vs["r"][ri])

            band = np.abs(vs["r"] - r_peak) < band_ft
            prof_b = sub[:, band].max(axis=1)                 # along bearing
            b0, b1 = _run_extent(prof_b, bi, frac * peak)
            tangential = float((rel_in[b1] - rel_in[b0]) * r_peak)

            prof_r = sub[b0:b1 + 1, :].max(axis=0)            # along range
            r0, r1 = _run_extent(prof_r, ri, frac * peak)
            radial = float(vs["r"][r1] - vs["r"][r0])

            out[s] = {"length": max(tangential, radial), "range": r_peak,
                      "peak": peak, "occ": occ[s]}
        return out

    return (measure_sectors,)


@app.cell
def sim_consistency(MONSTER_FISH, SECTORS, measure_sectors, np):
    # --- What the unit reports: consistency ----------------------------------
    # One number per sector: the chance the sector would look the way it does, if
    # the monster were in it. This is P(reading | monster here) -- what a matched
    # filter computes -- and it is a MEASUREMENT, not a chosen parameter.
    #
    # For a sector the beam reaches, the unit compares the contact's apparent
    # length against the monster's known 8.4 ft. The tolerance on that comparison
    # is not invented either; it has two derived parts:
    #
    #   beam    -- a contact is smeared across the beam footprint, r * theta_beam,
    #              so length uncertainty grows with range.
    #   aspect  -- a fish's acoustic length is L*|cos(phi)| for orientation phi.
    #              Taking phi uniform (it could be pointing any way), that has
    #              standard deviation L * sqrt(1/2 - 4/pi^2) = 0.308 * L.
    #
    # For a sector the ridge blocks, "no return" is exactly what you would get if
    # the monster were in the blocked part -- so the consistency is just the
    # occluded fraction, straight off the ray-march.
    BEAM_RAD = np.deg2rad(3.5)
    ASPECT_SD = np.sqrt(0.5 - 4.0 / np.pi ** 2)          # = 0.308


    def length_sigma(range_ft):
        """Tolerance on an apparent-length measurement, in feet."""
        return np.hypot(range_ft * BEAM_RAD, ASPECT_SD * MONSTER_FISH["length"])


    def consistency(vs=None, fish=None):
        """P(this sector's reading | monster in this sector), per sector."""
        m = measure_sectors(vs=vs, fish=fish)
        out = {}
        for s in SECTORS:
            d = m[s]
            if d["range"] is None:                        # nothing came back
                out[s] = {"kind": "blocked", "value": d["occ"],
                          "length": None, "range": None, "occ": d["occ"]}
            else:
                sig = length_sigma(d["range"])
                v = float(np.exp(-0.5 * ((d["length"] - MONSTER_FISH["length"]) / sig) ** 2))
                out[s] = {"kind": "contact", "value": v, "length": d["length"],
                          "range": d["range"], "occ": d["occ"]}
        return out

    return (consistency,)


@app.cell
def measured_table(MONSTER_FISH, SECTORS, consistency, mo):
    _c = consistency()
    _rows = []
    for _s in SECTORS:
        _d = _c[_s]
        _what = (f"no return ({_d['occ']:.0%} of sector blocked)" if _d["kind"] == "blocked"
                 else f"contact, {_d['length']:.1f} ft at {_d['range']:.0f} ft")
        _rows.append(f"| **{_s}** | {_what} | **{_d['value']:.2f}** |")

    mo.md(
        "### What the unit measures\n\n"
        f"Monster is {MONSTER_FISH['length']} ft. Every number below is measured off "
        "the simulated scope or off the ray-march -- none of it is chosen.\n\n"
        "| sector | reading | consistency |\n|---|---|---|\n" + "\n".join(_rows)
    )
    return


@app.cell
def problem_spec(SECTORS, check, consistency):
    # --- The problem spec ----------------------------------------------------
    # Two inputs, and neither is invented.
    #   sightings   -- counts. The app logged them; there is nothing to justify.
    #   consistency -- measured off the scope and the ray-march, in the cell above.
    # The normalising total is whatever falls out. Nothing here has been chosen to
    # make the arithmetic land on a round number.
    SIGHTINGS = {"N": 6, "NE": 8, "SE": 13, "S": 6, "SW": 9, "NW": 17}

    CONS = consistency()

    PROBLEM = {
        "name": "measured consistency against crowd sightings",
        "story": "The app counts sightings. The sonar reports how well each sector "
                 "fits an 8.4 ft target. Multiply, and take the biggest.",
        "labels": SECTORS,
        "counts": [SIGHTINGS[s] for s in SECTORS],
        "readings": ["no return" if CONS[s]["kind"] == "blocked"
                     else f"{CONS[s]['length']:.1f} ft" for s in SECTORS],
        "lrs": [CONS[s]["value"] for s in SECTORS],
    }

    check(PROBLEM)
    return (PROBLEM,)


@app.cell
def sim_side(FISH, SIM_RANGE, TRANSDUCER_DEPTH, VS, fish_visible, np, plt):
    # --- The side inset: why those bearings are blind ------------------------
    def draw_side_profile(ax, bearing=150.0, vs=None, fish=None, rmax=None):
        """A vertical slice along one bearing, straight out of the same BED grid
        and the same viewshed. This is the picture the reference fish-finder
        diagram draws, and it is what makes the dark wedges legible."""
        vs = vs or VS
        fish = FISH if fish is None else fish
        rmax = rmax or SIM_RANGE

        i = int(round(bearing / 360.0 * len(vs["th_deg"]))) % len(vs["th_deg"])
        r = vs["r"]
        D = vs["D"][i]
        horizon = vs["horizon"][i]
        # Shallowest depth still in line of sight at each range.
        los = np.where(np.isfinite(horizon), horizon * r + TRANSDUCER_DEPTH, 0.0)
        ymax = float(D.max()) + 4.0

        ax.fill_between(r, 0, D, color="#0d3b52", zorder=1)                  # water
        ax.fill_between(r, D, ymax, color="#6b4423", zorder=3)               # bed
        ax.plot(r, D, color="#f0a81e", lw=2.0, zorder=4)                     # hard return

        # Everything deeper than the line of sight, but above the bed, is shadow.
        shadow = np.minimum(np.maximum(los, 0.0), D)
        # Inside a couple of feet the horizon is still undefined, so `los` collapses
        # to 0 and paints a false shadow sliver right under the boat.
        near = r >= 3.0
        ax.fill_between(r, shadow, D, where=((D - shadow) > 0.05) & near,
                        color="#000000", alpha=0.80, zorder=2,
                        hatch="///", edgecolor="#334155", linewidth=0.0)
        ax.plot(r[near], np.clip(los[near], 0, ymax), color="#38bdf8", lw=1.4,
                ls=(0, (5, 3)), zorder=5)

        for f in fish:
            b = np.rad2deg(np.arctan2(f["x"], f["y"])) % 360.0
            if min(abs(b - bearing), 360 - abs(b - bearing)) > 30.0:
                continue
            seen = fish_visible(f)
            ax.add_patch(plt.matplotlib.patches.Ellipse(
                (f["range"], f["depth"]), f["length"], f["width"],
                angle=0, facecolor="#fde68a" if seen else "#ef4444",
                edgecolor="white", linewidth=2.2 if f["monster"] else 1.1,
                zorder=6, alpha=0.95))
            if f["monster"]:
                ax.annotate("THE MONSTER", (f["range"], f["depth"]),
                            textcoords="offset points", xytext=(0, -24),
                            ha="center", fontsize=8.5, fontweight="bold",
                            color="#fecaca", zorder=7)

        ax.plot([0], [TRANSDUCER_DEPTH], marker="v", markersize=11,
                color="#e2e8f0", zorder=7)
        ax.set_xlim(0, rmax); ax.set_ylim(ymax, 0)
        ax.set_xlabel("range (ft)", color="#cbd5e1", fontsize=9)
        ax.set_ylabel("depth (ft)", color="#cbd5e1", fontsize=9)
        ax.tick_params(colors="#94a3b8", labelsize=8)
        ax.set_facecolor("#05070a")
        for sp in ax.spines.values():
            sp.set_color("#334155")
        ax.set_title(f"slice along bearing {bearing:.0f}\u00b0   "
                     f"(red = fish the sonar cannot reach)",
                     color="#f0a81e", fontsize=9.5, fontweight="bold",
                     fontfamily="monospace", pad=8)
        return ax

    return (draw_side_profile,)


@app.cell
def sim_app_map(
    BEARINGS,
    BED,
    GXX,
    GYY,
    LAKE,
    LinearSegmentedColormap,
    SECTORS,
    SIM_RANGE,
    np,
    plt,
    to_math_angle,
):
    # --- The fishing app: rectangular map, centred on you --------------------
    GMAP_BLUE = "#4285F4"
    APP_HEAT = LinearSegmentedColormap.from_list("appheat", [
        (0.00, "#00000000"),
        (0.18, "#22d3ee44"),
        (0.42, "#a3e63588"),
        (0.62, "#facc15bb"),
        (0.82, "#fb923cdd"),
        (1.00, "#dc2626f0"),
    ])


    def sample_local_reports(counts, rmax=None, seed=9):
        """Reports scattered within sonar range, binned into the same sectors.

        Both instruments now cover exactly the same disc, which is what lets the
        two panels be compared sector for sector.
        """
        rmax = rmax or SIM_RANGE
        rng = np.random.default_rng(seed)
        pts = {}
        for s, n in zip(SECTORS, counts):
            lo = BEARINGS[s] - 26.0
            got = []
            while len(got) < n:
                b = rng.uniform(lo, lo + 52.0)
                rad = rmax * np.sqrt(rng.uniform(0.045, 0.92))
                a = to_math_angle(b)
                got.append([rad * np.cos(a), rad * np.sin(a)])
            pts[s] = np.array(got)
        return pts


    def draw_app_map(ax, counts, half_w=76.0, half_h=66.0, bw=11.0, seed=9,
                     extra=None, highlight=None, rmax=None, fontsize=11.5,
                     anchor=0.66, title=None):
        """A phone map view: bathymetric contours, a crowd heatmap, and a
        Google-Maps location puck sitting dead centre because the map follows you."""
        rmax = rmax or SIM_RANGE
        pts = sample_local_reports(counts, rmax=rmax, seed=seed)

        ax.set_facecolor("#eaf4fa")
        # Same BED the sonar uses -- the app draws the lake's contours from it.
        ax.contourf(GXX, GYY, BED, levels=[0, 8, 14, 19, 23, 27, 40],
                    colors=["#bfe3f2", "#c9e9f6", "#d5eefa", "#e1f3fc",
                            "#ecf8fe", "#f5fbff"], zorder=1)
        ax.contour(GXX, GYY, BED, levels=[8, 14, 19, 23, 27],
                   colors="#9dc6da", linewidths=0.7, zorder=2)

        g_x = np.linspace(-half_w, half_w, 380)
        g_y = np.linspace(-half_h, half_h, 340)
        MX, MY = np.meshgrid(g_x, g_y)
        dens = np.zeros_like(MX)
        for s in SECTORS:
            for p in pts[s]:
                dens += np.exp(-(((MX - p[0]) ** 2 + (MY - p[1]) ** 2) / (2 * bw ** 2)))
        if dens.max() > 0:
            dens /= dens.max()
        # vmax below 1 on purpose: normalised to the peak, a sector with half the
        # reports renders as pale cyan and reads as no activity at all. Capping the
        # scale lets the secondary clusters show as real hotspots.
        ax.imshow(dens, origin="lower", extent=(-half_w, half_w, -half_h, half_h),
                  cmap=APP_HEAT, vmin=0, vmax=0.62, zorder=3,
                  interpolation="bilinear")

        for s in SECTORS:
            a = to_math_angle(BEARINGS[s] - 30)
            ax.plot([0, 200 * np.cos(a)], [0, 200 * np.sin(a)], color="#334155",
                    lw=1.1, ls=(0, (6, 4)), zorder=4, alpha=0.65)

        for s, n in zip(SECTORS, counts):
            a = to_math_angle(BEARINGS[s])
            d = rmax * anchor
            x, y = d * np.cos(a), d * np.sin(a)
            txt = f"{s}\n{n}"
            if extra and s in extra:
                txt += f"\n{extra[s]}"
            win = (s == highlight)
            ax.text(x, y, txt, ha="center", va="center", fontsize=fontsize,
                    fontweight="bold", color="#0f172a", zorder=7, linespacing=1.35,
                    bbox=dict(boxstyle="round,pad=0.40",
                              facecolor="#fde68a" if win else "white",
                              edgecolor="#0f172a", linewidth=2.2 if win else 1.2,
                              alpha=0.95))

        # The location puck: accuracy halo, white collar, blue dot. Dead centre,
        # because a maps view is always centred on the person holding it.
        ax.add_patch(plt.Circle((0, 0), 15.0, facecolor=GMAP_BLUE, alpha=0.16,
                                edgecolor="none", zorder=8))
        ax.add_patch(plt.Circle((0, 0), 15.0, facecolor="none", edgecolor=GMAP_BLUE,
                                alpha=0.35, linewidth=1.0, zorder=8))
        ax.add_patch(plt.Circle((0, 0), 4.6, facecolor="white", edgecolor="none",
                                zorder=9))
        ax.add_patch(plt.Circle((0, 0), 3.4, facecolor=GMAP_BLUE,
                                edgecolor="white", linewidth=1.4, zorder=10))

        # Scale bar and north arrow, as any map app shows.
        ax.plot([half_w - 34, half_w - 9], [-half_h + 8, -half_h + 8],
                color="#0f172a", lw=2.2, zorder=9, solid_capstyle="butt")
        ax.text(half_w - 21.5, -half_h + 11.5, "25 ft", ha="center", va="bottom",
                fontsize=8, color="#0f172a", fontweight="bold", zorder=9)
        ax.annotate("N", (half_w - 14, half_h - 26), xytext=(half_w - 14, half_h - 9),
                    ha="center", fontsize=10, fontweight="bold", color="#0f172a",
                    zorder=9, arrowprops=dict(arrowstyle="<-", color="#0f172a", lw=1.6))

        ax.set_xlim(-half_w, half_w); ax.set_ylim(-half_h, half_h)
        ax.set_aspect("equal"); ax.set_xticks([]); ax.set_yticks([])
        for sp in ax.spines.values():
            sp.set_color("#94a3b8")
        ax.set_title(title if title is not None else
                     f"{LAKE} MonsterLog  |  {sum(counts)} reports within 60 ft, 30 days",
                     fontsize=10.5, fontweight="bold", color="#0f172a", pad=10)
        return ax

    return (draw_app_map,)


@app.cell
def sim_figures(
    MONSTER,
    PROBLEM,
    SECTORS,
    answers,
    draw_app_map,
    draw_side_profile,
    draw_sim_scope,
    plt,
):
    # --- The two finished visuals --------------------------------------------
    # Derived from the spec, never typed twice -- the scope labels and the
    # likelihood ratios have to describe the same observation.
    # Derived from the spec, never typed twice -- the scope labels and the
    # numbers the reader multiplies have to be the same measurement.
    SIM_READINGS = {
        s: f"{rd}\n{v:.2f}"
        for s, rd, v in zip(SECTORS, PROBLEM["readings"], PROBLEM["lrs"])
    }

    CONSISTENCY_KEY = (
        "CONSISTENCY  --  chance the sector would look like this, "
        "if the monster were in it"
    )


    def _put_key(fig, y=0.012, color="#cbd5e1"):
        fig.text(0.5, y, CONSISTENCY_KEY, ha="center", va="bottom", fontsize=9,
                 color=color, fontfamily="monospace",
                 bbox=dict(boxstyle="round,pad=0.45", facecolor="#111827",
                           edgecolor="#475569", linewidth=1.0))


    def sonar_figure(figsize=(8.0, 10.0), bearing=150.0, readings=None):
        """Visual 1: the simulated scope, with the side slice that explains it."""
        fig = plt.figure(figsize=figsize, facecolor="#0b0e13")
        gs = fig.add_gridspec(2, 1, height_ratios=[2.75, 1.0], hspace=0.28,
                              left=0.06, right=0.94, top=0.94, bottom=0.105)
        ax = fig.add_subplot(gs[0], projection="polar")
        draw_sim_scope(ax, readings=readings or SIM_READINGS)
        ax2 = fig.add_subplot(gs[1])
        draw_side_profile(ax2, bearing=bearing)
        _put_key(fig)
        return fig


    def app_figure(counts=None, figsize=(8.0, 7.0), **kw):
        """Visual 2: the crowd map, centred on you."""
        counts = PROBLEM["counts"] if counts is None else counts
        fig, ax = plt.subplots(figsize=figsize, facecolor="white")
        draw_app_map(ax, counts, **kw)
        fig.tight_layout()
        return fig


    def sim_poster(reveal=False, figsize=(8.6, 10.4)):
        """Both instruments in one portrait.

        The problem image pairs the crowd map with the scope. The solution swaps
        the scope for the side slice -- by then the reader has already stared at
        the scope, and what they need is the reason those two sectors are black.
        """
        res = answers(PROBLEM)
        extra = highlight = None
        if reveal:
            extra = {s: f"x{lr} = {w}%" for s, lr, w
                     in zip(SECTORS, PROBLEM["lrs"], res["weights"])}
            highlight = res["bayes"]

        fig = plt.figure(figsize=figsize, facecolor="#0b0e13")
        ratios = [1.0, 1.35] if not reveal else [1.0, 0.62]
        gs = fig.add_gridspec(2, 1, height_ratios=ratios, hspace=0.24,
                              left=0.06, right=0.94, top=0.905, bottom=0.075)

        ax_app = fig.add_subplot(gs[0])
        draw_app_map(ax_app, PROBLEM["counts"], extra=extra, highlight=highlight,
                     fontsize=10.5 if reveal else 11.5,
                     anchor=0.80 if reveal else 0.66,
                     title=("posterior = reports x likelihood ratio, and they sum to 100"
                            if reveal else None))
        # the map's own title is near-black, which vanishes on the dark poster
        ax_app.title.set_color("#cbd5e1")

        if not reveal:
            ax2 = fig.add_subplot(gs[1], projection="polar")
            draw_sim_scope(ax2, readings=SIM_READINGS)
        else:
            ax2 = fig.add_subplot(gs[1])
            draw_side_profile(ax2, bearing=150.0)

        head = (f"Where do you cast for {MONSTER}?" if not reveal
                else f"Cast {res['bayes']}  --  "
                     f"{res['weights'][SECTORS.index(res['bayes'])]}%")
        fig.suptitle(head, color="#f8fafc", fontsize=20, fontweight="bold", y=0.968)
        if not reveal:
            _put_key(fig, y=0.008)
        return fig

    return app_figure, sim_poster, sonar_figure


@app.cell(hide_code=True)
def md_visuals(mo):
    mo.md(r"""
    ---
    ## 4. The two finished visuals

    **Visual 1** is the sonar: the simulated scope, plus a side slice along a
    shadowed bearing showing why those sectors are black.

    **Visual 2** is the app: a rectangular map centred on you, with the crowd
    heatmap and the per-sector counts. Its depth contours come from the same `BED`
    the sonar sees, so the ridge is quietly visible there too.
    """)
    return


@app.cell
def visual_1_sonar(sonar_figure):
    # VISUAL 1 -- the sonar
    sonar_figure()
    return


@app.cell
def visual_2_app(app_figure):
    # VISUAL 2 -- the fishing app
    app_figure()
    return


@app.cell
def sonar_explainer(
    GRID_N,
    G_BEARING,
    G_RANGE,
    SONAR_CMAP,
    TRANSDUCER_DEPTH,
    cast_viewshed,
    fish_visible,
    np,
    place_obj,
    plt,
    sim_scope_image,
    span_window,
    value_noise,
):
    # --- How the sonar sees: one object, one barrier -------------------------
    # A second, deliberately simple world, run through exactly the same pipeline as
    # the real one -- same viewshed, same renderer. Nothing here is drawn by hand,
    # so the scope on the right is what this seabed would actually produce.
    DEMO_RANGE = 60.0
    RIDGE_BEARINGS = (112.0, 188.0)
    SLICE_A, SLICE_B = 150.0, 45.0          # through the barrier / through the object
    ACCENT_A, ACCENT_B = "#38bdf8", "#a3e635"


    def build_demo_bed(seed=3):
        rng = np.random.default_rng(seed)
        bed = 26.0 + 1.6 * value_noise(GRID_N, 5, rng)
        amt = (span_window(G_BEARING, *RIDGE_BEARINGS, soft=9.0)
               * np.exp(-((G_RANGE - 27.0) / 4.6) ** 2))
        return np.clip(bed * (1 - amt) + 3.5 * amt, 2.0, None)


    DEMO_BED = build_demo_bed()
    DEMO_VS = cast_viewshed(rmax=DEMO_RANGE, bed=DEMO_BED)
    DEMO_FISH = [place_obj(SLICE_B, 31.0, 11.0, 9.0, 2.6, 40, "demo target")]
    DEMO_IMG = sim_scope_image(vs=DEMO_VS, fish=DEMO_FISH)
    RINGS = (15, 30, 45, 60)


    def draw_explainer_slice(ax, bearing, accent, vs=None, fish=None, ymax=31.0):
        vs = vs or DEMO_VS
        fish = DEMO_FISH if fish is None else fish
        i = int(round(bearing / 360.0 * len(vs["th_deg"]))) % len(vs["th_deg"])
        r, D, hor = vs["r"], vs["D"][i], vs["horizon"][i]
        los = np.where(np.isfinite(hor), hor * r + TRANSDUCER_DEPTH, 0.0)
        near = r >= 2.0
        lit = np.minimum(los, D)

        ax.fill_between(r, 0, D, color="#0b3446", zorder=1)
        ax.fill_between(r[near], 0, lit[near], color="#17627e", zorder=2)
        ax.fill_between(r[near], lit[near], D[near], where=(D - lit)[near] > 0.05,
                        color="#000000", alpha=0.86, hatch="///",
                        edgecolor="#3f4c5f", linewidth=0.0, zorder=3)
        ax.fill_between(r, D, ymax, color="#6b4423", zorder=4)
        ax.plot(r, D, color="#f0a81e", lw=2.2, zorder=5)
        ax.axhline(0, color="#7dd3fc", lw=2.0, zorder=6)

        # the scan itself: rays out from the transducer, stopping on the bottom
        # The scan, and then the thing that makes the display top-down: every ray
        # that comes back is known only by its TRAVEL TIME and the bearing of the
        # head. Its depression angle is lost, so each hit collapses straight down
        # onto the range axis -- the whole vertical fan folds into one line, which
        # is the strip directly beneath this panel.
        # Targets sitting in this slice, so a ray can terminate on one.
        slice_fish = [f for f in fish
                      if min(abs((np.rad2deg(np.arctan2(f["x"], f["y"])) % 360.0) - bearing),
                             360 - abs((np.rad2deg(np.arctan2(f["x"], f["y"])) % 360.0) - bearing))
                      <= 25.0 and fish_visible(f, vs)]

        # The fan has to span the WHOLE elevation beam, not just the angles steep
        # enough to reach bottom. Starting it at the grazing slope means every ray
        # drawn is already below anything suspended in the water column, so nothing
        # ever appears to strike a target.
        graz = float(np.min(((D - TRANSDUCER_DEPTH) / r)[near]))
        hits = []
        for m in np.linspace(0.05, max(graz * 2.1, 0.95), 14):
            ray = TRANSDUCER_DEPTH + m * r
            i_bed = int(np.argmax(ray >= D)) if np.any(ray >= D) else None
            i_fish = None
            for f in slice_fish:
                inside = (((r - f["range"]) / (f["length"] / 2)) ** 2
                          + ((ray - f["depth"]) / (f["width"] * 0.9)) ** 2) <= 1.0
                if np.any(inside):
                    k = int(np.argmax(inside))
                    i_fish = k if i_fish is None else min(i_fish, k)
            cand = [k for k in (i_bed, i_fish) if k is not None]
            stop = min(cand) if cand else len(r) - 1
            on_fish = i_fish is not None and stop == i_fish

            ax.plot(r[:stop], ray[:stop],
                    color="#fde68a" if on_fish else "#ffd970",
                    lw=1.8 if on_fish else 0.9,
                    alpha=1.0 if on_fish else 0.55,
                    zorder=8 if on_fish else 6)
            if on_fish:
                ax.plot([r[stop]], [ray[stop]], marker="o", ms=5.0,
                        color="#fde68a", markeredgecolor="#0f172a",
                        markeredgewidth=0.7, zorder=10)
            elif i_bed is not None and stop == i_bed:
                hits.append((float(r[stop]), float(D[stop])))

        for rh, dh in hits:
            ax.plot([rh, rh], [dh, ymax], color="#ffd970", lw=0.8, ls=(0, (2, 3)),
                    alpha=0.5, zorder=7)
            ax.plot([rh], [dh], marker="o", ms=4.2, color="#ffd970",
                    markeredgecolor="#0f172a", markeredgewidth=0.6, zorder=9)
            ax.plot([rh], [ymax], marker="v", ms=6.5, color="#ffd970", zorder=9,
                    clip_on=False)

        # where the barrier starts casting: the same radius the strip goes black
        dark = np.nonzero(((D - np.minimum(los, D)) > 0.05) & near)[0]
        if len(dark):
            r_dark = float(r[dark[0]])
            ax.plot([r_dark, r_dark], [0, ymax], color=accent, lw=1.6,
                    ls=(0, (4, 3)), alpha=0.9, zorder=8)
        ax.plot(r[near], np.clip(los[near], 0, ymax), color=accent, lw=2.0,
                ls=(0, (5, 3)), zorder=7)

        for f in fish:
            b = np.rad2deg(np.arctan2(f["x"], f["y"])) % 360.0
            if min(abs(b - bearing), 360 - abs(b - bearing)) > 25.0:
                continue
            seen = fish_visible(f, vs)
            ax.add_patch(plt.matplotlib.patches.Ellipse(
                (f["range"], f["depth"]), f["length"], f["width"] * 1.6,
                facecolor="#fde68a" if seen else "#ef4444", edgecolor="white",
                linewidth=1.6, zorder=9))
            # A target folds down the same way the bottom does -- but only if the
            # beam reached it. Something in the shadow drops nothing onto the
            # range axis, which is exactly why it never appears in the strip.
            if seen:
                ax.plot([f["range"], f["range"]], [f["depth"], ymax],
                        color="#fde68a", lw=1.2, ls=(0, (2, 3)), alpha=0.75, zorder=8)
                ax.plot([f["range"]], [ymax], marker="v", ms=8.0, color="#fde68a",
                        zorder=10, clip_on=False)

        ax.add_patch(plt.Polygon([(-4.0, -3.4), (4.4, -3.4), (3.4, 0.6),
                                 (-3.0, 0.6)], closed=True, facecolor="#e2e8f0",
                                edgecolor="#0f172a", linewidth=1.3, zorder=10))
        ax.add_patch(plt.Rectangle((-1.6, -6.0), 3.2, 2.6, facecolor="#cbd5e1",
                                  edgecolor="#0f172a", linewidth=1.1, zorder=10))
        ax.add_patch(plt.Rectangle((-5.6, -3.6), 1.6, 2.6, facecolor="#334155",
                                  edgecolor="#0f172a", linewidth=1.0, zorder=10))
        ax.add_patch(plt.Rectangle((0.0, 0.6), 1.6, 1.1, facecolor="#f0a81e",
                                  edgecolor="#0f172a", linewidth=1.1, zorder=11))
        for ring in RINGS:
            ax.plot([ring, ring], [0, ymax], color="#64748b", lw=0.7,
                    ls=(0, (3, 5)), zorder=8)

        ax.set_xlim(-7, DEMO_RANGE + 2); ax.set_ylim(ymax, -7.0)
        ax.set_xticks(list(RINGS)); ax.set_yticks([0, 15, 30])
        ax.tick_params(colors="#94a3b8", labelsize=8.5)
        ax.set_facecolor("#05070a")
        for sp in ax.spines.values():
            sp.set_color(accent); sp.set_linewidth(2.2)
        ax.text(0.985, 0.88, f"{bearing:.0f}\u00b0", transform=ax.transAxes,
                ha="right", va="center", fontsize=16, fontweight="bold",
                color=accent, zorder=11)
        return ax


    def draw_explainer_scope(ax, vs=None, img=None, marks=None):
        vs = vs or DEMO_VS
        img = DEMO_IMG if img is None else img
        marks = marks or [(SLICE_A, ACCENT_A), (SLICE_B, ACCENT_B)]
        th, r = np.deg2rad(vs["th_deg"]), vs["r"]

        ax.set_theta_zero_location("N"); ax.set_theta_direction(-1)
        ax.pcolormesh(th, r, img.T, cmap=SONAR_CMAP, shading="gouraud",
                      vmin=0.0, vmax=1.0, zorder=1)
        ring_th = np.linspace(0, 2 * np.pi, 240)
        for ring in RINGS:
            ax.plot(ring_th, np.full_like(ring_th, ring), color="#64748b",
                    lw=0.7, ls=(0, (3, 5)), zorder=4)
            ax.text(np.deg2rad(203), ring, f"{ring}", color="#94a3b8", fontsize=8,
                    ha="center", va="center", zorder=6, fontfamily="monospace",
                    bbox=dict(boxstyle="round,pad=0.12", facecolor="#05070a",
                              edgecolor="none", alpha=0.8))
        for bearing, accent in marks:
            t = np.deg2rad(bearing)
            # white halo first, so the spoke reads on both the lit bottom and the
            # black shadow it crosses
            ax.plot([t, t], [0, DEMO_RANGE], color="#f8fafc", lw=4.4, zorder=6,
                    solid_capstyle="butt")
            ax.plot([t, t], [0, DEMO_RANGE], color=accent, lw=3.0, zorder=7,
                    solid_capstyle="butt")
            for ring in RINGS:                       # ticks matching the strip axis
                ax.plot([t], [ring], marker="o", ms=4.5, color="#f8fafc", zorder=8)
            ax.text(t, DEMO_RANGE * 1.16, f"{bearing:.0f}\u00b0", ha="center",
                    va="center", fontsize=15, fontweight="bold", color=accent,
                    zorder=8)

        ax.scatter([0], [0], s=150, marker="o", color="#e2e8f0", zorder=9,
                   edgecolors="#0b0e13", linewidths=2)
        ax.set_xticks([]); ax.set_yticks([]); ax.set_ylim(0, DEMO_RANGE * 1.28)
        ax.spines["polar"].set_visible(False)
        ax.set_facecolor("#05070a")
        return ax


    def bearing_index(vs, bearing):
        return int(round(bearing / 360.0 * len(vs["th_deg"]))) % len(vs["th_deg"])


    def draw_bearing_trace(ax, bearing, accent, vs=None, img=None):
        """What one bearing actually returns: echo strength against range.

        This is the step that was missing. The unit does not receive "a fish" and
        "the bottom" as separate objects -- it receives ONE amplitude trace. A
        target shows up as a PEAK sitting on top of the bottom's baseline at the
        same range, not as something floating in a gap. Its width here, in feet of
        range, is one of the two extents the unit can measure; the other is its
        width across bearings, which comes from the sweep. Depth is measured
        nowhere.
        """
        vs = vs or DEMO_VS
        img = DEMO_IMG if img is None else img
        r = vs["r"]
        row = img[bearing_index(vs, bearing)]

        # the strip of scope pixels along this bearing, laid along the bottom edge
        ax.imshow(row[None, :], cmap=SONAR_CMAP, vmin=0.0, vmax=1.0, aspect="auto",
                  extent=(r[0], r[-1], 0.0, 0.26), interpolation="bilinear",
                  zorder=2)
        # and the same numbers as a trace above it
        amp = 0.34 + 0.60 * row
        ax.fill_between(r, 0.34, amp, color="#ffd970", alpha=0.22, zorder=3)
        ax.plot(r, amp, color="#ffd970", lw=1.5, zorder=4)
        ax.axhline(0.34, color="#475569", lw=0.8, zorder=3)

        for ring in RINGS:
            ax.axvline(ring, color="#64748b", lw=0.7, ls=(0, (3, 5)), zorder=5)
        ax.set_xlim(-7, DEMO_RANGE + 2); ax.set_ylim(0.0, 1.0)
        ax.set_facecolor("#05070a")
        ax.set_yticks([]); ax.set_xticks(list(RINGS))
        ax.tick_params(colors="#94a3b8", labelsize=8.5)
        for sp in ax.spines.values():
            sp.set_color(accent); sp.set_linewidth(2.2)
        return ax


    def sonar_explainer_figure(figsize=(14.0, 7.6)):
        fig = plt.figure(figsize=figsize, facecolor="#0b0e13")
        gs = fig.add_gridspec(4, 2, height_ratios=[1.0, 0.46, 1.0, 0.46],
                              width_ratios=[1.35, 1.0], hspace=0.16, wspace=0.14,
                              left=0.05, right=0.97, top=0.95, bottom=0.07)
        for row, (bearing, accent) in enumerate([(SLICE_A, ACCENT_A),
                                                 (SLICE_B, ACCENT_B)]):
            draw_explainer_slice(fig.add_subplot(gs[row * 2, 0]), bearing, accent)
            draw_bearing_trace(fig.add_subplot(gs[row * 2 + 1, 0]), bearing, accent)
        draw_explainer_scope(fig.add_subplot(gs[:, 1], projection="polar"))
        return fig

    return (
        ACCENT_A,
        ACCENT_B,
        DEMO_FISH,
        DEMO_VS,
        RINGS,
        SLICE_A,
        SLICE_B,
        sonar_explainer_figure,
    )


@app.cell
def explainer_output(sonar_explainer_figure):
    # How the sonar sees. Schematic seabed -- this one is for explaining the
    # mechanism, not for measuring anything.
    sonar_explainer_figure()
    return


@app.cell
def slant_option_b(
    ACCENT_A,
    ACCENT_B,
    DEMO_FISH,
    DEMO_VS,
    RINGS,
    SLICE_A,
    SLICE_B,
    SONAR_CMAP,
    TRANSDUCER_DEPTH,
    fish_visible,
    np,
    plt,
):
    # --- Design aid: what the scope looks like in SLANT range ----------------
    # Option B from the discussion. NOT part of the published visuals -- this is
    # here so the tradeoff can be looked at rather than argued about.
    #
    # The rest of the notebook works in horizontal ground range. A real unit
    # measures slant range: distance along the ray, sqrt(x^2 + z^2). Rebuilding the
    # image that way makes the water column appear (no echo can arrive sooner than
    # the depth under the boat) and puts every target at its true echo distance.
    SLANT_MAX, SLANT_N = 66.0, 420


    def _slant_blur(a, kth, ks):
        out = a
        if kth > 1:
            kth |= 1; k = np.ones(kth) / kth; p = kth // 2
            ext = np.concatenate([out[-p:], out, out[:p]], axis=0)
            out = np.stack([np.convolve(ext[:, j], k, "valid")
                            for j in range(out.shape[1])], 1)
        if ks > 1:
            ks |= 1; k = np.ones(ks) / ks; p = ks // 2
            ext = np.pad(out, ((0, 0), (p, p)), mode="edge")
            out = np.stack([np.convolve(ext[i], k, "valid")
                            for i in range(out.shape[0])], 0)
        return out


    def slant_scope_image(vs=None, fish=None):
        """Rebuild the scope with radius = slant range instead of ground range."""
        vs = vs or DEMO_VS
        fish = DEMO_FISH if fish is None else fish
        n_th = vs["D"].shape[0]
        R = vs["r"][None, :] * np.ones_like(vs["D"])
        s_grid = np.linspace(0.0, SLANT_MAX, SLANT_N)

        dDdr = np.gradient(vs["D"], vs["r"], axis=1)
        facing = 1.0 - np.exp(-np.clip(-dDdr, 0.0, None) / 0.22)
        bright = (0.34 + 0.30 * facing) * np.clip(1.10 - 0.004 * R, 0.72, 1.0)
        bright = np.where(vs["visible"], bright, 0.0)

        # every bottom cell moves to the range its echo actually comes back at
        S = np.hypot(R, vs["D"] - TRANSDUCER_DEPTH)
        out = np.zeros((n_th, SLANT_N))
        idx = np.clip(np.searchsorted(s_grid, S), 0, SLANT_N - 1)
        for i in range(n_th):
            np.add.at(out[i], idx[i], bright[i])

        th = np.deg2rad(vs["th_deg"])
        for f in fish:
            if not fish_visible(f, vs):
                continue
            b_f = np.deg2rad(np.rad2deg(np.arctan2(f["x"], f["y"])) % 360.0)
            s_f = float(np.hypot(f["range"], f["depth"] - TRANSDUCER_DEPTH))
            dth = np.arctan2(np.sin(th - b_f), np.cos(th - b_f))[:, None]
            out += 2.6 * np.exp(-(dth / ((f["length"] / 2) / f["range"])) ** 2
                                - ((s_grid[None, :] - s_f) / (f["width"] * 1.1)) ** 2)

        return np.clip(_slant_blur(out, 7, 5) * 0.55, 0.0, 1.0), s_grid, float(np.min(S))


    def slant_range_figure(figsize=(13.5, 7.0)):
        """Side view with constant-time ARCS, the slant trace, and the slant scope.

        The red tick is where a vertical drop would put the target -- the
        construction used in the main explainer. The yellow tick is where its echo
        actually lands. They differ by under 2 ft at this range.
        """
        vs = DEMO_VS
        img, s_grid, hole = slant_scope_image()
        n_th = vs["D"].shape[0]
        th = np.deg2rad(vs["th_deg"])
        i45 = int(round(SLICE_B / 360.0 * n_th)) % n_th
        r, Dr, ymax = vs["r"], vs["D"][i45], 31.0
        f = DEMO_FISH[0]
        s_f = float(np.hypot(f["range"], f["depth"] - TRANSDUCER_DEPTH))

        fig = plt.figure(figsize=figsize, facecolor="#0b0e13")
        gs = fig.add_gridspec(2, 2, height_ratios=[1.0, 0.5], width_ratios=[1.3, 1.0],
                              hspace=0.30, wspace=0.16, left=0.05, right=0.97,
                              top=0.86, bottom=0.09)

        ax = fig.add_subplot(gs[0, 0])
        ax.fill_between(r, 0, Dr, color="#17627e", zorder=1)
        ax.fill_between(r, Dr, ymax, color="#6b4423", zorder=3)
        ax.plot(r, Dr, color="#f0a81e", lw=2.2, zorder=4)
        # the surface line doubles as the range scale: at the transducer's own
        # depth, distance from the boat IS slant range, so every arc lands on it
        ax.axhline(TRANSDUCER_DEPTH, color="#7dd3fc", lw=2.0, zorder=7)

        # A full fan. Each ray stops where it first meets the bottom, and its echo
        # rides an arc of constant travel time back to the range scale. Steep rays
        # all land within a foot or two of each other just past the depth under the
        # boat -- that bunching IS the bright first return, and the empty stretch
        # inside it is the water column.
        # Each ray is coloured by the range its echo lands at, and the same colour
        # is repeated on its arc, its landing tick, and again under the trace
        # below -- so one arc can be followed all the way to its position in the
        # returned signal.
        _cmap = plt.get_cmap("cool")
        _lo, _hi = 24.0, SLANT_MAX
        landings = []
        for phi in np.linspace(80.0, 21.0, 16):
            ray = TRANSDUCER_DEPTH + np.tan(np.deg2rad(phi)) * r
            if not np.any(ray >= Dr):
                continue
            hit = int(np.argmax(ray >= Dr))
            if hit == 0:
                continue
            xh, zh = float(r[hit]), float(Dr[hit])
            s = float(np.hypot(xh, zh - TRANSDUCER_DEPTH))
            col = _cmap(float(np.clip((s - _lo) / (_hi - _lo), 0.0, 1.0)))
            ax.plot(r[:hit], ray[:hit], color=col, lw=1.0, alpha=0.85, zorder=6)
            ax.plot([xh], [zh], marker="o", ms=4.0, color=col,
                    markeredgecolor="#0f172a", markeredgewidth=0.5, zorder=8)
            aa = np.linspace(np.arctan2(zh - TRANSDUCER_DEPTH, xh), 0.0, 140)
            ax.plot(s * np.cos(aa), TRANSDUCER_DEPTH + s * np.sin(aa),
                    color=col, lw=1.0, ls=(0, (3, 4)), alpha=0.6, zorder=6)
            landings.append((s, col))
        for s, col in landings:
            ax.plot([s, s], [TRANSDUCER_DEPTH - 2.4, TRANSDUCER_DEPTH + 0.6],
                    color=col, lw=2.4, zorder=9)

        # the target: its ray, its arc, and where it lands
        ax.add_patch(plt.matplotlib.patches.Ellipse(
            (f["range"], f["depth"]), f["length"], f["width"] * 1.6,
            facecolor="#fde68a", edgecolor="white", lw=1.6, zorder=10))
        ax.plot([0, f["range"]], [TRANSDUCER_DEPTH, f["depth"]], color="#fde68a",
                lw=2.0, zorder=9)
        a_f = np.linspace(np.arctan2(f["depth"] - TRANSDUCER_DEPTH, f["range"]), 0.0, 140)
        ax.plot(s_f * np.cos(a_f), TRANSDUCER_DEPTH + s_f * np.sin(a_f),
                color="#fde68a", lw=2.2, ls=(0, (4, 3)), zorder=10)
        ax.plot([s_f, s_f], [TRANSDUCER_DEPTH - 2.6, TRANSDUCER_DEPTH + 0.5],
                color="#fde68a", lw=2.6, zorder=11)
        # where a vertical drop would have put it instead
        ax.plot([f["range"], f["range"]], [f["depth"], TRANSDUCER_DEPTH],
                color="#ef4444", lw=1.4, ls=(0, (2, 3)), alpha=0.9, zorder=10)
        ax.plot([f["range"], f["range"]], [TRANSDUCER_DEPTH - 2.6, TRANSDUCER_DEPTH + 0.5],
                color="#ef4444", lw=2.2, zorder=11)

        ax.set_xlim(-4, SLANT_MAX); ax.set_ylim(ymax, -6.0)
        ax.set_xticks(list(RINGS))
        ax.xaxis.set_ticks_position("top"); ax.xaxis.set_label_position("top")
        ax.set_yticks([0, 15, 30])
        ax.tick_params(colors="#94a3b8", labelsize=8.5); ax.set_facecolor("#05070a")
        for sp in ax.spines.values():
            sp.set_color(ACCENT_B); sp.set_linewidth(2.2)

        ax2 = fig.add_subplot(gs[1, 0])
        row = img[i45]
        ax2.imshow(row[None, :], cmap=SONAR_CMAP, vmin=0, vmax=1, aspect="auto",
                   extent=(0, SLANT_MAX, 0.0, 0.26), interpolation="bilinear", zorder=2)
        amp = 0.34 + 0.60 * row
        ax2.fill_between(s_grid, 0.34, amp, color="#ffd970", alpha=0.22, zorder=3)
        ax2.plot(s_grid, amp, color="#ffd970", lw=1.5, zorder=4)
        # the same landings, in the same colours, under the signal they produced
        for s, col in landings:
            ax2.plot([s, s], [0.27, 0.33], color=col, lw=2.4, zorder=7)
        ax2.plot([s_f, s_f], [0.27, 0.33], color="#fde68a", lw=3.0, zorder=8)
        ax2.plot([f["range"], f["range"]], [0.27, 0.33], color="#ef4444", lw=2.4,
                 zorder=8)
        for rad in RINGS:
            ax2.axvline(rad, color="#64748b", lw=0.7, ls=(0, (3, 5)), zorder=5)
        ax2.axvline(hole, color="#38bdf8", lw=1.8, zorder=6)
        ax2.set_xlim(-4, SLANT_MAX); ax2.set_ylim(0, 1); ax2.set_yticks([])
        ax2.set_xticks([0, 15, 30, 45, 60])
        ax2.tick_params(colors="#94a3b8", labelsize=8.5); ax2.set_facecolor("#05070a")
        for sp in ax2.spines.values():
            sp.set_color(ACCENT_B); sp.set_linewidth(2.2)

        ax3 = fig.add_subplot(gs[:, 1], projection="polar")
        ax3.set_theta_zero_location("N"); ax3.set_theta_direction(-1)
        ax3.pcolormesh(th, s_grid, img.T, cmap=SONAR_CMAP, shading="gouraud",
                       vmin=0, vmax=1, zorder=1)
        ring_th = np.linspace(0, 2 * np.pi, 240)
        for rad in RINGS:
            ax3.plot(ring_th, np.full_like(ring_th, rad), color="#64748b", lw=0.7,
                     ls=(0, (3, 5)), zorder=4)
        ax3.plot(ring_th, np.full_like(ring_th, hole), color="#38bdf8", lw=2.0, zorder=5)
        for bearing, accent in [(SLICE_A, ACCENT_A), (SLICE_B, ACCENT_B)]:
            t = np.deg2rad(bearing)
            ax3.plot([t, t], [0, SLANT_MAX], color="#f8fafc", lw=4.4, zorder=6)
            ax3.plot([t, t], [0, SLANT_MAX], color=accent, lw=3.0, zorder=7)
        ax3.scatter([0], [0], s=140, color="#e2e8f0", zorder=9,
                    edgecolors="#0b0e13", linewidths=2)
        ax3.set_xticks([]); ax3.set_yticks([]); ax3.set_ylim(0, SLANT_MAX)
        ax3.spines["polar"].set_visible(False); ax3.set_facecolor("#05070a")
        fig.suptitle(f"slant range -- water column hole = {hole:.1f} ft",
                     color="#f8fafc", fontsize=13, fontweight="bold", y=0.985)
        return fig

    return (slant_range_figure,)


@app.cell
def slant_option_b_output(slant_range_figure):
    slant_range_figure()
    return


@app.cell(hide_code=True)
def md_poster(mo):
    mo.md(r"""
    ### Posted composition

    Rough previews of how the pair would run. The real images get built in the
    site's React DSL against the 1080x1350 canvas -- these only check that the two
    panels hold together.
    """)
    return


@app.cell
def poster_problem(sim_poster):
    sim_poster()
    return


@app.cell
def poster_solution(sim_poster):
    sim_poster(reveal=True)
    return


@app.cell(hide_code=True)
def solution(PROBLEM, SECTORS, answers, mo):
    # Built from PROBLEM so the write-up can never drift from the numbers.
    _n, _c, _rd = PROBLEM["counts"], PROBLEM["lrs"], PROBLEM["readings"]
    _res = answers(PROBLEM)
    _rows = "\n".join(
        f"| **{s}** | {_n[i]} | {_rd[i]} | {_c[i]:.2f} | {_n[i]} x {_c[i]:.2f} = "
        f"**{_res['weights'][i]:.1f}** | {_res['post'][i]:.0%} |"
        for i, s in enumerate(SECTORS)
    )
    _best = _res["bayes"]
    _bi = SECTORS.index(_best)

    _head = r"""
    ---
    ## Solution

    ### What you are given

    Two numbers per sector, and neither needs interpreting.

    - $n_i$ — **sightings**. The app counted them. Nothing to justify.
    - $c_i$ — **consistency**, measured by the sonar: the chance that sector would
      look the way it does *if the monster were in it*. That is exactly
      $P(e_i \mid H_i)$, where $H_i$ is "the monster is in sector $i$".

    Where the beam reaches, the unit gets $c_i$ by comparing the contact's apparent
    length against the monster's known $8.4$ ft. Where the ridge blocks the beam,
    **no return is precisely what you would see if the monster were hiding there**,
    so $c_i$ is just the fraction of that sector the beam could not reach.

    ### 1. The prior is the sightings

    $$P(H_i) \;\propto\; n_i$$

    ### 2. The likelihood is the consistency

    $$P(e_i \mid H_i) \;=\; c_i$$

    The readings in the other five sectors come from ordinary fish, sunken logs and
    bottom geometry — none of which care where the monster is. So they contribute
    the same constant factor to every hypothesis and cancel:

    $$P(E \mid H_i) \;=\; \underbrace{c_i}_{\text{depends on } i} \times \underbrace{\prod_{j \neq i} P(e_j)}_{\text{same for every } i}$$

    ### 3. Bayes

    $$P(H_i \mid E) \;=\; \frac{n_i \, c_i}{\sum_j n_j \, c_j}$$

    ### 4. You never have to divide

    The question is *which sector*, not *what probability*. The denominator is the
    same for all six, so the largest posterior is just the largest product
    $n_i c_i$. Multiply six pairs and compare — no normalising, and no need for the
    total to be a round number.

    | sector | sightings | reading | consistency | product | posterior |
    |---|---|---|---|---|---|
    """

    _tail = r"""

    ### 5. Why each instrument misleads alone

    **The app says NW.** It has the most sightings by a wide margin. But the sonar
    reached NW and found a $3.2$ ft contact, and an $8.4$ ft animal reads that short
    only rarely — consistency $0.30$. The count gets multiplied down.

    **The sonar says SW.** Its contact measures $8.4$ ft, exactly the monster's
    length: consistency $1.00$, a *perfect* match. It is a $9$ ft waterlogged
    deadhead with two fish beside it, smeared into one contact by the beam. Nothing
    on the screen could tell you that — and the sighting count there is low.

    **SE wins on neither.** A middling count and no data at all. Its $0.82$ is high
    precisely because the sector cannot be seen: if the monster were there, the
    blank screen is exactly what you would get.

    ### 6. The point

    *Absence of evidence is not evidence of absence*, as arithmetic. A sector the
    sonar could not see keeps $0.82$ of its weight. A sector it saw clearly, and
    which came back too short, is cut to $0.15$. Being unable to look is worth more
    than looking and finding the wrong thing.

    And the answer is a bet, not a prediction — the winner takes about
    """

    mo.md(_head + _rows + _tail
          + f"{_res['post'][_bi]:.0%} of the probability, so it is wrong more often "
            f"than it is right. It is simply the best cast available.")
    return


if __name__ == "__main__":
    app.run()
