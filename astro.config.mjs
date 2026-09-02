// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * 站点级配置（网址、标题、主题色……）全部来自 config/site.yaml，
 * 本文件只负责构建层面的设置，不包含任何站点信息。
 */
export default defineConfig({
  // 纯静态输出（适配 Cloudflare Pages / 任意静态托管）
  output: 'static',

  // 压缩 HTML 输出
  compressHTML: true,

  // 控制台与构建信息更安静
  logLevel: 'info',

  vite: {
    plugins: [tailwindcss()],
  },
});
