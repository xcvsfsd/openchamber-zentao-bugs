// Work Status 区：我的 Bug 数，点击打开本扩展面板。
import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import type { CountAnswer } from '../shared/types.ts';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Missing #root');
root.innerHTML = `<style>
body{margin:0;font:12px/1.5 system-ui,sans-serif}
#root{padding:2px 4px;cursor:pointer}
.m{opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style><div class="m" id="m">禅道: …</div>`;
const m = document.querySelector('#m') as HTMLElement;

root.onclick = () => {
  void host.openSurface('plugin:zentao-bugs').catch(() => undefined);
};

const poll = async (): Promise<void> => {
  if (document.hidden) return;
  try {
    const r = await host.serviceRequest({ method: 'GET', path: '/count' });
    const j = JSON.parse(r.body) as CountAnswer;
    if (!j.ok) {
      m.textContent = '禅道: 待登录（面板⚙连接）';
      return;
    }
    m.textContent = `禅道: 🐞${j.total}`;
    void host.setBadge(j.total > 0 ? j.total : null).catch(() => undefined);
    const h = Math.ceil(root.getBoundingClientRect().height);
    void host.setHeight(h).catch(() => undefined);
  } catch {
    m.textContent = '禅道: 未启用本地服务';
  }
};

setInterval(() => void poll(), 30000);

host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  void poll();
});
