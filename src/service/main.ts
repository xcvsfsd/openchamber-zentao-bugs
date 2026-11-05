// 禅道 service：跑在 OpenChamber 起的子进程里，直调禅道 REST v1。
// 凭据来源：面板 POST /login（service 内存缓存）。宿主 spawn service 时只透传白名单
// 环境变量（PATH/HOME 等），业务环境变量到不了子进程，故不用 process.env。
import http from 'node:http';

const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
const token0 = process.env.OPENCHAMBER_SERVICE_TOKEN ?? '';
if (!port || !token0) {
  console.error('OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required');
  process.exit(1);
}

const API = '/api.php/v1';

// 凭据来源：面板 POST /login（service 内存缓存）。宿主 spawn service 时只透传白名单
// 环境变量（PATH/HOME 等），ZENTAO_* 到不了子进程，故不用 process.env。
let CFG = { base: '', account: '', password: '' };

// ---- token 缓存（10 分钟），401 自动刷一次 ----
let cached: { token: string; at: number } | null = null;

const login = async (base: string, account: string, password: string): Promise<string | null> => {
  try {
    const r = await fetch(`${base}${API}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password }),
      signal: AbortSignal.timeout(15_000),
    });
    const j = (await r.json()) as { token?: string };
    if (!j.token) return null;
    cached = { token: j.token, at: Date.now() };
    return j.token;
  } catch {
    return null;
  }
};

const getToken = async (): Promise<string | null> => {
  if (!CFG.base || !CFG.account) return null;
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.token;
  return login(CFG.base, CFG.account, CFG.password);
};

const zfetch = async (path: string, init?: RequestInit): Promise<{ status: number; json: unknown }> => {
  let tk = await getToken();
  if (!tk) return { status: 401, json: { error: 'need-config' } };
  const doFetch = async (t: string): Promise<{ status: number; json: unknown }> => {
    const r = await fetch(`${CFG.base}${API}${path}`, {
      ...init,
      headers: { ...(init?.headers ?? {}), Token: t, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    let j: unknown = null;
    try {
      j = await r.json();
    } catch {
      j = { error: `http-${r.status}` };
    }
    return { status: r.status, json: j };
  };
  let out = await doFetch(tk);
  if (out.status === 401) {
    // token 过期刷一次
    const fresh = CFG.base && CFG.account ? await login(CFG.base, CFG.account, CFG.password) : null;
    if (fresh) out = await doFetch(fresh);
  }
  return out;
};

// ---- 列表缓存 60 秒（/bugs 与 /count 共用） ----
type Row = {
  id: number;
  title: string;
  status: string;
  severity: number;
  pri: number;
  productId: number;
  productName: string;
  projectId: number;
  executionId: number;
  openedBy: string;
  openedDate: string;
  assignedDate: string;
  openedBuild: string;
  resolvedBuild: string;
  statusName: string;
};
let listCache: { at: number; rows: Row[]; names: Map<number, string> } | null = null;

const loadAll = async (): Promise<{ rows: Row[]; error?: string }> => {
  if (listCache && Date.now() - listCache.at < 60_000) return { rows: listCache.rows };
  const pr = await zfetch('/products?limit=100');
  if (pr.status === 401) return { rows: [], error: 'need-config' };
  const products = ((pr.json as { products?: { id: number; name: string }[] }).products ?? []) as {
    id: number;
    name: string;
  }[];
  const names = new Map(products.map((p) => [Number(p.id), String(p.name ?? '')]));
  const ids = products.map((p) => Number(p.id)).filter((n) => n > 0);
  const rows: Row[] = [];
  // 分批并发，防打爆禅道
  for (let i = 0; i < ids.length; i += 6) {
    const batch = await Promise.all(
      ids.slice(i, i + 6).map(async (pid) => {
        try {
          const r = await zfetch(`/products/${pid}/bugs?assignedTo=${encodeURIComponent(CFG.account)}&limit=200`);
          const bugs = ((r.json as { bugs?: Record<string, unknown>[] }).bugs ?? []) as Record<string, unknown>[];
          // 列表里 assignedTo 可能是 {account,...} 对象或字符串
          return bugs.filter((b) => {
            const a = b.assignedTo as { account?: unknown } | string | undefined;
            const acc = typeof a === 'string' ? a : String(a?.account ?? '');
            return acc === CFG.account;
          });
        } catch {
          return [];
        }
      }),
    );
    for (const bugs of batch) {
      for (const b of bugs) {
        const pid = Number(b.product ?? 0);
        rows.push({
          id: Number(b.id ?? 0),
          title: String(b.title ?? ''),
          status: String(b.status ?? ''),
          severity: Number(b.severity ?? 0),
          pri: Number(b.pri ?? 0),
          productId: pid,
          productName: names.get(pid) ?? '',
          projectId: Number(b.project ?? 0),
          executionId: Number(b.execution ?? 0),
          openedBy: String(b.openedBy ?? ''),
          openedDate: String(b.openedDate ?? ''),
          assignedDate: String(b.assignedDate ?? ''),
          openedBuild: String(b.openedBuild ?? ''),
          resolvedBuild: String(b.resolvedBuild ?? ''),
          statusName: String(b.statusName ?? ''),
        });
      }
    }
  }
  rows.sort((a, b) => (a.openedDate < b.openedDate ? 1 : a.openedDate > b.openedDate ? -1 : b.id - a.id));
  listCache = { at: Date.now(), rows, names };
  return { rows };
};

// HTML 重现步骤转纯文本
const stepsPlain = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 4000);

const isValidAccount = (s: unknown): s is string =>
  typeof s === 'string' && s.length > 0 && s.length <= 64 && /^[A-Za-z0-9_@.-]+$/.test(s);

const json = (res: http.ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

const readBody = (req: http.IncomingMessage): Promise<unknown> =>
  new Promise((resolve) => {
    let text = '';
    req.on('data', (c: Buffer) => {
      text += c.toString('utf8');
      if (text.length > 64 * 1024) req.destroy();
    });
    req.on('end', () => {
      if (!text) return resolve({});
      try {
        resolve(JSON.parse(text));
      } catch {
        resolve(null);
      }
    });
  });

const server = http.createServer((req, res) => {
  if (req.headers.authorization !== `Bearer ${token0}`) {
    json(res, 401, { ok: false, error: 'unauthorized' });
    return;
  }
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (url.pathname === '/health') {
    json(res, 200, { ok: true, configured: Boolean(CFG.account && cached), baseUrl: CFG.base });
    return;
  }

  // ---- 建连：面板设置页提交凭据，service 换 token 内存缓存 ----
  if (req.method === 'POST' && url.pathname === '/login') {
    readBody(req).then(async (raw) => {
      if (!raw || typeof raw !== 'object') return json(res, 400, { ok: false, error: 'bad-request' });
      const body = raw as Record<string, unknown>;
      const baseUrl = typeof body.baseUrl === 'string' ? body.baseUrl.trim().replace(/\/+$/, '') : '';
      const account = typeof body.account === 'string' ? body.account.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^https?:\/\/.{1,200}$/.test(baseUrl) || !isValidAccount(account) || password.length === 0 || password.length > 200) {
        return json(res, 400, { ok: false, error: 'bad-credential' });
      }
      const tk = await login(baseUrl, account, password);
      if (!tk) return json(res, 200, { ok: false, error: 'login-failed' });
      CFG = { base: baseUrl, account, password };
      cached = { token: tk, at: Date.now() };
      listCache = null;
      return json(res, 200, { ok: true, account });
    });
    return;
  }
  if (!CFG.account || !cached) {
    json(res, 200, { ok: false, error: 'need-config' });
    return;
  }

  // ---- 读：我的 Bug（创建时间倒序，默认近7天，days=0 查全部） ----
  if (req.method === 'GET' && (url.pathname === '/bugs' || url.pathname === '/count')) {
    (async () => {
      const { rows, error } = await loadAll();
      if (error) return json(res, 200, { ok: false, error, total: 0, items: [] });
      const days = Number(url.searchParams.get('days') ?? '7');
      // 已解决/已关闭不进列表（面板只看待办）
      const actionable = rows.filter((r) => !/解决|关闭|resolved|closed/i.test(`${r.statusName} ${r.status}`));
      const list = days > 0 ? actionable.filter((r) => Date.parse(r.openedDate) >= Date.now() - days * 86400000) : actionable;
      if (url.pathname === '/count') return json(res, 200, { ok: true, total: list.length });
      return json(res, 200, { ok: true, total: list.length, items: list.slice(0, 10) });
    })().catch(() => json(res, 500, { ok: false, error: 'bugs-failed' }));
    return;
  }

  // ---- 读：单条详情（含步骤纯文本与附件） ----
  if (req.method === 'GET' && url.pathname === '/bug') {
    (async () => {
      const id = Number(url.searchParams.get('id') ?? '0');
      if (!Number.isInteger(id) || id <= 0) return json(res, 400, { ok: false, error: 'bad-id' });
      const r = await zfetch(`/bugs/${id}`);
      if (r.status === 401) return json(res, 200, { ok: false, error: 'need-config' });
      const b = r.json as Record<string, unknown>;
      if (!b || typeof b.id === 'undefined') return json(res, 200, { ok: false, error: 'not-found' });
      const rawFiles = (Array.isArray(b.files) ? b.files : []) as Record<string, unknown>[];
      const files: {
        id: number;
        name: string;
        ext: string;
        size: number;
        isImage: boolean;
        dataUrl?: string;
        tooLarge?: boolean;
      }[] = [];
      for (const f of rawFiles.slice(0, 5)) {
        const fid = Number(f.id ?? f.fileID ?? 0);
        const name = String(f.title ?? f.name ?? f.pathname ?? `附件${fid}`);
        const ext = (name.split('.').pop() ?? '').toLowerCase().slice(0, 10);
        const size = Number(f.size ?? f.fileSize ?? 0);
        const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext);
        const entry: (typeof files)[number] = { id: fid, name, ext, size, isImage };
        // 图片 ≤300KB 内嵌 base64，超限只给名（面板提示浏览器看）
        if (isImage && fid > 0 && size > 0 && size <= 300 * 1024) {
          try {
            const dl = await fetch(`${CFG.base}${API}/files/${fid}`, {
              headers: { Token: (cached?.token ?? (await getToken())) as string },
              signal: AbortSignal.timeout(20_000),
            });
            const buf = Buffer.from(await dl.arrayBuffer());
            if (buf.length > 0 && buf.length <= 300 * 1024) {
              const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : ext === 'bmp' ? 'image/bmp' : 'image/jpeg';
              entry.dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
            } else {
              entry.tooLarge = true;
            }
          } catch {
            entry.tooLarge = true;
          }
        } else if (isImage && size > 300 * 1024) {
          entry.tooLarge = true;
        }
        files.push(entry);
      }
      // 步骤 HTML 内联截图：file-read-{id}.ext，需 Token 下载（裸访返回登录页）
      const rawSteps = String(b.steps ?? '');
      const seen = new Set(files.map((f) => f.id));
      const tkInline = cached?.token ?? (await getToken());
      const reInline = /file-read-(\d+)\.([A-Za-z]{2,4})/g;
      let mInline: RegExpExecArray | null;
      let inlineCount = 0;
      while ((mInline = reInline.exec(rawSteps)) !== null && inlineCount < 3) {
        const fid = Number(mInline[1]);
        const fext = (mInline[2] ?? 'png').toLowerCase();
        if (!fid || seen.has(fid)) continue;
        seen.add(fid);
        try {
          const dl = await fetch(`${CFG.base}/file-read-${fid}.${fext}`, {
            headers: tkInline ? { Token: tkInline } : {},
            signal: AbortSignal.timeout(20_000),
          });
          const ct = dl.headers.get('content-type') ?? '';
          const buf = Buffer.from(await dl.arrayBuffer());
          if (buf.length > 0 && buf.length <= 300 * 1024 && ct.startsWith('image/')) {
            files.push({
              id: fid,
              name: `步骤截图${fid}.${fext}`,
              ext: fext,
              size: buf.length,
              isImage: true,
              dataUrl: `data:${ct.split(';')[0]};base64,${buf.toString('base64')}`,
            });
            inlineCount += 1;
          }
        } catch { /* 跳过单张 */ }
      }
      const pid = Number(b.product ?? 0);
      const pname = listCache?.names.get(pid) ?? '';
      json(res, 200, {
        ok: true,
        bug: {
          id: Number(b.id ?? id),
          title: String(b.title ?? ''),
          status: String(b.status ?? ''),
          severity: Number(b.severity ?? 0),
          pri: Number(b.pri ?? 0),
          type: String(b.type ?? ''),
          productName: pname,
          projectName: String(b.projectName ?? ''),
          executionId: Number(b.execution ?? 0),
          openedBy: String(
            typeof b.openedBy === 'object' && b.openedBy !== null
              ? ((b.openedBy as { account?: unknown }).account ?? '')
              : (b.openedBy ?? ''),
          ),
          openedDate: String(b.openedDate ?? ''),
          assignedTo: String(
            typeof b.assignedTo === 'object' && b.assignedTo !== null
              ? ((b.assignedTo as { account?: unknown }).account ?? '')
              : (b.assignedTo ?? ''),
          ),
          stepsPlain: stepsPlain(String(b.steps ?? '')),
          bugUrl: `${CFG.base}/bug-view-${id}.html`,
          files,
        },
      });
    })().catch(() => json(res, 500, { ok: false, error: 'bug-failed' }));
    return;
  }

  // ---- 读：版本列表（解决版本下拉，默认匹配影响版本） ----
  if (req.method === 'GET' && url.pathname === '/builds') {
    (async () => {
      const execId = Number(url.searchParams.get('execution') ?? '0');
      if (!Number.isInteger(execId) || execId <= 0) return json(res, 200, { ok: true, builds: [] });
      const r = await zfetch(`/executions/${execId}/builds`);
      if (r.status === 401) return json(res, 200, { ok: false, error: 'need-config' });
      const builds = ((r.json as { builds?: { id?: unknown; name?: unknown }[] }).builds ?? [])
        .map((x) => ({ id: Number(x.id ?? 0), name: String(x.name ?? '') }))
        .filter((x) => x.id > 0);
      json(res, 200, { ok: true, builds });
    })().catch(() => json(res, 500, { ok: false, error: 'builds-failed' }));
    return;
  }

  // ---- 读：解决方案下拉（固定字典，默认 fixed/修改代码） ----
  if (req.method === 'GET' && url.pathname === '/resolutions') {
    json(res, 200, {
      ok: true,
      resolutions: [
        { id: 'fixed', name: '修改代码' },
        { id: 'duplicate', name: '重复Bug' },
        { id: 'willnotfix', name: '不予解决' },
        { id: 'postponed', name: '延期处理' },
        { id: 'external', name: '外部原因' },
        { id: 'bydesign', name: '设计如此' },
        { id: 'notrepro', name: '无法重现' },
      ],
    });
    return;
  }

  // ---- 读：用户列表（指派下拉） ----
  if (req.method === 'GET' && url.pathname === '/users') {
    (async () => {
      const r = await zfetch('/users?limit=500');
      if (r.status === 401) return json(res, 200, { ok: false, error: 'need-config' });
      const users = ((r.json as { users?: { account?: unknown; realname?: unknown }[] }).users ?? [])
        .map((u) => ({ account: String(u.account ?? ''), realname: String(u.realname ?? '') }))
        .filter((u) => u.account);
      json(res, 200, { ok: true, users });
    })().catch(() => json(res, 500, { ok: false, error: 'users-failed' }));
    return;
  }

  // ---- 写：解决（resolvedDate 取当前时间；回读校验 status=resolved） ----
  if (req.method === 'POST' && url.pathname === '/resolve') {
    readBody(req).then(async (raw) => {
      if (!raw || typeof raw !== 'object') return json(res, 400, { ok: false, error: 'bad-request' });
      const body = raw as Record<string, unknown>;
      const bugId = Number(body.bugId ?? 0);
      const resolution = typeof body.resolution === 'string' ? body.resolution : '';
      const resolvedBuild = Number(body.resolvedBuild ?? 0);
      const assignedTo = body.assignedTo;
      const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
      if (!Number.isInteger(bugId) || bugId <= 0) return json(res, 400, { ok: false, error: 'bad-id' });
      if (!/^[a-z]+$/.test(resolution) || resolution.length > 20) return json(res, 400, { ok: false, error: 'bad-resolution' });
      if (!Number.isInteger(resolvedBuild) || resolvedBuild <= 0) return json(res, 400, { ok: false, error: 'bad-build' });
      if (!isValidAccount(assignedTo)) return json(res, 400, { ok: false, error: 'bad-account' });
      if (!comment || comment.length > 2000) return json(res, 400, { ok: false, error: 'bad-comment' });
      try {
        const now = new Date();
        const pad = (n: number): string => String(n).padStart(2, '0');
        const resolvedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        await zfetch(`/bugs/${bugId}/resolve`, {
          method: 'POST',
          body: JSON.stringify({ resolution, resolvedBuild, resolvedDate, assignedTo, comment }),
        });
        const chk = await zfetch(`/bugs/${bugId}`);
        const cb = chk.json as Record<string, unknown>;
        if (String(cb.status ?? '') === 'resolved') {
          listCache = null;
          return json(res, 200, { ok: true });
        }
        return json(res, 200, { ok: false, error: '解决未生效（回读不一致），请浏览器确认' });
      } catch {
        return json(res, 500, { ok: false, error: 'resolve-failed' });
      }
    });
    return;
  }

  // ---- 写：指派 ----
  if (req.method === 'POST' && url.pathname === '/assign') {
    readBody(req).then(async (raw) => {
      if (!raw || typeof raw !== 'object') return json(res, 400, { ok: false, error: 'bad-request' });
      const body = raw as Record<string, unknown>;
      const bugId = Number(body.bugId ?? 0);
      const assignedTo = body.assignedTo;
      const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : '';
      if (!Number.isInteger(bugId) || bugId <= 0) return json(res, 400, { ok: false, error: 'bad-id' });
      if (!isValidAccount(assignedTo)) return json(res, 400, { ok: false, error: 'bad-account' });
      try {
        const payload: Record<string, string> = { assignedTo };
        if (comment) payload.comment = comment;
        await zfetch(`/bugs/${bugId}/assign`, { method: 'POST', body: JSON.stringify(payload) });
        // 上游空 200 无法区分成败：回读校验
        const chk = await zfetch(`/bugs/${bugId}`);
        const cb = chk.json as Record<string, unknown>;
        const cur = cb.assignedTo as { account?: unknown } | string | undefined;
        const curAcc = typeof cur === 'string' ? cur : String(cur?.account ?? '');
        if (curAcc === assignedTo) {
          listCache = null; // 指派后列表失效
          return json(res, 200, { ok: true });
        }
        return json(res, 200, { ok: false, error: '指派未生效（回读不一致），请浏览器确认' });
      } catch {
        return json(res, 500, { ok: false, error: 'assign-failed' });
      }
    });
    return;
  }

  json(res, 404, { ok: false, error: 'not-found' });
});

const shutdown = (): void => {
  server.close();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(port, '127.0.0.1');
