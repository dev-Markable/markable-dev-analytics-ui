import apiClient from "./client";
import { setTokens, clearTokens } from "./tokenService";

export const AuthAPI = {
    register: async (data) => {
        const response = await apiClient.post("/auth/register", data);
        const { accessToken, refreshToken } = response.data;
        setTokens(accessToken, refreshToken);
        return response.data;
    },

    login: async (data) => {
        const response = await apiClient.post("/auth/login", data);
        const { accessToken, refreshToken } = response.data;
        setTokens(accessToken, refreshToken);
        return response.data;
    },

    logout: async () => {
        await apiClient.post("/auth/logout");
        clearTokens();
    },

    verifyEmail: async (token) => {
        return apiClient.post(`/auth/verify-email?token=${token}`);
    },

    forgotPassword: async (email) => {
        return apiClient.post("/auth/forgot-password", { email });
    },

    resetPassword: async (data) => {
        return apiClient.post("/auth/reset-password", data);
    },
};