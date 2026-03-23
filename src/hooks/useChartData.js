import {useState, useEffect, useCallback} from 'react';
import {ChartAPI} from '../api/chartAPI';

export const useChartData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // true по умолчанию
    const [error, setError] = useState(null);

    const fetchChartData = useCallback(async () => {
        try {
            setLoading(true);
            const chartData = await ChartAPI.getDailyCommits();
            setData(chartData);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load chart data');
            console.error('Chart data error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    return {
        data,
        loading,
        error,
        refetch: fetchChartData
    };
};