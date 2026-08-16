# /// script
# dependencies = [
#     "marimo",
#     "matplotlib==3.11.1",
#     "numpy==2.5.2",
# ]
# requires-python = ">=3.13"
# ///

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import numpy as np
    import matplotlib.pyplot as plt
    import marimo as mo

    return mo, np, plt


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Basic Assumptions

    - The grid is a square, `[0, s]` on both X and Y.
    - The target shape is always a "W": three peaks at height `s` and two
      valleys at `0`, evenly spaced across four equal-width segments.
    - `s` is the only free dimension. Drag the slider below and watch how the
      four hidden units' weights and biases move.
    """)
    return


@app.cell
def _(mo):
    s_slider = mo.ui.slider(
        start=0.4, stop=3.0, step=0.01, value=1.0, label="Grid width (s)"
    )
    s_slider
    return (s_slider,)


@app.cell
def _(s_slider):
    s = s_slider.value
    start, end = 0, s
    return end, s, start


@app.cell
def _(np):
    # Define the ReLU function

    def relu(x):
        return np.maximum(0, x)

    print(f"ReLU of -1: {relu(-1)}, ReLU of 1: {relu(1)}")
    return (relu,)


@app.cell
def _(relu):
    def linear(x, w, b):
        return w * x + b

    def perceptron(x, w, b):
        return relu(linear(x, w, b))

    return (perceptron,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Placing the joints

    A W drawn across `[0, s]` in four equal segments bends at the quarter,
    half, and three-quarter marks.
    """)
    return


@app.cell
def _(s):
    bp1, bp2, bp3 = s / 4, s / 2, 3 * s / 4
    return bp1, bp2, bp3


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## From joints to weights

    Each hidden unit is a ReLU `relu(w*x + b)`, which switches on at
    `x = -b/w`. Pinning that switch-on point at a breakpoint fixes `b` in
    terms of `w`: `b = -w * breakpoint`.

    The slope each unit needs to contribute is fixed by the shape alone
    (height `s` over a run of `s/4`, i.e. a ratio of 4) — so `w` never has to
    change with `s`, only `b` does.
    """)
    return


@app.cell
def _(bp1, bp2, bp3):
    w1, w2, w3, w4 = -4, 4, 8, 8
    b1 = -w1 * bp1
    b2 = -w2 * bp1
    b3 = -w3 * bp2
    b4 = -w4 * bp3
    return b1, b2, b3, b4, w1, w2, w3, w4


@app.cell(hide_code=True)
def _(b1, b2, b3, b4, mo, s, w1, w2, w3, w4):
    mo.md(f"""
    ### Solution weights at `s = {s:.4f}`

    | unit | w | b |
    |---|---|---|
    | 1 | {w1} | {b1:.6f} |
    | 2 | {w2} | {b2:.6f} |
    | 3 | {w3} | {b3:.6f} |
    | 4 | {w4} | {b4:.6f} |
    """)
    return


@app.cell
def _(b1, b2, b3, b4, perceptron, w1, w2, w3, w4):
    def network(x):
        h1 = perceptron(x, w1, b1)
        h2 = perceptron(x, w2, b2)
        h3 = perceptron(x, w3, b3)
        h4 = perceptron(x, w4, b4)

        return h1 + h2 + -1 * h3 + h4

    return (network,)


@app.cell
def _(end, network, np, plt, start):
    X = np.linspace(start, end, num=1000)
    y = network(X)

    plt.xlim(start, end)
    plt.ylim(start, end)
    plt.plot(X, y)
    return


@app.cell
def _(end, np, plt, relu, start):
    def plot_perceptron(w, b):
        X = np.linspace(start, end, num=1000)
        y = relu(w * X + b)

        plt.xlim(start - 0.1, end + 0.1)
        plt.ylim(start - 0.1, end + 0.1)
        plt.plot(X, y)
        plt.show()

    return (plot_perceptron,)


@app.cell
def _(b1, plot_perceptron, w1):
    plot_perceptron(w1, b1)
    return


@app.cell
def _(b2, plot_perceptron, w2):
    plot_perceptron(w2, b2)
    return


@app.cell
def _(b3, plot_perceptron, w3):
    plot_perceptron(w3, b3)  # Note that this is actually multiplied by -1 in the network
    return


@app.cell
def _(b4, plot_perceptron, w4):
    plot_perceptron(w4, b4)
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
