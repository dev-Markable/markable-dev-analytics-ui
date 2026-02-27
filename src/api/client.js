import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/", // Базовый URL вашего API
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Response interceptor для обработки ошибок
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Подробное логирование ошибок
        if (error.response) {
            // Сервер ответил с ошибкой
            console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url,
                method: error.config?.method
            });

            // Форматируем ошибку для удобства использования
            error.formattedMessage = error.response.data?.message ||
                error.response.data?.error ||
                `Ошибка ${error.response.status}`;
        } else if (error.request) {
            // Запрос был отправлен, но нет ответа
            console.error('API No Response:', {
                request: error.request,
                url: error.config?.url
            });
            error.formattedMessage = 'Сервер не отвечает. Проверьте подключение к сети.';
        } else {
            // Ошибка при настройке запроса
            console.error('API Request Error:', error.message);
            error.formattedMessage = 'Ошибка при отправке запроса';
        }

        return Promise.reject(error);
    }
);

// Добавляем перехватчик для логирования всех запросов (опционально, для отладки)
apiClient.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;