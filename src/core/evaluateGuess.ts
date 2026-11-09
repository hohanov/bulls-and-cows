type GuessResult = {
    bulls: number;
    cows: number;
};

type GuessScore = GuessResult & {
    remainingDigits: Record<string, number>;
};

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
    const secretDigits = [...secret.toLowerCase()];
    const guessDigits = [...guess.toLowerCase()];

    const remainingSecretDigits = secretDigits.reduce<Record<string, number>>(
        (counts, digit, index) =>
            digit === guessDigits[index] ? counts : { ...counts, [digit]: (counts[digit] ?? 0) + 1 },
        {}
    );

    const score = guessDigits.reduce<GuessScore>(
        (result, digit, index) => {
            if (digit === secretDigits[index]) {
                return { ...result, bulls: result.bulls + 1 };
            }

            const remainingCount = result.remainingDigits[digit] ?? 0;
            if (remainingCount === 0) {
                return result;
            }

            return {
                ...result,
                cows: result.cows + 1,
                remainingDigits: {
                    ...result.remainingDigits,
                    [digit]: remainingCount - 1,
                },
            };
        },
        { bulls: 0, cows: 0, remainingDigits: remainingSecretDigits }
    );

    return { bulls: score.bulls, cows: score.cows };
};
