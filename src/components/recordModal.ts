import { addRecord, deleteRecord, loadRecords, type WorkoutRecord } from '../data/storage';
import { BODY_PARTS, getPartLabel, type BodyPart } from '../types/bodyPart';
import { formatDate, parseDate } from '../utils/dateUtils';
import { openPartPicker } from './partPicker';
import { showToast } from './toast';

type OnClose = () => void;

function formatDateLabel(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function openAddRecordModal(
  initialDate: Date,
  onSaved: () => void,
  onClose?: OnClose,
): void {
  let currentDate = new Date(initialDate);
  let selectedParts: BodyPart[] = [];

  const mask = document.createElement('div');
  mask.className = 'modal-mask';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const titleEl = document.createElement('div');
  titleEl.className = 'modal-title';
  titleEl.textContent = '补打卡';
  content.appendChild(titleEl);

  // 日期选择
  const dateRow = document.createElement('div');
  dateRow.className = 'row-between';
  dateRow.style.cssText = 'padding: 10px 4px;';
  const dateLabel = document.createElement('span');
  dateLabel.textContent = '日期';
  const dateVal = document.createElement('span');
  dateVal.className = 'text-primary';
  dateVal.textContent = formatDateLabel(currentDate);
  dateRow.appendChild(dateLabel);
  dateRow.appendChild(dateVal);
  content.appendChild(dateRow);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = formatDate(currentDate);
  dateInput.style.cssText = 'width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 10px; font-size: 14px; margin-bottom: 16px;';
  dateInput.addEventListener('change', () => {
    if (dateInput.value) {
      currentDate = parseDate(dateInput.value);
      dateVal.textContent = formatDateLabel(currentDate);
    }
  });
  content.appendChild(dateInput);

  // 部位选择
  const partLabel = document.createElement('div');
  partLabel.style.cssText = 'font-size: 14px; margin-bottom: 8px;';
  partLabel.textContent = '锻炼部位';
  content.appendChild(partLabel);

  const partDisplay = document.createElement('div');
  partDisplay.style.cssText =
    'min-height: 44px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 10px; font-size: 13px; color: var(--color-text-muted); cursor: pointer;';
  partDisplay.textContent = '点击选择锻炼部位';
  partDisplay.addEventListener('click', () => {
    openPartPicker(
      selectedParts,
      '选择锻炼部位',
      (parts) => {
        selectedParts = parts;
        if (parts.length === 0) {
          partDisplay.textContent = '点击选择锻炼部位';
          partDisplay.style.color = 'var(--color-text-muted)';
        } else {
          partDisplay.innerHTML = parts
            .map((p) => {
              const part = BODY_PARTS.find((x) => x.key === p);
              return `<span style="display:inline-block;margin-right:6px;">${part?.icon ?? ''}${part?.label ?? p}</span>`;
            })
            .join('');
          partDisplay.style.color = 'var(--color-text)';
        }
      },
    );
  });
  content.appendChild(partDisplay);

  // 按钮
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'display: flex; gap: 10px; margin-top: 20px;';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-ghost';
  cancelBtn.style.flex = '1';
  cancelBtn.textContent = '取消';
  cancelBtn.addEventListener('click', close);

  const okBtn = document.createElement('button');
  okBtn.className = 'btn btn-primary';
  okBtn.style.flex = '2';
  okBtn.textContent = '保存打卡';
  okBtn.addEventListener('click', () => {
    if (selectedParts.length === 0) {
      showToast('请选择锻炼部位');
      return;
    }
    addRecord(formatDate(currentDate), selectedParts);
    showToast('打卡成功');
    onSaved();
    close();
  });

  btnWrap.appendChild(cancelBtn);
  btnWrap.appendChild(okBtn);
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

// 打卡记录列表 + 删除
export function openRecordListModal(onClose?: OnClose): void {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const titleEl = document.createElement('div');
  titleEl.className = 'modal-title';
  titleEl.textContent = '全部打卡记录';
  content.appendChild(titleEl);

  const list = document.createElement('div');
  list.style.cssText = 'max-height: 50vh; overflow-y: auto; margin: 0 -4px;';

  function renderList(): void {
    const records = loadRecords().sort((a, b) => (a.date < b.date ? 1 : -1));
    list.innerHTML = '';
    if (records.length === 0) {
      list.innerHTML = '<div class="empty-state">暂无打卡记录</div>';
      return;
    }

    // 按日期分组
    const groups = new Map<string, WorkoutRecord[]>();
    for (const r of records) {
      const arr = groups.get(r.date) ?? [];
      arr.push(r);
      groups.set(r.date, arr);
    }

    for (const [date, recs] of groups) {
      const dateHead = document.createElement('div');
      dateHead.style.cssText =
        'padding: 10px 4px 6px; font-size: 12px; color: var(--color-text-muted);';
      dateHead.textContent = date;
      list.appendChild(dateHead);

      for (const r of recs) {
        const item = document.createElement('div');
        item.className = 'record-item';
        const left = document.createElement('div');
        const partsStr = r.parts.map((p) => getPartLabel(p)).join('、');
        left.innerHTML = `<div class="record-parts">${partsStr}</div>`;
        const delBtn = document.createElement('button');
        delBtn.className = 'del-btn';
        delBtn.textContent = '删除';
        delBtn.addEventListener('click', () => {
          if (confirm('确定删除这条打卡记录吗？')) {
            deleteRecord(r.id);
            showToast('已删除');
            renderList();
          }
        });
        item.appendChild(left);
        item.appendChild(delBtn);
        list.appendChild(item);
      }
    }
  }
  renderList();
  content.appendChild(list);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-ghost';
  closeBtn.style.cssText = 'width: 100%; margin-top: 16px;';
  closeBtn.textContent = '关闭';
  closeBtn.addEventListener('click', close);
  content.appendChild(closeBtn);

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
