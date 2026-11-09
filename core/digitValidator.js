const digits = '0123456789abcdef';
export const createDigitValidator = (base) => (char) => {
    if (char.length !== 1) {
        return false;
    }
    const digitValue = digits.indexOf(char.toLowerCase());
    return digitValue >= 0 && digitValue < base;
};
//# sourceMappingURL=digitValidator.js.map