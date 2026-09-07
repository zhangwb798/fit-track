import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  attendanceRate,
  partsStats,
} from '../utils/dateUtils';
import { buildSegments, renderDonutChart, renderPartLegend } from '../components/donutChart';

type Period = 'week' | 'month' | 'year';

let currentPeriod: Period = 'week';

export function renderStatsPage(container: HTMLElement, _onDataChange: () => void): void {
  const now = new Date();

  function getRange(p: Period): { start: Date; end: Date; label: string } {
    if (p === 'week') {
      return {
        start: startOfWeek(now),
        end: now,
        label: '本周',
      };
    }
    if (p === 'month') {
      return { start: startOfMonth(now), end: now, label: '本月' };
    }
    return { start: startOfYear(now), end: now, label: '本年' };
  }

  const { start, end } = getRange(currentPeriod);
  const rate = attendanceRate(start, end);
  const pct = (rate.rate * 100).toFixed(0);
  const stats = partsStats(start, end);
  const { segments, total } = buildSegments(stats);

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div class="page-title">数据统计 📊</div>
        <div class="page-subtitle">看看你的运动成果</div>
      </div>

      <!-- 出勤率卡片 -->
      <div class="card">
        <div class="card-title">
          <span>出勤率</span>
          <div class="segmented" id="period-switch">
            <button data-p="week" class="${currentPeriod === 'week' ? 'active' : ''}">本周</button>
            <button data-p="month" class="${currentPeriod === 'month' ? 'active' : ''}">本月</button>
            <button data-p="year" class="${currentPeriod === 'year' ? 'active' : ''}">本年</button>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 20px; padding: 8px 0 4px;">
          <div style="flex:1;">
            <div style="font-size: 36px; font-weight: 700; color: var(--color-success);">
              ${pct}<span style="font-size: 18px;">%</span>
            </div>
            <div class="muted" style="margin-top: 4px;">
              打卡 ${rate.checked} / ${rate.total} 天
            </div>
          </div>
          <div style="flex:1;">
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <div class="muted" style="margin-top: 6px; text-align: right;">
              ${rate.checked >= 3 ? '表现不错 👍' : '继续加油 💪'}
            </div>
          </div>
        </div>
      </div>

      <div class="section-gap"></div>

      <!-- 部位占比 -->
      <div class="card">
        <div class="card-title">
          <span>部位占比</span>
          <span class="muted">共 ${total} 部位次</span>
        </div>

        <div class="donut-chart">
          ${renderDonutChart(segments)}
          <div class="donut-center">
            <div class="num">${total}</div>
            <div class="lbl">总部位次</div>
          </div>
        </div>

        ${renderPartLegend(segments, total)}
      </div>

      <div class="section-gap"></div>
    </div>
  `;

  // 切换周期
  const switchEl = document.getElementById('period-switch');
  switchEl?.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-p') as Period;
      if (p && p !== currentPeriod) {
        currentPeriod = p;
        renderStatsPage(container, _onDataChange);
      }
    });
  });
}
