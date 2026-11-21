# Rev.U Design System

Rev.U is a review app for the Civil Engineering licensure exam. It teaches each topic through lessons and step-by-step solutions, then brings back the problems a reviewer got wrong until they are cleared.

This system records the Daily Desk design: an app that opens on today's work and always shows one clear next action. It was taken from the working prototype, so the values here are the ones the prototype uses.

Files in this folder:

- `README.md`: this guide.
- `tokens.json`: every colour, type style, spacing step, radius, shadow, size and breakpoint, each with a usage note.
- `components/`: one guide per component.
- `prototype.html`: the working prototype. Open it in a browser to see the screens, the three layouts, the animations and the scratch pad.

Status: first version. There is a light theme only. The contrast figures were calculated by hand, not with a tool. No logo or icon files exist yet.

## Principles

1. **One main action per screen.** Only one filled green control appears on a screen. Everything else is a plain row or a text button.
2. **Say what the work is before asking for it.** The repeats card states how many problems, how long they take and how old they are.
3. **Understanding before speed.** Solutions open one step at a time. A hint comes before a solution.
4. **Never rely on colour alone.** Due, missed and correct states always carry an icon or a word.
5. **Calm surfaces.** White cards on a pale background, soft shadows, and colour kept for meaning.

## Writing

- Use plain words a reviewer would use: "repeats", "missed", "cleared", "practise", "hint".
- Use sentence case everywhere. No all-capital labels.
- A button says what happens: "Start repeats", "Show next step", "Redo 3 due problems".
- Feedback is short and tells the reviewer what happens next: "Correct. It comes back in 7 days." and "Not yet. It comes back tomorrow."
- Do not scold. A wrong answer is "Not yet", never "Wrong".
- Write numbers as digits and keep the unit beside them: "8 minutes", "40 m", "48%".
- Empty screens say what will appear and how to start, for example "No mistakes yet. Problems you miss will collect here."

## Colour

| Role | Token | Rule |
|---|---|---|
| Background | `bg` | Behind every screen. The top 200px carries a wash from `green-soft` to `bg`. |
| Surface | `surface` | Cards, list groups, navigation, options, the scratch pad. |
| Text | `ink`, `ink-2` | `ink` for main text, `ink-2` for supporting text. `ink-3` is for decorative icons only. |
| Action and progress | `green` | The one main action, progress fills, active navigation, correct answers. |
| Tint | `green-soft` | Behind green icons and the active tab. |
| Attention | `amber`, `amber-soft`, `amber-ink` | What is due now: the streak pill, the missed pill, hints, the current schedule marker. Text on amber uses `amber-ink` on `amber-soft`. |
| Error | `red`, `red-soft` | Wrong answers, missed problems, weak topics. Always with an icon or word. |

The repeats card is the only gradient: `green` to `green-deep` at 135 degrees.

Text pairs used in the product and their contrast, calculated by hand:

| Text | On | Ratio |
|---|---|---|
| `ink` | `bg` | about 16 to 1 |
| `ink-2` | `bg` | about 5.4 to 1 |
| white | `green` | about 6.2 to 1 |
| `green` | `green-soft` | about 5.4 to 1 |
| `amber-ink` | `amber-soft` | about 6.3 to 1 |
| `red` | `red-soft` | about 5.8 to 1 |

## Type

One family, Figtree, loaded from Google Fonts. Bold is kept for screen titles and headline numbers. Item names are semi-bold. Everything else is regular.

- `screen-title` 28px: once per screen.
- `problem-text` 16px: problem statements and lesson paragraphs, because they are read closely.
- `body` 15px: default.
- `secondary` 13px in `ink-2`: the supporting line under an item.
- `tab-label` 11px: navigation labels only. Nothing else goes below 12px.

Use tabular figures wherever numbers line up or change, such as percentages and counters.

Mathematics in lessons and solutions is rendered with KaTeX, not with this type scale.

## Spacing and shape

Spacing uses a 4px scale. The three values used most:

- `space-5` (20px): screen margin on a phone and the gap between groups.
- `space-3` (12px): the gap between items inside a group.
- `space-2` (8px): the gap between answer options.

Radius grows with the size of the object: `radius-sm` for icon tiles, `radius-md` for controls, `radius-lg` for cards, `radius-xl` for the repeats card and the scratch pad, `radius-pill` for buttons and pills.

Group related rows into one card with `line` dividers. Do not give each row its own card.

Anything that can be tapped is at least `tap-min` (44px). Buttons and answer options are `control-height` (48px).

## Elevation

Three shadows, in order of height: `shadow-card` for resting cards, `shadow-float` for floating navigation and the scratch pad button, `shadow-sheet` for the scratch pad sheet on a phone. Nothing else casts a shadow.

## Layout

The app re-lays itself at two widths.

| Width | Navigation | Content |
|---|---|---|
| Under `bp-tablet` (600px) | Floating bar at the bottom, four items with labels | One column, 20px margins. Scratch pad is a sheet over the lower 64% of the screen. |
| `bp-tablet` to `bp-laptop` | Rail on the left, 84px wide, icon above label | Two columns on Today and Subjects, 28px margins. Scratch pad sits beside the problem. |
| `bp-laptop` (960px) and up | Sidebar, 208px wide, icon beside label, product name at the top | Same columns, 36px margins, larger scratch pad. |

Order on Today: the repeats card, then the remaining stops of the route, then statistics. On wider screens statistics move to a second column.

Lists and forms stop growing at 640px wide so lines stay readable on a laptop.

The scratch pad can be opened full screen at any width from a button in its toolbar. It then covers the whole app, navigation included, with square corners and no shadow. The problem text stays in a strip under the toolbar, in `secondary` on `bg`, with the problem's figure beside it at 136px wide on a `surface` tile. The same button or the Escape key returns to the normal view, and the working is kept.

## Icons

Line icons at 20px with a 1.75px stroke, round caps and joins. Every icon sits beside a text label and never replaces it.

No icon files are stored in this system yet. The prototype uses placeholder drawings. Take the product's icons from one open-source set, such as Lucide, so they share one weight and corner style.

Topic icons: a right triangle for trigonometry, a sigma for algebra, axes with a curve for analytic geometry, an integral sign for calculus.

## Motion

Motion either answers an action or shows a number changing. All of it is switched off when a person asks their device to reduce motion.

Easing for everything: `cubic-bezier(.2, .8, .2, 1)`.

| Where | What moves | Duration |
|---|---|---|
| Changing screens | New screen fades in and rises 8px | 280ms |
| Rings, bars, week chart | Fill from zero to their value, once | 500 to 900ms |
| Buttons and options | Shrink to 97% while pressed | 120ms |
| Correct answer | Letter badge pops to 125% and turns green | 350ms |
| Wrong answer | The option shakes 5px left and right, once | 320ms |
| Repeat schedule | The marker moves to the new stop and pops | 300 to 400ms |
| Hint, feedback, solution steps | Fade in and rise | 250 to 300ms |
| Scratch pad on a phone | Sheet slides up from the bottom | 320ms |

Nothing loops, and nothing moves without a reason.

## Components

- [Button](components/Button.md): primary, inverse, text.
- [RepeatsCard](components/RepeatsCard.md): the main card on Today.
- [AnswerOption](components/AnswerOption.md): a multiple-choice answer with correct and wrong states.
- [ScheduleTracker](components/ScheduleTracker.md): where a missed problem is in its 1, 3, 7 day schedule.
- [NavBar](components/NavBar.md): the navigation in its three forms.

Patterns in the prototype not yet written up as components: list row, progress ring, segmented control, pill, scratch pad.

## Accessibility

- Text contrast is at least 4.5 to 1 for the pairs listed above.
- Every control has a visible focus ring: 2px `green`, 2px offset.
- Tap targets are at least 44px.
- State is never shown by colour alone.
- The scratch pad works with touch, stylus and mouse. It is an aid, not a required step, so a reviewer who cannot draw can still answer.
