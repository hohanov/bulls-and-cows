const digits = '0123456789abcdef';

export const generateSecret = (length: number, base: number, random: () => number = Math.random): string => {
    if (!Number.isInteger(base) || base < 2 || base > digits.length) {
        throw new RangeError('Base must be an integer between 2 and 16.');
    }

    if (!Number.isInteger(length) || length < 1 || length > base) {
        throw new RangeError('Length must be an integer between 1 and the base.');
    }

    const availableDigits = digits.slice(0, base).split('');

    for (let index = availableDigits.length - 1; index > 0; index -= 1) {
        const randomValue = random();
        if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
            throw new RangeError('Random source must return a number in the [0, 1) interval.');
        }

        const swapIndex = Math.floor(randomValue * (index + 1));
        [availableDigits[index], availableDigits[swapIndex]] = [availableDigits[swapIndex], availableDigits[index]];
    }

    return availableDigits.slice(0, length).join('');
};
