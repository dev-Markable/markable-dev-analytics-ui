import apiClient from "./client";

export class DailyCommitData {
    constructor(date, totalCommits, totalMergeCommits, totalAddedLines, totalDeletedLines, totalTestAddedLines, details = []) {
        this.date = date;
        this.totalCommits = totalCommits;
        this.totalMergeCommits = totalMergeCommits || 0;
        this.totalAddedLines = totalAddedLines || 0;
        this.totalDeletedLines = totalDeletedLines || 0;
        this.totalTestAddedLines = totalTestAddedLines || 0;
        this.details = details; // детальные данные по пользователям за этот день
    }

    static fromApiResponse(aggregated, details) {
        return new DailyCommitData(
            aggregated.date,
            aggregated.totalCommits,
            aggregated.totalMergeCommits,
            aggregated.totalAddedLines,
            aggregated.totalDeletedLines,
            aggregated.totalTestAddedLines,
            details
        );
    }
}

export class DailyUserDetail {
    constructor(data) {
        this.email = data.email;
        this.commits = data.commits;
        this.mergeCommits = data.mergeCommits || 0;
        this.addedLines = data.addedLines || 0;
        this.deletedLines = data.deletedLines || 0;
        this.testAddedLines = data.testAddedLines || 0;
    }
}

export const CommitsAPI = {
    /**
     * Получить агрегированные данные по дням
     */
    getDailyCommits: async () => {
        try {
            // Получаем агрегированные данные
            const aggregatedResponse = await apiClient.get('api/v1/analysis/daily');

            // Получаем детальные данные
            const detailedResponse = await apiClient.get('api/v1/analysis/daily/detailed');

            // Группируем детальные данные по дням
            const detailsByDate = new Map();
            detailedResponse.data.forEach(item => {
                if (!detailsByDate.has(item.date)) {
                    detailsByDate.set(item.date, []);
                }
                detailsByDate.get(item.date).push(new DailyUserDetail(item));
            });

            // Объединяем агрегированные данные с детальными
            const combinedData = aggregatedResponse.data.map(agg =>
                DailyCommitData.fromApiResponse(
                    agg,
                    detailsByDate.get(agg.date) || []
                )
            );

            return combinedData;

        } catch (error) {
            console.error('Failed to fetch daily commits:', error);
            throw error;
        }
    }
};