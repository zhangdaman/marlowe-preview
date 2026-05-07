# MARLOWE — AI 定制钛合金狗牌独立站

> Claude Code 工作上下文文件
> 每次开始编码前，请先阅读完本文件再执行任务。
>
> **完整产品方案**：[docs/product-plan.md](docs/product-plan.md)（产品全景、定位、SKU 矩阵、商业模式、路线图、风险）
> **后端 API 规约**：[docs/api-generate.md](docs/api-generate.md)（generate 防滥用 + Stripe + 限流）
> **客服聊天机器人**：[docs/chat-bot.md](docs/chat-bot.md)（FAQ 内容 EN/ZH + UX 规约 + AI 升级路径）；widget 实现 [chat-widget.js](chat-widget.js)，挂载在 7 个核心页面（首页/designer/cart/checkout/thank-you），不挂法律页
> **账户系统 / 登录注册**：[docs/auth.md](docs/auth.md)（Magic link + Apple/Google OAuth + Supabase Auth，渐进强制——cart 仍 guest，generate 需登录）；shared wrapper [auth-state.js](auth-state.js)

---

## 1. 项目概况

**产品**：DTC 独立站，卖单一产品——AI 定制**钛合金**狗牌（v1.0）。用户上传宠物照片，系统生成可雕刻的灰阶画像，工厂按单**精密雕刻**：浅浮雕勾轮廓、影雕呈细节。

**核心工艺三件套**：
- **钛合金底材**——耐腐蚀、轻、低致敏、永不生锈（航天级常用）
- **浅浮雕**（low-relief / bas-relief）——图案凸起，可触摸
- **影雕**（halftone engraving）——密集点阵疏密呈灰阶渐变，把照片精度刻到金属上

这三个词在文案里要统一使用。**避免**：cast / forged / hammered / hand-finished metal 这种暗示传统铸造工艺的词——我们不是浇铸 brass，是钛合金精密雕刻。

**v1 / v2 路线**：v1 只卖纯钛合金狗牌，故事干净聚焦、上线快。v2 才会引入 NFC 芯片作为全新功能（届时是新批次生产）。**v1 站点任何位置不得出现 NFC / smart / lost mode / tap-to-call / medical card / 找回 / 走失 等字眼**——保持产品故事简洁。

**当前状态**：v1.0 设计原型阶段。已存在 4 个 HTML 文件，正在打磨设计、不绑定具体平台。

**品牌占位名**：MARLOWE（最终品牌名 TBD，统一替换）

**目标市场**：美国（不做中国市场，不做欧洲）

**目标客户**：35-55 岁养狗家庭，家庭年收入 $80K+，欣赏 heritage / craft 美学，主流犬种为拉布拉多、金毛、工作犬

**客单价**：$79（占位，砍 NFC 后未重新定价，留到上线前决策）

**生产周期**：下单后 7-10 个工作日

---

## 2. 产品形态（v1）

**SKU 矩阵：3 形状 × 5 表面 = 15 SKU**，统一定价 $79。

- **底材统一**：航天级钛合金（同一基材，CNC 切割 + 镜面抛光）
- **3 种形状**（工厂已落实物，designer A 步选择）：
  - **Shield 盾形**（带侧翼装饰耳，顶部一体凸起穿孔，最 heritage / iconic — designer 默认）
  - **Octagon 八角**（八边等长，独立焊接环 loop + 颈部连接）
  - **Disc 圆形**（圆盘 + 独立焊接环 loop + 颈部连接）
- **5 种表面处理**（同一钛合金基材 + PVD 镀膜 / 阳极氧化，designer B 步选择）：
  - **Antiqued Silver**（钛合金本色抛光 — designer 默认，实物对应款）
  - **Antiqued Brass**（古铜 PVD）
  - **Midnight Teal**（青色阳极氧化）
  - **Charcoal Black**（DLC 涂层）
  - **Vintage Copper**（玫瑰金 / 铜色 PVD）
- **核心工艺**：浅浮雕（low-relief）成型轮廓 + 影雕（halftone）呈现照片级灰阶细节
- 免费刻字（宠物名 + 联系电话，designer C 步输入）
- AI 生成可雕刻的灰阶肖像画像（依据用户上传照片）
- 按单生产，无库存
- **无芯片、无订阅、无配套 app**（v2 才引入）

---

## 3. 品牌调性（最重要的章节，违反这个会让产出全部作废）

### 调性方向
- Confident, not cute. 自信，不卖萌。
- Heritage, not vintage-fake. 真实工艺感，不要假复古。
- Precise, not industrial. 工艺精密，但避免冰冷的工业感（钛合金 + 影雕是现代精密制造，但 framing 要保持 craft 温度）。
- Caring, not sappy. 关怀但不煽情。

### 文案示例

**YES**（正确调性）：
- "A tag worthy of the dog wearing it."
- "We make one thing. We make it well."
- "One dog. One tag."
- "Engraved on demand. Made to outlive the leash."
- "Cut deeper than printed. Made to last as long as the metal."

**NO**（错误调性）：
- "Cutest tags ever! 🐾💕"
- "Premium quality at affordable price"
- "Trust our supply chain to deliver"
- "Best dog tag in 2025!!!"

### 参考品牌（视觉 + 调性）
- **正面**：Shinola, Filson, Hamilton Khaki Field, Found My Animal, Wild One
- **反面（绝对不要参考）**：Two Tails Pet Co（太萌系），GoTags（太工具感），AliExpress 风（太廉价感），Etsy 手工感

### AI 生成画像视觉规范

AI 出图**既是用户预览，也是工厂雕刻的源文件**——同一张灰阶肖像，先在网站上让客户看到"这是我家狗"，然后送到工厂直接驱动影雕机。所以 AI 输出必须同时满足两个目标：可识别 + 可雕刻。

**YES**（正确风格）：
- **灰阶肖像**（halftone-ready），不是 line-art
- 高对比度黑白照片质感，类似铜版画（mezzotint）/ 点绘（stippling）
- 主体居中、背景去除（让影雕只刻动物本体）
- 保留毛色明暗关系——这是辨识度的关键，黑色拉布拉多和金毛在影雕里就靠灰阶值区分
- 边缘清晰，主体跟背景之间高对比

**NO**（绝对禁止）：
- 写实风 photo-real "AI 宠物照"（美国用户一眼识破，破坏 premium）
- 卡通 / 插画 / 水彩 / 油画风
- 高饱和彩色、渐变彩虹
- Stable Diffusion 默认 anime / 3D render 美学
- Line-art / 19 世纪 heraldic seal 风（这是 logo 不是肖像，影雕机刻不出灰阶细节就浪费了工艺）
- 任何 watermark / signature / 文字残影

**实现约束**：
- 固定一套 LoRA 或 ControlNet halftone-portrait pipeline + 锁死 style prompt
- 用户**不能**自由调 prompt，只能上传照片 + 选金属表面
- 输出尺寸 / 灰阶 bit 深度需匹配影雕机参数（具体规格待工厂确认后写到 §7）
- 前端预览时把灰阶图叠在 medallion 圆形遮罩里，模拟最终雕刻效果

---

## 4. 视觉设计系统

### 颜色 Tokens（CSS 变量，所有代码必须使用这些）

```css
:root {
  /* 背景 */
  --cream: #F5F1E8;        /* 主背景，米色 */
  --cream-light: #FBF8F1;  /* 次背景，更亮一点 */
  --paper: #EDE8DA;        /* 第三背景，UGC/对比区 */
  
  /* 文字 */
  --charcoal: #1F2937;     /* 主文字色，不是纯黑 */
  --charcoal-soft: #374151;/* 次要文字 */
  --ink: #111827;          /* 最深，强对比块用 */
  
  /* 主点缀 */
  --brass: #B8956A;        /* 古铜，主点缀色 */
  --brass-deep: #8E6F47;   /* 深古铜，按钮/链接强调 */
  --brass-light: #D4B896;  /* 浅古铜 */
  
  /* 深点缀 */
  --forest: #2D3E2C;       /* 森林绿，CTA 区域 */
  --rust: #8B2E2E;         /* 深红，备用强调色（v1 暂未使用） */
  --rose: #D4B5A0;         /* 暖粉，装饰用 */
  
  /* 线 */
  --line: rgba(31, 41, 55, 0.12);
  --line-soft: rgba(31, 41, 55, 0.06);
}
```

### 字体

```css
/* 必须从 Google Fonts 加载 */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..500&family=Manrope:wght@300..700&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+SC:wght@400..600&family=Noto+Sans+SC:wght@400..600&display=swap');

/* 标题 */
font-family: 'Fraunces', 'Noto Serif SC', serif;
font-variation-settings: 'opsz' 144;

/* 正文 */
font-family: 'Manrope', 'Noto Sans SC', sans-serif;

/* 编号 / 小标签 / 等宽 */
font-family: 'JetBrains Mono', 'Noto Sans SC', monospace;
```

⚠️ **不允许使用 Inter 字体**（太通用，破坏品牌差异化）

### 排版与布局

- 大量留白（Shinola 级别，宁可空也不挤）
- 编辑感的章节编号（§ 01 / § 02 / § 03 / § 04）
- 段落标签用 small caps + letter-spacing 0.18em 大写
- 卡片内子项用 A / B / C 而非 1 / 2 / 3
- **按钮直角**（border-radius: 0），heritage 风必须直角
- **不要 drop shadow**，用 1px 微弱 border 即可
- 容器最大宽度 1320px，左右 padding 32px / 移动端 20px

### 动效

- 滚动出现：`opacity 0→1, translateY 24px→0, 800ms cubic-bezier(0.4, 0, 0.2, 1)`
- 卡片 hover：`translateY -4px, shadow soft`
- 按钮 hover：颜色翻转（charcoal bg ↔ cream bg）
- **禁用**：parallax、neon、霓虹光、夸张渐变（除了金属拟物的 radial gradient）、Lottie、3D 库

### 装饰元素

- 用 SVG 自绘宠物轮廓 / 盾牌轮廓（不用照片）
- 金属质感用 radialGradient 模拟（参考已有文件）
- 背景叠 4% 不透明度的 SVG 噪点纹理（已在文件中实现）

---

## 5. 文件结构

```
项目根目录/
├── CLAUDE.md              ← 本文件
├── index.html             ← 英文首页（生产候选）
├── index-zh.html          ← 中文首页（内部评审）
├── designer.html          ← 英文设计器页面
└── designer-zh.html       ← 中文设计器页面
```

### v1 待开发页面 backlog（按优先级）
1. **about.html** — 品牌故事完整版
2. **faq.html** — 含定制时效、退换货政策、材质保养
3. **shipping.html** — 运费 / 时效 / 退换政策

### v2 backlog（NFC 推出后才做，v1 站点不出现）
- profile.html — 扫码档案页
- lost-found.html — 走失服务专题页
- 后端：NFC 注册 / 扫码计数 / 走失模式切换 / SMS 通知

---

## 6. 编码规范

- HTML 写**语义标签**：`<section>`, `<nav>`, `<article>`, `<header>`, `<footer>`
- CSS **按 section / 功能分组**，加注释如 `/* Hero ====... */`
- 所有颜色用 **CSS 变量**，不要写死十六进制
- SVG **全部内联**（单文件零外部依赖）
- **移动端优先**响应式：测 375px / 768px / 1280px 三档
- **禁止 emoji** 出现在代码或文案
- 提交前**清掉 console.log**
- 类名用 **kebab-case**（如 `.hero-grid`、`.metal-feature`）
- 不要用 BEM 复杂命名

---

## 7. 技术架构

### 当前阶段：纯静态 HTML/CSS/JS
- 不引入任何框架（no React, no Vue, no Svelte）
- 不需要构建步骤（no Webpack, no Vite）
- 所有 JS 写在 HTML 内联 `<script>` 中
- 所有 CSS 写在 HTML 内联 `<style>` 中（保持单文件可分发）

### 未来阶段（仅作参考，**当前不要重构到这些**）
- 前端：React + Next.js（自研独立站路线）
- 购物车 / 结账 / 支付：**自建**（不走 Shopify）。支付集成 Stripe（卡 + Apple Pay + Google Pay），可选 PayPal
- 订单 / 用户 / 定制数据：Node.js (NestJS) + PostgreSQL on AWS us-east-1
- AI 出图：Replicate API 或自部署 SD + ControlNet（用户上传宠物照片 → 生成 halftone-ready 灰阶肖像，**既给客户预览也直接送到影雕机**——同一张图，双用途）
- **Generate API 防滥用**：见 [docs/api-generate.md](docs/api-generate.md)——Cloudflare Turnstile + 邮箱限流 (3/小时, 10/天) + IP 限流 (5/小时) 三层防护；前端 customize 面板需 gate 邮箱才能 Generate
- 通知：SendGrid (Email) — v1 用；SMS 推迟到 v2
- **v2 才需要**：NFC 后端（注册 / 扫码计数 / 走失切换）+ Redis + Twilio SMS

---

## 8. Anti-Patterns（绝对不要做的事）

写代码时如果你正想做下面任何一件事，**停下来，换方案**：

- ❌ 不要用 Tailwind utility classes（本项目用纯 CSS 控制设计）
- ❌ 不要用 Bootstrap / Material UI / Ant Design（错误调性）
- ❌ 不要用 Inter 字体（太通用）
- ❌ 不要用 emoji（任何位置）
- ❌ 不要用 placeholder 图片服务（如 placehold.it）—— 用 SVG 自绘 + 色块
- ❌ 不要写圆角按钮（border-radius > 4px）
- ❌ 不要用 drop shadow（用 1px border 替代）
- ❌ 不要用 console.log 调试后留在代码里
- ❌ 不要用 `<div class="container">` 这种无意义嵌套——用语义标签
- ❌ 不要用 jQuery（vanilla JS 完全够用）

> **注**：AI 生成图是产品核心机制（用户上传宠物照片 → 生成金属浮雕画像），可以用，但要包装得像 "工艺草图 / craftsman's rendering"，避免生成 photo-real 假宠物照让人识破。

---

## 9. 任务执行原则

收到任何编码任务，按以下顺序处理：

1. **读取相关现有文件**（`index-zh.html`、`designer-zh.html` 等），理解已有约定
2. **复用已有组件 / 样式**，不要重新造轮子
3. **如有疑问先问，不要自作主张**——例如新增 section 不知道放哪一屏，先问设计意图
4. **改动尽量最小**，不要顺便重构无关代码
5. **完成后告知验证方法**：用什么浏览器尺寸、要看哪几个交互、可能哪里出错

---

## 10. 成功标准

任何输出都要满足：

- [ ] 跟现有 4 个 HTML 视觉风格一致（不是新风格）
- [ ] 移动端 / 桌面端都能正常显示
- [ ] 颜色和字体严格用 CSS 变量
- [ ] 没有违反 anti-patterns 章节的任何一条
- [ ] 文案符合品牌调性（confident / heritage / smart / caring，不 cute / 不 sappy）
- [ ] 在浏览器 DevTools 控制台没有 error 和 warning

---

> **更新这份文件**：每次有重大决策（如选定品牌名、决定上线平台、确认价格）后，回来更新对应章节，让 Claude Code 始终拿最新的上下文。
