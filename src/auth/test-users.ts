"use server";

import { like } from "drizzle-orm";
import { getWebRequest } from "vinxi/http";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { user } from "~/database/schema";

function generateRandomPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function extractTestUserNumber(email: string): number | null {
  const match = email.match(/^testuser(\d+)@example\.com$/);
  return match ? parseInt(match[1], 10) : null;
}

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: getWebRequest().headers,
  });
  if (!session) throw new Error("Not authenticated");
  if (session.user.role !== "admin") throw new Error("Admin access required");
  return session;
}

async function getMaxTestUserNumber(): Promise<number> {
  const testUsers = await connection
    .select({ email: user.email })
    .from(user)
    .where(like(user.email, "testuser%@example.com"));

  let max = 0;
  for (const row of testUsers) {
    const num = extractTestUserNumber(row.email);
    if (num !== null && num > max) max = num;
  }
  return max;
}

export async function getNextTestUserNumber(): Promise<number> {
  await requireAdmin();
  return (await getMaxTestUserNumber()) + 1;
}

export async function createTestUsers(
  count: number,
): Promise<{ created: number; startedAt: number; error?: string }> {
  await requireAdmin();

  if (count < 1 || count > 100) {
    return { created: 0, startedAt: 0, error: "Count must be between 1 and 100" };
  }

  const startNumber = (await getMaxTestUserNumber()) + 1;
  let created = 0;

  for (let i = 0; i < count; i++) {
    const n = startNumber + i;
    try {
      await auth.api.createUser({
        body: {
          name: `TestUser${n}`,
          email: `testuser${n}@example.com`,
          password: generateRandomPassword(),
          role: "user",
        },
      });
      created++;
    } catch (err) {
      console.error(`Failed to create TestUser${n}:`, err);
    }
  }

  return { created, startedAt: startNumber };
}
