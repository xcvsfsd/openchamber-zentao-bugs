// Work Status 区：待办数与手动刷新放在分区标题栏（宿主渲染控件），区内只留上次刷新时间与定时开关。
// 点击空白处打开本扩展面板。
import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import type { CountAnswer } from '../shared/types.ts';

const host = connectHost();

// 标题栏控件回调必须同步注册：数量点开面板并让面板自动刷新一次，↻ 只刷新
host.onStatusControl((e) => {
  if (e.id === 'refresh') void poll();
  else if (e.id === 'count') void openPanelWithRefresh();
});

const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Missing #root');

// 打开面板前留个一次性标记，面板读到就按一次「刷新」
const openPanelWithRefresh = async (): Promise<void> => {
  try {
    await host.storage.set('ztb-open-refresh', String(Date.now()), { scope: 'device' });
  } catch { /* 标记失败也照常打开 */ }
  void host.openSurface('plugin:zentao-bugs').catch(() => undefined);
};
root.innerHTML = `<style>
body{margin:0;font:12px/1.5 system-ui,sans-serif}
#root{padding:2px 4px;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.m{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;opacity:.75}
.row{display:flex;gap:4px;align-items:center}
button{flex:1;padding:1px 4px;font-size:11.5px;border:1px solid var(--oc-border,var(--border,#8888));border-radius:6px;background:var(--oc-elevated,inherit);color:var(--oc-fg,inherit);cursor:pointer;white-space:nowrap}
button.on{border-color:var(--primary,#3574f0);color:var(--primary,#3574f0);font-weight:700}
button[hidden]{display:none}
</style><div class="row"><button id="btn-r" title="手动刷新" hidden>↻</button><button id="btn-a" title="定时刷新开关（60秒）">定时刷新:关</button></div><div class="m" id="m"></div>`;

const m = document.querySelector('#m') as HTMLElement;
const btnR = document.querySelector('#btn-r') as HTMLButtonElement;
const btnA = document.querySelector('#btn-a') as HTMLButtonElement;

root.onclick = (e) => {
  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
  void host.openSurface('plugin:zentao-bugs').catch(() => undefined);
};

let auto = false;
let timer: ReturnType<typeof setInterval> | null = null;
let total: number | null = null;
let busy = false;
let headerControls = false;
let lastTime = '';

const stamp = (): string => {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// 标题栏：待办数（只读按钮）+ 刷新；老宿主退回区内刷新按钮
const publishControls = async (): Promise<void> => {
  const controls: { kind: 'button'; id: string; label: string; disabled?: boolean }[] = [];
  if (total !== null) controls.push({ kind: 'button', id: 'count', label: `🐞 ${total} 待办` });
  controls.push({ kind: 'button', id: 'refresh', label: busy ? '↻…' : '↻', disabled: busy });
  try {
    await host.setStatusControls(controls);
    headerControls = true;
    btnR.hidden = true;
  } catch {
    headerControls = false;
    btnR.hidden = false;
    btnR.disabled = busy;
    btnR.textContent = busy ? '↻…' : '↻';
  }
};

const fit = (): void => {
  const h = Math.ceil(root.getBoundingClientRect().height);
  void host.setHeight(h).catch(() => undefined);
};

const paint = (n: number | null): void => {
  total = n;
  if (n === null) {
    m.textContent = '待登录（面板⚙连接）';
  } else {
    m.textContent = lastTime ? `上次刷新 ${lastTime}` : '未刷新';
    m.style.color = n > 0 ? '#f87171' : '';
    m.style.fontWeight = n > 0 ? '700' : '';
  }
  void publishControls();
  void host.setBadge(n !== null && n > 0 ? n : null).catch(() => undefined);
  fit();
};

const poll = async (): Promise<void> => {
  if (document.hidden || busy) return;
  busy = true;
  await publishControls();
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
      else { m.textContent = '禅道不可用'; void publishControls(); }
      return;
    }
    lastTime = stamp();
    paint(j.total);
  } catch {
    m.textContent = '未启用本地服务';
    void publishControls();
  } finally {
    busy = false;
    await publishControls();
  }
};

const setAuto = (on: boolean): void => {
  auto = on;
  btnA.textContent = on ? '定时刷新:开' : '定时刷新:关';
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

let booted = false;
host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  // 新宿主把待办数与刷新放到分区标题栏；老宿主保留区内刷新按钮
  if (ctx.features?.statusControls !== true) btnR.hidden = false;
  else void publishControls();
  void (async () => {
    try {
      const v = await host.storage.get('ztb-autoref', { scope: 'device' });
      if (v === '1') setAuto(true);
    } catch { /* 默认关 */ }
    // 静默保活：service 重启丢 token 就用存的配置重登，不刷界面
    try {
      const c = (await host.storage.get('ztb-cfg', { scope: 'device' })) as { base?: string; account?: string; password?: string } | undefined;
      if (c?.base && c?.account && c?.password) {
        await host.serviceRequest({ method: 'POST', path: '/login', body: JSON.stringify({ baseUrl: c.base, account: c.account, password: c.password }) });
      }
    } catch { /* 忽略 */ }
    // 自动刷只在首帧跑一次；切会话/模型重连等不再触发
    if (booted) return;
    booted = true;
    void poll();
  })();
});
