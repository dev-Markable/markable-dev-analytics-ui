import axios from 'axios';
import { ApiError } from './api-error';

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

const isProblemDetails = (data: unknown): data is ProblemDetails => {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return 'title' in d || 'type' in d || 'detail' in d;
};

const networkErrorMessage = 'Сервер не отвечает. Проверьте подключение к сети.';

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const data = err.response?.data;

    if (isProblemDetails(data)) {
      return new ApiError({
        status,
        type: data.type ?? 'about:blank',
        title: data.title ?? 'Ошибка запроса',
        detail: data.detail ?? null,
        instance: data.instance ?? null,
      });
    }

    if (status === 0) {
      return new ApiError({
        status: 0,
        type: 'urn:devpulse:problem:network',
        title: 'Сервер недоступен',
        detail: networkErrorMessage,
      });
    }

    return new ApiError({
      status,
      type: 'about:blank',
      title: `Ошибка ${status}`,
      detail: err.message,
    });
  }

  const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
  return new ApiError({
    status: 0,
    type: 'about:blank',
    title: 'Ошибка клиента',
    detail: message,
  });
}
