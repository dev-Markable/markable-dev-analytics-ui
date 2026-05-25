interface AppEnv {
  apiBaseUrl: string;
}

const fallbackBaseUrl = '/api/v2';

export const env: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? fallbackBaseUrl,
};
