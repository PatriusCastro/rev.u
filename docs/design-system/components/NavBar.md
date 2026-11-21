# NavBar

The main navigation: Today, Subjects, Notebook, Library. It takes three forms depending on width.

## Forms

- **Phone, under 600px**: a floating bar 12px from the bottom and sides, `radius-xl` corners, `shadow-float`. Four equal items, icon above an 11px label, each 48px tall.
- **Tablet, 600px and up**: a rail on the left, 84px wide. Same items stacked, icon above label, each 60px tall.
- **Laptop, 960px and up**: a sidebar 208px wide. The product name sits at the top. Items are 44px tall with the icon beside a 14px label.

## States

- **Active**: `green` icon and label, semi-bold, on a `green-soft` background.
- **Inactive**: `ink-2` icon and label, no background.
- The background and colour change over 200ms.

## Rules

- Every item keeps its text label in every form. Never show icons alone.
- Four items only. A fifth destination belongs inside one of these four.
- On a phone, hide the bar while a problem is open so the problem and scratch pad have the full height. On tablet and laptop it stays.

## You provide

The current destination and what happens when each item is chosen.
