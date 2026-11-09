import { describe, expect, it } from '@jest/globals';
import { createDigitValidator } from '../src/core/digitValidator';

describe('createDigitValidator', () => {
    it('accepts only binary digits for base 2', () => {
        const isValidDigit = createDigitValidator(2);

        expect(isValidDigit('0')).toBe(true);
        expect(isValidDigit('1')).toBe(true);
        expect(isValidDigit('2')).toBe(false);
    });

    it('accepts digits below the selected base', () => {
        expect(createDigitValidator(8)('7')).toBe(true);
        expect(createDigitValidator(8)('8')).toBe(false);
        expect(createDigitValidator(10)('9')).toBe(true);
        expect(createDigitValidator(10)('a')).toBe(false);
    });

    it('accepts hexadecimal letters without regard to case', () => {
        const isValidDigit = createDigitValidator(16);

        expect(isValidDigit('a')).toBe(true);
        expect(isValidDigit('A')).toBe(true);
        expect(isValidDigit('f')).toBe(true);
        expect(isValidDigit('F')).toBe(true);
        expect(isValidDigit('g')).toBe(false);
    });

    it('rejects empty and multi-character input', () => {
        const isValidDigit = createDigitValidator(16);

        expect(isValidDigit('')).toBe(false);
        expect(isValidDigit('10')).toBe(false);
    });
});
