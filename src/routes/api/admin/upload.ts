import type { APIEvent } from "@solidjs/start/server";
import { getStore } from "@netlify/blobs";
import { auth } from "~/auth/core";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
]);

const EXT_MAP: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
};

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const formData = await event.request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return new Response("No file provided", { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
        return new Response(
            "File must be an image (JPEG, PNG, GIF, WebP, SVG)",
            {
                status: 400,
            },
        );
    }

    if (file.size > MAX_SIZE) {
        return new Response("File must be under 5MB", { status: 400 });
    }

    const ext = EXT_MAP[file.type] ?? "bin";
    const key = `${crypto.randomUUID()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const store = getStore("images");
    await store.set(key, buffer, {
        metadata: { contentType: file.type, originalName: file.name },
    });

    return Response.json({ url: `/api/images/${key}` });
}
