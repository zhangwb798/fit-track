import { hasCheckedIn, getRecordsByDate, addRecord } from '../data/storage';
import {
  todayStr,
  getWeekDates,
  isSameDay,
  formatDate,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  totalWorkouts,
  totalDays,
  firstWorkoutDate,
  streakDays,
} from '../utils/dateUtils';
import { openPartPicker } from '../components/partPicker';
import { showToast } from '../components/toast';
import { openAddRecordModal } from '../components/recordModal';
import type { BodyPart } from '../types/bodyPart';
import { BODY_PARTS, getPartLabel } from '../types/bodyPart';

export function renderHomePage(container: HTMLElement, onDataChange: () => void): void {
  const today = todayStr();
  const checkedToday = hasCheckedIn(today);
  const total = totalWorkouts();
  const dayCount = totalDays();
  const first = firstWorkoutDate();
  const stickDays = streakDays();

  // 今日已打卡的部位
  const todayRecords = getRecordsByDate(today);
  const todayParts = todayRecords.flatMap((r) => r.parts);

  const weekDates = getWeekDates(new Date());
  const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  // 月视图日期（带补齐）
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const firstDay = monthStart.getDay(); // 0=周日
  const leading = firstDay === 0 ? 6 : firstDay - 1; // 周一开头
  const monthDays: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) monthDays.push(null);
  let d = new Date(monthStart);
  while (d <= monthEnd) {
    monthDays.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div class="page-title">今天也要加油 💪</div>
        <div class="page-subtitle">${new Date().getFullYear()}年${
          new Date().getMonth() + 1
        }月${new Date().getDate()}日 · 周${weekdayLabels[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}</div>
      </div>

      <!-- 打卡按钮 -->
      <div class="card" style="text-align:center; padding: 28px 16px;">
        <button class="checkin-btn ${checkedToday ? 'checked' : ''}" id="checkin-btn">
          <span class="icon">${checkedToday ? '✓' : '🏋️'}</span>
          <span>${checkedToday ? '已打卡' : '今天打卡'}</span>
          <span class="small-text">${checkedToday ? '继续保持' : '点击记录'}</span>
        </button>

        ${
          todayParts.length > 0
            ? `<div style="margin-top:16px; font-size:13px; color: var(--color-text-muted);">
                 今日部位：${[...new Set(todayParts)].map((p) => getPartLabel(p)).join('、')}
               </div>`
            : ''
        }
      </div>

      <div class="section-gap"></div>

      <!-- 数据总览 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${total}</div>
          <div class="stat-label">累计健身次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: var(--color-success);">${dayCount}</div>
          <div class="stat-label">打卡天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #5B8DEF;">${stickDays}</div>
          <div class="stat-label">坚持天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #A66EFF;">${
            stickDays > 0 ? Math.min(100, Math.round((total / stickDays) * 100)) : 0
          }%</div>
          <div class="stat-label">总出勤率</div>
        </div>
      </div>

      <div class="section-gap"></div>

      <!-- 本周出勤 -->
      <div class="card">
        <div class="card-title">
          <span>本周出勤</span>
          <span class="muted">${formatDate(startOfWeek(new Date())).slice(5)} - ${formatDate(
            endOfWeek(new Date()),
          ).slice(5)}</span>
        </div>
        <div class="week-calendar">
          ${weekdayLabels.map((w) => `<div class="weekday">${w}</div>`).join('')}
          ${weekDates
            .map((date) => {
              const checked = hasCheckedIn(formatDate(date));
              const isToday = isSameDay(date, new Date());
              return `
                <div class="cal-cell ${isToday ? 'today' : ''}">
                  <span>${date.getDate()}</span>
                  <span class="dot ${checked ? '' : 'none'}"></span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <div class="section-gap"></div>

      <!-- 本月出勤 -->
      <div class="card">
        <div class="card-title">
          <span>本月出勤</span>
          <button class="text-primary" id="btn-makeup" style="font-size:13px;">补打卡</button>
        </div>
        <div class="week-calendar" style="margin-bottom: 4px;">
          ${weekdayLabels.map((w) => `<div class="weekday">${w}</div>`).join('')}
        </div>
        <div class="month-calendar">
          ${monthDays
            .map((date) => {
              if (!date) {
                return `<div class="m-cal-cell other-month"></div>`;
              }
              const checked = hasCheckedIn(formatDate(date));
              const isToday = isSameDay(date, new Date());
              return `
                <div class="m-cal-cell ${isToday ? 'today' : ''} ${checked ? 'checked' : ''}">
                  ${date.getDate()}
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <div class="section-gap"></div>
    </div>
  `;

  // 绑定事件
  const checkinBtn = document.getElementById('checkin-btn');
  checkinBtn?.addEventListener('click', () => {
    if (checkedToday) {
      showToast('今天已经打卡啦～');
      return;
    }
    openPartPicker([], '今天练什么？', (parts) => {
      handleCheckIn(today, parts, onDataChange);
    });
  });

  const makeupBtn = document.getElementById('btn-makeup');
  makeupBtn?.addEventListener('click', () => {
    openAddRecordModal(new Date(), onDataChange);
  });
}

function handleCheckIn(date: string, parts: BodyPart[], onDataChange: () => void): void {
  addRecord(date, parts);
  // 轻震动
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  showToast('打卡成功！继续加油 💪');
  onDataChange();
}

// 用于显示今日部位
function getTodayParts(): string[] {
  const records = getRecordsByDate(todayStr());
  return [...new Set(records.flatMap((r) => r.parts))].map((p) => getPartLabel(p));
}
