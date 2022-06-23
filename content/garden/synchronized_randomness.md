---
title: "Creating synchronized randomness"
date: 2022-06-22
lastmod: 2022-06-22
draft: false
garden_tags: ["math", "web"]
summary: "Using web technologies and math to synchronize random numbers without the need for a server."
status: "seeding"
---

In my recent project, [Identity](https://github.com/We-Gold/identity), I created an entirely unnecessary problem.

---

Identity is an app that allows you to configure a custom clock screen with unique animations (but with bigger long-term goals for more personalized graphics).

<details class="mb-3">
<summary><strong>Click here to see a preview of Identity</strong></summary>
<iframe src="https://wegold.me/identity/" width="100%" style="aspect-ratio: 4/3;"></iframe>
</details>

During the brainstorming phase, I decided that it would be absolutely crucial for the central clock animation to be synchronized across all devices.

That led me down a long rabbit-hole of math, time, and incomplete solutions. In the end, the solution I came up with is sufficient for small projects, but not professional level applications. Still, the ideas are interesting, so I'll present the algorithm here.

## The Components

There are only three parts of this algorithm, and here I will attempt to explain them as simply as possible.

#### A Seeded Number Generator

When generating random numbers on a computer, we use pseudo-random number generators to generate random numbers. The cool thing about these generators is that they can be "seeded".

A random number generator that has been seeded (typically with a numeric value) will always produce the same sequence of random numbers.

Such a generator would allow us to create "the same" random number generator on all devices.

Unfortunately, because the app will likely never be opened at exactly the same time on multiple devices, these number generators are immediately out of sync with each other.

#### Simplex Noise (sometimes called Perlin Noise)

Simplex noise is much _simpler_ (pun intended) than the name would suggest.

It is an algorithm that allows us to generate a smooth topographical map of random numbers with an arbitrary number of dimensions.

Here is an example of what a 2D Simplex Noise map would look like (each pixel is a number between -1 and 1).

{{< figure src="../images/simplex noise.png" width="100%" >}}

So how exactly does this help us?

#### The Time Component

Time is what brings together this entire algorithm. _Unfortunately that does mean that the synchronicity of this solution depends on using a consistent timestamp, so be aware of that while implementing the algorithm._

Let's say that you want to generate a random map like the one above, but you want it to change with time while being synchronized across devices.

For this, we will need a 3-dimensional simplex noise map, with two dimensions for x and y, and one for time.

This way, on every render loop, we can get a noise map that is unique to the current timestamp.

In my project, I used the `Date.now()` function to get the current timestamp (in ms), but you may want to consider a more developed time library for your own application.

## Basic JavaScript Code

The implementation I wrote is very short and simple, and it uses two small JS libraries: [fast-simplex-noise](https://www.npmjs.com/package/fast-simplex-noise) and [rand-seed](https://www.npmjs.com/package/rand-seed).

```javascript
import { makeNoise3D } from "fast-simplex-noise"
import Rand from "rand-seed"

// Make a 3D simplex noise generator to sync noise by timestamp between devices
const randomNumberGenerator = new Rand("identity")
const getRandom = () => randomNumberGenerator.next()
const noiseGenerator = makeNoise3D(getRandom)

// Create a wrapper for the global noise generator
export const getNoise = (x: number, y: number, time: number) =>
	noiseGenerator(x, y, time)
```

From here, another module can import the `getNoise` method to get a particular pixel of noise.

## Conclusion

Hopefully this will be useful or inspiring for your own future project!
