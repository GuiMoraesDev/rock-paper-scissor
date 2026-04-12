# Tests

## E2E Tests (Playwright)

```bash
npm run test:e2e   # Run all e2e tests
```

E2E tests live in `e2e/` and use Playwright with Chromium. The Playwright config (`playwright.config.ts` at the web app root) automatically starts the Next.js dev server (port 3000) before running tests.

### Conventions

- Use `data-testid` attributes to locate elements — avoid selectors based on text content, CSS classes, or DOM structure.
- Each test creates isolated browser contexts for each player (`browser.newContext()`) to simulate two separate clients.
- Helper functions (`createGame`, `joinGame`, `bothPlayersReady`, `makeMove`) encapsulate common flows — use them to keep tests focused on the scenario being validated.
- Use `{ force: true }` on clicks for elements with Framer Motion animations to bypass "element not stable" errors.
- The server's `next-round` event transitions the game for all players — only one player needs to trigger it.

### Adding `data-testid` to components

When writing new e2e tests that need to target elements without a `data-testid`, add the attribute to the source component first, then reference it in the test via `page.getByTestId("...")`.
