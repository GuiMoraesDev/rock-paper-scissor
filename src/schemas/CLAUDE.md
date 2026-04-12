# Schemas

Zod validation schemas for form inputs. Used with `react-hook-form` via `zodResolver`.

## Structure

Each schema lives in its own folder with a co-located unit test:

```
schemas/
├── createGame/
│   ├── schema.ts
│   └── schema.test.ts
└── joinGame/
    ├── schema.ts
    └── schema.test.ts
```

## Conventions

- Each file exports the schema (e.g. `createGameSchema`) and its inferred type (e.g. `CreateGameSchemaProps`).
- Inferred types use `z.infer<typeof schema>` and are named `<PascalCaseName>SchemaProps`.
- Error messages are user-facing strings — keep them in the schema, not in the component.

## Testing

- Tests are pure Vitest (no Testing Library) — schemas have no JSX, so no `render` needed.
- Use `schema.safeParse(...)` and assert on `result.success` and `result.error?.issues[0].message`.
- Cover: valid input, each validation boundary (min, max, exact length), enum values, and any transforms.
