import axios, { type AxiosInstance } from 'axios';
import { env } from '@/shared/config';
import { toApiError } from './problem-details';

const createClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, application/problem+json',
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error)),
  );

  return instance;
};

export const apiClient: AxiosInstance = createClient();
