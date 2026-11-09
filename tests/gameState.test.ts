import { describe, expect, it } from '@jest/globals';
import { createGameState, submitGuess } from '../src/core/gameState';

describe('game state', () => {
    it('creates a playing state with immutable settings and an empty history', () => {
        expect(createGameState('4271', { length: 4, base: 10 })).toEqual({
            secret: '4271',
            settings: { length: 4, base: 10 },
            history: [],
            status: 'playing',
        });
    });

    it('adds a guess and its score without changing the previous state', () => {
        const initialState = createGameState('4271', { length: 4, base: 10 });
        const nextState = submitGuess(initialState, '1234');

        expect(nextState.history).toEqual([{ guess: '1234', bulls: 1, cows: 2 }]);
        expect(nextState).not.toBe(initialState);
        expect(nextState.history).not.toBe(initialState.history);
        expect(initialState.history).toEqual([]);
        expect(initialState.status).toBe('playing');
    });

    it('appends guesses while preserving earlier entries', () => {
        const firstState = submitGuess(createGameState('4271', { length: 4, base: 10 }), '1234');
        const secondState = submitGuess(firstState, '4270');

        expect(secondState.history).toEqual([
            { guess: '1234', bulls: 1, cows: 2 },
            { guess: '4270', bulls: 3, cows: 0 },
        ]);
        expect(firstState.history).toEqual([{ guess: '1234', bulls: 1, cows: 2 }]);
    });

    it('marks the game as won when every digit is a bull', () => {
        const state = createGameState('aF03', { length: 4, base: 16 });
        const wonState = submitGuess(state, 'AF03');

        expect(wonState.status).toBe('won');
        expect(wonState.history).toEqual([{ guess: 'AF03', bulls: 4, cows: 0 }]);
        expect(submitGuess(wonState, 'af30')).toBe(wonState);
    });

    it('does not append a duplicate guess', () => {
        const firstState = submitGuess(createGameState('4271', { length: 4, base: 10 }), '1234');

        expect(submitGuess(firstState, '1234')).toBe(firstState);
    });

    it('rejects invalid guesses without changing the state', () => {
        const state = createGameState('4271', { length: 4, base: 10 });

        expect(() => submitGuess(state, '12x4')).toThrow(RangeError);
        expect(state.history).toEqual([]);
    });

    it('rejects an invalid secret when creating the state', () => {
        expect(() => createGameState('1123', { length: 4, base: 10 })).toThrow(RangeError);
    });
});
