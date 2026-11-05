// 禅道 Bug 面板：我的前10（创建时间倒序）、提取发会话、快速指派、浏览器打开。
import { connectHost, HostRequestError } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { pinyin } from 'pinyin-pro';
import type { AssignAnswer, BugDetailAnswer, BugItem, BugListAnswer, CountAnswer, UserEntry, UsersAnswer } from '../shared/types.ts';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Missing #root');

root.innerHTML = `
<style>
:root{color-scheme:light dark}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;font:15px/1.6 system-ui,sans-serif}
#root{padding:10px;display:flex;flex-direction:column;gap:10px;min-height:100%;max-width:100%;overflow-x:hidden}
.top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.top .t{font-weight:700}
button{padding:8px 14px;font-size:14px;border:1px solid var(--oc-border,var(--border,#8888));border-radius:8px;background:var(--oc-elevated,inherit);color:var(--oc-fg,inherit);cursor:pointer;white-space:nowrap}
button.primary{background:var(--primary,#3574f0);border-color:transparent;color:#fff}
button:disabled{opacity:.5}
button.small{padding:4px 10px;font-size:13px}
.card{border:1px solid #8883;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}
.card .title{font-weight:700;word-break:break-all}
.card .meta{font-size:13px;opacity:.75}
.card .ops{display:flex;gap:8px;flex-wrap:wrap}
.sev{font-weight:700}
textarea,input[type=text],input[type=password]{width:100%;padding:8px 10px;font-size:14px;border:1px solid var(--oc-border,var(--border,#8888));border-radius:8px;background:var(--oc-elevated,inherit);color:var(--oc-fg,inherit)}
textarea{min-height:56px;resize:vertical}
select{padding:8px 10px;font-size:14px;border:1px solid var(--oc-border,var(--border,#8888));border-radius:8px;background:var(--oc-elevated,#fff);color:var(--oc-fg,inherit);max-width:100%}
select option{background:var(--oc-elevated,#fff);color:var(--oc-fg,#111)}
.assign{border-top:1px dashed #8884;padding-top:8px;display:flex;flex-direction:column;gap:8px}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chips button{font-size:12.5px;padding:4px 10px}
.row{display:flex;gap:8px}
.mut{font-size:13.5px;opacity:.7}
.err{background:#7f1d1d22;border:1px solid #7f1d1d66;border-radius:8px;padding:10px;font-size:14px}
.ok{color:#4ade80}
</style>
<div class="top">
  <span class="t">🐞 我的 Bug</span>
  <span id="total" class="mut"></span>
  <span style="flex:1"></span>
  <button id="btn-cfg" class="small" title="禅道连接设置">⚙</button>
  <button id="btn-refresh" class="small" title="刷新">↻</button>
</div>
<div id="cfg" class="card" hidden>
  <input id="cfg-base" type="text" placeholder="禅道地址，如 http://10.1.20.201:8088/zentao" />
  <div class="row"><input id="cfg-acc" type="text" placeholder="账号" style="flex:1" /></div>
  <div class="row"><input id="cfg-pwd" type="password" placeholder="密码" style="flex:1" /></div>
  <div><button id="btn-login" class="primary small">保存并连接</button> <span id="cfg-out" class="mut"></span></div>
  <div class="mut">配置只存本浏览器（localStorage），service 内存换 token，不落盘。</div>
</div>
<div id="msg" class="mut"></div>
<div id="list" style="display:flex;flex-direction:column;gap:10px"></div>
`;

const $ = <T extends HTMLElement>(id: string): T => document.querySelector(`#${id}`) as T;
const totalEl = $('total');
const msgEl = $('msg');
const listEl = $('list');
const btnRefresh = $('btn-refresh') as unknown as HTMLButtonElement;

let baseUrl = '';
let users: (UserEntry & { py: string; init: string })[] = [];
let favs: Record<string, number> = {};
// 持久化：优先宿主 device 存储（iframe localStorage 可能不持久），localStorage 兜底
const storeGet = async (key: string): Promise<unknown> => {
  try {
    const v = await host.storage.get(key, { scope: 'device' });
    if (v !== undefined) return v;
  } catch { /* 降级本地 */ }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};
const storeSet = async (key: string, value: unknown): Promise<void> => {
  try {
    await host.storage.set(key, value as never, { scope: 'device' });
  } catch { /* 降级本地 */ }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* 忽略 */ }
};
const saveFavs = (): void => {
  void storeSet('ztb-fav', favs);
};

const call = (method: 'GET' | 'POST', p: string, body?: unknown) =>
  host.serviceRequest({ method, path: p, body: body === undefined ? undefined : JSON.stringify(body) });

const pyOf = (s: string): { py: string; init: string } => {
  try {
    const full = pinyin(s, { toneType: 'none', type: 'array' }).join('').toLowerCase();
    const init = pinyin(s, { pattern: 'initial', toneType: 'none', type: 'array' }).join('').toLowerCase();
    return { py: full, init };
  } catch {
    return { py: s.toLowerCase(), init: '' };
  }
};

const matchUser = (u: (typeof users)[number], q: string): boolean => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    u.account.toLowerCase().includes(needle) ||
    u.realname.includes(q.trim()) ||
    u.py.includes(needle) ||
    (u.init !== '' && u.init.includes(needle))
  );
};

const sevText = (s: number): string => ({ 1: '致命', 2: '严重', 3: '一般', 4: '建议' })[s] ?? `S${s}`;

// 发会话：详情 Markdown（含步骤纯文本与内嵌图片）→ 直接发送
const sendBug = async (id: number, btn: HTMLButtonElement): Promise<void> => {
  btn.disabled = true;
  msgEl.textContent = `#${id} 提取中…`;
  try {
    const r = await call('GET', `/bug?id=${id}`);
    const j = JSON.parse(r.body) as BugDetailAnswer;
    if (!j.ok || !j.bug) {
      msgEl.textContent = j.error ?? '提取失败';
      return;
    }
    const b = j.bug;
    const lines = [
      `【禅道Bug #${b.id}】${b.title}`,
      `状态 ${b.status}｜严重 ${sevText(b.severity)}｜优先级 P${b.pri}｜类型 ${b.type || '-'}`,
      `产品 ${b.productName || '-'}｜项目 ${b.projectName || '-'}｜由 ${b.openedBy} 创建于 ${b.openedDate}｜当前指派 ${b.assignedTo}`,
      '',
      '重现步骤：',
      b.stepsPlain || '（无）',
    ];
    const imgs = (b.files ?? []).filter((f) => f.isImage && f.dataUrl).slice(0, 3);
    for (const f of imgs) lines.push('', `![${f.name}](${f.dataUrl ?? ''})`);
    const big = (b.files ?? []).filter((f) => f.tooLarge).map((f) => f.name);
    if (big.length > 0) lines.push('', `大图未内嵌（>300KB），浏览器查看：${big.join('、')}`);
    const nonImg = (b.files ?? []).filter((f) => !f.isImage).map((f) => f.name);
    if (nonImg.length > 0) lines.push('', `附件：${nonImg.join('、')}`);
    lines.push('', b.bugUrl);
    await host.prompt({ text: lines.join('\n'), send: true });
    msgEl.innerHTML = `<span class="ok">#${id} 已发送到当前会话</span>`;
  } catch (e) {
    msgEl.textContent = e instanceof HostRequestError ? `${e.code}` : '发送失败';
  } finally {
    btn.disabled = false;
  }
};

// 指派行内表单
const openAssign = (card: HTMLElement, bug: BugItem): void => {
  card.querySelector('.assign')?.remove();
  const box = document.createElement('div');
  box.className = 'assign';
  box.innerHTML = `
    <input type="text" placeholder="拼音/姓名/账号过滤，如 lzs / 廖泽松" />
    <select></select>
    <div class="chips"></div>
    <textarea placeholder="备注（从会话结果粘贴，如：已定位xx原因，请验证）"></textarea>
    <div><button class="primary small act-do">确定指派</button> <button class="small act-cancel">取消</button> <span class="mut act-out"></span></div>`;
  const filter = box.querySelector('input') as HTMLInputElement;
  const sel = box.querySelector('select') as HTMLSelectElement;
  const chips = box.querySelector('.chips') as HTMLElement;
  const remark = box.querySelector('textarea') as HTMLTextAreaElement;
  const out = box.querySelector('.act-out') as HTMLElement;

  const paintSel = (): void => {
    sel.innerHTML = '';
    const list = users.filter((u) => matchUser(u, filter.value)).slice(0, 100);
    for (const u of list) {
      const o = document.createElement('option');
      o.value = u.account;
      o.textContent = `${u.realname}（${u.account}）`;
      sel.appendChild(o);
    }
    if (list.length === 0) {
      const o = document.createElement('option');
      o.value = '';
      o.textContent = '无匹配';
      sel.appendChild(o);
    }
  };
  const paintChips = (): void => {
    chips.innerHTML = '';
    const top = [...users]
      .filter((u) => (favs[u.account] ?? 0) > 0)
      .sort((a, b) => (favs[b.account] ?? 0) - (favs[a.account] ?? 0))
      .slice(0, 5);
    for (const u of top) {
      const b = document.createElement('button');
      b.textContent = `${u.realname}`;
      b.title = u.account;
      b.onclick = () => {
        filter.value = u.account;
        paintSel();
        sel.value = u.account;
      };
      chips.appendChild(b);
    }
  };
  filter.oninput = paintSel;
  paintSel();
  paintChips();
  (box.querySelector('.act-cancel') as HTMLButtonElement).onclick = () => box.remove();
  (box.querySelector('.act-do') as HTMLButtonElement).onclick = async (ev) => {
    const btn = ev.target as HTMLButtonElement;
    if (!sel.value) {
      out.textContent = '先选一个人';
      return;
    }
    btn.disabled = true;
    out.textContent = '指派中…';
    try {
      const r = await call('POST', '/assign', { bugId: bug.id, assignedTo: sel.value, comment: remark.value.trim() });
      const j = JSON.parse(r.body) as AssignAnswer;
      if (!j.ok) {
        out.textContent = j.error ?? '指派失败';
        return;
      }
      favs[sel.value] = (favs[sel.value] ?? 0) + 1;
      saveFavs();
      out.innerHTML = `<span class="ok">已指派给 ${sel.value}</span>`;
      setTimeout(() => void refresh(), 800);
    } catch {
      out.textContent = '指派失败';
    } finally {
      btn.disabled = false;
    }
  };
  card.appendChild(box);
  filter.focus();
};

const render = (items: BugItem[]): void => {
  listEl.innerHTML = '';
  if (items.length === 0) {
    listEl.innerHTML = '<div class="mut">暂无指派给我的 Bug 🎉</div>';
    return;
  }
  for (const b of items) {
    const card = document.createElement('div');
    card.className = 'card';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `#${b.id} ${b.title}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${sevText(b.severity)} · P${b.pri} · ${b.productName || `产品${b.productId}`} · ${b.openedDate || ''}`;
    const ops = document.createElement('div');
    ops.className = 'ops';
    const bSend = document.createElement('button');
    bSend.className = 'primary small';
    bSend.textContent = '提取发会话';
    bSend.onclick = () => void sendBug(b.id, bSend);
    const bAssign = document.createElement('button');
    bAssign.className = 'small';
    bAssign.textContent = '指派';
    bAssign.onclick = () => openAssign(card, b);
    const bOpen = document.createElement('button');
    bOpen.className = 'small';
    bOpen.textContent = '浏览器打开';
    bOpen.title = '宿主打开链接（想走系统浏览器：设置里关掉“在内置浏览器中打开链接”，或 Ctrl+点击）';
    bOpen.onclick = () => void host.openUrl(`${baseUrl}/bug-view-${b.id}.html`).catch(() => undefined);
    const bCopy = document.createElement('button');
    bCopy.className = 'small';
    bCopy.textContent = '复制链接';
    bCopy.title = '显示链接手动复制（沙箱内剪贴板可能被拦）';
    bCopy.onclick = () => {
      // 沙箱 opaque origin 下剪贴板 API 可能被拦：给可选中输入框兜底
      const url = `${baseUrl}/bug-view-${b.id}.html`;
      void host.writeClipboard(url).then(() => {
        msgEl.textContent = '链接已复制';
      }).catch(() => undefined);
      let inp = card.querySelector('.copylink') as HTMLInputElement | null;
      if (!inp) {
        inp = document.createElement('input');
        inp.type = 'text';
        inp.readOnly = true;
        inp.className = 'copylink';
        card.appendChild(inp);
      }
      inp.value = url;
      inp.focus();
      inp.select();
      msgEl.textContent = '链接已选中，Ctrl+C 复制';
    };
    ops.append(bSend, bAssign, bOpen, bCopy);
    card.append(title, meta, ops);
    listEl.appendChild(card);
  }
};

const refresh = async (): Promise<void> => {
  msgEl.textContent = '加载中…';
  try {
    const h = await call('GET', '/health');
    const hj = JSON.parse(h.body) as { ok: boolean; configured?: boolean; baseUrl?: string };
    if (hj.configured) baseUrl = hj.baseUrl ?? '';
    const r = await call('GET', '/bugs');
    const j = JSON.parse(r.body) as BugListAnswer;
    if (!j.ok) {
      msgEl.innerHTML =
        j.error === 'need-config'
          ? '<div class="err">未连接禅道：点右上 ⚙ 填地址/账号/密码后连接</div>'
          : `<div class="err">${j.error ?? '加载失败'}</div>`;
      return;
    }
    totalEl.textContent = `共 ${j.total} 条 · 取前 ${j.items.length} 条`;
    msgEl.textContent = '';
    render(j.items);
    void host.setBadge(j.total > 0 ? j.total : null).catch(() => undefined);
    // 用户列表懒加载一次
    if (users.length === 0) {
      try {
        const u = await call('GET', '/users');
        const uj = JSON.parse(u.body) as UsersAnswer;
        if (uj.ok) users = uj.users.map((x) => ({ ...x, ...pyOf(`${x.realname}${x.account}`) }));
      } catch { /* 下次再试 */ }
    }
  } catch (e) {
    msgEl.textContent = e instanceof HostRequestError ? `${e.code}` : '加载失败';
  }
};

btnRefresh.onclick = () => void refresh();

// 设置：配置存本浏览器，打开自动建连
const cfgBox = $('cfg');
const cfgBase = $('cfg-base') as unknown as HTMLInputElement;
const cfgAcc = $('cfg-acc') as unknown as HTMLInputElement;
const cfgPwd = $('cfg-pwd') as unknown as HTMLInputElement;
const cfgOut = $('cfg-out');
const btnLogin = $('btn-login') as unknown as HTMLButtonElement;
($('btn-cfg') as unknown as HTMLButtonElement).onclick = () => {
  cfgBox.hidden = !cfgBox.hidden;
};
type Cfg = { base: string; account: string; password: string };
const loadCfg = async (): Promise<Cfg> => {
  try {
    const v = (await storeGet('ztb-cfg')) as Partial<Cfg> | undefined;
    if (v && typeof v === 'object') return { base: v.base ?? '', account: v.account ?? '', password: v.password ?? '' };
  } catch { /* 空配置 */ }
  return { base: '', account: '', password: '' };
};
const doLogin = async (c: Cfg): Promise<boolean> => {
  if (!c.base || !c.account || !c.password) return false;
  try {
    const r = await call('POST', '/login', { baseUrl: c.base, account: c.account, password: c.password });
    const j = JSON.parse(r.body) as { ok: boolean; error?: string };
    if (!j.ok) {
      cfgOut.textContent = j.error === 'login-failed' ? '连接失败：检查地址/账号/密码' : (j.error ?? '连接失败');
      return false;
    }
    cfgOut.textContent = '';
    return true;
  } catch {
    cfgOut.textContent = '连接失败';
    return false;
  }
};
btnLogin.onclick = async () => {
  const c: Cfg = { base: cfgBase.value.trim().replace(/\/+$/, ''), account: cfgAcc.value.trim(), password: cfgPwd.value };
  if (!c.base || !c.account || !c.password) {
    cfgOut.textContent = '三项都要填';
    return;
  }
  btnLogin.disabled = true;
  cfgOut.textContent = '连接中…';
  await storeSet('ztb-cfg', c);
  if (await doLogin(c)) {
    cfgBox.hidden = true;
    void refresh();
  }
  btnLogin.disabled = false;
};

host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  void (async () => {
    try {
      const f = (await storeGet('ztb-fav')) as Record<string, number> | undefined;
      if (f && typeof f === 'object') favs = f;
    } catch { /* 无常用人 */ }
    const c = await loadCfg();
    cfgBase.value = c.base;
    cfgAcc.value = c.account;
    cfgPwd.value = c.password;
    if (c.base && c.account && c.password) {
      const ok = await doLogin(c);
      if (ok) void refresh();
      else {
        cfgBox.hidden = false;
        msgEl.innerHTML = '<div class="err">自动连接失败，检查配置后点“保存并连接”</div>';
      }
    } else {
      cfgBox.hidden = false;
    }
  })();
});
