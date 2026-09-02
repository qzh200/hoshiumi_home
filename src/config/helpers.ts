/**
 * 基于站点配置的派生工具函数
 *
 * 这些函数把「配置原始值」加工成组件需要的「渲染值」，
 * 让 .astro 组件保持薄、保持只读配置不写死信息。
 */
import type { SiteConfig, SiteLink } from './schema';

/** 链接是否为外部 http(s) 链接 */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** 从 url 推导简洁的主机名（如 https://blog.example.com/ → blog.example.com） */
function deriveHost(url: string): string {
  try {
    const host = new URL(url).host;
    return host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** 卡片上展示的地址：优先 displayUrl，缺省时自动从 url 推导 */
export function displayUrlOf(link: SiteLink): string {
  const explicit = link.displayUrl?.trim();
  if (explicit) return explicit;
  if (!isExternalUrl(link.url)) return link.url;
  return deriveHost(link.url);
}

/** 渲染用链接属性：站内链接同页跳转，站外链接新标签打开 */
export function linkTarget(link: SiteLink): { target: string; rel?: string } {
  if (!isExternalUrl(link.url)) return { target: '_self' };
  return { target: '_blank', rel: 'noopener noreferrer' };
}

/** 只保留 enabled: true 的链接（顺序保持 YAML 数组顺序） */
export function enabledLinks(config: SiteConfig): SiteLink[] {
  return config.links.filter((link) => link.enabled);
}

/** 把站内路径拼成绝对 URL（用于 og:image 等） */
export function absoluteUrl(base: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl.slice(1) : pathOrUrl;
  return `${base.replace(/\/+$/, '')}/${normalized}`;
}

/** OG 图片绝对地址：seo.openGraph.image → site.defaultOgImage → site.avatar 依次回退 */
export function ogImageUrl(config: SiteConfig): string {
  const candidates = [
    config.seo.openGraph.enabled ? config.seo.openGraph.image : undefined,
    config.site.defaultOgImage,
  ];
  const found = candidates.find((c): c is string => Boolean(c));
  return found ? absoluteUrl(config.site.url, found) : '';
}

/** 版权年份：startYear 与当前年份一致显示单年，否则显示区间 */
export function copyrightRange(startYear: number): string {
  const current = new Date().getFullYear();
  return current > startYear ? `${startYear}–${current}` : `${startYear}`;
}

/** 渲染页脚版权文本（替换 {year} 占位符） */
export function renderCopyright(template: string, startYear: number): string {
  return template.replace('{year}', copyrightRange(startYear));
}
