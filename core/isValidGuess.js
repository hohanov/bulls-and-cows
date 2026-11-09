import { createDigitValidator } from './digitValidator.js';
export const isValidGuess = (guess, length, base) => {
    if (!Number.isInteger(length) || length < 1 || guess.length !== length) {
        return false;
    }
    if (!Number.isInteger(base) || base < 2 || base > 16) {
        return false;
    }
    const isValidDigit = createDigitValidator(base);
    const normalizedDigits = [...guess].map((digit) => digit.toLowerCase());
    return normalizedDigits.every(isValidDigit) && new Set(normalizedDigits).size === length;
};
//# sourceMappingURL=isValidGuess.js.map