---
globs: frontend/**
---

# Frontend Conventions

## React
- Functional components only; no class components.
- State with `useState`/`useReducer`; side effects in `useEffect`.
- Custom hooks live in `src/hooks/` and are prefixed with `use`.
- Pages (routed components) live in `src/pages/`; reusable UI in `src/components/`.

## Tailwind CSS
- Use Tailwind utility classes directly in JSX — no separate CSS files unless unavoidable.
- Responsive variants use mobile-first order: base → `sm:` → `md:` → `lg:`.
- Consistent color palette: use `indigo-*` for primary actions, `green-*` for correct, `red-*` for incorrect.

## API Calls
- All fetch logic goes through `src/services/api.js` — never call `fetch`/`axios` directly in components.
- Handle loading and error states explicitly; never silently swallow errors.

## General
- No prop-types or TypeScript — keep it plain JS/JSX for now.
- Prefer composition over abstraction; don't create a helper for a pattern used fewer than 3 times.
