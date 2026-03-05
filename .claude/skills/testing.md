# Testing

Tests live in `tests/` mirroring the `src/` structure. Run with `bun run test`.

## Setup

- **Runner**: Vitest with `jsdom` environment, globals enabled (`describe`, `it`, `expect`, `vi` are global)
- **Component tests**: `@solidjs/testing-library` (`.test.tsx` files)
- **Utility tests**: plain Vitest (`.test.ts` files)

## File Location

| Source file                        | Test file                                |
| ---------------------------------- | ---------------------------------------- |
| `src/components/ui/Button.tsx`     | `tests/components/ui/Button.test.tsx`    |
| `src/utils/batch-stream.ts`        | `tests/utils/batch-stream.test.ts`       |
| `src/components/nav/nav-links.tsx` | `tests/components/nav/nav-links.test.ts` |

## Component Test Pattern

```tsx
import { render, fireEvent } from "@solidjs/testing-library";
import Button from "~/components/ui/Button";

describe("Button", () => {
    it("renders with default primary color and btn variant", () => {
        const { getByRole } = render(() => <Button>Click</Button>);
        const btn = getByRole("button");
        expect(btn.className).toContain("btn-primary");
        expect(btn.className).toContain("shape-btn");
    });

    it("applies danger color class", () => {
        const { getByRole } = render(() => <Button color="danger">Del</Button>);
        expect(getByRole("button").className).toContain("btn-danger");
    });

    it("calls onClick handler", async () => {
        const handler = vi.fn();
        const { getByRole } = render(() => (
            <Button onClick={handler}>Go</Button>
        ));
        fireEvent.click(getByRole("button"));
        expect(handler).toHaveBeenCalledOnce();
    });

    it("can be disabled", () => {
        const { getByRole } = render(() => <Button disabled>No</Button>);
        expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    });
});
```

### Key patterns

- `render(() => <Component />)` — always wrap in arrow function (Solid requirement)
- `getByRole("button")` / `getByRole("textbox")` — query by ARIA role
- `fireEvent.click(element)` — simulate user interaction
- `container.querySelector(".class")` — for CSS class assertions when role queries don't apply
- `btn.className` — check applied classes

## Utility Test Pattern

```ts
import { consumeBatchStream } from "~/utils/batch-stream";

describe("consumeBatchStream", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("calls onProgress for progress events", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                createSSEStream([
                    { completed: 1, total: 2 },
                    { done: true, succeededIds: ["a"], failedCount: 0 },
                ]),
                { status: 200 },
            ),
        );

        await consumeBatchStream(
            "/api/test",
            { userIds: ["a"] },
            (p) => progressCalls.push(p),
            (d) => {
                doneResult = d;
            },
            () => {},
        );

        expect(progressCalls).toEqual([{ completed: 1, total: 2 }]);
    });

    it("calls onError for non-ok response", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response("Unauthorized", { status: 401 }),
        );
        // ...assert error callback
    });
});
```

### Key patterns

- `vi.fn()` — create mock functions
- `vi.spyOn(globalThis, "fetch").mockResolvedValue(...)` — mock fetch calls
- `vi.restoreAllMocks()` in `afterEach` — clean up between tests
- `vi.mock("module")` — mock entire modules

## Conventions

- One `describe` block per function/component
- Test default behavior, each variant/prop, event handlers, and edge cases
- No need to import `describe`, `it`, `expect`, `vi` — they are globals
- Use `toContain` for class checks, `toEqual` for object comparisons
- Use `toHaveBeenCalledOnce()` / `toHaveBeenCalledWith()` for mock assertions
