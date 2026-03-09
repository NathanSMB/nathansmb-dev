export function readingTime(content: string): number {
    return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}
