export function getString(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw Error(`The ${key} environment variable is not set.`);
    }
    return value;
}

export function getAnyString(keys: string[]): string {
    for (const key of keys) {
        const value = process.env[key];
        if (value) return value;
    }
    throw Error(
        `None of the environment variables are set: ${keys.join(", ")}`,
    );
}
