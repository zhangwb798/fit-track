import { BODY_PARTS, type BodyPart } from '../types/bodyPart';

type OnConfirm = (parts: BodyPart[]) => void;
type OnClose = () => void;

export function openPartPicker(
  initialParts: BodyPart[],
  title: string,
  onConfirm: OnConfirm,
  onClose?: OnClose,
): void {
  const selected = new Set<BodyPart>(initialParts);

  const mask = document.createElement('div');
  mask.className = 'modal-mask';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const titleEl = document.createElement('div');
  titleEl.className = 'modal-title';
  titleEl.textContent = title;
  content.appendChild(titleEl);

  const selector = document.createElement('div');
  selector.className = 'part-selector';

  function renderParts(): void {
    selector.innerHTML = '';
    for (const p of BODY_PARTS) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `part-chip ${selected.has(p.key) ? 'active' : ''}`;
      chip.innerHTML = `<span>${p.icon}</span><span>${p.label}</span>`;
      chip.addEventListener('click', () => {
        if (selected.has(p.key)) {
          selected.delete(p.key);
        } else {
          selected.add(p.key);
        }
        renderParts();
      });
      selector.appendChild(chip);
    }
  }
  renderParts();
  content.appendChild(selector);

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
  okBtn.textContent = '确认';
  okBtn.addEventListener('click', () => {
    if (selected.size === 0) {
      okBtn.textContent = '请至少选择一个部位';
      setTimeout(() => {
        okBtn.textContent = '确认';
      }, 1000);
      return;
    }
    onConfirm(Array.from(selected));
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
