/**
 * 图标运行时查找（v3）
 *
 * 所有图标 SVG 由 scripts/generate-icons.mjs 在构建前生成到
 * src/generated/site-icons.ts，并在打包期内联 —— 运行时只做查表，
 * 不读文件系统，保证任意构建环境（静态 / Cloudflare 适配器）一致。
 */
import { siteIconSvgs } from '../generated/site-icons';

const cache = new Map<string, string>();

/**
 * 取回 `lucide:图标名` 对应的原始 SVG 字符串（尺寸交由 CSS 控制）。
 * 生成产物中缺失时抛出清晰错误，提示重新生成。
 */
export function loadLucideIconSvg(spec: string): string {
  const hit = cache.get(spec);
  if (hit) return hit;

  const svg = siteIconSvgs[spec];
  if (!svg) {
    throw new Error(
      `[icons] 缺少图标 ${spec}：图标未在构建产物中。\n` +
        `        请确认拼写为 lucide:图标名，并重新运行 pnpm prebuild` +
        `（或直接执行 pnpm dev / pnpm build / pnpm check 自动重新生成）。`
    );
  }

  cache.set(spec, svg);
  return svg;
}
