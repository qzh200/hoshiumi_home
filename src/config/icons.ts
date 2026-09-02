/**
 * Lucide 图标解析器（构建期）
 *
 * 配置中以 `lucide:图标名`（如 `lucide:book-open`）声明图标，
 * 这里在构建期从 lucide-static 依赖中读取对应的原始 SVG，
 * 并内联到页面 —— 零运行时 JS、零请求、可被静态托管缓存。
 *
 * 这是一个「通用映射机制」：
 *   1. 解析 `lucide:` 前缀；
 *   2. 在 lucide-static/icons/ 目录下按图标名查找同名 .svg；
 *   3. 找不到时抛出清晰错误，让 pnpm build 失败（不静默回退）。
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

/** 模块级缓存：避免重复读盘 */
const cache = new Map<string, string>();

let packageRootCache: string | null = null;

/** 定位已安装的 lucide-static 包根目录（兼容 pnpm 软链） */
function resolveLucideStaticRoot(): string {
  if (packageRootCache) return packageRootCache;

  let main: string;
  try {
    main = require.resolve('lucide-static');
  } catch {
    throw new Error(
      '[icons] 无法解析依赖 lucide-static，请先执行 pnpm install，并确认其已写入 package.json 的 dependencies。'
    );
  }

  let dir = dirname(main);
  for (;;) {
    const manifestPath = join(dir, 'package.json');
    if (existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { name?: string };
        if (manifest.name === 'lucide-static') {
          packageRootCache = dir;
          return dir;
        }
      } catch {
        // 继续向上查找
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error('[icons] 已找到 lucide-static，但无法确认其包目录结构，请检查依赖安装是否完整。');
}

/** 校验图标名是否合法，并返回小写标准化结果 */
function normalizeIconName(raw: string): string {
  const match = /^[a-z0-9-]+$/.exec(raw);
  if (!match) {
    throw new Error(`[icons] 非法的图标名："${raw}"，图标名只能包含小写字母、数字与连字符。`);
  }
  return raw;
}

/**
 * 读取 lucide 图标的原始 SVG 字符串（已剥离固定尺寸，便于 CSS 控制大小）。
 * @param spec 形如 `lucide:book-open`
 */
export function loadLucideIconSvg(spec: string): string {
  const cached = cache.get(spec);
  if (cached) return cached;

  const prefix = 'lucide:';
  if (!spec.startsWith(prefix)) {
    throw new Error(`[icons] 不支持的图标前缀："${spec}"。当前仅支持 lucide 图标，格式为 lucide:图标名。`);
  }

  const name = normalizeIconName(spec.slice(prefix.length));
  const root = resolveLucideStaticRoot();
  const file = join(root, 'icons', `${name}.svg`);

  if (!existsSync(file)) {
    throw new Error(
      `[icons] 找不到图标 lucide:${name}：在 lucide-static/icons/ 下不存在 ${name}.svg。` +
        `\n        请检查 config/site.yaml 中 links[].icon 的拼写，或前往 https://lucide.dev/icons 查找可用图标名。`
    );
  }

  const raw = readFileSync(file, 'utf8');

  // 去掉固定 width/height，让图标尺寸完全交给 CSS 控制
  const cleaned = raw
    .replace(/\s(width|height)="\d+"/g, '')
    // lucide 图标默认继承 currentColor
    .replace(/\n\s*/g, ' ');

  cache.set(spec, cleaned);
  return cleaned;
}
