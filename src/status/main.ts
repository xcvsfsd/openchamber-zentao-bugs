// Work Status 区：待办数（非零高亮）+ 定时刷新开关 + 手动刷新，点击打开本扩展面板。
import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import type { CountAnswer } from '../shared/types.ts';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Missing #root');
root.innerHTML = `<style>
body{margin:0;font:12px/1.5 system-ui,sans-serif}
#root{padding:2px 4px;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.m{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;justify-content:space-between;align-items:center;gap:8px}
.m .l{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m .r{flex:none;font-size:11px;opacity:.65;font-weight:400}
.m b{font-size:13px}
.row{display:flex;gap:4px;align-items:center}
#t{font-size:10.5px;opacity:.65;white-space:nowrap}
button{flex:1;padding:1px 4px;font-size:11.5px;border:1px solid var(--oc-border,var(--border,#8888));border-radius:6px;background:var(--oc-elevated,inherit);color:var(--oc-fg,inherit);cursor:pointer;white-space:nowrap}
button.on{border-color:var(--primary,#3574f0);color:var(--primary,#3574f0);font-weight:700}
</style><div class="m" id="m">禅道: …</div><div class="row"><button id="btn-r" title="手动刷新">↻ 刷新</button><button id="btn-a" title="定时刷新开关（60秒）">⏱ 关</button></div>`;
const m = document.querySelector('#m') as HTMLElement;
const btnR = document.querySelector('#btn-r') as unknown as HTMLButtonElement;
const btnA = document.querySelector('#btn-a') as unknown as HTMLButtonElement;

root.onclick = (e) => {
  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
  void host.openSurface('plugin:zentao-bugs').catch(() => undefined);
};

let auto = false;
let timer: ReturnType<typeof setInterval> | null = null;

const paint = (total: number | null): void => {
  if (total === null) {
    m.style.cssText = '';
    m.textContent = '禅道: 待登录（面板⚙连接）';
    void host.setBadge(null).catch(() => undefined);
    return;
  }
  m.style.cssText = total > 0
    ? 'background:#7f1d1d55;border:1px solid #f8717166;border-radius:8px;padding:0 6px;'
    : '';
  m.innerHTML = '';
  const left = document.createElement('span');
  left.className = 'l';
  const t = document.createElement('span');
  t.textContent = '禅道: 🐞 ';
  left.appendChild(t);
  const n = document.createElement('b');
  n.textContent = String(total);
  if (total > 0) {
    n.style.color = '#f87171';
    const pill = document.createElement('span');
    pill.textContent = ' 待办';
    pill.style.cssText = 'background:#7f1d1d55;border:1px solid #f87171;border-radius:8px;padding:0 6px;font-weight:700;color:#f87171';
    left.append(t, n, document.createTextNode(' '), pill);
  } else {
    left.append(t, n);
  }
  m.appendChild(left);
  if (lastTime) {
    const ts = document.createElement('span');
    ts.className = 'r';
    ts.textContent = lastTime;
    ts.title = '最后刷新时间';
    m.appendChild(ts);
  }
  void host.setBadge(total > 0 ? total : null).catch(() => undefined);
};

let lastTime = '';
const stamp = (): string => {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const poll = async (): Promise<void> => {
  if (document.hidden) return;
  btnR.disabled = true;
  btnR.textContent = '↻…';
  try {
    let r = await host.serviceRequest({ method: 'GET', path: '/count?days=7' });
    let j = JSON.parse(r.body) as CountAnswer;
    if (!j.ok && j.error === 'need-config') {
      // service 重启丢 token：用存的配置自动建连一次
      try {
        const c = (await host.storage.get('ztb-cfg', { scope: 'device' })) as { base?: string; account?: string; password?: string } | undefined;
        if (c?.base && c?.account && c?.password) {
          await host.serviceRequest({ method: 'POST', path: '/login', body: JSON.stringify({ baseUrl: c.base, account: c.account, password: c.password }) });
          r = await host.serviceRequest({ method: 'GET', path: '/count?days=7' });
          j = JSON.parse(r.body) as CountAnswer;
        }
      } catch { /* 保持未登录态 */ }
    }
    if (!j.ok) {
      if (j.error === 'need-config') paint(null);
      else m.textContent = '禅道: 不可用';
      return;
    }
    lastTime = stamp();
    paint(j.total);
    btnR.title = `手动刷新（上次 ${lastTime}）`;
    const h = Math.ceil(root.getBoundingClientRect().height);
    void host.setHeight(h).catch(() => undefined);
  } catch {
    m.textContent = '禅道: 未启用本地服务';
  } finally {
    btnR.disabled = false;
    btnR.textContent = '↻ 刷新';
  }
};

const setAuto = (on: boolean): void => {
  auto = on;
  btnA.textContent = on ? '⏱ 开' : '⏱ 关';
  btnA.classList.toggle('on', on);
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (on) timer = setInterval(() => void poll(), 60_000);
};

btnR.onclick = (e) => {
  e.stopPropagation();
  void poll();
};
btnA.onclick = (e) => {
  e.stopPropagation();
  setAuto(!auto);
  try {
    void host.storage.set('ztb-autoref', auto ? '1' : '', { scope: 'device' });
  } catch { /* 忽略 */ }
};

host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  void (async () => {
    try {
      const v = await host.storage.get('ztb-autoref', { scope: 'device' });
      if (v === '1') setAuto(true);
    } catch { /* 默认关 */ }
  })();
  void poll();
});
