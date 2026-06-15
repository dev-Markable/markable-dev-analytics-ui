import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input, Typography } from 'antd';
import { KeyRound } from 'lucide-react';
import { useCurrentUser, useLogin } from '@/entities/auth';
import { useApiError } from '@/shared/api';
import { useDocumentTitle } from '@/shared/hooks';
import { ROUTES } from '@/app/router/paths';
import './styles.css';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  useDocumentTitle('Вход');
  const { data: user } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const loginMut = useLogin();
  const [token, setToken] = useState('');
  const error = useApiError(loginMut.error);

  const target = (location.state as LocationState | null)?.from ?? ROUTES.dashboard;

  // Уже вошли (или вернулись на /login по прямой ссылке) — уводим в приложение.
  if (user) {
    return <Navigate to={target} replace />;
  }

  const submit = (): void => {
    const value = token.trim();
    if (!value) return;
    loginMut.mutate(value, {
      onSuccess: () => navigate(target, { replace: true }),
    });
  };

  const errorText = !error
    ? null
    : error.status === 403
      ? 'Нет доступа к отслеживаемым проектам в GitLab. Обратитесь к администратору.'
      : error.status === 401
        ? 'Невалидный токен. Проверьте, что это актуальный GitLab access token.'
        : (error.detail ?? error.title);

  return (
    <div className="login-screen">
      <Card variant="borderless" className="login-card">
        <div className="login-card__head">
          <span className="login-card__icon">
            <KeyRound size={20} />
          </span>
          <Typography.Title level={3} style={{ margin: 0 }}>
            DevPulse
          </Typography.Title>
          <Typography.Text type="secondary">Вход по GitLab access token</Typography.Text>
        </div>

        {errorText && (
          <Alert type="error" showIcon message={errorText} style={{ marginBottom: 16 }} />
        )}

        <Input.Password
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onPressEnter={submit}
          placeholder="glpat-…"
          size="large"
          autoFocus
          disabled={loginMut.isPending}
        />
        <Button
          type="primary"
          size="large"
          block
          style={{ marginTop: 12 }}
          loading={loginMut.isPending}
          disabled={!token.trim()}
          onClick={submit}
        >
          Войти
        </Button>

        <Typography.Paragraph type="secondary" className="login-card__hint">
          Создайте токен с правом <code>read_user</code> на{' '}
          <Typography.Link
            href="https://scm.x5.ru/-/user_settings/personal_access_tokens"
            target="_blank"
          >
            scm.x5.ru
          </Typography.Link>{' '}
          и вставьте сюда. Токен не сохраняется — он нужен только для входа.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
