interface ApiErrorInit {
  status: number;
  type: string;
  title: string;
  detail?: string | null;
  instance?: string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly type: string;
  readonly title: string;
  readonly detail: string | null;
  readonly instance: string | null;

  constructor(init: ApiErrorInit) {
    super(init.detail ?? init.title);
    this.name = 'ApiError';
    this.status = init.status;
    this.type = init.type;
    this.title = init.title;
    this.detail = init.detail ?? null;
    this.instance = init.instance ?? null;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isBadRequest(): boolean {
    return this.status === 400;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
}
