import {useState, useEffect, useCallback} from 'react';
import {ChartAPI} from '../api/chartAPI';

export const useChartData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchChartData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const chartData = await ChartAPI.getDailyCommits();
            setData(chartData);
            return chartData;
        } catch (err) {
            setError(err.message || 'Failed to load chart data');
            throw err;
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