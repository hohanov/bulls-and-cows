import { describe, expect, it } from '@jest/globals';
import { generateSecret } from '../src/core/generateSecret';

describe('generateSecret', () => {
    it('generates a deterministic sequence from the injected random source', () => {
        expect(generateSecret(4, 10, () => 0)).toBe('1234');
    });

    it('preserves a leading zero when selected', () => {
        expect(generateSecret(4, 10, () => 0.999999)).toBe('0123');
    });

    it('returns unique digits that belong to the selected base', () => {
        const secret = generateSecret(6, 8, () => 0.5);

        expect(new Set(secret).size).toBe(6);
        expect([...secret].every((digit) => '01234567'.includes(digit))).toBe(true);
    });

    it('rejects lengths or bases outside the supported range', () => {
        expect(() => generateSecret(0, 10, () => 0)).toThrow(RangeError);
        expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
        expect(() => generateSecret(2, 17, () => 0)).toThrow(RangeError);
    });

    it('rejects random values outside the [0, 1) interval', () => {
        expect(() => generateSecret(2, 10, () => 1)).toThrow(RangeError);
        expect(() => generateSecret(2, 10, () => -0.1)).toThrow(RangeError);
    });
});
