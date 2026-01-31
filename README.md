# Memorial - Digital Tributes

A serene, high-contrast digital memorial platform designed for privacy, accessibility, and honoring loved ones.

## Architecture & Modular Design

The application has been refactored to follow a modern, modular architecture for better maintainability and scalability.

### State Management (Zustand & Persist)
We use **Zustand** for lightweight, robust state management. 
- **Persistence:** Local state (like the multistep memorial creation form) is persisted using the `persist` middleware, ensuring user progress is saved across page reloads.
- **Global Stores:** Found in `src/lib/store/`, including `auth-store.ts` for user sessions and `memorial-form.ts` for wizard progress.

### Custom Hooks
Data fetching and complex logic are encapsulated in custom hooks found in `src/lib/hooks/`:
- `useAuthSync`: Synchronizes Supabase auth state with the global store.
- `useMemorials`: Manages fetching and refreshing lists of memorials.
- `useMemorial(id)`: Handles single memorial detail fetching with built-in access checks.

### Utility Functions
Shared logic is abstracted into `src/lib/utils/`:
- `format.ts`: Centralized date and lifespan formatting using `date-fns`.

### Component Structure
- **UI Components:** Reusable primitive components (shadcn/ui based) in `src/components/ui/`.
- **Layout Components:** High-level wrappers like `ProtectedRoute` in `src/components/layout/`.
- **Feature Components:** Domain-specific components like `ProfileDropdown` or `MediaGrid`.

### Accessibility & UX
- **WCAG AAA Compliance:** Color palette ("Serene Stone") and typography are optimized for maximum readability and contrast.
- **Interactive Indicators:** Explicit `cursor-pointer` for all buttons, links, and selectable elements.
- **Enhanced Navigation:** Intelligent date pickers with decade-level navigation and smooth-scrolling landing pages.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.