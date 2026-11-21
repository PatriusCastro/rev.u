# Button

The action control. Buttons are pill-shaped, 48px tall and labelled with what happens when pressed.

## Variants

- **Primary**: `green` fill, white label. The one main action on a screen. Use at most one per screen, full width on a phone.
- **Inverse**: `surface` fill, `green` label. Only on the repeats card, where the ground is already green.
- **Text**: no fill, `green` label, 44px tall. Secondary actions such as "Show a hint" and "Try again".
- **Disabled**: `line` fill, `ink-2` label. Use when an action is finished, for example "All steps shown".

## Rules

- The label is a verb phrase in sentence case: "Start repeats", "Show next step".
- An icon may sit before or after the label, with an 8px gap. An arrow after the label means the button opens another screen.
- While pressed, the button shrinks to 97% for 120ms.
- Focus shows a 2px `green` ring with a 2px offset.

## You provide

The label, the action, and whether the button is full width.
