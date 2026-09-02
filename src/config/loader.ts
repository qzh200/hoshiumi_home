/**
 * 配置加载器
 *
 * 数据流：config/site.yaml → yaml 解析 → zod 校验 → 类型安全的 SiteConfig
 *
 * 校验失败会在构建 / 开发启动时直接抛出带中文说明的错误，
 * 让用户在 config/site.yaml 中即可完成修复，而无需深入源码。
 */
import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { formatZodIssues, siteConfigSchema, type SiteConfig } from './schema';
import { loadLucideIconSvg } from './icons';

const CONFIG_RELATIVE_PATH = 'config/site.yaml';

/** 配置文件名（用于报错提示） */
export const CONFIG_FILENAME = 'site.yaml';

let cachedConfig: SiteConfig | null = null;
let cachedError: unknown = null;

/** 定位 config/site.yaml 的绝对路径 */
function locateConfigFile(): string {
  const candidates: string[] = [];

  const cwd = process.cwd();
  if (cwd) candidates.push(resolve(cwd, CONFIG_RELATIVE_PATH));

  // 兜底：相对 src/config 目录向上两级（src/config -> src -> 项目根）
  const here = dirname(fileURLToPath(import.meta.url));
  candidates.push(resolve(here, '..', '..', 'config', 'site.yaml'));

  for (const candidate of candidates) {
    if (isAbsolute(candidate)) {
      try {
        if (readFileSync(candidate, 'utf8').length > 0) return candidate;
      } catch {
        // 继续尝试下一个候选路径
      }
    }
  }

  throw new Error(
    `[config] 未找到 ${CONFIG_RELATIVE_PATH}。\n` +
      `        请确认项目根目录下存在 config/site.yaml（当前工作目录：${cwd}）。`
  );
}

/**
 * 读取并校验站点配置。
 *
 * 结果会被缓存；各组件调用本函数拿到的是同一份配置对象。
 * 开发期修改 config/site.yaml 后请重启 dev server 使其生效。
 */
export function getSiteConfig(): SiteConfig {
  if (cachedConfig) return cachedConfig;
  if (cachedError) throw cachedError;

  try {
    const filePath = locateConfigFile();

    let rawText: string;
    try {
      rawText = readFileSync(filePath, 'utf8');
    } catch (cause) {
      throw new Error(`[config] 无法读取配置文件 ${filePath}：${(cause as Error).message}`);
    }

    let parsed: unknown;
    try {
      parsed = parseYaml(rawText);
    } catch (cause) {
      throw new Error(`[config] ${CONFIG_FILENAME} 不是合法的 YAML：${(cause as Error).message}`);
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`[config] ${CONFIG_FILENAME} 内容为空或顶层不是对象（应为 map / 键值结构）。`);
    }

    const result = siteConfigSchema.safeParse(parsed);
    if (!result.success) {
      const message = formatZodIssues(result.error);
      throw new Error(`[config] ${message}`);
    }

    const config = result.data;

    // 预热并校验所有链接图标与社交图标，确保图标名可解析、错误在构建期尽早暴露
    for (const link of config.links) {
      loadLucideIconSvg(link.icon);
    }
    for (const item of config.social) {
      loadLucideIconSvg(item.icon);
    }

    cachedConfig = config;
    return config;
  } catch (error) {
    cachedError = error;
    throw error;
  }
}

/**
 * 解析期辅助类型——方便组件拿到「站点配置」的 TS 类型而无需依赖 zod。
 * 组件直接 `import type { SiteConfig } from '../config/schema'` 亦可。
 */
export type { SiteConfig, SiteLink } from './schema';
