// Агрегированные данные по пользователю
export class UserAggregatedStats {
    constructor(data) {
        this.email = data.email;
        this.totalCommits = data.totalCommits || 0;
        this.totalMergeCommits = data.totalMergeCommits || 0;
        this.totalAddedLines = data.totalAddedLines || 0;
        this.totalDeletedLines = data.totalDeletedLines || 0;
        this.totalTestAddedLines = data.totalTestAddedLines || 0;
        this.daysActive = data.daysActive || 0;
        this.details = data.details || []; // детальные данные по дням
    }

    static fromApiResponse(detailedData) {
        // Группируем по пользователям
        const userMap = new Map();

        detailedData.forEach(item => {
            if (!userMap.has(item.email)) {
                userMap.set(item.email, {
                    email: item.email,
                    totalCommits: 0,
                    totalMergeCommits: 0,
                    totalAddedLines: 0,
                    totalDeletedLines: 0,
                    totalTestAddedLines: 0,
                    daysActive: 0,
                    details: []
                });
            }

            const user = userMap.get(item.email);
            user.totalCommits += item.commits;
            user.totalMergeCommits += item.mergeCommits;
            user.totalAddedLines += item.addedLines;
            user.totalDeletedLines += item.deletedLines;
            user.totalTestAddedLines += item.testAddedLines;
            user.daysActive++;
            user.details.push(item);
        });

        // Сортируем детали по дате
        userMap.forEach(user => {
            user.details.sort((a, b) => a.date.localeCompare(b.date));
        });

        // Преобразуем в массив и сортируем по коммитам
        return Array.from(userMap.values())
            .map(userData => new UserAggregatedStats(userData))
            .sort((a, b) => b.totalCommits - a.totalCommits);
    }
}

// Детальные данные по пользователю за день
export class DailyUserStats {
    constructor(data) {
        this.date = data.date;
        this.email = data.email;
        this.commits = data.commits;
        this.mergeCommits = data.mergeCommits;
        this.addedLines = data.addedLines;
        this.deletedLines = data.deletedLines;
        this.testAddedLines = data.testAddedLines;
    }
}