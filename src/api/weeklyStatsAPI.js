import apiClient from "./client";

export class WeeklyStats {
    constructor(data) {
        this.weekNumber = data.weekNumber;
        this.weekStart = data.weekStart;
        this.weekEnd = data.weekEnd;
        this.totalCommits = data.totalCommits;
        this.totalMergeCommits = data.totalMergeCommits;
        this.totalAddedLines = data.totalAddedLines;
        this.totalDeletedLines = data.totalDeletedLines;
        this.totalTestAddedLines = data.totalTestAddedLines;
        this.uniqueAuthors = data.uniqueAuthors;
        this.topAuthors = data.topAuthors || {};
    }

    getWeekLabel() {
        const start = new Date(this.weekStart).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
        const end = new Date(this.weekEnd).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
        return `${start} - ${end}`;
    }
}

export const WeeklyStatsAPI = {
    getWeeklyStats: async () => {
        try {
            const response = await apiClient.get('api/v1/analysis/weekly');
            return response.data.map(item => new WeeklyStats(item));
        } catch (error) {
            console.error('Failed to fetch weekly stats:', error);
            throw error;
        }
    }
};