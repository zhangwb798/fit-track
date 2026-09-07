import { BODY_PARTS, getPartLabel, getPartColor, type BodyPart } from '../types/bodyPart';

interface DonutSegment {
  part: BodyPart;
  count: number;
  percentage: number;
}

/**
 * 生成 SVG 环形图
 * @param segments 数据段
 * @param size 直径
 * @param strokeWidth 环宽
 */
export function renderDonutChart(
  segments: DonutSegment[],
  size = 160,
  strokeWidth = 18,
): string {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (segments.length === 0) {
    // 空状态：灰色环
    return `
      <svg viewBox="0 0 ${size} ${size}">
        <circle cx="${center}" cy="${center}" r="${radius}"
          fill="none" stroke="#EEF0F3" stroke-width="${strokeWidth}" />
      </svg>
    `;
  }

  let offset = 0;
  const paths = segments
    .map((seg) => {
      const dashLength = (seg.percentage / 100) * circumference;
      const color = getPartColor(seg.part);
      const path = `
        <circle cx="${center}" cy="${center}" r="${radius}"
          fill="none" stroke="${color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${dashLength} ${circumference}"
          stroke-dashoffset="${-offset}"
          stroke-linecap="butt" />
      `;
      offset += dashLength;
      return path;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${size} ${size}">
      <circle cx="${center}" cy="${center}" r="${radius}"
        fill="none" stroke="#F0F2F5" stroke-width="${strokeWidth}" />
      ${paths}
    </svg>
  `;
}

export function renderPartLegend(segments: DonutSegment[], total: number): string {
  if (segments.length === 0) {
    return '<div class="empty-state">暂无数据，快去打卡吧～</div>';
  }
  return `
    <div class="part-legend">
      ${segments
        .map((s) => {
          const color = getPartColor(s.part);
          const pct = total > 0 ? ((s.count / total) * 100).toFixed(0) : '0';
          return `
            <div class="legend-item">
              <span class="legend-dot" style="background:${color}"></span>
              <span class="legend-name">${getPartLabel(s.part)}</span>
              <span class="legend-pct">${s.count} 次 · ${pct}%</span>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

// 统计数据转 segments
export function buildSegments(
  stats: { part: BodyPart; count: number }[],
): { segments: DonutSegment[]; total: number } {
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const segments: DonutSegment[] = stats.map((s) => ({
    part: s.part,
    count: s.count,
    percentage: total > 0 ? (s.count / total) * 100 : 0,
  }));
  return { segments, total };
}

export { BODY_PARTS };
