# KATHA — Featured Books Section

You are implementing the next reusable section for KATHA.

Project stack:

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- TypeScript
- Existing Design System
- Existing Button component
- Existing Navbar component
- Existing BookCard component

Follow the existing architecture and code style exactly.

---

## Goal

Create a reusable homepage section that showcases featured books.

Location:

components/home/FeaturedBooks.tsx

This component should be completely reusable and contain only presentation logic.

Do not modify BookCard.

---

## Component Structure

Create:

components/home/FeaturedBooks.tsx

and

prompts/005-featured-books-section.md

following the documentation style used in previous prompts.

---

## Data

For now, create a temporary array inside the component.

Example structure:

```ts
const featuredBooks = [
  {
    title: "...",
    author: "...",
    category: "...",
    featured: true,
    chapters: 7,
    href: "/library/..."
  }
];
```

Do NOT fetch data yet.

Do NOT use a database yet.

We'll replace this with Prisma later.

Use 4 sample Filipino-inspired books.

Examples:

- Ang Huling Tag-araw
- Mga Liham sa Dilim
- Ang Bahay sa Buwan
- Huling Tren Pauwi

---

## Layout

Top row

-----------------------------------

Featured Books

A curated collection of stories...

(View All →)

-----------------------------------

Below:

Responsive grid

Desktop

BookCard BookCard BookCard BookCard

Tablet

2 columns

Mobile

1 column

Use

grid-cols-1
sm:grid-cols-2
lg:grid-cols-4

Gap:

gap-6

---

## Header

Left

Heading

Featured Books

Paragraph

A curated selection of stories our readers are loving this week.

Right

Text Link

View All →

Links to

/library

---

## Book Cards

Render using

featuredBooks.map()

Example:

<BookCard
  key={book.href}
  {...book}
/>

Do not duplicate BookCard markup.

---

## Spacing

Use existing spacing scale.

Container:

container-katha

Vertical spacing:

py-20

---

## Styling

Use only existing design tokens.

Examples:

text-foreground

text-muted-foreground

border-border

bg-background

shadow-sm

No new colors.

---

## Accessibility

Section should have

aria-labelledby

Heading should be

<h2>

View All should have proper Link.

---

## Responsive

Desktop

4 columns

Tablet

2 columns

Mobile

1 column

---

## Export

Default export.

---

## Do NOT modify

BookCard

Navbar

Button

globals.css

app/page.tsx

Only create the new section.

---

## Documentation

Generate

prompts/005-featured-books-section.md

matching the style of previous documentation.

---

## Future Compatibility

Design this component so the temporary array can later be replaced with:

const featuredBooks = await prisma.book.findMany()

without changing the JSX.

Keep data separate from rendering.
