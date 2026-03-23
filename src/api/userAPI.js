import apiClient from "./client";

export class UserProfile {
    constructor(data) {
        this.email = data.email;
        this.username = data.username;
        this.joinedDate = data.joinedDate;
        this.totalCommits = data.totalCommits;
        this.totalMergeCommits = data.totalMergeCommits;
        this.totalAddedLines = data.totalAddedLines;
        this.totalDeletedLines = data.totalDeletedLines;
        this.totalTestAddedLines = data.totalTestAddedLines;
        this.activeDays = data.activeDays;
        this.totalDays = data.totalDays;
        this.avgCommitsPerDay = data.avgCommitsPerDay;
        this.periodStart = data.periodStart;
        this.periodEnd = data.periodEnd;
        this.activityByDay = data.activityByDay || {};
        this.activityByHour = data.activityByHour || {};
        this.repositories = data.repositories || [];
        this.tasks = data.tasks || [];
        this.inactivePeriods = data.inactivePeriods || [];
        this.aiSummary = data.aiSummary || "";
    }
}

export const UserAPI = {
    /**
     * Получить профиль пользователя
     * @param {string} email - email пользователя (может быть с параметрами)
     * @param {string} url - полный URL (если передан, используем его)
     */
    getUserProfile: async (emailOrUrl) => {
        try {
            let url;

            // Если передан полный URL (с параметрами)
            if (emailOrUrl.startsWith('/users/') || emailOrUrl.startsWith('users/')) {
                url = 'api/v1' + emailOrUrl;
            } else {
                // Если передан только email
                const encodedEmail = encodeURIComponent(emailOrUrl);
                url = `api/v1/users/${encodedEmail}`;
            }

            console.log('API Request: GET', url);

            const response = await apiClient.get(url);
            return new UserProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            throw error;
        }
    },

    /**
     * Получить коммиты пользователя
     */
    getUserCommits: async (email) => {
        try {
            const encodedEmail = encodeURIComponent(email);
            const response = await apiClient.get(`/users/${encodedEmail}/commits`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user commits:', error);
            throw error;
        }
    }
};