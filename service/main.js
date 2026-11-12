// src/service/main.ts
import http from "node:http";
var port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
var token0 = process.env.OPENCHAMBER_SERVICE_TOKEN ?? "";
if (!port || !token0) {
  console.error("OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required");
  process.exit(1);
}
var API = "/api.php/v1";
var CFG = { base: "", account: "", password: "" };
var cached = null;
var login = async (base, account, password) => {
  try {
    const r = await fetch(`${base}${API}/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
      signal: AbortSignal.timeout(15000)
    });
    const j = await r.json();
    if (!j.token)
      return null;
    cached = { token: j.token, at: Date.now() };
    return j.token;
  } catch {
    return null;
  }
};
var getToken = async () => {
  if (!CFG.base || !CFG.account)
    return null;
  if (cached && Date.now() - cached.at < 10 * 60 * 1000)
    return cached.token;
  return login(CFG.base, CFG.account, CFG.password);
};
var zfetch = async (path, init) => {
  let tk = await getToken();
  if (!tk)
    return { status: 401, json: { error: "need-config" } };
  const doFetch = async (t) => {
    const r = await fetch(`${CFG.base}${API}${path}`, {
      ...init,
      headers: { ...init?.headers ?? {}, Token: t, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(20000)
    });
    let j = null;
    try {
      j = await r.json();
    } catch {
      j = { error: `http-${r.status}` };
    }
    return { status: r.status, json: j };
  };
  let out = await doFetch(tk);
  if (out.status === 401) {
    const fresh = CFG.base && CFG.account ? await login(CFG.base, CFG.account, CFG.password) : null;
    if (fresh)
      out = await doFetch(fresh);
  }
  return out;
};
var listCache = null;
var loadAll = async () => {
  if (listCache && Date.now() - listCache.at < 60000)
    return { rows: listCache.rows };
  const pr = await zfetch("/products?limit=100");
  if (pr.status === 401)
    return { rows: [], error: "need-config" };
  const products = pr.json.products ?? [];
  const names = new Map(products.map((p) => [Number(p.id), String(p.name ?? "")]));
  const ids = products.map((p) => Number(p.id)).filter((n) => n > 0);
  const rows = [];
  for (let i = 0;i < ids.length; i += 6) {
    const batch = await Promise.all(ids.slice(i, i + 6).map(async (pid) => {
      try {
        const r = await zfetch(`/products/${pid}/bugs?assignedTo=${encodeURIComponent(CFG.account)}&limit=200`);
        const bugs = r.json.bugs ?? [];
        return bugs.filter((b) => {
          const a = b.assignedTo;
          const acc = typeof a === "string" ? a : String(a?.account ?? "");
          return acc === CFG.account;
        });
      } catch {
        return [];
      }
    }));
    for (const bugs of batch) {
      for (const b of bugs) {
        const pid = Number(b.product ?? 0);
        const obRaw = b.openedBy;
        const obAcc = typeof obRaw === "string" ? obRaw : String(obRaw?.account ?? "");
        rows.push({
          id: Number(b.id ?? 0),
          title: String(b.title ?? ""),
          status: String(b.status ?? ""),
          severity: Number(b.severity ?? 0),
          pri: Number(b.pri ?? 0),
          productId: pid,
          productName: names.get(pid) ?? "",
          projectId: Number(b.project ?? 0),
          executionId: Number(b.execution ?? 0),
          openedBy: obAcc,
          openedDate: String(b.openedDate ?? ""),
          assignedDate: String(b.assignedDate ?? ""),
          openedBuild: String(b.openedBuild ?? ""),
          resolvedBuild: String(b.resolvedBuild ?? ""),
          statusName: String(b.statusName ?? "")
        });
      }
    }
  }
  rows.sort((a, b) => a.openedDate < b.openedDate ? 1 : a.openedDate > b.openedDate ? -1 : b.id - a.id);
  listCache = { at: Date.now(), rows, names };
  return { rows };
};
var stepsPlain = (html) => html.replace(/<br\s*\/?>/gi, `
`).replace(/<\/(p|div|li|tr|h[1-6])>/gi, `
`).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').split(`
`).map((l) => l.trimEnd()).join(`
`).replace(/\n{3,}/g, `

`).trim().slice(0, 4000);
var isValidAccount = (s) => typeof s === "string" && s.length > 0 && s.length <= 64 && /^[A-Za-z0-9_@.-]+$/.test(s);
var json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};
var readBody = (req) => new Promise((resolve) => {
  let text = "";
  req.on("data", (c) => {
    text += c.toString("utf8");
    if (text.length > 64 * 1024)
      req.destroy();
  });
  req.on("end", () => {
    if (!text)
      return resolve({});
    try {
      resolve(JSON.parse(text));
    } catch {
      resolve(null);
    }
  });
});
var server = http.createServer((req, res) => {
  if (req.headers.authorization !== `Bearer ${token0}`) {
    json(res, 401, { ok: false, error: "unauthorized" });
    return;
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/health") {
    json(res, 200, { ok: true, configured: Boolean(CFG.account && cached), baseUrl: CFG.base });
    return;
  }
  if (req.method === "POST" && url.pathname === "/login") {
    readBody(req).then(async (raw) => {
      if (!raw || typeof raw !== "object")
        return json(res, 400, { ok: false, error: "bad-request" });
      const body = raw;
      const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim().replace(/\/+$/, "") : "";
      const account = typeof body.account === "string" ? body.account.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!/^https?:\/\/.{1,200}$/.test(baseUrl) || !isValidAccount(account) || password.length === 0 || password.length > 200) {
        return json(res, 400, { ok: false, error: "bad-credential" });
      }
      const tk = await login(baseUrl, account, password);
      if (!tk)
        return json(res, 200, { ok: false, error: "login-failed" });
      CFG = { base: baseUrl, account, password };
      cached = { token: tk, at: Date.now() };
      listCache = null;
      return json(res, 200, { ok: true, account });
    });
    return;
  }
  if (!CFG.account || !cached) {
    json(res, 200, { ok: false, error: "need-config" });
    return;
  }
  if (req.method === "GET" && (url.pathname === "/bugs" || url.pathname === "/count")) {
    (async () => {
      const { rows, error } = await loadAll();
      if (error)
        return json(res, 200, { ok: false, error, total: 0, items: [] });
      const days = Number(url.searchParams.get("days") ?? "7");
      const actionable = rows.filter((r) => !/解决|关闭|resolved|closed/i.test(`${r.statusName} ${r.status}`));
      const list = days > 0 ? actionable.filter((r) => Date.parse(r.openedDate) >= Date.now() - days * 86400000) : actionable;
      if (url.pathname === "/count")
        return json(res, 200, { ok: true, total: list.length });
      return json(res, 200, { ok: true, total: list.length, items: list.slice(0, 10) });
    })().catch(() => json(res, 500, { ok: false, error: "bugs-failed" }));
    return;
  }
  if (req.method === "GET" && url.pathname === "/bug") {
    (async () => {
      const id = Number(url.searchParams.get("id") ?? "0");
      if (!Number.isInteger(id) || id <= 0)
        return json(res, 400, { ok: false, error: "bad-id" });
      const r = await zfetch(`/bugs/${id}`);
      if (r.status === 401)
        return json(res, 200, { ok: false, error: "need-config" });
      const b = r.json;
      if (!b || typeof b.id === "undefined")
        return json(res, 200, { ok: false, error: "not-found" });
      const rawFiles = Array.isArray(b.files) ? b.files : [];
      const files = [];
      const IMG_MAX = 1 * 1024 * 1024;
      const dlWithRetry = async (url2) => {
        let tk = cached?.token ?? await getToken();
        if (!tk)
          return null;
        let dl = await fetch(url2, { headers: { Token: tk }, signal: AbortSignal.timeout(20000) });
        if (dl.status === 401) {
          const fresh = CFG.base && CFG.account ? await login(CFG.base, CFG.account, CFG.password) : null;
          if (!fresh)
            return dl;
          dl = await fetch(url2, { headers: { Token: fresh }, signal: AbortSignal.timeout(20000) });
        }
        return dl;
      };
      for (const f of rawFiles.slice(0, 5)) {
        const fid = Number(f.id ?? f.fileID ?? 0);
        const name = String(f.title ?? f.name ?? f.pathname ?? `附件${fid}`);
        const ext = (name.split(".").pop() ?? "").toLowerCase().slice(0, 10);
        const size = Number(f.size ?? f.fileSize ?? 0);
        const isImage = ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext);
        const entry = { id: fid, name, ext, size, isImage };
        if (isImage && fid > 0 && size > 0 && size <= IMG_MAX) {
          try {
            const dl = await dlWithRetry(`${CFG.base}${API}/files/${fid}`);
            if (!dl) {
              entry.tooLarge = true;
            } else {
              const buf = Buffer.from(await dl.arrayBuffer());
              if (buf.length > 0 && buf.length <= IMG_MAX) {
                const mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : ext === "bmp" ? "image/bmp" : "image/jpeg";
                entry.dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
              } else {
                entry.tooLarge = true;
              }
            }
          } catch {
            entry.tooLarge = true;
          }
        } else if (isImage && size > IMG_MAX) {
          entry.tooLarge = true;
        }
        files.push(entry);
      }
      const rawSteps = String(b.steps ?? "");
      const seen = new Set(files.map((f) => f.id));
      const reInline = /file-read-(\d+)\.([A-Za-z]{2,4})/g;
      let mInline;
      let inlineCount = 0;
      while ((mInline = reInline.exec(rawSteps)) !== null && inlineCount < 5) {
        const fid = Number(mInline[1]);
        const fext = (mInline[2] ?? "png").toLowerCase();
        if (!fid || seen.has(fid))
          continue;
        seen.add(fid);
        try {
          const dl = await dlWithRetry(`${CFG.base}/file-read-${fid}.${fext}`);
          if (!dl)
            continue;
          const ct = dl.headers.get("content-type") ?? "";
          const buf = Buffer.from(await dl.arrayBuffer());
          if (buf.length > 0 && buf.length <= IMG_MAX && ct.startsWith("image/")) {
            files.push({
              id: fid,
              name: `步骤截图${fid}.${fext}`,
              ext: fext,
              size: buf.length,
              isImage: true,
              dataUrl: `data:${ct.split(";")[0]};base64,${buf.toString("base64")}`
            });
            inlineCount += 1;
          }
        } catch {}
      }
      const stepsBlocks = [];
      const byId = new Map(files.filter((f) => f.isImage && f.dataUrl).map((f) => [f.id, f]));
      const reImg = /<img[^>]*file-read-(\d+)\.[A-Za-z]{2,4}[^>]*>/g;
      let last = 0;
      let mImg;
      while ((mImg = reImg.exec(rawSteps)) !== null) {
        const head = stepsPlain(rawSteps.slice(last, mImg.index));
        if (head)
          stepsBlocks.push({ kind: "text", text: head });
        const fid = Number(mImg[1]);
        const hit = byId.get(fid);
        if (hit?.dataUrl)
          stepsBlocks.push({ kind: "image", fileId: fid, name: hit.name, dataUrl: hit.dataUrl });
        else
          stepsBlocks.push({ kind: "text", text: `[图片${fid}未加载]` });
        last = mImg.index + mImg[0].length;
      }
      const tail = stepsPlain(rawSteps.slice(last));
      if (tail)
        stepsBlocks.push({ kind: "text", text: tail });
      const pid = Number(b.product ?? 0);
      const pname = listCache?.names.get(pid) ?? "";
      json(res, 200, {
        ok: true,
        bug: {
          id: Number(b.id ?? id),
          title: String(b.title ?? ""),
          status: String(b.status ?? ""),
          severity: Number(b.severity ?? 0),
          pri: Number(b.pri ?? 0),
          type: String(b.type ?? ""),
          productName: pname,
          projectName: String(b.projectName ?? ""),
          executionId: Number(b.execution ?? 0),
          openedBy: String(typeof b.openedBy === "object" && b.openedBy !== null ? b.openedBy.account ?? "" : b.openedBy ?? ""),
          openedDate: String(b.openedDate ?? ""),
          assignedTo: String(typeof b.assignedTo === "object" && b.assignedTo !== null ? b.assignedTo.account ?? "" : b.assignedTo ?? ""),
          stepsPlain: stepsPlain(String(b.steps ?? "")),
          stepsBlocks,
          bugUrl: `${CFG.base}/bug-view-${id}.html`,
          files
        }
      });
    })().catch(() => json(res, 500, { ok: false, error: "bug-failed" }));
    return;
  }
  if (req.method === "GET" && url.pathname === "/builds") {
    (async () => {
      const execId = Number(url.searchParams.get("execution") ?? "0");
      if (!Number.isInteger(execId) || execId <= 0)
        return json(res, 200, { ok: true, builds: [] });
      const r = await zfetch(`/executions/${execId}/builds`);
      if (r.status === 401)
        return json(res, 200, { ok: false, error: "need-config" });
      const builds = (r.json.builds ?? []).map((x) => ({ id: Number(x.id ?? 0), name: String(x.name ?? "") })).filter((x) => x.id > 0);
      json(res, 200, { ok: true, builds });
    })().catch(() => json(res, 500, { ok: false, error: "builds-failed" }));
    return;
  }
  if (req.method === "GET" && url.pathname === "/resolutions") {
    json(res, 200, {
      ok: true,
      resolutions: [
        { id: "fixed", name: "修改代码" },
        { id: "duplicate", name: "重复Bug" },
        { id: "willnotfix", name: "不予解决" },
        { id: "postponed", name: "延期处理" },
        { id: "external", name: "外部原因" },
        { id: "bydesign", name: "设计如此" },
        { id: "notrepro", name: "无法重现" }
      ]
    });
    return;
  }
  if (req.method === "GET" && url.pathname === "/users") {
    (async () => {
      const r = await zfetch("/users?limit=500");
      if (r.status === 401)
        return json(res, 200, { ok: false, error: "need-config" });
      const users = (r.json.users ?? []).map((u) => ({ account: String(u.account ?? ""), realname: String(u.realname ?? "") })).filter((u) => u.account);
      json(res, 200, { ok: true, users });
    })().catch(() => json(res, 500, { ok: false, error: "users-failed" }));
    return;
  }
  if (req.method === "POST" && url.pathname === "/resolve") {
    readBody(req).then(async (raw) => {
      if (!raw || typeof raw !== "object")
        return json(res, 400, { ok: false, error: "bad-request" });
      const body = raw;
      const bugId = Number(body.bugId ?? 0);
      const resolution = typeof body.resolution === "string" ? body.resolution : "";
      const resolvedBuild = Number(body.resolvedBuild ?? 0);
      const assignedTo = body.assignedTo;
      const comment = typeof body.comment === "string" ? body.comment.trim() : "";
      if (!Number.isInteger(bugId) || bugId <= 0)
        return json(res, 400, { ok: false, error: "bad-id" });
      if (!/^[a-z]+$/.test(resolution) || resolution.length > 20)
        return json(res, 400, { ok: false, error: "bad-resolution" });
      if (!Number.isInteger(resolvedBuild) || resolvedBuild <= 0)
        return json(res, 400, { ok: false, error: "bad-build" });
      if (!isValidAccount(assignedTo))
        return json(res, 400, { ok: false, error: "bad-account" });
      if (!comment || comment.length > 2000)
        return json(res, 400, { ok: false, error: "bad-comment" });
      try {
        const now = new Date;
        const pad = (n) => String(n).padStart(2, "0");
        const resolvedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        await zfetch(`/bugs/${bugId}/resolve`, {
          method: "POST",
          body: JSON.stringify({ resolution, resolvedBuild, resolvedDate, assignedTo, comment })
        });
        const chk = await zfetch(`/bugs/${bugId}`);
        const cb = chk.json;
        if (String(cb.status ?? "") === "resolved") {
          listCache = null;
          return json(res, 200, { ok: true });
        }
        return json(res, 200, { ok: false, error: "解决未生效（回读不一致），请浏览器确认" });
      } catch {
        return json(res, 500, { ok: false, error: "resolve-failed" });
      }
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/assign") {
    readBody(req).then(async (raw) => {
      if (!raw || typeof raw !== "object")
        return json(res, 400, { ok: false, error: "bad-request" });
      const body = raw;
      const bugId = Number(body.bugId ?? 0);
      const assignedTo = body.assignedTo;
      const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 2000) : "";
      if (!Number.isInteger(bugId) || bugId <= 0)
        return json(res, 400, { ok: false, error: "bad-id" });
      if (!isValidAccount(assignedTo))
        return json(res, 400, { ok: false, error: "bad-account" });
      try {
        const payload = { assignedTo };
        if (comment)
          payload.comment = comment;
        await zfetch(`/bugs/${bugId}/assign`, { method: "POST", body: JSON.stringify(payload) });
        const chk = await zfetch(`/bugs/${bugId}`);
        const cb = chk.json;
        const cur = cb.assignedTo;
        const curAcc = typeof cur === "string" ? cur : String(cur?.account ?? "");
        if (curAcc === assignedTo) {
          listCache = null;
          return json(res, 200, { ok: true });
        }
        return json(res, 200, { ok: false, error: "指派未生效（回读不一致），请浏览器确认" });
      } catch {
        return json(res, 500, { ok: false, error: "assign-failed" });
      }
    });
    return;
  }
  json(res, 404, { ok: false, error: "not-found" });
});
var shutdown = () => {
  server.close();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
server.listen(port, "127.0.0.1");
