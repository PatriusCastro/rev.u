# Content

Lessons and problems are plain text files. `npm run import` checks every file and loads them into the database; adding a topic needs no code change.

> Every solution here is a draft until a licensed civil engineer has checked it.

## Folders

- `subjects.json`: the exam, its subjects, their weights and mock exam size.
- `lessons/<area>/<topic>.md`: one lesson per sub-topic. The file path (without `.md`) is the topic id, for example `trigonometry/angles-of-elevation`.
- `problems/<area>/<name>.txt`: one problem per file.
- `figures/`: SVG figures a problem can name with `figure:`. Use `currentColor` for strokes and text.

## Lesson file

```text
subject: math
area: Trigonometry
name: Angles of elevation and depression
minutes: 8
order: 1

## A heading
A paragraph with $inline$ math, **bold**, and

$$display math$$

- a list item
```

## Problem file

The header ends at the first blank line. Choices start on the first line beginning `A.`. A line of three dashes separates the solution steps.

```text
topic: trigonometry/angles-of-elevation
answer: C
hint: Start with the right triangle at B.
figure: tower.svg

From point A, the angle of elevation of the top of a tower is 30°. ...

A. 20.00 m    B. 28.28 m    C. 34.64 m    D. 40.00 m

## Solution
Let $x$ be the distance from B to the tower.
---
$h = 20\sqrt{3} \approx 34.64$ m.
```

The import refuses a file with no correct choice, no hint, no solution steps or an unknown topic.
