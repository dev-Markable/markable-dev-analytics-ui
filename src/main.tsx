import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

// Базовые глобальные стили — порядок важен.
// base.css       — :root vars, html/body/typography
// app-layout.css — sidebar/topbar/content (каркас приложения)
// shared.css     — кросс-виджетные классы (.leaderboard-card,
//                  .activity-badge, .weekly-tooltip — recharts), на которые
//                  рассчитывают несколько виджетов одновременно.
// Per-widget CSS подтягивается самими виджетами через index.ts:
//   `import './styles.css'` рядом с компонентом. Не нужно знать о них здесь.
import './app/styles/base.css';
import './app/styles/app-layout.css';
import './app/styles/shared.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
