import apiClient from "./client";
import { DailyCommitData, DailyUserData } from "./types/chart";

export const ChartAPI = {
    /**
     * Получить данные для графика коммитов по дням
     * @returns {Promise<Array<DailyCommitData>>}
     */
    getDailyCommits: async () => {
        try {
            // Получаем детальные данные
            const response = await apiClient.get('api/v1/analysis/daily/detailed');

            // Агрегируем по дням
            const dailyMap = new Map();

            response.data.forEach(item => {
                const dailyUser = DailyUserData.fromApiResponse(item);
                const date = dailyUser.date;
                const current = dailyMap.get(date) || 0;
                dailyMap.set(date, current + dailyUser.commits);
            });

            // Преобразуем в массив DailyCommitData и сортируем по дате
            const result = Array.from(dailyMap.entries())
                .map(([date, commits]) => new DailyCommitData(date, commits))
                .sort((a, b) => a.date.localeCompare(b.date));

            console.log('Chart data:', result);
            return result;

        } catch (error) {
            console.error('Failed to fetch chart data:', error);
            throw error;
        }
    },

    /**
     * Получить сырые данные по пользователям
     * @returns {Promise<Array<DailyUserData>>}
     */
    getDailyUserStats: async () => {
        try {
            const response = await apiClient.get('api/v1/analysis/daily/detailed');
            return response.data.map(item => DailyUserData.fromApiResponse(item));
        } catch (error) {
            console.error('Failed to fetch daily user stats:', error);
            throw error;
        }
    }
};