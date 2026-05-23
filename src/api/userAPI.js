import apiClient from "./client";

export class UserProfile {
    constructor(data) {
        this.email = data.email;
        this.username = data.username;
        this.joinedDate = data.joinedDate;
        this.avatarUrl = data.avatarUrl;  // 👈 добавляем аватарку
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
        this.kaitenCards = data.kaitenCards || [];
        this.inactivePeriods = data.inactivePeriods || [];
        this.aiSummary = data.aiSummary || "";
    }
}

export const UserAPI = {
    getUserProfile: async (emailOrUrl) => {
        try {
            let url;
            if (emailOrUrl.startsWith('/users/') || emailOrUrl.startsWith('users/')) {
                url = 'api/v1' + emailOrUrl;
            } else {
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