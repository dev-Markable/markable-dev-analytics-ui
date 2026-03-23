import { useState, useEffect, useCallback } from 'react';
import { UserStatsAPI } from '../api/userStatsAPI';

export const useUserStats = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserStats = useCallback(async () => {
        try {
            setLoading(true);
            const stats = await UserStatsAPI.getAllUserStats();
            setData(stats);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load user statistics');
            console.error('User stats error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    return {
        data,
        loading,
        error,
        refetch: fetchUserStats
    };
};