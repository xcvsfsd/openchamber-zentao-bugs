// 构建：与 resource-monitor 一致，输出 IIFE 给面板 + Node 版给 service。
// OpenChamber 装扩展不构建，所以 panel/main.js、status/main.js、service/main.js 必须提交。
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const targets = [
  { entry: 'src/panel/main.ts', out: 'panel/main.js', node: false },
  { entry: 'src/status/main.ts', out: 'status/main.js', node: false },
  { entry: 'src/service/main.ts', out: 'service/main.js', node: true },
];

for (const target of targets) {
  const result = await Bun.build({
    entrypoints: [resolve(target.entry)],
    format: target.node ? 'esm' : 'iife',
    target: target.node ? 'node' : 'browser',
    minify: !target.node,
  });
  const artifact = result.outputs[0];
  if (!result.success || !artifact) {
    console.error(result.logs.map((log) => log.message).join('\n') || `Build failed: ${target.entry}`);
    process.exit(1);
  }
  await writeFile(resolve(target.out), await artifact.text());
  console.log(`${target.out}  ${(artifact.size / 1024).toFixed(1)} KB`);
}
