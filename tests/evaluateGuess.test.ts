import { describe, expect, it } from '@jest/globals';
import { evaluateGuess } from '../src/core/evaluateGuess';

describe('evaluateGuess', () => {
    it('counts bulls and cows separately', () => {
        expect(evaluateGuess('4271', '1234')).toEqual({ bulls: 1, cows: 2 });
    });

    it('counts a correct guess as all bulls and no cows', () => {
        expect(evaluateGuess('0123', '0123')).toEqual({ bulls: 4, cows: 0 });
    });

    it('compares hexadecimal digits without regard to case', () => {
        expect(evaluateGuess('aF03', 'Af30')).toEqual({ bulls: 2, cows: 2 });
    });

    it('does not count the same secret digit more than once', () => {
        expect(evaluateGuess('ab', 'aa')).toEqual({ bulls: 1, cows: 0 });
    });
});
