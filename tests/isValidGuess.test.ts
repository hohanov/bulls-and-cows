import { describe, expect, it } from '@jest/globals';
import { isValidGuess } from '../src/core/isValidGuess';

describe('isValidGuess', () => {
    it('accepts a guess with the required length and unique binary digits', () => {
        expect(isValidGuess('10', 2, 2)).toBe(true);
    });

    it('accepts hexadecimal digits without regard to case', () => {
        expect(isValidGuess('aF03', 4, 16)).toBe(true);
    });

    it('rejects guesses with the wrong length', () => {
        expect(isValidGuess('123', 4, 10)).toBe(false);
    });

    it('rejects digits that are outside the selected base', () => {
        expect(isValidGuess('128', 3, 8)).toBe(false);
    });

    it('rejects repeated digits, including case-insensitive hexadecimal repeats', () => {
        expect(isValidGuess('112', 3, 10)).toBe(false);
        expect(isValidGuess('aA', 2, 16)).toBe(false);
    });

    it('rejects invalid lengths and bases', () => {
        expect(isValidGuess('', 0, 10)).toBe(false);
        expect(isValidGuess('12', 2, 1)).toBe(false);
    });
});
