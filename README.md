# Hoshiumi 主页 / 入口页

一个安静、空灵、**配置驱动**的个人起始页。
基于 Astro + Tailwind CSS，纯静态输出，可直接托管到 Cloudflare Pages。

> **Hoshiumi / 星海日和**
> 于群星与潮汐之间，记录旅途与幻想
>
> 设计：日系 · 清新 · 星海 · 梦幻 · 轻二次元 · 柔和 · 空灵
> 布局：桌面端「左简介 / 右卡片」双栏；移动端纵向堆叠

## 这是什么

一个**只需要改 YAML 就能换所有内容**的门户站。头像、站名、标语、社交链接、右侧
入口卡片、深浅主题、背景、SEO 元数据——**全部在 `config/site.yaml` 一份文件里**。

适合想"挂一张个人主页"但又不想折腾 CMS / 后端 / 数据库的人。

## 功能要点

- 📄 **纯静态**：无数据库、无后端、无登录、无 CMS
- ⚙️ **配置驱动**：所有内容集中在 `config/site.yaml`
- 🧩 **Zod 校验**：YAML 写错，`pnpm build` 直接失败，并给中文字段级提示
- 🖼️ **左简介 / 右卡片**：头像 + 站名 + 标语 + 社交 + 入口卡片
- 🃏 **卡片自动生成**：`links[]` 每项自动生成一张极简卡片
- 🌙 **浅色 / 深色 / 跟随系统**：localStorage 持久化，首帧无闪烁
- ✨ **克制背景**：纯 CSS，极光 / 星光 / 噪点可选
- ♿ **无障碍**：语义化 HTML、键盘可达、focus-visible、尊重 reduced-motion
- 📈 **SEO**：title / description / canonical / OG / Twitter Card / JSON-LD
- 🚀 **轻量**：几乎零运行时 JS，无动画库、无外部字体请求

## 开始用

环境：Node.js ≥ 22.12，pnpm ≥ 10。

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # → dist/
pnpm check        # 类型检查
```

## 怎么改

绝大多数情况下你只需要改两个地方：

1. **`config/site.yaml`**：站名、卡片、社交、主题色、背景、SEO（每项都带中文注释）
2. **`public/images/`**：头像、OG 分享图、favicon

### 加一个入口卡片

```yaml
links:
  - id: github
    enabled: true
    title: GitHub
    name: 我的代码
    description: 项目与源码
    url: https://github.com/qzh200
    icon: lucide:github    # 到 https://lucide.dev/icons 找，GitHub 等品牌图标已内置
```

卡片**顺序即数组顺序**。

> 把 `layout.type` 改成 `bento` 可以做网格布局；个别卡片还能加 `featured: true` + `size: large` 跨整行。

### 临时关掉一个卡片

```yaml
- id: sink
  enabled: false
```

或者整段删掉——两者等价。

### 加一个社交图标

```yaml
social:
  - enabled: true
    label: 给我写信
    url: mailto:hello@example.com
    icon: lucide:mail
```

> `lucide:rss` / `lucide:mail` 是 Lucide 通用图标；`lucide:github` / `lucide:bilibili` 等品牌图标已经做了内置兜底（Lucide 上游移除了品牌图标）。

### 改主题色

```yaml
theme:
  default: system        # light / dark / system
  allowSwitch: true
  light:
    background: '#fdfbff'
    primary: '#8da7e8'
    secondary: '#e6a6cb'
    accent: '#b9a7e8'
  dark:
    background: '#111426'
    primary: '#9eb8ff'
    secondary: '#e7a8cf'
    accent: '#c4b4ff'
  card:
    radius: 22px
    blur: 20px
    borderOpacity: 0.35
    bgOpacity: 0.6
```

填十六进制色，YAML → CSS 变量在构建期自动完成，不需要碰任何 CSS。

### 改背景

```yaml
background:
  type: aurora            # aurora（光斑+渐变） / minimal（素净）
  image:
    enabled: false
    src: /images/background.webp
  stars: { enabled: true, count: 26 }
  glow: true
  noise: true
  gradient: true
```

### 替换图片

```
public/
├── favicon.svg
└── images/
    ├── avatar.webp      # 头像，建议 1:1
    └── og.svg           # 社交分享图占位，建议 1200×630
```

## 部署到 Cloudflare Pages

1. 推 GitHub，Cloudflare Dashboard → **Workers & Pages → Pages → Connect to Git**
2. 配置：

   | 项                       | 值           |
   | ------------------------ | ------------ |
   | Framework preset         | Astro        |
   | Build command            | `pnpm build` |
   | Build output directory   | `dist`       |
   | Environment              | 无需任何变量 |

3. **Save and Deploy**

> 也可以本地 `pnpm build` 后，把 `dist/` 拖到 Pages（Direct Upload）。

绑定自定义域名：Pages 项目 → **Custom domains → Set up a custom domain**，按提示配
DNS（`CNAME` 到 Pages 地址，或由 Cloudflare 自动创建），等证书生效即可。

## 项目结构

```
├── config/
│   └── site.yaml            # ★ 站点配置（绝大多数情况只改这一个）
├── public/                  # favicon、images、robots.txt
├── scripts/
│   └── generate-icons.mjs   # 构建前自动生成 src/generated/site-icons.ts
├── src/
│   ├── components/          # Background / Hero / SocialLinks / SiteGrid /
│   │                        # SiteCard / ThemeToggle / Footer / Icon
│   ├── config/              # 加载层：types / schema / loader / icons / helpers
│   ├── layouts/Layout.astro
│   ├── pages/index.astro
│   └── styles/global.css
├── astro.config.mjs
└── tsconfig.json
```

> `src/generated/` 是构建产物，已 `.gitignore`。

数据流：

```text
config/site.yaml
      ↓ 构建期：?raw 内联 + 提取图标
   Zod 校验（失败即中断构建）
      ↓
  SiteConfig（强类型，运行时零文件 IO）
      ↓
  Astro 组件只读渲染
```

## 常见问题

**改了 site.yaml 但 dev 页面没变？**
`config/` 不在 Astro 监听范围内，重启 `pnpm dev` 即可；构建不受影响。

**图标写错了会怎样？**
构建前的生成脚本会校验，写错直接报错并指出问题图标名。

**想不显示某个区域？**
- 隐藏顶部：把 `hero.enabled` 设 `false`
- 隐藏页脚：把 `footer.enabled` 设 `false`
- 隐藏主题切换按钮：`theme.allowSwitch: false`
- 隐藏社交图标行：`social: []`

**性能怎么样？**
几乎零运行时 JS，无动画库，无外部字体请求；首屏 SSR 渲染好骨架。

## 许可

[MIT](./LICENSE)
