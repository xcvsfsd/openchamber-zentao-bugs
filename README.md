# openchamber-zentao-bugs

禅道指派 Bug 面板，给 OpenChamber 用的扩展。仿 `openchamber-git-commit` 结构（panel + status + service），中文界面。

## 功能

- 我的 Bug：指派给我的全部 Bug 按创建时间倒序，面板展示前 10 条；状态栏显示总数 `🐞N`，图标 badge 同步
- 每条三个按钮：
  - 提取发会话：详情（标题/状态/严重/优先级/产品/重现步骤/附件名）拼成 Markdown，图片 ≤300KB 内嵌 base64（最多 3 张），直接 `prompt(send:true)` 发到当前会话
  - 指派：行内展开，拼音/姓名/账号过滤（pinyin-pro），常用人按使用次数置顶（localStorage），备注框（从会话结果粘贴），确定后调禅道指派接口并回读校验
  - 浏览器打开：`host.openUrl` 跳 `bug-view-{id}.html`
- service 直调禅道 REST v1：`POST /tokens` 换 token（内存缓存 10 分钟，401 自动刷），列表走 `GET /products/:id/bugs?assignedTo=` 合并排序

## 安装

OpenChamber → 设置 → 扩展 → 粘贴 Git 地址或本地文件夹添加：

```text
/home/liaoz/code/openchamber-zentao-bugs
```

批准 `service` 能力，点 rail 上 Bug 图标。

## 环境变量（service 读环境，必须配）

service 不存凭据，每次用环境变量换 token。给 openchamber 服务加 drop-in：

```ini
# ~/.config/systemd/user/openchamber.service.d/zentao.conf
[Service]
Environment=ZENTAO_BASE_URL=http://10.1.20.201:8088/zentao
Environment=ZENTAO_ACCOUNT=你的账号
Environment=ZENTAO_PASSWORD=你的密码
Environment=NO_PROXY=10.0.0.0/8,192.168.0.0/16
Environment=no_proxy=10.0.0.0/8,192.168.0.0/16
```

```bash
systemctl --user daemon-reload
systemctl --user restart openchamber   # 会掉线，自己点头再执行
```

## 说明

- 面板只读列表/详情；唯一写操作是指派（带回读校验，失败会明示）。
- 改完 `bun run build`，提交 built 文件（`panel/main.js`、`status/main.js`、`service/main.js` 必须提交）。
- 内网自签证书场景 service 会直接报错（不做跳验证），先保证 `curl $ZENTAO_BASE_URL/api.php/v1/tokens` 能通。

## License

MIT
