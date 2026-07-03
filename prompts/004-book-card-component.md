# KATHA — Book Card Component

You are implementing the next reusable UI component for KATHA.

This project uses:

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- TypeScript
- Design tokens already defined in app/globals.css
- Existing reusable Button component
- Existing Navbar component

Follow the existing code style exactly.

---

## Goal

Create a reusable Book Card component.

Location:

components/ui/BookCard.tsx

The component should be completely reusable.

Nothing should be hardcoded inside the component except sensible defaults.

The card must accept props.

---

## Props

```ts
interface BookCardProps {
  title: string;
  author: string;
  cover?: string;
  category?: string;
  featured?: boolean;
  chapters?: number;
  href: string;
}
```

---

## Design Direction

Think:

- Kindle
- Apple Books
- Kinokuniya
- Premium bookstore
- Minimal
- Warm
- Editorial

NOT:

- Gaming
- Neon
- Material UI
- SaaS dashboard

---

## Layout

Top

Book Cover

If no image exists:

Generate a beautiful CSS-only placeholder cover using KATHA colors.

Below the cover:

Book title

Author

Category badge (optional)

Bottom row

Featured badge (optional)

Chapter count

Entire card should be clickable.

---

## Styling

Use ONLY existing design tokens.

Examples:

bg-card

text-foreground

text-muted-foreground

bg-primary

bg-secondary

border-border

shadow-sm

shadow-md

rounded-[18px]

font-heading

font-logo

font-body

Do not introduce new colors.

---

## Hover

Card slightly lifts.

Shadow increases.

Cover scales slightly.

Smooth transition.

---

## Accessibility

Keyboard focus

Proper Link usage

Alt text

aria labels where needed

---

## Responsive

Desktop:

4 cards per row

Tablet:

2 cards

Mobile:

1 card

The component itself must be responsive.

---

## Export

Default export.

---

## Documentation

Also generate

prompts/004-book-card-component.md

matching the previous prompt documentation style.

Do not modify any other files.

Only generate:

components/ui/BookCard.tsx

prompts/004-book-card-component.md