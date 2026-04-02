import apiClient from "./client";

export const AdminAPI = {
    /**
     * Ручной запуск сбора ежедневной статистики
     * @returns {Promise<{message: string}>}
     */
    triggerDailyStatsCollection: async () => {
        try {
            const response = await apiClient.post('api/v1/analysis/daily/collect');
            return response.data;
        } catch (error) {
            console.error('Failed to trigger daily stats collection:', error);
            throw error;
        }
    },

    /**
     * Получить статус последней выгрузки
     */
    getExportStatus: async () => {
        try {
            const response = await apiClient.get('api/v1/analysis/daily/status');
            return response.data;
        } catch (error) {
            console.error('Failed to get export status:', error);
            throw error;
        }
    }
};