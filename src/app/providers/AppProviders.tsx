import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useThemeMode } from '@/features/theme-switch';
import { AntdProvider } from './AntdProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const mode = useThemeMode();
  return (
    <AntdProvider mode={mode}>
      <BrowserRouter>{children}</BrowserRouter>
    </AntdProvider>
  );
}
