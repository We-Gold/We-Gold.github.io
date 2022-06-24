---
title: "Java FRC Robot"
date: 2022-06-24
draft: false
project_tags: ["robotics", "java"]
status: "seeding"
weight: 1
summary: "The improved code that now runs our FRC robot following the world championship, and the lessons learned along the way."
links:
    github_link:
        text: "See the code"
        icon: "fab alt brands fa-github"
        href: "https://github.com/FRC2539/javabot"
        weight: 1
    website_link:
        text: "Visit our team's website"
        icon: "fas fa-external-link-alt"
        href: "https://www.team2539.com/"
        weight: 2
    tiktok_link:
        text: "Watch season highlights"
        icon: "fab fa-brands fa-tiktok"
        href: "https://www.tiktok.com/@kryptoncougars2539"
        weight: 3
---

What is FRC, and what are FRC robots?

---

FRC, or FIRST Robotics Competition, is a program hosted and managed by FIRST (a robotics non-profit) in which thousands of teams from around the world compete to rapidly design, build, program, and drive robots in a unique game for each season.

## Game Explanation

This year's game, Rapid React, involves shooting oversized tennis balls (nicknamed cargo) into a large central hub for points.

<details class="mb-3 lazy-details">
<summary><strong>Click here to watch an animated explanation of the game, or scroll down for a written explanation.</strong></summary>
<iframe style="aspect-ratio: 560/315;" width="100%" src="about:blank" data-src="https://www.youtube-nocookie.com/embed/LgniEjI9cCM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</details>

During one match (2 minute and 30 seconds), robots begin by attempting to collect and score cargo autonomously (this segment lasts for the first 15 seconds of the match).

Then, for the next 1 minute and 45 seconds, robots collect and shoot as much cargo as possible to rack up points.

Finally, the last 30 seconds are devoted to endgame, where robots climb up monkey bars of increasing height, and receive additional points for the final bar they end up on.

{{< figure src="./PXL_20220409_220236411.jpg" width="100%" title="Team 2539 (my current team) and team 341 (my old team) climbing together at district championships.">}}

---

## Robots Explained

We have approximately six weeks, starting in January, to fully construct and code our robots.

Following that period we attend competitions, and with a high overall performance, it is possible to qualify to go to the world championship (~450 teams attend the competition).

{{< figure src="./20220423_171616.jpg" width="100%" title="Moments before the final matches of the world championship.">}}

---

### Using Python

We began the season using Python, as we always have, because it is easy to learn and prototype with.

Unfortunately, it is not an officially supported language, **so library releases are delayed (if available at all), and bugs are possible**.

This is no fault of the amazing team that works on Python support for FIRST; it is simply not an officially supported language.

As lead programmer on the team, I am in charge of the robot code, and I was well aware of the struggles we faced with programming the robot.

#### Challenges

The most significant challenges we faced were the **lack of (FIRST-specific) libraries** available for Python and the **slower processing speed** (when compared to compiled alternatives).

We immediately noticed the discrepancy when we attended district competitions, and we saw other teams running complex autonomous paths, impressively fast aiming algorithms, and responsive drivetrain controls.

Given the time and effort that the whole team had put into the robot, there were times that I felt that I had let the team down with the performance of our robot.

_Before continuing, I must mention that we performed very well this season, and a combination of luck and incredible team effort were able to get us to this point._

In order to remain competitive in FRC, constant improvement is necessary.

Making modifications is imperative, and therefore the programming team worked at writing advanced and improved algorithms throughout the season.

Unfortunately, the performance of the code was, at the time, inexplicable.

**Fast-forward to worlds**, and the gap became more and more apparent. The majority of robots there were impressively performant and could complete complex tasks autonomously.

### Java?

After worlds ended (and with us unexpectedly ending as finalists), our team returned to our hotel and reflected upon the competition and the season.

I was unsatisfied with the state of our code, and I voiced my opinions to my fellow programmers:

> "We are going to try writing the robot code in Java."

When we returned to meetings, I dedicated myself to the Java rewrite, and I was able to create a prototype codebase over a weekend to test.

#### Surprising Results

I arrived at the buildsite (which was now a mentor's garage, as we had just lost our previous buildsite) ready and excited to test the new swerve drive code on the robot. _Swerve drive is a type of drivetrain that uses four independently rotating wheels to enable simultaneous translation and rotation._

Given that code rarely runs correctly the first time, it was not a surprise that I had to spend the next meetings debugging, rewriting, and modifying code before I got the robot running.

**But then, something amazing happened.**

The robot drove. Not only did it drive, but it drove responsively.

In a moment of enthusiasm, I wrote a simple PID control algorithm to aim the robot at the central hub using the onboard camera.

This was nothing new, we had an algorithm for this task in our python code, but it always took a few seconds to aim at the target.

I deployed the code, "asked" another programmer to hold up a cardboard target model in front of the robot, and enabled the camera-based aiming system for the first time.

**My jaw basically dropped.**

It locked on almost instantaneously and held the lock despite movement in the target.

Given how well these two systems now worked, I was inspired to speed-write the robot code over the next week of meetings.

#### The Current State

With more development, our robot can now follow complex paths on the field and can responsively react to controls and to the environment.

Additionally, the decision to change to Java unexpectedly eased the introduction into robot code for many new programmers, as our high school has a course on Java that many of them have taken.

## Conclusion

Overall, this was not a revolutionary discovery or an incredible project, but I can now proudly say that I, and the other programmers on the team, are buidling a solid codebase that can be drawn up in years to come.

To summarize what I have learned from this whirlwind of a season:

> Even if you are satisfied with the status quo, failing to improve without trying doesn't do justice to the hard work and commitment it took to get this far. Continuous improvement!
