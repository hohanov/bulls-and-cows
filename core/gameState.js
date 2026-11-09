import { evaluateGuess } from './evaluateGuess.js';
import { isValidGuess } from './isValidGuess.js';
export const createGameState = (secret, settings) => {
    if (!isValidGuess(secret, settings.length, settings.base)) {
        throw new RangeError('Secret must be a valid sequence for the selected settings.');
    }
    return {
        secret,
        settings: { ...settings },
        history: [],
        status: 'playing',
    };
};
export const submitGuess = (state, guess) => {
    if (state.status === 'won') {
        return state;
    }
    const normalizedGuess = guess.toLowerCase();
    if (state.history.some((entry) => entry.guess.toLowerCase() === normalizedGuess)) {
        return state;
    }
    if (!isValidGuess(guess, state.settings.length, state.settings.base)) {
        throw new RangeError('Guess must be valid for the current game settings.');
    }
    const result = evaluateGuess(state.secret, guess);
    const entry = { guess, ...result };
    return {
        ...state,
        history: [...state.history, entry],
        status: result.bulls === state.settings.length ? 'won' : 'playing',
    };
};
//# sourceMappingURL=gameState.js.map