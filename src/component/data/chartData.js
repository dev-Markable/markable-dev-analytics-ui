// Генерируем данные с 01.01.2026 по 01.03.2026
export const generateCommitData = () => {
    const data = [];
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-03-01');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Генерируем случайное количество коммитов от 0 до 25
        // с пиками по выходным (меньше коммитов) и будням (больше)
        const dayOfWeek = d.getDay(); // 0 - воскресенье, 6 - суббота
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        let commits;
        if (isWeekend) {
            commits = Math.floor(Math.random() * 5); // 0-5 коммитов в выходные
        } else {
            commits = Math.floor(Math.random() * 20) + 5; // 5-25 коммитов в будни
        }

        // Добавляем несколько пиков для интереса
        if (d.getDate() === 15 && d.getMonth() === 0) commits = 42; // 15 января
        if (d.getDate() === 1 && d.getMonth() === 1) commits = 38; // 1 февраля
        if (d.getDate() === 20 && d.getMonth() === 1) commits = 45; // 20 февраля

        data.push({
            date: d.toISOString().split('T')[0], // YYYY-MM-DD
            commits: commits,
            day: d.getDate(),
            month: d.toLocaleString('ru', { month: 'short' }),
            weekday: d.toLocaleString('ru', { weekday: 'short' })
        });
    }

    return data;
};

// Новые данные для Kaiten (закрытые дефекты)
export const generateKaitenData = () => {
    const data = [];
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-03-01');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // В выходные дефекты закрывают реже
        let defects;
        if (isWeekend) {
            defects = Math.floor(Math.random() * 3); // 0-2 дефекта
        } else {
            defects = Math.floor(Math.random() * 8) + 2; // 2-10 дефектов
        }

        // Добавляем пики для реалистичности
        if (d.getDate() === 10 && d.getMonth() === 0) defects = 15; // 10 января
        if (d.getDate() === 5 && d.getMonth() === 1) defects = 18;  // 5 февраля
        if (d.getDate() === 25 && d.getMonth() === 1) defects = 22; // 25 февраля

        data.push({
            date: d.toISOString().split('T')[0],
            defects: defects,
            day: d.getDate(),
            month: d.toLocaleString('ru', { month: 'short' }),
            weekday: d.toLocaleString('ru', { weekday: 'short' })
        });
    }

    return data;
};

export const commitData = generateCommitData();
export const kaitenData = generateKaitenData();