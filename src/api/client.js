import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokenService";

const apiClient = axios.create({
    baseURL: "http://localhost:8080", // ← поменяй на свой backend
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request interceptor — добавляем Bearer токен
 */
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Response interceptor — авто refresh
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            getRefreshToken()
        ) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(
                    "http://localhost:8080/auth/refresh",
                    {
                        refreshToken: getRefreshToken(),
                    }
                );

                const { accessToken, refreshToken } = response.data;
                setTokens(accessToken, refreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (err) {
                clearTokens();
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;