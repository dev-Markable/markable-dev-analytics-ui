// DailyCommitData класс для графика
export class DailyCommitData {
    constructor(date, commits) {
        this.date = date;        // дата в формате YYYY-MM-DD
        this.commits = commits;   // общее количество коммитов за день
    }

    static fromApiResponse(data) {
        return new DailyCommitData(
            data.date,
            data.commits
        );
    }
}

// DailyUserData класс для детальной статистики
export class DailyUserData {
    constructor(data) {
        this.date = data.date;
        this.email = data.email;
        this.commits = data.commits;
        this.mergeCommits = data.mergeCommits || 0;
        this.addedLines = data.addedLines || 0;
        this.deletedLines = data.deletedLines || 0;
        this.testAddedLines = data.testAddedLines || 0;
    }

    static fromApiResponse(data) {
        return new DailyUserData(data);
    }
}

// Для форматирования дат (если понадобится)
export const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
};