# Hoshiumi Start Page / Portal

一个**安静、空灵、配置驱动**的个人起始页 / 入口页（Start Page）主题，
基于 **Astro + Tailwind CSS** 构建，纯静态输出，可直接部署到 **Cloudflare Pages**。

**Hoshiumi / 星海日和**
**于群星与潮汐之间，记录旅途与幻想**

> 设计：日系 · 清新 · 星海 · 梦幻 · 轻二次元 · 柔和 · 空灵。
> 布局：桌面端「**左简介 / 右卡片**」双栏门户，移动端纵向堆叠。

---

## 项目截图

> TODO：在此放置桌面端 / 移动端 / 深色模式截图。

## 特性

- 📄 **纯静态**：无数据库、无后端、无登录、无 CMS，产物可直接托管
- ⚙️ **配置驱动**：站名、标语、卡片、社交、主题色、背景、动画、SEO……
  全部集中在 `config/site.yaml`
- 🧩 **Zod 校验**：配置错误时 `pnpm build` 直接失败并给出中文字段级提示
- 🖼️ **左简介 / 右卡片**：左侧头像 + 站名 + 标语 + 社交图标，右侧入口卡片成块
- 🃏 **卡片自动生成**：`links[]` 每一项自动生成一张极简卡片（图标 + 英文名 + 中文名 + 一句话）
- 🌙 **浅色 / 深色 / 跟随系统**：localStorage 持久化，首帧无闪烁
- ✨ **克制的背景**：淡蓝紫粉渐变 + 柔和光斑 + 少量星光 + 极弱噪点（纯 CSS）
- ♿ **无障碍**：语义化 HTML、键盘可达、focus-visible、reduced-motion
- 📈 **SEO**：title / description / canonical / Open Graph / Twitter Card / JSON-LD
- 🚀 **性能优先**：几乎零运行时 JS，无动画库、无外部字体请求

## 快速开始

环境要求：Node.js ≥ 22.12，pnpm ≥ 10。

```bash
pnpm install
pnpm dev          # 本地开发 http://localhost:4321
pnpm build        # 构建静态站点，输出到 dist/
pnpm check        # 类型检查
```

## 配置你的站点

只需要编辑 `config/site.yaml`（已带完整中文注释），
以及替换 `public/` 下的图标与图片。

### 添加一个站点（右侧卡片）

在 `config/site.yaml` 的 `links:` 下追加一项即可，**无需修改任何源码**：

```yaml
- id: github
  enabled: true
  title: GitHub
  name: 我的代码
  description: 项目与源码
  url: https://github.com/qzh200
  icon: lucide:github    # https://lucide.dev/icons（github 等品牌图标已内置）
```

卡片**顺序即 `links:` 数组顺序**，无需 `order` 字段。

> 若把 `layout.type` 改为 `bento`，可再给个别卡片加
> `featured: true` 与 `size: large`（跨整行大卡）。

### 删除 / 隐藏一个站点

```yaml
- id: sink
  enabled: false   # ← false 即隐藏（保留配置，随时可恢复）
```

整段删除同样可行。

### 添加社交图标（左侧）

在 `config/site.yaml` 的 `social:` 列表中添加：

```yaml
social:
  - enabled: true
    label: 给我写信
    url: mailto:hello@example.com
    icon: lucide:mail
  - enabled: true
    label: GitHub
    url: https://github.com/qzh200
    icon: lucide:github
```

> `rss`、`mail` 等为 Lucide 图标；GitHub / X / Telegram / Bilibili / 微信
> 等**品牌图标已内置兜底**（Lucide 上游移除了品牌图标），直接写
> `lucide:github` 即可使用。

### 修改主题颜色

编辑 `theme:` 段落，全部为 6 位十六进制色：

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

颜色会被自动编译为 CSS 变量供全站引用，无需修改任何 CSS。

### 修改背景

编辑 `background:` 段落：

```yaml
background:
  type: aurora            # aurora（光斑+渐变） / minimal（素净）
  image:
    enabled: false        # 启用整幅背景图（放到 public/）
    src: /images/background.webp
  stars:
    enabled: true
    count: 26             # 星星数量，克制优先
  glow: true
  noise: true
  gradient: true
```

### Dark Mode

右上角按钮在 浅色 → 深色 → 跟随系统 间循环，选择写入 `localStorage`，
未选择时跟随 `prefers-color-scheme`；深色模式采用深蓝 / 靛蓝基调。

### 替换图标与图片

```
public/
├── favicon.svg          # 网站图标
└── images/
    ├── avatar.webp      # 头像图片（建议 1:1 正方形，WebP/PNG 均可）
    └── og.svg           # 社交分享图占位（建议替换为 1200×630 图片）
```

替换后同步修改 `config/site.yaml` 中的对应路径。

## Cloudflare Pages 部署

1. 把项目推送到 GitHub，进入 Cloudflare Dashboard → **Workers & Pages → Pages → Connect to Git**；
2. 按下面配置：

   | 项目           | 值           |
   | -------------- | ------------ |
   | Framework preset | Astro      |
   | Build command  | `pnpm build` |
   | Build output directory | `dist` |
   | Root directory | `/`（默认）  |
   | Environment    | 无需任何变量  |

3. 点击 **Save and Deploy**。

> 也可 **Direct Upload**：本地 `pnpm build` 后把 `dist/` 拖入 Pages 即可。

### 绑定自定义域名

1. Pages 项目 → **Custom domains → Set up a custom domain**，输入 `hoshiumi.xyz`；
2. 按提示添加 DNS 记录（`CNAME` 到 Pages 地址，或由 Cloudflare 自动创建）；
3. 等待证书生效，即可通过 `https://hoshiumi.xyz` 访问。

## 项目结构

```
├── config/
│   └── site.yaml            # ★ 站点配置（绝大多数情况下只改这里）
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/              # avatar / og 等静态资源
├── src/
│   ├── components/          # Background / Hero / SocialLinks / SiteGrid /
│   │                        # SiteCard / ThemeToggle / Footer / Icon
│   ├── config/              # 配置加载层
│   │   ├── types.ts         #   枚举与类型（单一来源）
│   │   ├── schema.ts        #   Zod Schema 与中文错误提示
│   │   ├── loader.ts        #   YAML → 校验 → SiteConfig
│   │   ├── icons.ts         #   lucide 图标构建期解析
│   │   └── helpers.ts       #   派生工具
│   ├── layouts/Layout.astro # SEO + 主题 CSS 变量 + 主题引导脚本
│   ├── pages/index.astro    # 唯一页面（左右分栏）
│   └── styles/global.css    # 全站样式（消费 CSS 变量，不写死品牌色）
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

数据流：

```text
config/site.yaml
      ↓ YAML 解析
   Zod 校验（失败即中断构建）
      ↓
  SiteConfig（强类型）
      ↓
  Astro 组件只读渲染
```

## 常见问题

**改了 site.yaml 但 dev 页面没变？**
`config/` 不在 Astro 的监听范围内，修改后请重启 `pnpm dev`；构建不受影响。

**图标怎么找？**
到 https://lucide.dev/icons 搜索，写成 `lucide:名称` 即可。
构建时会校验图标是否存在，写错会直接报错提示。

**不想要某个区域？**
`hero.enabled` / `footer.enabled` 设 `false`；`theme.allowSwitch: false` 隐藏主题按钮；
`social: []` 隐藏社交图标行。

## License

[MIT](./LICENSE)
