/**
 * config/site.yaml 的 Zod 校验 Schema
 *
 * 职责：
 *   1. 用 zod 严格校验配置文件的结构、类型、枚举与取值范围；
 *   2. 校验失败时抛出「可读的中文错误」，让 pnpm build 直接失败并给出
 *      精确到字段路径的修复提示，绝不静默忽略错误配置。
 *
 * 若在 config/site.yaml 中新增 / 修改字段，请同步修改本文件。
 */
import { z } from 'zod';
import {
  ANIMATION_SPEEDS,
  BACKGROUND_TYPES,
  CARD_SIZES,
  LAYOUT_TYPES,
  THEME_MODES,
  TWITTER_CARDS,
} from './types';

/* ------------------------------------------------------------------ */
/* 通用原子校验器                                                      */
/* ------------------------------------------------------------------ */

/** 长度值，如 24px / 0px / 1.5rem 之外的统一提示 */
const pxValue = z
  .string()
  .regex(/^(0|[1-9]\d*)(\.\d+)?px$/, '必须是像素长度，例如 24px（或 0px）');

/** 十六进制颜色，#rrggbb */
const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, '必须是 6 位十六进制颜色，例如 #8da7e8');

/** 0 ~ 1 之间的小数（透明度 / 不透明度） */
const opacity01 = z
  .number()
  .min(0, '取值范围为 0 ~ 1')
  .max(1, '取值范围为 0 ~ 1');

/** 正整数（数量类字段） */
const positiveInt = z.number().int('必须是整数').min(0, '不能小于 0');

/** 站内相对路径或 http(s) 绝对地址 */
const internalOrHttpPath = z
  .string()
  .min(1, '不能为空字符串')
  .refine(
    (v) => v.startsWith('/') || /^https?:\/\//.test(v),
    '必须是站内路径（以 / 开头）或 http(s) 链接'
  );

/** 普通 http(s) 地址 */
const httpUrl = z
  .string()
  .url('必须是合法的 URL，例如 https://example.com')
  .refine((v) => /^https?:\/\//.test(v), '只支持 http:// 或 https:// 链接');

/* ------------------------------------------------------------------ */
/* 站点基本                                                             */
/* ------------------------------------------------------------------ */

const siteSchema = z
  .object({
    title: z.string().trim().min(1, '不能为空字符串'),
    alternate: z.string().trim().min(1, '不能为空字符串'),
    subtitle: z.string().trim().min(1, '不能为空字符串'),
    description: z.string().trim().min(1, '不能为空字符串'),

    url: httpUrl,
    language: z
      .string()
      .regex(/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})?$/, '必须是合法语言标签，例如 zh-CN / en'),
    timezone: z.string().min(1, '不能为空字符串'),

    favicon: internalOrHttpPath,
    avatar: internalOrHttpPath,
    defaultOgImage: internalOrHttpPath,

    startYear: z
      .number()
      .int('必须是整数年份')
      .min(1900, '年份过小')
      .max(new Date().getFullYear() + 1, '年份不能超过明年'),

    keywords: z.array(z.string().trim().min(1, '关键词不能为空字符串')).max(40, '关键词最多 40 个'),
  })
  .strict('存在未知字段，请检查拼写');

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const heroSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().trim().min(1, '不能为空字符串'),
    subtitle: z.string().trim().min(1, '不能为空字符串'),
    description: z.string().min(1, '不能为空字符串'),
    // avatar / decoration 两个子块均为可选：缺省或 enabled: false 即不展示
    avatar: z
      .object({
        enabled: z.boolean(),
      })
      .strict('存在未知字段，请检查拼写')
      .optional(),
    decoration: z
      .object({
        enabled: z.boolean(),
        text: z.string().trim().min(1, '不能为空字符串'),
      })
      .strict('存在未知字段，请检查拼写')
      .optional(),
  })
  .strict('存在未知字段，请检查拼写');

/* ------------------------------------------------------------------ */
/* 链接（站点卡片）                                                     */
/* ------------------------------------------------------------------ */

const linkSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, '不能为空字符串')
      .regex(/^[a-zA-Z0-9_-]+$/, '只能包含字母、数字、下划线与连字符'),

    enabled: z.boolean(),

    /** 英文标题（卡片主标题） */
    title: z.string().trim().min(1, '不能为空字符串'),
    /** 中文名 / 别名（副标题） */
    name: z.string().trim().min(1, '不能为空字符串'),
    description: z.string().trim().min(1, '不能为空字符串'),

    url: internalOrHttpPath,

    /** 展示用域名；留空时自动从 url 推导（可选） */
    displayUrl: z
      .string()
      .trim()
      .refine(
        (v) => v === '' || !/\s/.test(v),
        '展示地址不能包含空格，请去掉协议前缀，例如 blog.hoshiumi.xyz'
      )
      .optional(),

    /** 图标，格式 lucide:图标名（如 lucide:book-open） */
    icon: z
      .string()
      .trim()
      .regex(/^lucide:[a-z0-9-]+$/, '图标格式应为 lucide:图标名，例如 lucide:book-open'),

    featured: z.boolean(),
    size: z.enum(CARD_SIZES),
  })
  .strict('存在未知字段，请检查拼写');

/* ------------------------------------------------------------------ */
/* 布局 / 主题 / 背景 / 动画 / 页脚 / SEO                                */
/* ------------------------------------------------------------------ */

const layoutSchema = z
  .object({
    type: z.enum(LAYOUT_TYPES),
    maxWidth: pxValue,
    columns: z.number().int('必须是整数').min(1, '至少 1 列').max(4, '最多 4 列'),
    gap: pxValue,
    mobile: z
      .object({
        columns: z.number().int('必须是整数').min(1, '至少 1 列').max(2, '移动端最多 2 列'),
      })
      .strict('存在未知字段，请检查拼写'),
  })
  .strict('存在未知字段，请检查拼写');

const themeSchema = z
  .object({
    default: z.enum(THEME_MODES),
    allowSwitch: z.boolean(),

    light: z
      .object({
        background: hexColor,
        primary: hexColor,
        secondary: hexColor,
        accent: hexColor,
      })
      .strict('存在未知字段，请检查拼写'),
    dark: z
      .object({
        background: hexColor,
        primary: hexColor,
        secondary: hexColor,
        accent: hexColor,
      })
      .strict('存在未知字段，请检查拼写'),

    card: z
      .object({
        radius: pxValue,
        /** 毛玻璃模糊量；0px 表示关闭模糊 */
        blur: pxValue,
        /** 卡片边框不透明度 0~1 */
        borderOpacity: opacity01,
        /** 卡片底色不透明度 0~1；1 表示接近不透明 */
        bgOpacity: opacity01,
      })
      .strict('存在未知字段，请检查拼写'),
  })
  .strict('存在未知字段，请检查拼写');

const backgroundSchema = z
  .object({
    /** aurora：主题色光斑 + 渐变氛围；minimal：只保留底色与可选噪点 */
    type: z.enum(BACKGROUND_TYPES),

    image: z
      .object({
        enabled: z.boolean(),
        src: internalOrHttpPath.optional(),
        /** 图片不透明度 0~1 */
        opacity: opacity01.default(0.6),
      })
      .strict('存在未知字段，请检查拼写'),

    stars: z
      .object({
        enabled: z.boolean(),
        count: positiveInt.max(160, '星星数量过多，建议 ≤ 120'),
      })
      .strict('存在未知字段，请检查拼写'),

    glow: z.boolean(),
    noise: z.boolean(),
    gradient: z.boolean(),
  })
  .strict('存在未知字段，请检查拼写')
  .superRefine((bg, ctx) => {
    if (bg.image.enabled && !bg.image.src) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['image', 'src'],
        message: 'background.image.enabled 为 true 时必须提供 src 图片路径',
      });
    }
  });

const animationSchema = z
  .object({
    enabled: z.boolean(),

    entrance: z
      .object({
        enabled: z.boolean(),
        /** 相邻卡片入场动画间隔（毫秒） */
        stagger: z.number().int('必须是整数毫秒').min(0, '不能小于 0').max(1000, '最多 1000ms'),
      })
      .strict('存在未知字段，请检查拼写'),

    card: z
      .object({
        hover: z.boolean(),
        /** 悬浮上移距离（px，负数表示向上） */
        translateY: z.number().int('必须是整数 px').min(-12, '不要超过 -12px').max(0, '只能为 0 或负数'),
      })
      .strict('存在未知字段，请检查拼写'),

    background: z
      .object({
        enabled: z.boolean(),
        speed: z.enum(ANIMATION_SPEEDS),
      })
      .strict('存在未知字段，请检查拼写'),

    respectReducedMotion: z.boolean(),
  })
  .strict('存在未知字段，请检查拼写');

const footerSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().trim().min(1, '不能为空字符串'),
    description: z.string().trim().min(1, '不能为空字符串'),
    /** 支持 {year} 占位符，构建时自动替换为年份或年份区间 */
    copyright: z.string().trim().min(1, '不能为空字符串'),
  })
  .strict('存在未知字段，请检查拼写');

const seoSchema = z
  .object({
    title: z.string().trim().min(1, '不能为空字符串'),
    description: z.string().trim().min(1, '不能为空字符串'),
    canonical: httpUrl,

    openGraph: z
      .object({
        enabled: z.boolean(),
        /** 留空时回退到 site.defaultOgImage */
        image: internalOrHttpPath.optional(),
      })
      .strict('存在未知字段，请检查拼写'),

    twitter: z
      .object({
        enabled: z.boolean(),
        card: z.enum(TWITTER_CARDS),
      })
      .strict('存在未知字段，请检查拼写'),
  })
  .strict('存在未知字段，请检查拼写');

/* ------------------------------------------------------------------ */
/* 顶层配置                                                            */
/* ------------------------------------------------------------------ */

export const siteConfigSchema = z
  .object({
    site: siteSchema,
    hero: heroSchema,
    links: z.array(linkSchema),
    layout: layoutSchema,
    theme: themeSchema,
    background: backgroundSchema,
    animation: animationSchema,
    footer: footerSchema,
    seo: seoSchema,
  })
  .strict('存在未知字段，请检查拼写')
  .superRefine((config, ctx) => {
    // links[].id 必须唯一
    const ids = config.links.map((l) => l.id);
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['links'],
          message: `存在重复的链接 id："${id}"，请保证 links[].id 全局唯一`,
        });
        break;
      }
      seen.add(id);
    }
  });

/** 由 Schema 推导出的完整配置类型 */
export type SiteConfig = z.infer<typeof siteConfigSchema>;

/** 单个链接的完整配置类型 */
export type SiteLink = z.infer<typeof linkSchema>;

/** 把部分 zod 内置的英文提示翻译为中文，其余保持（多数字段已自带中文 message） */
function localizeMessage(issue: z.ZodIssue): string {
  const raw = issue.message;
  if (raw === 'Required') return '该项必填，但配置中缺失或为 null';

  if (raw.startsWith('Invalid enum value')) {
    const allowed = [...raw.matchAll(/'([^']+)'/g)].map((m) => m[1]!).join(' | ');
    const received = (issue as { received?: unknown }).received;
    const suffix = received === undefined ? '' : `（当前值：${JSON.stringify(received)}）`;
    return allowed ? `不是合法的枚举值，应为：${allowed}${suffix}` : raw;
  }

  if (raw.startsWith('Invalid url')) return '不是合法的 URL（需要 http:// 或 https:// 开头）';
  if (raw.startsWith('Invalid literal value')) return '与允许的字面量值不匹配';

  return raw;
}

/** 把 ZodError 渲染成易读的中文多行文本 */
export function formatZodIssues(error: z.ZodError): string {
  const lines = error.issues.map((issue, index) => {
    const path = issue.path.length > 0 ? `config:${issue.path.join('.')}` : 'config';
    const input = (issue as { input?: unknown }).input;
    const value = input === undefined ? '' : JSON.stringify(input);
    return `  ${index + 1}. ${path}  →  ${localizeMessage(issue)}${value ? `（当前值：${value}）` : ''}`;
  });
  return `config/site.yaml 校验失败，共 ${error.issues.length} 个问题：\n${lines.join('\n')}`;
}
