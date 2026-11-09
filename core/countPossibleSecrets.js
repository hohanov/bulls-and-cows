const resultCache = new Map();
const countRecursively = (length, base) => {
    const key = `${length}:${base}`;
    const cachedResult = resultCache.get(key);
    if (cachedResult !== undefined) {
        return cachedResult;
    }
    if (length === 0) {
        return 1;
    }
    if (length > base) {
        return 0;
    }
    const result = base * countRecursively(length - 1, base - 1);
    resultCache.set(key, result);
    return result;
};
export const countPossibleSecrets = (length, base) => {
    if (!Number.isInteger(length) || length < 0) {
        throw new RangeError('Length must be a non-negative integer.');
    }
    if (!Number.isInteger(base) || base < 2) {
        throw new RangeError('Base must be an integer greater than or equal to 2.');
    }
    return countRecursively(length, base);
};
//# sourceMappingURL=countPossibleSecrets.js.map