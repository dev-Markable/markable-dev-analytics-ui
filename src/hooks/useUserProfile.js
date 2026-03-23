import { useState, useEffect, useCallback } from 'react';
import { UserAPI } from '../api/userAPI';

export const useUserProfile = (emailOrUrl) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        if (!emailOrUrl) return;

        try {
            setLoading(true);
            // Передаем напрямую email или URL
            const data = await UserAPI.getUserProfile(emailOrUrl);
            setProfile(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load user profile');
            console.error('User profile error:', err);
        } finally {
            setLoading(false);
        }
    }, [emailOrUrl]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile
    };
};