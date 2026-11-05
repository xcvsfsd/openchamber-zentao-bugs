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

OpenChamber → 设置 → 扩展 → 粘贴 Git 地址添加：

```text
https://github.com/xcvsfsd/openchamber-zentao-bugs
```

本地开发可用文件夹路径安装（改完 `bun run build` 即生效）：

```text
/home/liaoz/code/openchamber-zentao-bugs
```

批准 `service` 能力，点 rail 上 Bug 图标。

## 连接（面板内设置）

点面板右上 ⚙，填禅道地址/账号/密码 → 保存并连接。配置只存本浏览器
localStorage，service 换 token 后只放内存，不落盘；service 重启后打开
面板自动重连。状态栏 `禅道: 待登录` 表示还没连。

## 说明

- 面板只读列表/详情；唯一写操作是指派（带回读校验，失败会明示）。
- 改完 `bun run build`，提交 built 文件（`panel/main.js`、`status/main.js`、`service/main.js` 必须提交）。
- 内网自签证书场景 service 会直接报错（不做跳验证），先保证 `curl $ZENTAO_BASE_URL/api.php/v1/tokens` 能通。

## License

MIT
