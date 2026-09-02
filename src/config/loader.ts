/**
 * 配置加载器（v3：构建期内联，运行时零文件 IO）
 *
 * 数据流：config/site.yaml（?raw 内联）→ YAML 解析 → Zod 校验 → SiteConfig
 *
 * 通过 Vite 的 `?raw` 把 YAML 文本直接打进 bundle，并在模块求值时完成
 * YAML 解析与 Zod 校验 —— 全程不触碰文件系统。因此无论在普通静态构建、
 * Astro dev，还是 Cloudflare 适配器（pre-render 工作目录会改变）中，
 * 本模块都稳定可用。
 *
 * 校验失败会抛出带中文说明的错误，构建 / 开发启动时直接失败。
 */
import yamlSource from '../../config/site.yaml?raw';
import { parse as parseYaml } from 'yaml';
import { formatZodIssues, siteConfigSchema, type SiteConfig } from './schema';

let cachedConfig: SiteConfig | null = null;
let cachedError: unknown = null;

/** 读取并校验站点配置（结果缓存，各组件共享同一份配置） */
export function getSiteConfig(): SiteConfig {
  if (cachedConfig) return cachedConfig;
  if (cachedError) throw cachedError;

  try {
    const parsed: unknown = parseYaml(yamlSource);

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('[config] config/site.yaml 内容为空或顶层不是对象（应为 map / 键值结构）。');
    }

    const result = siteConfigSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`[config] ${formatZodIssues(result.error)}`);
    }

    cachedConfig = result.data;
    return cachedConfig;
  } catch (error) {
    cachedError = error;
    throw error;
  }
}

/** 便于组件按需引入配置类型 */
export type { SiteConfig, SiteLink } from './schema';
