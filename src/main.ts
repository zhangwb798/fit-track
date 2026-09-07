import { renderHomePage } from './pages/home';
import { renderStatsPage } from './pages/stats';
import { renderSettingsPage } from './pages/settings';

type TabKey = 'home' | 'stats' | 'settings';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'stats', label: '统计', icon: 'stats' },
  { key: 'settings', label: '设置', icon: 'settings' },
];

const ICONS: Record<string, string> = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

let activeTab: TabKey = 'home';

export function initApp(): void {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App element not found');
    return;
  }

  app.innerHTML = `
    <div class="app-container">
      <div id="page-content"></div>
      <nav class="tab-bar" id="tab-bar"></nav>
    </div>
  `;

  const pageContent = document.getElementById('page-content') as HTMLElement;
  const tabBar = document.getElementById('tab-bar') as HTMLElement;

  function renderTabBar(): void {
    tabBar.innerHTML = TABS.map((t) => `
      <button class="tab-item ${activeTab === t.key ? 'active' : ''}" data-tab="${t.key}">
        ${ICONS[t.icon]}
        <span>${t.label}</span>
      </button>
    `).join('');

    tabBar.querySelectorAll('.tab-item').forEach((el) => {
      el.addEventListener('click', () => {
        const key = el.getAttribute('data-tab') as TabKey;
        if (key && key !== activeTab) {
          activeTab = key;
          renderTabBar();
          renderPage();
          window.scrollTo(0, 0);
        }
      });
    });
  }

  function renderPage(): void {
    const onDataChange = (): void => {
      renderPage();
    };
    if (activeTab === 'home') {
      renderHomePage(pageContent, onDataChange);
    } else if (activeTab === 'stats') {
      renderStatsPage(pageContent, onDataChange);
    } else {
      renderSettingsPage(pageContent, onDataChange);
    }
  }

  renderTabBar();
  renderPage();
}
