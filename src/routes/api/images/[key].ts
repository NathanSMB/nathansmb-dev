import type { APIEvent } from "@solidjs/start/server";
import { getStore } from "@netlify/blobs";

export async function GET(event: APIEvent) {
    const key = event.params.key;

    const store = getStore("images");
    const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!blob) {
        return new Response("Not found", { status: 404 });
    }

    const contentType =
        (blob.metadata as Record<string, string>)?.contentType ??
        "application/octet-stream";

    return new Response(blob.data as ArrayBuffer, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
