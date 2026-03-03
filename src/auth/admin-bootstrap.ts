"use server";

import { eq } from "drizzle-orm";
import { getWebRequest } from "vinxi/http";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { user } from "~/database/schema";

async function requireSession() {
    const session = await auth.api.getSession({
        headers: getWebRequest().headers,
    });
    if (!session) {
        throw new Error("Not authenticated");
    }
    return session;
}

async function hasAdmins(): Promise<boolean> {
    const admins = await connection
        .select({ id: user.id })
        .from(user)
        .where(eq(user.role, "admin"))
        .limit(1);
    return admins.length > 0;
}

export async function checkHasAdmins(): Promise<boolean | null> {
    const session = await auth.api.getSession({
        headers: getWebRequest().headers,
    });
    if (!session) return null;
    return hasAdmins();
}

export async function promoteToAdmin(): Promise<void> {
    const session = await requireSession();

    if (await hasAdmins()) {
        throw new Error("An admin already exists");
    }

    await connection
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.id, session.user.id));
}
