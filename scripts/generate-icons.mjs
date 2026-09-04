/**
 * generate-icons.mjs —— 构建前图标生成器
 *
 * 在 pnpm dev / build / check 之前由 pre* 钩子自动执行：
 *   1. 读取 config/site.yaml，收集 links[] / social[] 用到的图标；
 *   2. 从 node_modules/lucide-static/icons 读取对应 SVG 并做轻量清理；
 *   3. Lucide 已移除的品牌图标（github / x / …）使用内置兜底数据；
 *   4. 生成 src/generated/site-icons.ts（纯静态映射表）。
 *
 * 产物在打包期被 Vite 内联进 bundle，运行时零文件 IO ——
 * 这样静态构建与 Cloudflare 适配器等任意构建环境都稳定。
 * 该文件为纯 Node ESM 脚本（.mjs），不参与 Astro 类型检查。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = join(root, 'config', 'site.yaml');
const OUTPUT_DIR = join(root, 'src', 'generated');
const OUTPUT_FILE = join(OUTPUT_DIR, 'site-icons.ts');
const LUCIDE_ICONS_DIR = join(root, 'node_modules', 'lucide-static', 'icons');

/* ------------------------------------------------------------------ */
/* 品牌图标兜底（fill 风格；CC0 数据，来自 simple-icons）               */
/* ------------------------------------------------------------------ */
const BRAND_FALLBACKS = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  x: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
  telegram:
    'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  bilibili:
    'M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z',
  wechat:
    'M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z',
};

/** 页面内固定引用的 UI 图标（主题切换按钮等，不来自配置） */
const MARKUP_ICONS = ['sun', 'moon', 'monitor'];

function fail(message) {
  console.error(`\n[icons] ${message}\n`);
  process.exit(1);
}

/** 解析配置并收集 lucide 图标名 */
function collectIconNames() {
  let yamlText;
  try {
    yamlText = readFileSync(CONFIG_PATH, 'utf8');
  } catch (cause) {
    fail(`无法读取 ${CONFIG_PATH}：${cause.message}`);
  }

  let parsed;
  try {
    parsed = parseYaml(yamlText);
  } catch (cause) {
    fail(`${CONFIG_PATH} 不是合法的 YAML：${cause.message}`);
  }

  const names = new Set(MARKUP_ICONS);
  const specs = [];
  if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.links)) specs.push(...parsed.links.map((l) => l && l.icon));
    if (Array.isArray(parsed.social)) specs.push(...parsed.social.map((s) => s && s.icon));
  }

  for (const spec of specs) {
    if (typeof spec !== 'string') continue; // 其余交给运行时 Zod 校验给出清晰报错
    const match = /^lucide:([a-z0-9-]+)$/.exec(spec);
    if (match) names.add(match[1]);
  }
  return names;
}

/**
 * 读取并清理一个 lucide 图标 SVG。
 *
 * 注意点：lucide 的图标 SVG 根标签自带 `width="24" height="24"`，需要剥掉让 CSS
 * 接管尺寸。但只能用 `<svg` 起始标签锚定去剥——`/g` 全局会把子元素（典型如
 * `<rect width="20" height="14">`）的尺寸也一起误伤，导致 rect 默认 0×0，
 * 像 monitor 这种"屏幕"元素就直接消失，只剩底部支架线条。
 * 历史 bug：2026-09 前曾用 `/\s(width|height)="\d+"/g` 全局剥，造成
 * `lucide:monitor` 渲染异常。
 */
function readLucideIcon(name) {
  const file = join(LUCIDE_ICONS_DIR, `${name}.svg`);
  if (!existsSync(file)) return null;
  return readFileSync(file, 'utf8')
    .replace(/<svg((?:[^>])*?)\s+width="\d+"/, '<svg$1')
    .replace(/<svg((?:[^>])*?)\s+height="\d+"/, '<svg$1')
    .replace(/\n\s*/g, ' ');
}

function wrapFallbackSvg(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="${d}"/></svg>`;
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */
const names = collectIconNames();
const entries = [];

for (const name of names) {
  const spec = `lucide:${name}`;
  const raw = readLucideIcon(name);
  if (raw) {
    entries.push([spec, raw]);
    continue;
  }
  const brandPath = BRAND_FALLBACKS[name];
  if (brandPath) {
    entries.push([spec, wrapFallbackSvg(brandPath)]);
    continue;
  }
  fail(
    `找不到图标 lucide:${name}：lucide-static/icons/ 下不存在 ${name}.svg。\n` +
      `        请检查 config/site.yaml 中 links[].icon / social[].icon 的拼写，` +
      `或前往 https://lucide.dev/icons 查找可用图标名。` +
      `\n        （内置品牌兜底：github / x / telegram / bilibili / wechat）`
  );
}

entries.sort((a, b) => a[0].localeCompare(b[0]));
const body = entries.map(([spec, svg]) => `  ${JSON.stringify(spec)}: ${JSON.stringify(svg)},`).join('\n');
const code =
  '// AUTO-GENERATED by scripts/generate-icons.mjs —— 请勿手改，提交前无需保留。\n' +
  '// 运行时图标映射表（打包期内联，避免任何运行时文件 IO）。\n' +
  'export const siteIconSvgs: Record<string, string> = {\n' +
  `${body}\n` +
  '};\n';

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, code, 'utf8');
console.log(`[icons] 已生成 ${entries.length} 个图标 → src/generated/site-icons.ts`);
