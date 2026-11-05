// 禅道 Bug 面板：我的前10（创建时间倒序）、提取发会话、快速指派、浏览器打开。
import { connectHost, HostRequestError } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { pinyin } from 'pinyin-pro';
import type { AssignAnswer, BugDetail, BugDetailAnswer, BugItem, BugListAnswer, CountAnswer, UserEntry, UsersAnswer } from '../shared/types.ts';

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
.btn-get{background:linear-gradient(135deg,#8b5cf6,#3b82f6);border:none;color:#fff;font-weight:700}
.btn-assign{background:#d97706;border:none;color:#fff;font-weight:700}
.btn-copy{background:#0d9488;border:none;color:#fff}
.btn-ok{background:#16a34a;border:none;color:#fff;font-weight:700}
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
.pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12.5px;font-weight:700;border:1px solid}
.detail{border-top:1px dashed #8884;padding-top:8px;display:flex;flex-direction:column;gap:8px}
.steps{white-space:pre-wrap;word-break:break-word;font-size:14px;background:#8881;border-radius:8px;padding:8px 10px;max-height:320px;overflow-y:auto}
.detail img{max-width:100%;border-radius:8px;border:1px solid #8883;cursor:zoom-in}
.mono{font-family:monospace;font-size:12.5px;word-break:break-all}
#zoom{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:50;padding:12px;cursor:zoom-out}
#zoom img{max-width:96%;max-height:96%;border-radius:8px}
.detail img{cursor:zoom-in}
.row{display:flex;gap:8px}
.mut{font-size:13.5px;opacity:.7}
.err{background:#7f1d1d22;border:1px solid #7f1d1d66;border-radius:8px;padding:10px;font-size:14px}
.ok{color:#4ade80}
</style>
<div class="top">
  <span class="t">🐞 我的 Bug</span>
  <span id="total" class="mut"></span>
  <span style="flex:1"></span>
  <button id="btn-range" class="small" title="切换：近一周 / 全部">近一周</button>
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
<div id="zoom" hidden><img id="zoom-img" alt="" /></div>
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
const sevColor = (s: number): string => ({ 1: '#f87171', 2: '#fb923c', 3: '#fbbf24', 4: '#94a3b8' })[s] ?? '#9ca3b8';
const statusColor = (name: string): string =>
  name.includes('激活') ? '#60a5fa' : name.includes('解决') ? '#4ade80' : name.includes('关闭') ? '#9ca3b8' : name.includes('延期') ? '#fbbf24' : '#9ca3b8';
const priColor = (p: number): string => (p <= 1 ? '#f87171' : p === 2 ? '#fb923c' : p >= 4 ? '#9ca3b8' : 'inherit');

let days = 7;

// 详情缓存：提取一次，展开/发会话复用
const detailCache = new Map<number, BugDetail>();
const fetchBug = async (id: number): Promise<BugDetail | null> => {
  const hit = detailCache.get(id);
  if (hit) return hit;
  const r = await call('GET', `/bug?id=${id}`);
  const j = JSON.parse(r.body) as BugDetailAnswer;
  if (!j.ok || !j.bug) {
    msgEl.textContent = j.error ?? '提取失败';
    return null;
  }
  detailCache.set(id, j.bug);
  return j.bug;
};

const buildMarkdown = (b: BugDetail): string => {
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
  if (big.length > 0) lines.push('', `大图未内嵌（>300KB）：${big.join('、')}`);
  const nonImg = (b.files ?? []).filter((f) => !f.isImage).map((f) => f.name);
  if (nonImg.length > 0) lines.push('', `附件：${nonImg.join('、')}`);
  lines.push('', b.bugUrl);
  return lines.join('\n');
};

const openZoom = (srcUrl: string, name: string): void => {
  const z = $('zoom');
  const zi = $('zoom-img') as unknown as HTMLImageElement;
  zi.src = srcUrl;
  zi.alt = name;
  z.hidden = false;
};
($('zoom') as unknown as HTMLElement).onclick = () => {
  $('zoom').hidden = true;
  ($('zoom-img') as unknown as HTMLImageElement).src = '';
};

// 提取：详情（含图片）直接在卡片下方展开，再点收起
const toggleDetail = async (card: HTMLElement, bug: BugItem, btn: HTMLButtonElement): Promise<void> => {
  const old = card.querySelector('.detail');
  if (old) {
    old.remove();
    btn.textContent = '提取';
    return;
  }
  btn.disabled = true;
  msgEl.textContent = `#${bug.id} 提取中…`;
  try {
    const b = await fetchBug(bug.id);
    if (!b) return;
    msgEl.textContent = '';
    const box = document.createElement('div');
    box.className = 'detail';
    const head = document.createElement('div');
    head.className = 'mut';
    head.textContent = `状态 ${b.status}｜${sevText(b.severity)}·P${b.pri}｜${b.productName || ''}｜${b.openedBy} ${b.openedDate}｜指派 ${b.assignedTo}`;
    const steps = document.createElement('div');
    steps.className = 'steps';
    steps.textContent = b.stepsPlain || '（无重现步骤）';
    box.append(head, steps);
    for (const f of (b.files ?? []).filter((x) => x.isImage && x.dataUrl).slice(0, 3)) {
      const img = document.createElement('img');
      img.src = f.dataUrl ?? '';
      img.alt = f.name;
      img.title = `${f.name}（点击放大）`;
      img.onclick = () => openZoom(f.dataUrl ?? '', f.name);
      box.appendChild(img);
    }
    const big = (b.files ?? []).filter((f) => f.tooLarge).map((f) => f.name);
    const nonImg = (b.files ?? []).filter((f) => !f.isImage).map((f) => f.name);
    if (big.length > 0 || nonImg.length > 0) {
      const att = document.createElement('div');
      att.className = 'mut';
      att.textContent = [big.length > 0 ? `大图>300KB未展示：${big.join('、')}` : '', nonImg.length > 0 ? `附件：${nonImg.join('、')}` : ''].filter(Boolean).join('；');
      box.appendChild(att);
    }
    const url = document.createElement('div');
    url.className = 'mut mono';
    url.textContent = b.bugUrl;
    box.appendChild(url);
    card.appendChild(box);
    btn.textContent = '收起';
  } catch {
    msgEl.textContent = '提取失败';
  } finally {
    btn.disabled = false;
  }
};

// 发会话：用已提取的详情拼 Markdown 直接发送
const sendSession = async (id: number, btn: HTMLButtonElement): Promise<void> => {
  btn.disabled = true;
  msgEl.textContent = `#${id} 准备中…`;
  try {
    const b = await fetchBug(id);
    if (!b) return;
    await host.prompt({ text: buildMarkdown(b), send: true });
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
    <div><button class="small btn-ok act-do">确定指派</button> <button class="small act-cancel">取消</button> <span class="mut act-out"></span></div>`;
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
    listEl.innerHTML = '';
    const w = document.createElement('div');
    w.className = 'empty';
    w.innerHTML = `<div class="ic">—○—</div><div>${days > 0 ? '近一周无新建 Bug' : '暂无指派给我的 Bug'} 🎉</div>${days > 0 ? '<div class="mut">点“全部”查看历史</div>' : ''}`;
    listEl.appendChild(w);
    return;
  }
  for (const b of items) {
    const card = document.createElement('div');
    card.className = 'card';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `#${b.id} ${b.title}`;
    title.title = '点击提取详情';
    title.style.cursor = 'pointer';
    title.onclick = () => bGet.click();
    const meta = document.createElement('div');
    meta.className = 'meta';
    const pill = document.createElement('span');
    pill.className = 'pill';
    const sColor = statusColor(b.statusName || b.status);
    pill.style.color = sColor;
    pill.style.borderColor = sColor;
    pill.textContent = b.statusName || b.status || '未知';
    const sev = document.createElement('span');
    sev.style.color = sevColor(b.severity);
    sev.style.fontWeight = '700';
    sev.textContent = sevText(b.severity);
    const pri = document.createElement('span');
    pri.style.color = priColor(b.pri);
    pri.style.fontWeight = b.pri <= 2 ? '700' : '400';
    pri.textContent = `P${b.pri}`;
    const rest = document.createElement('span');
    const vers = [`影响 ${b.openedBuild || '-'}`];
    if (b.resolvedBuild) vers.push(`解决 ${b.resolvedBuild}`);
    rest.textContent = `${b.productName || `产品${b.productId}`} · ${vers.join(' · ')} · ${(b.openedDate || '').slice(0, 10)}`;
    meta.append(pill, ' ', sev, ' · ', pri, ' · ', rest);
    const ops = document.createElement('div');
    ops.className = 'ops';
    const bGet = document.createElement('button');
    bGet.className = 'small btn-get';
    bGet.textContent = '提取';
    bGet.title = '拉取详情并在下方展开（含图片）';
    bGet.onclick = () => void toggleDetail(card, b, bGet);
    const bSend = document.createElement('button');
    bSend.className = 'primary small';
    bSend.textContent = '发会话';
    bSend.title = '把详情发到当前会话';
    bSend.onclick = () => void sendSession(b.id, bSend);
    const bAssign = document.createElement('button');
    bAssign.className = 'small btn-assign';
    bAssign.textContent = '指派';
    bAssign.onclick = () => openAssign(card, b);
    const bCopy = document.createElement('button');
    bCopy.className = 'small btn-copy';
    bCopy.textContent = '复制链接';
    bCopy.title = '显示链接手动复制（沙箱内剪贴板可能被拦）';
    bCopy.onclick = () => {
      // 沙箱 iframe 经消息中转调宿主剪贴板时用户手势已丢失：先在同手势内同步 execCommand
      const url = `${baseUrl}/bug-view-${b.id}.html`;
      let done = false;
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        card.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        done = document.execCommand('copy');
        ta.remove();
      } catch { /* 走下面兜底 */ }
      if (done) {
        msgEl.innerHTML = '<span class="ok">链接已复制</span>';
        return;
      }
      void host.writeClipboard(url).then(() => {
        msgEl.innerHTML = '<span class="ok">链接已复制</span>';
      }).catch(() => undefined);
      // 都不行：给可选中输入框，用户按 Ctrl+C（浏览器自身复制，不受沙箱限制）
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
      msgEl.textContent = '自动复制失败，链接已选中，按 Ctrl+C 复制';
    };
    ops.append(bGet, bSend, bAssign, bCopy);
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
    const r = await call('GET', `/bugs?days=${days}`);
    const j = JSON.parse(r.body) as BugListAnswer;
    if (!j.ok) {
      msgEl.innerHTML =
        j.error === 'need-config'
          ? '<div class="err">未连接禅道：点右上 ⚙ 填地址/账号/密码后连接</div>'
          : `<div class="err">${j.error ?? '加载失败'}</div>`;
      return;
    }
    totalEl.textContent = `${days > 0 ? '近一周 ' : ''}共 ${j.total} 条 · 取前 ${j.items.length} 条`;
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
($('btn-range') as unknown as HTMLButtonElement).onclick = (ev) => {
  days = days > 0 ? 0 : 7;
  (ev.target as HTMLButtonElement).textContent = days > 0 ? '近一周' : '全部';
  void refresh();
};

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
