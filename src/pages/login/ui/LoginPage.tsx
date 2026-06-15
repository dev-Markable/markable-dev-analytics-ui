import { useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Input, Skeleton, Typography } from 'antd';
import {
  Activity,
  ClipboardCheck,
  GitCompare,
  Layers,
  LayoutGrid,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { useCurrentUser, useLogin } from '@/entities/auth';
import { useApiError } from '@/shared/api';
import { useDocumentTitle } from '@/shared/hooks';
import { useThemeMode } from '@/features/theme-switch';
import { APP_NAME } from '@/shared/config';
import { ROUTES } from '@/app/router/paths';
import './styles.css';

interface LocationState {
  from?: string;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: readonly Feature[] = [
  { icon: LayoutGrid, title: 'Дашборд', desc: 'Активность и скоринг разработчиков за период' },
  { icon: ClipboardCheck, title: 'Performance Review', desc: 'Досье: метрики, задачи Kaiten, дельты' },
  { icon: Activity, title: 'Активность', desc: 'Паттерны по дням и часам, репозитории' },
  { icon: Layers, title: 'Когорты', desc: 'Retention и переходы тиров по истории' },
  { icon: UsersRound, title: 'Команды', desc: 'Состав, лиды и сводки по командам' },
  { icon: GitCompare, title: 'Сравнение', desc: 'Разработчики бок о бок по метрикам' },
];

export function LoginPage() {
  useDocumentTitle('Вход');
  const mode = useThemeMode();
  const { data: user } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const loginMut = useLogin();
  const [token, setToken] = useState('');
  const lastErrorRef = useRef<string | null>(null);
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
        : error.status === 503
          ? 'GitLab сейчас недоступен — попробуйте войти позже.'
          : (error.detail ?? error.title);

  // react-query очищает error на время pending. Замораживаем последнюю ошибку, чтобы
  // при повторном входе слот не свапался на скелетон и не дёргал высоту.
  if (errorText) lastErrorRef.current = errorText;
  const shownError = loginMut.isPending ? lastErrorRef.current : errorText;
  // Скелетон — только для самого первого входа (ошибки ещё не было).
  const showSkeleton = loginMut.isPending && !lastErrorRef.current;

  const logoSrc = mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-aside">
          <div className="login-brand">
            <img src={logoSrc} alt="" className="login-brand__logo" />
            <Typography.Title level={3} className="login-brand__name">
              {APP_NAME}
            </Typography.Title>
            <Typography.Text type="secondary" className="login-brand__tagline">
              Аналитика и performance-review разработчиков
            </Typography.Text>
          </div>

          {/* Слот фиксированной высоты — место под ошибку зарезервировано заранее,
              разметка не прыгает. Во время запроса — скелетон (без мигания при ретрае). */}
          <div className="login-status" aria-live="polite">
            {showSkeleton ? (
              <Skeleton.Input active block className="login-status__skeleton" />
            ) : shownError ? (
              <Alert type="error" showIcon message={shownError} />
            ) : null}
          </div>

          <span className="login-field-label">GitLab access token</span>
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
            className="login-submit"
            loading={loginMut.isPending}
            disabled={!token.trim()}
            onClick={submit}
          >
            Войти
          </Button>

          <Typography.Paragraph type="secondary" className="login-hint">
            Создайте токен с правом <code>read_user</code> на{' '}
            <Typography.Link
              href="https://scm.x5.ru/-/user_settings/personal_access_tokens"
              target="_blank"
            >
              scm.x5.ru
            </Typography.Link>{' '}
            и вставьте сюда. Токен не сохраняется — он нужен только для входа.
          </Typography.Paragraph>
        </section>

        <aside className="login-hero" aria-hidden="true">
          <div className="login-hero__grid">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="login-feature">
                  <span className="login-feature__icon">
                    <Icon size={20} />
                  </span>
                  <div className="login-feature__title">{feature.title}</div>
                  <div className="login-feature__desc">{feature.desc}</div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
