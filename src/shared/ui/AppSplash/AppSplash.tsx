import { useThemeMode } from '@/features/theme-switch';
import { APP_SHORT_NAME } from '@/shared/config';
import './styles.css';

interface AppSplashProps {
  /** Подпись под логотипом. По умолчанию не показывается — переход должен быть тихим. */
  label?: string;
}

/**
 * Брендированная заставка на переходных состояниях: проверка сессии после OAuth-возврата,
 * загрузка lazy-чанка страницы. Логотип + тонкий indeterminate-бар вместо голой строки
 * текста со спиннером — переход читается как часть приложения, а не как «повисло».
 */
export function AppSplash({ label }: AppSplashProps) {
  const mode = useThemeMode();
  const src = mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <div className="app-splash" role="status" aria-live="polite">
      <div className="app-splash__mark">
        <img src={src} alt="" className="app-splash__logo" />
        <span className="app-splash__name">{APP_SHORT_NAME}</span>
      </div>
      <span className="app-splash__bar" aria-hidden />
      {label && <span className="app-splash__label">{label}</span>}
    </div>
  );
}
