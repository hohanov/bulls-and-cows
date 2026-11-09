import { evaluateGuess } from './evaluateGuess.js';
import { isValidGuess } from './isValidGuess.js';

export type GameSettings = Readonly<{
    length: number;
    base: number;
}>;

export type GuessEntry = Readonly<{
    guess: string;
    bulls: number;
    cows: number;
}>;

export type GameState = Readonly<{
    secret: string;
    settings: GameSettings;
    history: readonly GuessEntry[];
    status: 'playing' | 'won';
}>;

export const createGameState = (secret: string, settings: GameSettings): GameState => {
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

export const submitGuess = (state: GameState, guess: string): GameState => {
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
    const entry: GuessEntry = { guess, ...result };

    return {
        ...state,
        history: [...state.history, entry],
        status: result.bulls === state.settings.length ? 'won' : 'playing',
    };
};
