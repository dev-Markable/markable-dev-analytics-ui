import apiClient from "./client";
import { UserAggregatedStats } from "./types/userStats";

export const UserStatsAPI = {
    /**
     * Получить детальную статистику по пользователям
     * @returns {Promise<Array<UserAggregatedStats>>}
     */
    getAllUserStats: async () => {
        try {
            const response = await apiClient.get('api/v1/analysis/daily/detailed');
            return UserAggregatedStats.fromApiResponse(response.data);
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
            throw error;
        }
    }
};