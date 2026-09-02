# Hoshiumi Start Page / Portal

一个**安静、清新、配置驱动**的个人起始页 / 入口页（Start Page）主题，
基于 **Astro + Tailwind CSS** 构建，纯静态输出，可直接部署到 **Cloudflare Pages**。

> 设计语言：日系 · 清新 · 星海 · 梦幻 · 轻二次元 · 柔和 · 空灵。
> 配色以淡蓝 / 淡紫 / 淡粉 / 白为主，克制留白，而不是炫技。

**Hoshiumi / 星海日和**
**于群星与潮汐之间，记录旅途与幻想**

---

## 项目截图

> TODO：在此放置桌面端 / 移动端 / 深色模式截图。

## 特性

- 📄 **纯静态**：无数据库、无后端、无登录、无 CMS，构建产物可直接托管
- ⚙️ **配置驱动**：网站名、标语、SEO、卡片、主题色、背景、动画、页脚……
  全部集中在 `config/site.yaml`，改配置即改网站
- 🧩 **Zod 校验**：配置错误时 `pnpm build` 直接失败并给出中文字段级提示
- 🃏 **卡片自动生成**：`links[]` 每一项自动生成一张卡片，支持大小 / 置顶 / 隐藏
- 🧊 **Bento 网格**：大卡片自动跨行，桌面 2 列、移动端自动单列
- 🌙 **浅色 / 深色 / 跟随系统**：localStorage 持久化，首帧无闪烁
- ✨ **克制的背景**：极浅蓝紫粉渐变 + 柔和光斑 + 少量星光 + 极弱噪点（纯 CSS）
- ♿ **无障碍**：语义化 HTML、键盘可达、focus-visible、reduced-motion
- 📈 **SEO**：title / description / canonical / Open Graph / Twitter Card / JSON-LD
- 🚀 **性能优先**：几乎零运行时 JS，不引入动画库，无外部字体请求

## 快速开始

环境要求：Node.js ≥ 22.12，pnpm ≥ 10。

```bash
# 1. 安装依赖
pnpm install

# 2. 本地开发
pnpm dev          # 默认 http://localhost:4321

# 3. 构建静态站点（输出到 dist/）
pnpm build

# 4. 类型检查
pnpm check
```

## 配置你的站点

**只需要编辑 `config/site.yaml` 一个文件**（已带完整中文注释），
以及替换 `public/` 下的图标与图片。

### 添加一个站点（卡片）

在 `config/site.yaml` 的 `links:` 中追加一项即可，**无需修改任何源码**：

```yaml
- id: github          # 唯一标识（字母 / 数字 / _ / -）
  enabled: true       # false 时隐藏
  title: GitHub       # 英文标题
  name: 我的代码       # 中文名 / 副标题
  description: 项目与源码
  url: https://github.com/example
  displayUrl: github.com/example   # 留空会自动从 url 推导
  icon: lucide:folder-git          # https://lucide.dev/icons（lucide 已移除 github 等品牌图标）
  featured: false
  size: normal         # large（跨整行）/ normal / small
```

卡片**顺序即 `links:` 数组顺序**，无需额外的 `order` 字段。

### 删除 / 隐藏一个站点

```yaml
- id: sink
  enabled: false   # ← 改为 false 即隐藏（保留配置，随时可恢复）
```

整段删除同样可行。

### 修改主题颜色

编辑 `theme:` 段落，全部为 6 位十六进制色：

```yaml
theme:
  default: system        # light / dark / system
  allowSwitch: true
  light:
    background: '#fdfbff'
    primary: '#8da7e8'    # 主色（淡蓝）
    secondary: '#e6a6cb'  # 辅助色（淡粉）
    accent: '#b9a7e8'     # 强调色（淡紫）
  dark:
    background: '#111426' # 深色请用深蓝 / 靛蓝，避免纯黑
    primary: '#9eb8ff'
    secondary: '#e7a8cf'
    accent: '#c4b4ff'
  card:
    radius: 24px
    blur: 18px
    borderOpacity: 0.4
    bgOpacity: 0.55
```

颜色会被自动编译为 CSS 变量供全站引用，你不需要改任何 CSS。

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
    count: 30             # 星星数量，克制优先（建议 20 ~ 60）
  glow: true              # 柔和光斑
  noise: true             # 极弱噪点
  gradient: true          # 蓝紫粉渐变氛围
```

### Dark Mode

- 右上角按钮在 浅色 → 深色 → 跟随系统 间循环；
- 选择会写入 `localStorage`，下次访问自动恢复；
- 未手动选择时跟随 `prefers-color-scheme`；
- 深色模式采用深蓝 / 靛蓝基调，星光会更明显。

### 替换图标与图片

```
public/
├── favicon.svg          # 网站图标（站点 logo，SVG 即可）
└── images/
    ├── avatar.svg       # Hero 头像占位（正式使用建议替换为 avatar.webp）
    └── og.svg           # 社交分享图占位（建议替换为 1200×630 的 og.webp/png）
```

替换后记得同步修改 `config/site.yaml` 中的 `site.favicon` / `site.avatar` /
`site.defaultOgImage` / `seo.openGraph.image` 路径。

## Cloudflare Pages 部署

1. 把项目推送到 GitHub（或直接连接 Git 仓库）；
2. 在 Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**；
3. 按下面配置：

   | 项目           | 值              |
   | -------------- | --------------- |
   | Framework preset | Astro         |
   | Build command  | `pnpm build`    |
   | Build output directory | `dist` |
   | Root directory | `/`（默认）     |
   | Environment    | 无需任何变量     |

4. 点击 **Save and Deploy**。

> 也可使用 **Direct Upload**：本地 `pnpm build` 后把 `dist/` 拖入
> Cloudflare Pages 上传即可，无需连接 Git。

### 绑定自定义域名

1. 在 Pages 项目 → **Custom domains → Set up a custom domain**；
2. 输入 `hoshiumi.xyz`，Cloudflare 会提示添加 DNS 记录；
3. 在域名面板把 `hoshiumi.xyz` 解析到该 Pages 项目
   （如 `CNAME pages.dev` 地址，或由 Cloudflare 自动创建）；
4. 等待证书生效（几分钟），即可通过 `https://hoshiumi.xyz` 访问；
5. 如需 `www` 或其它子域入口，重复上述步骤添加即可。

## 项目结构

```
├── config/
│   └── site.yaml            # ★ 站点配置（绝大多数情况下只改这里）
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/              # avatar / og 等静态资源
├── src/
│   ├── components/          # Background / Hero / SiteCard / SiteGrid /
│   │                        # ThemeToggle / Footer / Icon
│   ├── config/              # 配置加载层
│   │   ├── types.ts         #   枚举与类型（单一来源）
│   │   ├── schema.ts        #   Zod Schema 与中文错误提示
│   │   ├── loader.ts        #   YAML → 校验 → SiteConfig
│   │   ├── icons.ts         #   lucide 图标构建期解析
│   │   └── helpers.ts       #   派生工具（展示地址、版权年份等）
│   ├── layouts/Layout.astro # SEO + 主题 CSS 变量 + 主题引导脚本
│   ├── pages/index.astro    # 唯一页面
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
到 https://lucide.dev/icons 搜索，把名称写成 `lucide:名称` 即可。
构建时会校验图标是否存在，写错会直接报错提示。
> 注意：Lucide 新版已移除 GitHub / Twitter 等品牌图标，
> 请改用 `folder-git`、`code-xml`、`rss` 等非品牌图标。

**不想显示某块区域？**
`hero.enabled` / `footer.enabled` 设 `false`；`theme.allowSwitch: false` 隐藏主题按钮。

## License

[MIT](./LICENSE)
