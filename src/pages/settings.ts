import { loadRecords, saveRecords } from '../data/storage';
import { totalWorkouts, totalDays, streakDays } from '../utils/dateUtils';
import { openAddRecordModal, openRecordListModal } from '../components/recordModal';
import { openInitialSettingsModal } from '../components/initialSettingsModal';
import { showToast } from '../components/toast';

export function renderSettingsPage(container: HTMLElement, onDataChange: () => void): void {
  const total = totalWorkouts();
  const days = totalDays();
  const stickDays = streakDays();

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div class="page-title">设置 ⚙️</div>
        <div class="page-subtitle">管理你的健身数据</div>
      </div>

      <!-- 数据概览 -->
      <div class="card" style="margin-bottom: 12px; padding: 20px 16px;">
        <div style="text-align: center;">
          <div style="font-size: 32px; font-weight: 700; color: var(--color-primary);">${total}</div>
          <div class="muted" style="margin-top: 4px;">累计打卡次数</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; text-align: center;">
          <div>
            <div style="font-size: 20px; font-weight: 600;">${days}</div>
            <div class="muted" style="font-size: 12px;">打卡天数</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: 600;">${stickDays}</div>
            <div class="muted" style="font-size: 12px;">已坚持</div>
          </div>
        </div>
      </div>

      <!-- 初始数据设置卡片 -->
      <div class="card" style="margin-bottom: 12px; padding: 0; overflow: hidden; border-radius: 16px;">
        <div class="setting-item" id="btn-initial-settings">
          <span>初始数据设置</span>
          <span class="muted" id="initial-summary" style="font-size: 12px;">第一次日期 + 历史次数 ›</span>
        </div>
      </div>

      <!-- 设置项 -->
      <div class="card" style="padding: 0; overflow: hidden; border-radius: 16px;">
        <div class="setting-item" id="btn-add-record">
          <span>补打卡</span>
          <span class="arrow">›</span>
        </div>
        <div class="setting-item" id="btn-manage-records">
          <span>管理打卡记录</span>
          <span class="arrow">›</span>
        </div>
        <div class="setting-item" id="btn-export">
          <span>导出数据 (JSON)</span>
          <span class="arrow">›</span>
        </div>
        <div class="setting-item" id="btn-import">
          <span>导入数据</span>
          <span class="arrow">›</span>
        </div>
      </div>

      <div style="height: 12px;"></div>

      <div class="card" style="padding: 0; overflow: hidden; border-radius: 16px;">
        <div class="setting-item" id="btn-clear" style="color: #FF4D6D;">
          <span>清空所有数据</span>
          <span class="arrow">›</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: var(--color-text-muted);">
        健身记录 · v1.0<br/>
        数据存储在本地浏览器中
      </div>
    </div>
  `;

  document.getElementById('btn-add-record')?.addEventListener('click', () => {
    openAddRecordModal(new Date(), onDataChange);
  });

  document.getElementById('btn-initial-settings')?.addEventListener('click', () => {
    openInitialSettingsModal(onDataChange);
  });

  document.getElementById('btn-manage-records')?.addEventListener('click', () => {
    openRecordListModal(onDataChange);
  });

  document.getElementById('btn-export')?.addEventListener('click', () => {
    const records = loadRecords();
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-records-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('已导出');
  });

  document.getElementById('btn-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result));
          if (!Array.isArray(data)) throw new Error('格式错误');
          if (!confirm(`确认导入 ${data.length} 条记录？将覆盖现有数据。`)) return;
          saveRecords(data);
          showToast('导入成功');
          onDataChange();
        } catch {
          showToast('文件格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
    if (!confirm('真的要清空吗？')) return;
    saveRecords([]);
    showToast('已清空数据');
    onDataChange();
  });
}
