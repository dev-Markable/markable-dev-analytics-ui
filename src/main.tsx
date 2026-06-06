import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

// Styles разрезаны по доменам. Порядок важен: base → shared-ui →
// app-layout → page-specific. AntD cssVar(:root) выставляет переменные
// сам, поэтому override в любом из ниже-стоящих файлов работает.
import './app/styles/base.css';
import './app/styles/shared-ui.css';
import './app/styles/app-layout.css';
import './app/styles/dashboard.css';
import './app/styles/weekly.css';
import './app/styles/activity.css';
import './app/styles/profile.css';
import './app/styles/compare.css';
import './app/styles/perf-review.css';
import './app/styles/teams.css';
import './app/styles/collection.css';
import './app/styles/settings.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
