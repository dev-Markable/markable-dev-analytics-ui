import { useState, useEffect, useCallback } from 'react';
import { CommitsAPI } from '../api/commitsAPI';

export const useCommitsData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCommitsData = useCallback(async () => {
        try {
            setLoading(true);
            const commitsData = await CommitsAPI.getDailyCommits();
            setData(commitsData);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load commits data');
            console.error('Commits data error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCommitsData();
    }, [fetchCommitsData]);

    return {
        data,
        loading,
        error,
        refetch: fetchCommitsData
    };
};