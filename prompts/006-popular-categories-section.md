Create a reusable homepage section for KATHA.

File:
components/home/PopularCategories.tsx

Context:
- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- TypeScript
- Design tokens already defined in app/globals.css

Requirements:
- Server component
- Premium bookstore style
- Section title: Browse by Genre
- Short description
- Render 8 category cards:
  - Romance
  - Fantasy
  - Mystery
  - Thriller
  - Historical Fiction
  - Young Adult
  - Poetry
  - Short Stories
- Each card links to /library?genre=<genre>
- Use existing design tokens only
- Responsive grid
- Soft hover lift
- Accessible
- No external dependencies
- Return ONLY the complete PopularCategories.tsx file