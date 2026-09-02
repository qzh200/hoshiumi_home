// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * 站点级配置（网址、标题、主题色……）全部来自 config/site.yaml，
 * 本文件只负责构建层面的设置，不包含任何站点信息。
 *
 * 默认纯静态输出：pnpm build 产出 dist/，可直接部署到
 * Cloudflare Pages（Framework preset: Astro）或任意静态托管。
 * 若走 Cloudflare Workers / wrangler deploy 流程，Cloudflare 会自动
 * 追加 @astrojs/cloudflare 适配器 —— 本项目配置与图标均在打包期内联，
 * 不依赖运行目录，两种流程都能通过。
 */
export default defineConfig({
  output: 'static',
  compressHTML: true,
  logLevel: 'info',

  vite: {
    plugins: [tailwindcss()],
  },
});
