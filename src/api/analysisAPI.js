import apiClient from "./client";
import { AnalysisResponse } from "./types/analysis";

export const AnalysisAPI = {
    /**
     * Запуск анализа с указанным периодом
     * @param {Object} params - параметры запроса
     * @param {dayjs} params.since - дата начала
     * @param {dayjs} params.until - дата окончания
     * @returns {Promise<Array<AnalysisResponse>>}
     */
    startAnalysis: async ({ since, until }) => {
        try {
            // Форматируем даты в строки
            const requestData = {
                since: since.format('YYYY-MM-DD'),
                until: until.format('YYYY-MM-DD')
            };

            console.log('Sending analysis request:', requestData); // для отладки

            const response = await apiClient.post('api/v1/analysis', requestData);

            // Преобразуем ответ в модели
            return response.data.map(item => new AnalysisResponse(item));
        } catch (error) {
            console.error('Analysis API Error:', error);
            throw error;
        }
    },

    /**
     * Альтернативный метод с raw данными
     */
    startAnalysisRaw: async (since, until) => {
        const response = await apiClient.post('/analysis', { since, until });
        return response.data; // возвращаем как есть, без преобразования
    },
};