import { useState, useCallback } from 'react';
import { AnalysisAPI } from '../api/analysisAPI';

export const useAnalysis = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalysis = useCallback(async (since, until) => {
        setLoading(true);
        setError(null);

        try {
            // Валидация дат
            if (!since || !until) {
                throw new Error('Необходимо выбрать обе даты');
            }

            if (!since.isValid() || !until.isValid()) {
                throw new Error('Некорректный формат даты');
            }

            if (since.isAfter(until)) {
                throw new Error('Дата начала не может быть позже даты окончания');
            }

            const result = await AnalysisAPI.startAnalysis({ since, until });

            // Проверяем, что результат - массив
            const dataArray = Array.isArray(result) ? result : [];
            setData(dataArray);

            return dataArray;
        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.formattedMessage ||
                err.message ||
                'Ошибка при загрузке данных';

            setError(errorMessage);
            setData([]); // Очищаем данные при ошибке
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearData = useCallback(() => {
        setData([]);
        setError(null);
    }, []);

    return {
        data,
        loading,
        error,
        fetchAnalysis,
        clearData
    };
};