# Components

Components follow **Atomic Design** methodology, organized into three layers:

- **`atoms/`** — Generic, reusable building blocks (Button, Input, Toaster, Modal). Keep them simple. Not domain-specific — name them generically.

Molecules and organisms are not used in the shared `src/components/` tree. Page-specific compound components (Lobby, GamePlay, RoundResultScreen, GameFinished, etc.) live inside each page's `_src/` directory.

## Component folder structure

Each component lives in its own folder with a barrel file and a unit test:

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
└── index.ts
```

There is **no top-level barrel file** per layer (no `atoms/index.ts`). Import directly from the component folder:

```ts
import { Button } from "@/components/atoms/Button";
```

## Atoms conventions

- Atoms must be simple — don't overcomplicate with too many props or conditional logic.
- Extend native HTML attributes via `ComponentProps<"element">` and spread `...props` for flexibility.
- Use the `asChild` pattern (via `@radix-ui/react-slot`) when a component needs to render as a different element. This replaces union-type approaches like `as="link"`. Example: `<Button asChild><Link href="/">Home</Link></Button>`.
- Use `tailwind-variants` (`tv`) for defining component variants. Export the variants function alongside the component so styles can be reused independently.
- Styles live in the component, not in global CSS. Don't create utility classes in `globals.css` for styles that belong to a component.
- Don't create single-purpose wrapper atoms (e.g., BackLink). Instead, compose existing atoms: `<Button asChild variant="ghost" size="sm"><Link href="/">← Back</Link></Button>`.

## Testing

- Tests use **Vitest** + **@testing-library/react** (config in `vitest.config.ts`, setup in `vitest.setup.ts`)
- Run tests: `npm run test` from `apps/web`
- Every component must have a co-located test file
