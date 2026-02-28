import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export * from "./schemas/auth";

export const tempTable = pgTable("temp_table", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});