import { webcrypto } from "node:crypto";

if (!globalThis.crypto) {
    // @ts-expect-error jsdom doesn't provide crypto.getRandomValues
    globalThis.crypto = webcrypto;
}
