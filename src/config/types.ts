/**
 * 共享类型定义
 *
 * 这里集中存放与配置相关的「常量枚举」与「纯类型」，
 * schema.ts 中的 Zod 校验直接从这些常量派生，
 * 组件与样式也引用这里导出的类型 —— 单一来源，避免重复。
 */

/** 主题模式 */
export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

/** 卡片尺寸 */
export const CARD_SIZES = ['large', 'normal', 'small'] as const;
export type CardSize = (typeof CARD_SIZES)[number];

/** 布局类型 */
export const LAYOUT_TYPES = ['bento', 'grid'] as const;
export type LayoutType = (typeof LAYOUT_TYPES)[number];

/** 背景类型 */
export const BACKGROUND_TYPES = ['aurora', 'minimal'] as const;
export type BackgroundType = (typeof BACKGROUND_TYPES)[number];

/** 背景动画速度 */
export const ANIMATION_SPEEDS = ['slow', 'normal', 'fast'] as const;
export type AnimationSpeed = (typeof ANIMATION_SPEEDS)[number];

/** Twitter / X 卡片类型 */
export const TWITTER_CARDS = ['summary', 'summary_large_image'] as const;
export type TwitterCard = (typeof TWITTER_CARDS)[number];

/** 链接的图标命名空间（目前内置 lucide，见 src/config/icons.ts） */
export const ICON_PREFIXES = ['lucide'] as const;
export type IconPrefix = (typeof ICON_PREFIXES)[number];
