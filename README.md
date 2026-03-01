# nathansmb-dev

A SolidStart application.

## Setup

After install dependencies and mark the auto-generated auth schema as unchanged:

```sh
bun install
```

`src/database/schemas/auth.ts` is auto-generated and should not be committed. It will be autogenerate on `prebuild` and `predev`. Otherwise you can run the following to regenerate it:

```sh
bun run generate-auth-schema
```

Run the following command to make it easier to avoid commiting the auth schema.

```sh
git update-index --assume-unchanged src/database/schemas/auth.ts
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
