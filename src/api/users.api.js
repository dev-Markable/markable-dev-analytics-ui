import apiClient from "./client";

export const UsersAPI = {
    getCurrentUser: async () => {
        const response = await apiClient.get("/users/me");
        return response.data;
    },

    updateCurrentUser: async (data) => {
        const response = await apiClient.put("/users/me", data);
        return response.data;
    },

    changePassword: async (data) => {
        return apiClient.put("/users/me/password", data);
    },

    getUserProfile: async (userId) => {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    },
};