import { loadConfig, saveConfig, type FitnessConfig } from '../data/config';
import { showToast } from './toast';

type OnSaved = () => void;
type OnClose = () => void;

export function openInitialSettingsModal(onSaved: OnSaved, onClose?: OnClose): void {
  const config = loadConfig();

  const mask = document.createElement('div');
  mask.className = 'modal-mask';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const titleEl = document.createElement('div');
  titleEl.className = 'modal-title';
  titleEl.textContent = '初始数据设置';
  content.appendChild(titleEl);

  // 说明
  const desc = document.createElement('div');
  desc.style.cssText = 'font-size: 12px; color: var(--color-text-muted); margin-bottom: 16px; line-height: 1.6;';
  desc.innerHTML =
    '设置你人生中第一次健身的日期和历史累计次数，' +
    '用于计算累计健身总次数和坚持天数。<br/>' +
    '（不影响实际打卡记录）';
  content.appendChild(desc);

  // 第一次健身日期
  const dateLabel = document.createElement('div');
  dateLabel.style.cssText = 'font-size: 14px; margin-bottom: 8px;';
  dateLabel.textContent = '第一次健身日期';
  content.appendChild(dateLabel);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = config.firstWorkoutDate ?? '';
  dateInput.style.cssText =
    'width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 10px; font-size: 14px; margin-bottom: 16px;';
  content.appendChild(dateInput);

  // 历史累计次数
  const countLabel = document.createElement('div');
  countLabel.style.cssText = 'font-size: 14px; margin-bottom: 8px;';
  countLabel.textContent = '历史累计健身次数（在此之前的次数）';
  content.appendChild(countLabel);

  const countInput = document.createElement('input');
  countInput.type = 'number';
  countInput.min = '0';
  countInput.value = String(config.historicalCount ?? 0);
  countInput.placeholder = '例如：30';
  countInput.style.cssText =
    'width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 10px; font-size: 14px;';
  content.appendChild(countInput);

  // 清空按钮
  const clearBtn = document.createElement('button');
  clearBtn.style.cssText =
    'margin-top: 12px; font-size: 12px; color: var(--color-text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;';
  clearBtn.textContent = '清空初始数据（恢复自动推算）';
  clearBtn.addEventListener('click', () => {
    if (!confirm('确定清空初始数据吗？将自动从打卡记录推算。')) return;
    saveConfig({});
    showToast('已清空');
    onSaved();
    close();
  });
  content.appendChild(clearBtn);

  // 按钮组
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'display: flex; gap: 10px; margin-top: 20px;';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-ghost';
  cancelBtn.style.flex = '1';
  cancelBtn.textContent = '取消';
  cancelBtn.addEventListener('click', close);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary';
  saveBtn.style.flex = '2';
  saveBtn.textContent = '保存';
  saveBtn.addEventListener('click', () => {
    const dateVal = dateInput.value.trim();
    const countVal = parseInt(countInput.value, 10);

    const next: FitnessConfig = {};
    if (dateVal) {
      // 简单校验
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) {
        showToast('请输入有效日期');
        return;
      }
      if (d.getTime() > Date.now()) {
        showToast('日期不能是未来');
        return;
      }
      next.firstWorkoutDate = dateVal;
    }
    if (!isNaN(countVal) && countVal >= 0) {
      next.historicalCount = countVal;
    } else {
      next.historicalCount = 0;
    }

    saveConfig(next);
    showToast('保存成功');
    onSaved();
    close();
  });

  btnWrap.appendChild(cancelBtn);
  btnWrap.appendChild(saveBtn);
  content.appendChild(btnWrap);

  mask.appendChild(content);
  document.body.appendChild(mask);

  function close(): void {
    mask.remove();
    onClose?.();
  }

  mask.addEventListener('click', (e) => {
    if (e.target === mask) close();
  });
}
