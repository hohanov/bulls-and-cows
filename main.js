import { createDigitValidator } from './core/digitValidator.js';
import { createGameState, submitGuess } from './core/gameState.js';
import { generateSecret } from './core/generateSecret.js';
import { isValidGuess } from './core/isValidGuess.js';
const SCORE_STORAGE_KEY = 'bulls-and-cows.records.v1';
const SCORE_LIMIT = 10;
const BASE_OPTIONS = [
    { base: 2, code: 'bin', label: 'Двоичная (bin)' },
    { base: 8, code: 'oct', label: 'Восьмеричная (oct)' },
    { base: 10, code: 'dec', label: 'Десятичная (dec)' },
    { base: 16, code: 'hex', label: 'Шестнадцатеричная (hex)' },
];
const createElement = (tag, className = '', text = '') => {
    const element = document.createElement(tag);
    const classes = className.split(/\s+/).filter(Boolean);
    if (tag === 'button') {
        classes.unshift('btn');
        if (!classes.some((className) => className.startsWith('btn-'))) {
            classes.push('btn-primary');
        }
    }
    element.className = classes.join(' ');
    if (text) {
        element.textContent = text;
    }
    return element;
};
const createColumn = (content, widthClass) => {
    const column = createElement('div', widthClass);
    column.append(content);
    return column;
};
const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
};
const formatBase = (base) => BASE_OPTIONS.find((option) => option.base === base)?.code ?? String(base);
const isScoreRecord = (value) => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const record = value;
    return (Number.isInteger(record.attempts) &&
        Number(record.attempts) > 0 &&
        Number.isFinite(record.elapsedMs) &&
        Number(record.elapsedMs) >= 0 &&
        Number.isInteger(record.length) &&
        Number(record.length) >= 2 &&
        Number.isInteger(record.base) &&
        BASE_OPTIONS.some((option) => option.base === record.base) &&
        Number(record.length) <= Number(record.base) &&
        typeof record.date === 'string');
};
const sortRecords = (records) => [...records].sort((first, second) => first.attempts - second.attempts || first.elapsedMs - second.elapsedMs);
const readRecords = () => {
    try {
        const storedValue = localStorage.getItem(SCORE_STORAGE_KEY);
        if (storedValue === null) {
            return { records: [], error: null };
        }
        const parsedValue = JSON.parse(storedValue);
        if (!Array.isArray(parsedValue) || !parsedValue.every(isScoreRecord)) {
            return { records: [], error: 'Сохранённые рекорды имеют неверный формат.' };
        }
        return { records: sortRecords(parsedValue).slice(0, SCORE_LIMIT), error: null };
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        return { records: [], error: `Не удалось загрузить рекорды: ${details}` };
    }
};
const loadedScores = readRecords();
let records = loadedScores.records;
let activeGame = null;
let startedAt = 0;
let timerId;
const app = createElement('main', 'container app-shell');
const header = createElement('header');
header.append(createElement('h1', '', 'Bulls and Cows'), createElement('p', '', 'Найдите секретное число по подсказкам.'));
const notice = createElement('p', 'notice');
notice.setAttribute('role', 'status');
notice.setAttribute('aria-live', 'polite');
const screen = createElement('div');
app.append(header, notice, screen);
document.body.replaceChildren(app);
const setNotice = (message, isError = false) => {
    notice.textContent = message;
    notice.classList.toggle('error', isError);
};
const createLeaderboard = () => {
    const panel = createElement('section', 'card p-3 p-md-4');
    panel.setAttribute('aria-labelledby', 'leaderboard-title');
    panel.append(createElement('p', '', 'Таблица рекордов'), createElement('h2', '', 'Лучшие результаты'), createElement('p', '', 'Сначала учитывается число ходов, затем время.'));
    const title = panel.querySelector('h2');
    title?.setAttribute('id', 'leaderboard-title');
    if (records.length === 0) {
        panel.append(createElement('p', 'text-secondary', 'История пока пуста. Ваш результат может стать первым.'));
        return panel;
    }
    const tableWrap = createElement('div', 'table-responsive');
    const table = createElement('table', 'table table-striped align-middle');
    const caption = createElement('caption', 'visually-hidden', 'Лучшие результаты игроков');
    const header = createElement('thead');
    const headerRow = createElement('tr');
    ['Раунд', 'Ходы / время'].forEach((heading) => {
        const cell = createElement('th', 'text-nowrap', heading);
        cell.scope = 'col';
        headerRow.append(cell);
    });
    header.append(headerRow);
    const body = createElement('tbody');
    sortRecords(records)
        .slice(0, SCORE_LIMIT)
        .forEach((record, index) => {
        const row = createElement('tr');
        const rank = createElement('th', 'text-nowrap', `#${index + 1} · ${record.length} ${formatBase(record.base).toUpperCase()}`);
        rank.scope = 'row';
        const result = createElement('td');
        result.className = 'text-nowrap';
        result.textContent = `${record.attempts} · ${formatDuration(record.elapsedMs)}`;
        result.setAttribute('aria-label', `Количество ходов: ${record.attempts}; время: ${formatDuration(record.elapsedMs)}`);
        row.append(rank, result);
        body.append(row);
    });
    table.append(caption, header, body);
    tableWrap.append(table);
    panel.append(tableWrap);
    return panel;
};
const renderSettings = () => {
    if (timerId !== undefined) {
        window.clearInterval(timerId);
        timerId = undefined;
    }
    activeGame = null;
    const layout = createElement('div', 'row g-3');
    const panel = createElement('section', 'card p-3 p-md-4');
    panel.setAttribute('aria-labelledby', 'settings-title');
    panel.append(createElement('p', '', 'Новая партия'), createElement('h2', '', 'Настройте игру'), createElement('p', '', 'Выберите длину секрета и систему счисления. После старта настройки зафиксируются.'));
    panel.querySelector('h2')?.setAttribute('id', 'settings-title');
    const form = createElement('form');
    const baseField = createElement('div', 'mb-3');
    const baseLabel = createElement('label', 'form-label', 'Система счисления');
    baseLabel.htmlFor = 'base-select';
    const baseSelect = createElement('select', 'form-select');
    baseSelect.id = 'base-select';
    BASE_OPTIONS.forEach((option) => {
        const choice = createElement('option', '', option.label);
        choice.value = String(option.base);
        baseSelect.append(choice);
    });
    baseSelect.value = '10';
    baseField.append(baseLabel, baseSelect);
    const lengthField = createElement('div', 'mb-3');
    const lengthLabel = createElement('label', 'form-label', 'Длина секрета');
    lengthLabel.htmlFor = 'length-select';
    const lengthSelect = createElement('select', 'form-select');
    lengthSelect.id = 'length-select';
    for (let length = 2; length <= 6; length += 1) {
        const option = createElement('option', '', String(length));
        option.value = String(length);
        lengthSelect.append(option);
    }
    lengthSelect.value = '4';
    const lengthHint = createElement('p', 'form-text', 'Каждая цифра в секрете должна быть уникальной.');
    const updateLengthOptions = () => {
        const base = Number(baseSelect.value);
        [...lengthSelect.options].forEach((option) => {
            option.disabled = Number(option.value) > base;
        });
        if (Number(lengthSelect.value) > base) {
            lengthSelect.value = String(base);
        }
        lengthHint.textContent = 'Длина не может превышать количество доступных цифр.';
    };
    baseSelect.addEventListener('change', updateLengthOptions);
    lengthField.append(lengthLabel, lengthSelect, lengthHint);
    const startButton = createElement('button', '', 'Начать игру');
    startButton.type = 'submit';
    form.append(baseField, lengthField, startButton);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const settings = {
            length: Number(lengthSelect.value),
            base: Number(baseSelect.value),
        };
        try {
            const secret = generateSecret(settings.length, settings.base);
            activeGame = createGameState(secret, settings);
            startedAt = Date.now();
            setNotice('Раунд начался. Удачи!');
            renderGame();
        }
        catch (error) {
            const details = error instanceof Error ? error.message : String(error);
            setNotice(`Не удалось начать игру: ${details}`, true);
        }
    });
    panel.append(form);
    layout.append(createColumn(panel, 'col-12 col-md-7'), createColumn(createLeaderboard(), 'col-12 col-md-5'));
    screen.replaceChildren(layout);
    setNotice(loadedScores.error ?? '');
};
const renderHistory = (body, state) => {
    body.replaceChildren();
    if (state.history.length === 0) {
        const row = createElement('tr');
        const emptyCell = createElement('td', 'text-secondary', 'Попыток пока нет.');
        emptyCell.colSpan = 4;
        row.append(emptyCell);
        body.append(row);
        return;
    }
    [...state.history].reverse().forEach((entry, index) => {
        const row = createElement('tr');
        const number = createElement('th', '', String(state.history.length - index).padStart(2, '0'));
        number.scope = 'row';
        row.append(number, createElement('td', '', entry.guess.toUpperCase()), createElement('td', '', String(entry.bulls)), createElement('td', '', String(entry.cows)));
        body.append(row);
    });
};
const saveWinningScore = (state, elapsedMs) => {
    const record = {
        attempts: state.history.length,
        elapsedMs,
        length: state.settings.length,
        base: state.settings.base,
        date: new Date().toISOString(),
    };
    records = sortRecords([...records, record]).slice(0, SCORE_LIMIT);
    try {
        localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(records));
        return null;
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        return `Не удалось сохранить рекорд: ${details}`;
    }
};
const renderGame = () => {
    if (!activeGame) {
        return;
    }
    const state = activeGame;
    const layout = createElement('div', 'row g-3');
    const panel = createElement('section', 'card p-3 p-md-4');
    panel.setAttribute('aria-labelledby', 'game-title');
    const topline = createElement('div', 'row align-items-start game-topline');
    const gameTitle = createElement('h2', '', 'Угадайте секрет');
    gameTitle.id = 'game-title';
    const roundLabel = createElement('p', '', 'Раунд идёт');
    const titleCopy = createElement('div', 'col');
    const badge = createElement('span', 'badge rounded-pill bg-success-subtle text-success-emphasis setting-badge col-auto', `Длина: ${state.settings.length} · ${formatBase(state.settings.base).toUpperCase()}`);
    titleCopy.append(roundLabel, gameTitle);
    topline.append(titleCopy, badge);
    const stats = createElement('div', 'row g-2 game-stats');
    const timeStat = createElement('div', 'col-6 stat');
    const timeValue = createElement('strong', '', formatDuration(Date.now() - startedAt));
    timeStat.append(createElement('span', '', 'Время'), timeValue);
    const attemptsStat = createElement('div', 'col-6 stat');
    const attemptsValue = createElement('strong', '', String(state.history.length));
    attemptsStat.append(createElement('span', '', 'Число ходов'), attemptsValue);
    stats.append(timeStat, attemptsStat);
    const form = createElement('form');
    const guessField = createElement('div', 'mb-3');
    const inputLabel = createElement('label', 'form-label', `Введите комбинацию длиной ${state.settings.length}`);
    inputLabel.htmlFor = 'guess-input';
    const input = createElement('input', 'form-control');
    input.id = 'guess-input';
    input.name = 'guess';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.required = true;
    input.setAttribute('aria-describedby', 'guess-hint guess-feedback');
    input.placeholder = 'Ваш вариант';
    const digitValidator = createDigitValidator(state.settings.base);
    input.addEventListener('input', () => {
        const filteredValue = [...input.value].filter(digitValidator).slice(0, state.settings.length).join('');
        if (input.value !== filteredValue) {
            input.value = filteredValue;
        }
    });
    const guessHint = createElement('p', 'form-text', 'Недопустимые символы будут удалены автоматически.');
    guessHint.id = 'guess-hint';
    guessField.append(inputLabel, input, guessHint);
    const submitButton = createElement('button', '', 'Проверить');
    submitButton.type = 'submit';
    form.append(guessField, submitButton);
    const feedback = createElement('p', 'guess-feedback text-secondary');
    feedback.id = 'guess-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    const historyHeading = createElement('h2', '', 'История попыток');
    const historyTable = createElement('table', 'table table-striped align-middle history-table');
    const historyCaption = createElement('caption', 'visually-hidden', 'История попыток и подсказок');
    const historyHead = createElement('thead');
    const historyHeaderRow = createElement('tr');
    ['#', 'Вариант', 'Bulls', 'Cows'].forEach((heading) => {
        const cell = createElement('th', '', heading);
        cell.scope = 'col';
        historyHeaderRow.append(cell);
    });
    historyHead.append(historyHeaderRow);
    const historyBody = createElement('tbody');
    renderHistory(historyBody, state);
    historyTable.append(historyCaption, historyHead, historyBody);
    const actions = createElement('div');
    const newGameButton = createElement('button', 'btn-outline-secondary', 'Новая игра');
    newGameButton.type = 'button';
    newGameButton.addEventListener('click', () => {
        renderSettings();
    });
    actions.append(newGameButton);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!activeGame) {
            return;
        }
        if (!isValidGuess(input.value, activeGame.settings.length, activeGame.settings.base)) {
            feedback.textContent = `Укажите корректную комбинацию длиной ${activeGame.settings.length} без повторов.`;
            feedback.classList.add('error');
            return;
        }
        const previousState = activeGame;
        const nextState = submitGuess(previousState, input.value);
        if (nextState === previousState) {
            feedback.textContent = 'Эта попытка уже есть в истории.';
            feedback.classList.remove('error');
            return;
        }
        activeGame = nextState;
        feedback.classList.remove('error');
        const latestEntry = nextState.history[nextState.history.length - 1];
        feedback.textContent =
            latestEntry === undefined ? '' : `На месте: ${latestEntry.bulls}; не на месте: ${latestEntry.cows}.`;
        attemptsValue.textContent = String(nextState.history.length);
        renderHistory(historyBody, nextState);
        input.value = '';
        if (nextState.status === 'won') {
            if (timerId !== undefined) {
                window.clearInterval(timerId);
                timerId = undefined;
            }
            const elapsedMs = Date.now() - startedAt;
            timeValue.textContent = formatDuration(elapsedMs);
            input.disabled = true;
            submitButton.disabled = true;
            const storageError = saveWinningScore(nextState, elapsedMs);
            const winBanner = createElement('div', 'alert alert-success');
            winBanner.setAttribute('role', 'status');
            winBanner.append(createElement('strong', '', 'Победа! '), createElement('span', '', `Секрет ${nextState.secret.toUpperCase()} найден. Количество ходов: ${nextState.history.length}. Время: ${formatDuration(elapsedMs)}.`));
            panel.insertBefore(winBanner, stats);
            roundLabel.textContent = 'Раунд завершён';
            layout.replaceChildren(createColumn(panel, 'col-12 col-md-7'), createColumn(createLeaderboard(), 'col-12 col-md-5'));
            setNotice(storageError ?? 'Результат добавлен в таблицу рекордов.', storageError !== null);
            return;
        }
        setNotice('');
    });
    const historyWrap = createElement('div', 'table-responsive');
    historyWrap.append(historyTable);
    panel.append(topline, stats, form, feedback, historyHeading, historyWrap, actions);
    layout.append(createColumn(panel, 'col-12 col-md-7'), createColumn(createLeaderboard(), 'col-12 col-md-5'));
    screen.replaceChildren(layout);
    input.focus();
    if (timerId !== undefined) {
        window.clearInterval(timerId);
    }
    timerId = window.setInterval(() => {
        if (activeGame?.status === 'playing') {
            timeValue.textContent = formatDuration(Date.now() - startedAt);
        }
    }, 250);
};
renderSettings();
//# sourceMappingURL=main.js.map