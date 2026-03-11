const TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
    data: any;
    expiry: number;
}

const postCache = new Map<string, CacheEntry>();
const listCache = new Map<string, CacheEntry>();

function get(cache: Map<string, CacheEntry>, key: string): any | undefined {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return undefined;
    }
    return entry.data;
}

function set(cache: Map<string, CacheEntry>, key: string, data: any) {
    cache.set(key, { data, expiry: Date.now() + TTL });
}

export function getCachedPost(slug: string) {
    return get(postCache, slug);
}

export function setCachedPost(slug: string, data: any) {
    set(postCache, slug, data);
}

export function getCachedList(key: string) {
    return get(listCache, key);
}

export function setCachedList(key: string, data: any) {
    set(listCache, key, data);
}

export function invalidatePost(slug: string) {
    postCache.delete(slug);
}

export function invalidateAllPosts() {
    postCache.clear();
    listCache.clear();
}
