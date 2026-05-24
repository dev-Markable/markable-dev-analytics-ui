import { Link } from 'react-router-dom';
import { useThemeMode } from '@/features/theme-switch';
import { APP_SHORT_NAME } from '@/shared/config';
import { ROUTES } from '@/app/router/paths';

interface BrandProps {
  collapsed?: boolean;
}

export function Brand({ collapsed = false }: BrandProps) {
  const mode = useThemeMode();
  const src = mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <Link to={ROUTES.dashboard} className="app-sidebar-brand" aria-label={APP_SHORT_NAME}>
      <img src={src} alt="" className="app-sidebar-brand__logo" />
      {!collapsed && <span className="app-sidebar-brand__name">{APP_SHORT_NAME}</span>}
    </Link>
  );
}
