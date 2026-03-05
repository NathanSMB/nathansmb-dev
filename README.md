# nathansmb-dev

A SolidStart application.

## Documentation

- [Auth & Access Control](docs/auth.md) — Authentication, roles, and route guards
- [Database](docs/database.md) — Drizzle ORM, Neon PostgreSQL, schema conventions
- [API Routes](docs/api.md) — Endpoints, batch streaming protocol
- [UI Components](docs/ui-components.md) — Reusable component reference

## Setup

Install dependencies:

```sh
bun install
```

`src/database/schemas/auth.ts` is auto-generated and gitignored. It regenerates automatically on `predev` and `prebuild`, or manually with:

```sh
bun run generate-auth-schema
```

To push schema changes to the database:

```sh
bun run push-schemas
```

## Developing

Start a development server:

```sh
bun run dev
```

## Building

```sh
bun run build
```
