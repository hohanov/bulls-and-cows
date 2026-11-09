import { describe, expect, it } from '@jest/globals';
import { countPossibleSecrets } from '../src/core/countPossibleSecrets';

describe('countPossibleSecrets', () => {
    it('counts permutations without excluding leading zeroes', () => {
        expect(countPossibleSecrets(2, 2)).toBe(2);
        expect(countPossibleSecrets(4, 10)).toBe(5040);
    });

    it('uses one arrangement for a zero-length sequence', () => {
        expect(countPossibleSecrets(0, 10)).toBe(1);
    });

    it('returns zero when there are not enough unique digits', () => {
        expect(countPossibleSecrets(3, 2)).toBe(0);
    });

    it('rejects invalid lengths and bases', () => {
        expect(() => countPossibleSecrets(-1, 10)).toThrow(RangeError);
        expect(() => countPossibleSecrets(2, 1)).toThrow(RangeError);
        expect(() => countPossibleSecrets(1.5, 10)).toThrow(RangeError);
    });
});
