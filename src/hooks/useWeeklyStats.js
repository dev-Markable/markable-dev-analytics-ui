import { useState, useEffect, useCallback } from 'react';
import { WeeklyStatsAPI } from '../api/weeklyStatsAPI';

export const useWeeklyStats = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWeeklyStats = useCallback(async () => {
        try {
            setLoading(true);
            const stats = await WeeklyStatsAPI.getWeeklyStats();
            setData(stats);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load weekly statistics');
            console.error('Weekly stats error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeeklyStats();
    }, [fetchWeeklyStats]);

    return {
        data,
        loading,
        error,
        refetch: fetchWeeklyStats
    };
};