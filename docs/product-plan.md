# MARLOWE — 产品方案 v1.0

> AI 定制钛合金宠物狗牌 · DTC 独立站 · 美国市场
> 内部参考文档，给团队 / 后端工程师 / 设计师 / 潜在投资人 share。

---

## 0. 一句话产品

**MARLOWE 是一个美国市场 DTC 独立站，卖单一产品——AI 定制钛合金狗牌。** 用户上传宠物照片，AI 处理成可雕刻的灰阶肖像，工厂用「浅浮雕 + 影雕」双工艺刻在钛合金上，按单生产，$79 一枚，免运费 7–10 个工作日交付。

---

## 1. 产品定位

### 谁是客户

35–55 岁美国养狗家庭，年收入 $80K+，欣赏 heritage / craft 美学。主流犬种：拉布拉多、金毛、罗威纳、各类工作犬。

### 客户为什么愿意花 $79 买一枚狗牌

宠物用品市场（一般狗牌 $10–$25）和高端纪念品市场（手工镀金 $150+）之间存在一个空白带。MARLOWE 打的是这个中段：**把 AI + 影雕这种"看似科技"的工艺包装成"现代精密 craft"叙事**——不是迪士尼周边的塑料感，也不是假复古的纹章 logo，而是"航天级钛合金 + 像照片一样精度的影雕肖像，每一只狗只刻一枚"。

### 卖点 ranking（客户大脑里的购买理由）

1. **独一无二**——每一张 halftone 肖像基于客户自己的照片生成，不复用、不再造
2. **永久耐用**——钛合金不锈不褪色不磨损，刻字是切刻不是印刷
3. **高级工艺感**——浅浮雕（3D 凸起）+ 影雕（灰阶细节）双工艺的视觉冲击力，是普通激光刻字达不到的
4. **完整故事性**——「从你家狗的照片到金属上的肖像」这条叙事链条本身值钱

### 不是什么

- 不是 NFC 智能狗牌（v1 完全砍掉，v2 再叠加）
- 不是宠物纪念品 / 棺材饰物（heritage 调性 ≠ 死亡纪念）
- 不是廉价快销批发（不做 Amazon、不做大经销商，DTC only）
- 不是定制礼品平台（不做多品类）

---

## 2. 市场 & 渠道

| 维度 | 决策 |
|---|---|
| **目标市场** | 美国 50 州 + DC + APO/FPO/DPO + U.S. 领地。**v1 不做国际**，等 GMV 跑起来再扩 |
| **不做** | 中国市场、欧洲、亚太——v1 聚焦美国，避免跨境合规 / 物流复杂度 |
| **渠道** | DTC 独立站。**不上 Amazon、不上 Etsy、不上 Shopify** ([CLAUDE.md §7](../CLAUDE.md))。自建购物车 / 结账，Stripe 收单 |
| **首批获客** | Instagram 内容 + Pinterest（heritage / craft pet 标签社区）+ Google Search "custom titanium dog tag"。Influencer 试用第一阶段 |
| **复购** | v1 几乎无复购（一狗一牌）。**第二阶段靠多狗家庭、礼品**（送朋友 / 家人狗），以及 v2 NFC 升级换牌 |

---

## 3. 产品形态

### SKU 矩阵：3 形状 × 5 表面处理 = **15 SKU**，统一定价 $79

**3 形状**（工厂已有实物模具）：

| 代号 | 形状 | 视觉特征 | designer 默认 |
|---|---|---|---|
| `shield` | 盾形 | 上半部带侧翼装饰耳，顶部一体凸起穿孔 | ✓ |
| `octagon` | 八角形 | 八边等长，独立焊接环 + 颈部连接 | |
| `disc` | 圆形 | 圆盘 + 独立焊接环 + 颈部连接 | |

**5 表面处理**（同一钛合金基材 + PVD 镀膜 / 阳极氧化）：

| 代号 | 名称 | 工艺 | designer 默认 |
|---|---|---|---|
| `silver` | Antiqued Silver | 钛合金本色抛光（实物基础款） | ✓ |
| `brass` | Antiqued Brass | 古铜 PVD 镀膜 | |
| `teal` | Midnight Teal | 青色阳极氧化 | |
| `charcoal` | Charcoal Black | DLC 涂层 | |
| `copper` | Vintage Copper | 玫瑰金 / 铜色 PVD | |

### 客户定制项

- **形状 × 表面处理**：从 15 SKU 中选
- **刻字**：宠物名（≤12 字符，免费）+ 联系电话（自由格式，免费）
- **AI 肖像**：上传宠物照片，AI 处理成 halftone 灰阶图，**这是核心定制内容**

### 不能定制的（v1 严格收窄）

- 字体（固定 Fraunces serif）
- 字号 / 排版位置
- 装饰元素（爪印、边框等都是固定的）
- 厚度 / 尺寸（单一尺寸）
- 没有"高级版" / "豪华版"——单一 $79

> 收窄定制范围 = 控制工厂端 SKU 复杂度 + 减少客户决策疲劳 + 拉高生产效率。每一项可定制都是 ops 复杂度的乘数。

### 工艺三件套（文案统一用这三个词）

1. **钛合金**（titanium）——航天 / 医疗级常用，耐腐蚀、轻、低致敏、永不生锈
2. **浅浮雕**（low-relief）——图案凸起轮廓，可触摸
3. **影雕**（halftone engraving）——密集点阵疏密呈现照片级灰阶细节

**避免使用的词**：cast / forged / hammered / hand-finished metal——这些暗示传统铸造，跟我们现代精密制造不符。

---

## 4. 品牌 & 调性

### 调性方向

- **Confident, not cute.** 自信，不卖萌
- **Heritage, not vintage-fake.** 真实工艺感，不要假复古
- **Precise, not industrial.** 工艺精密，但避免冰冷的工业感
- **Caring, not sappy.** 关怀但不煽情

### 文案示例

**YES**：
- "A tag worthy of the dog wearing it."
- "We make one thing. We make it well."
- "One dog. One tag."
- "Engraved on demand. Made to outlive the leash."
- "Cut deeper than printed. Made to last as long as the metal."

**NO**：
- "Cutest tags ever! 🐾💕"（萌 + emoji）
- "Premium quality at affordable price"（廉价话术）
- "Best dog tag in 2025!!!"（quality cliché）

### 视觉参考

- **正面**：Shinola、Filson、Hamilton Khaki Field、Found My Animal、Wild One
- **反面（绝对避免）**：Two Tails Pet Co（太萌）、GoTags（太工具感）、AliExpress 风（太廉价感）、Etsy 手工感

### 设计 token

- 字体：Fraunces（标题 serif）、Manrope（正文 sans）、JetBrains Mono（编号 / 小标签）
- 色彩：cream `#F5F1E8` 主背景 + brass `#B8956A` 主点缀 + charcoal `#1F2937` 主文字
- 排版：编辑感章节编号（§ 01 / § 02）+ 段落标签 small caps + 大量留白
- 按钮直角（border-radius: 0），不要 drop shadow（用 1px border 替代）

详见 [CLAUDE.md §3-§4](../CLAUDE.md)。

---

## 5. 核心用户旅程

### 5.1 首页 → 设计器（acquisition）

```
首页 hero（实景照 ranger.png + heritage 调性副标）
   ↓ "Open The Designer" CTA
designer.html · Stage 1（Upload）
   ↓ 拖照片或选 sample chip
designer.html · Stage 2（Customize）
```

### 5.2 设计器三段式（核心转化路径）

| Stage | 内容 | 状态 |
|---|---|---|
| **1 Upload** | 拖拽 / 点击 / sample chip 上传宠物照片 | ✅ v1 已做 |
| **2 Customize** | A 选形状 / B 选表面 / C 刻字（宠物名 + 电话）/ **D 邮箱 + Turnstile gate** → "Generate my portrait" CTA | ✅ v1 已做 |
| **3 Generate + Confirm** | Loading view（5 步状态文案 + 进度条）→ 自动切到 Final view（含 halftone 狗头预览 + Add to Cart） | ✅ v1 已做 |

**关键决策**：先选形状 / 颜色 / 刻字（无 AI 成本），最后才点 Generate 触发 AI 出图——把 AI 调用从「上传后立即跑」推迟到「客户已经投入精力定制后才跑」，提高每次 AI 调用的下单概率。

### 5.3 购物车 → 结账 → 确认

```
final view → "Add to Cart"
   ↓（写 localStorage marlowe_cart）
cart.html（数量调整 / 移除 / 总价 / Proceed to Checkout）
   ↓
checkout.html（联系信息 + 地址 + Stripe Payment Element）
   ↓ "Place Order"
thank-you.html?order=MX...（订单号 + 物流时间线 + 24h 取消提醒）
```

详见已有页面 + 后端契约（待接 [docs/api-generate.md](api-generate.md) + Stripe）。

### 5.4 订单后流程（后端 ops）

| 时间 | 动作 | 触发 |
|---|---|---|
| T+0 | 订单确认邮件 | Stripe webhook → SendGrid template |
| T+24h | **取消窗口关闭，订单进入生产**（不做 proof approval，以 designer 实时预览为准） | Cron 定时任务 |
| T+24h–10 days | 工厂收单、CNC 切割、PVD/阳极氧化、影雕 | 工厂端协作 |
| T+10–11 days | 包装（亚麻布袋 + 钢印盒）+ 物流取件 | 仓储 |
| T+11 days | 发货 + tracking 邮件 | 物流 webhook |
| T+14–16 days | 客户收货 | — |

---

## 6. AI 策略

### 6.1 AI 出图的双用途

**同一张 AI 输出 = 客户预览 + 工厂雕刻源文件**

```
客户上传照片 (.jpg/.png/.heic/.webp, ≤10MB)
   ↓
AI pipeline (Replicate halftone-portrait or self-hosted SD + ControlNet)
   ↓
灰阶 halftone 肖像图 (PNG)
   ├── 客户预览（嵌入 medallion 圆形 viewport）
   └── 工厂影雕机直接驱动源文件
```

**风格规约**（[CLAUDE.md §3 AI 视觉规范](../CLAUDE.md)）：
- ✅ YES：halftone-ready 灰阶肖像、铜版画 / 点绘质感、高对比度黑白照片感、主体居中、背景去除
- ❌ NO：写实 photo-real "AI 宠物照"、卡通 / 插画风、高饱和彩色、line-art / heraldic seal 风（影雕机刻不出灰阶细节就浪费工艺）

### 6.2 防滥用：3 层防御

| 层 | 措施 | 限度 |
|---|---|---|
| 1 | Cloudflare Turnstile（前端反爬虫） | 每次 generate 必须带 token |
| 2 | 邮箱限流（后端 Redis） | 每邮箱 3 次/小时 + 10 次/天 |
| 3 | IP 限流（后端 Redis 兜底） | 每 IP 5 次/小时 |

完整规约 → **[docs/api-generate.md](api-generate.md)**

### 6.3 AI 成本投影

每次生成 ~$0.05（Replicate 基线）：

| 用户类型 | 行为 | AI 成本 |
|---|---|---|
| 100 个真客户 | 平均 2.5 次生成 → 成单 | $12.50 |
| 100 个机器人攻击 | Turnstile 拦 95% → 5 个漏过去 → 各最多 3 次 | $0.75 |
| **合计每 ~$7,900 营收 cohort** | | **$13.25** |

AI 成本 ≈ **0.17% 营收**，可忽略。Margin 安全。

### 6.4 隐私

- AI 处理照片**只用于生成本订单的 halftone**——不训练任何模型，不分享给第三方除 AI 服务商和工厂
- 原始上传照片**1 年后自动删除**（生成的 halftone 作为订单凭证保留）
- 完整规约 → [privacy.html](../privacy.html) §03

---

## 7. 商业模式

### 7.1 单价结构

| 项目 | 金额 |
|---|---|
| Marlowe 售价（v1 占位） | **$79.00** |
| AI 出图（生成 + 重新生成） | $0.10–0.15 |
| 钛合金原材 + CNC + 表面处理 + 影雕 | TBD（工厂报价待补） |
| 包装（亚麻 + 卡片 + 信封） | ~$3.5 |
| 美区 Standard Shipping（USPS / UPS） | ~$4.5–7 |
| Stripe 手续费（2.9% + $0.30） | ~$2.6 |
| **预估毛利** | **TBD（看工厂报价）** |

### 7.2 价格策略

- **统一 $79，不做形状 / 颜色差价**——简化购买决策；复杂形状（盾）的成本溢价由简单形状（圆）的成本节余抵消
- **不做 tier / 高级版** v1——低复杂度 + 单一价格点 = 营销和库存简单
- **不做促销码 / 折扣**初期——heritage 品牌不打折，价格信号一致

### 7.3 关键开放问题

- [ ] 工厂报价：钛合金 + CNC + PVD/阳极氧化 + 影雕 单件成本是多少？毛利能不能达到 70%+？
- [ ] $79 到上线前是否需要重新校准？（v1 设的占位）
- [ ] 是否做 gift card？是否做 newsletter 订阅者首单 $5 off？

---

## 8. 技术架构

### 8.1 v1 现阶段（纯静态原型）

- **前端**：原生 HTML/CSS/JS，9 个页面（[index](../index.html) / [index-zh](../index-zh.html) / [designer](../designer.html) / [designer-zh](../designer-zh.html) / [cart](../cart.html) / [checkout](../checkout.html) / [thank-you](../thank-you.html) / [privacy](../privacy.html) / [terms](../terms.html) / [returns](../returns.html) / [shipping](../shipping.html) / [contact](../contact.html)）
- 无构建步骤，无框架依赖，无外部 CDN 除字体
- 单文件可分发（CSS / JS 都内联）
- localStorage 存购物车（key: `marlowe_cart`）

### 8.2 v1 上线版（前端 + 后端）

待后端工程师对接：

| 组件 | 选型 | 用途 |
|---|---|---|
| **前端** | 仍可保持 v1 静态原型，或迁 React + Next.js | 看后端开发节奏 |
| **支付** | Stripe Payment Element | 卡 + Apple Pay + Google Pay。**不走 Shopify** |
| **AI 出图** | Replicate API（halftone pipeline）或自部署 SD + ControlNet | 详见 [docs/api-generate.md](api-generate.md) |
| **反爬虫** | Cloudflare Turnstile（不用 reCAPTCHA） | 详见 [docs/api-generate.md §3](api-generate.md) |
| **限流 / 缓存** | Redis | 邮箱 + IP 限流 keys |
| **订单 / 用户 / 定制数据** | Node.js (NestJS) + PostgreSQL on AWS us-east-1 | |
| **邮件** | SendGrid | 订单确认 / 发货通知 / newsletter |
| **CDN / 图片存储** | Cloudflare R2 或 S3 + CloudFront | 用户上传照片 + halftone 输出 |
| **税** | Stripe Tax（自动跨州） | 加州 nexus 起步 |
| **分析** | Plausible 或 GA4 | 见 [docs/api-generate.md §9 监控指标](api-generate.md) |

### 8.3 后端 API 接口（前端已 wired）

- `POST /api/upload` — 用户照片上传 → R2/S3
- `POST /api/generate` — AI 出图触发，返回 `{ job_id }`，详见 [docs/api-generate.md §4](api-generate.md)
- `GET /api/jobs/:id` — 轮询 AI 出图状态
- `POST /api/orders` — 创建订单 + Stripe Payment Intent → 返回 `{ orderId, clientSecret }`
- Stripe webhook：payment success → 触发工厂订单 + 邮件确认

### 8.4 生产部署

未拍板：
- 美东 us-east-1 还是 us-west-2 部署？（用户在加州 → west 网络更快，但 east 价格 / 第三方服务支持更好）
- 域名（marlowe.example 是占位）
- DNS / SSL（Cloudflare 免费层够用）

---

## 9. 路线图

### v1.0 — MVP 上线（**当前阶段**）

**已完成**：
- 9 个完整页面（首页中英 / designer 中英 / cart / checkout / thank-you / 4 个法律页 / contact）
- 设计器 3 段式流程（上传 / 定制 / 生成确认）
- 错误态 5 种 reason 切换
- localStorage 购物车 + Stripe 集成入口（待 publishable key）
- 客服聊天机器人（scripted bot，[docs/chat-bot.md](chat-bot.md)）
- AI 防滥用 spec [docs/api-generate.md](api-generate.md)
- 法律页（含 AI 数据处理告知，符合 CCPA / GDPR）

**v1 in progress**（决策于 2026-05-07）：
- **账户系统提到 v1**——见 [docs/auth.md](auth.md)：渐进强制（cart 仍 guest，generate 需登录）+ Magic link + Apple/Google OAuth + Supabase Auth
- 新页面：`login.html` / `auth-callback.html` / `account.html`
- Designer 删除 D — Email section，改为「点 Generate 时弹登录模态」
- 新增 `auth-state.js` 共享 auth wrapper
- nav 加登录态显示（Sign in 链接 / 已登录 user pill）
- 上线时间相应延后 1-2 周

**待后端**：
- 接 **Supabase Auth**（创建 project + 配置 magic link + Apple/Google OAuth）
- 接 Replicate / Stripe / Redis / SendGrid / R2
- 真 Cloudflare Turnstile
- 把所有 `[Atelier address]` / `marlowe.example` 占位替换为真实信息
- 律师 review 4 个法律页 + 新增账户数据节

**P1 上线后两周内补**：
- 每页 meta tags + favicon + sitemap.xml + robots.txt
- about.html / faq.html
- GA4 / Plausible 接入
- Newsletter 表单接 SendGrid
- 用户上传后照片预览确认（Stage 1.5）
- 订单状态查询页

### v1.5 — 数据驱动优化（上线后 1-3 个月）

| 增强 | 触发条件 / 优先级 |
|---|---|
| ~~Account 系统 + 一键 reorder + 设计存档~~ | **已提至 v1**，见 [docs/auth.md](auth.md) |
| 一键 reorder 流（基于 v1 已存档的设计）| **P1**，账户系统就绪后立即上 |
| Add-to-Cart 解锁无限免费 regenerate | `gen_to_checkout` 比例 < 25% 时上 |
| 流失客户挽回邮件（48h 后送 free shipping） | 数据看 `gen_success` 但没 `gen_to_checkout` 的用户 ≥ 50% |
| 狗狗"生日"年度提醒邮件 | 客户首单填生日 → cron 1 年后触发 |
| Order tracking dashboard | GMV 跑到 $50K+ 后客户关怀压力大时 |
| Schema.org 结构化数据 / 完整 SEO | Google 收录稳定后 |
| Care & Repair 页 + Workshop notes 博客 | 内容营销启动 |

#### §V1.5-A · Reorder & 复购流（P1）

**为什么这是 v1.5 第一优先级**：单价 $79、毛利 70%+ 的生意，复购率从 5% 提升到 20% 直接翻 4 倍 LTV。客户在 Why 章节已经看到「同款再订 / 成长纪念 / 备用件」承诺（首页 §03 callout），v1.5 必须兑现。

**复购场景**（按预估占比排序）：
1. **每年一枚**——客户为狗的不同人生阶段订（1岁、3岁、5岁……）。AI 生成基于"当下照片"——每年的它都不同，肖像也不同
2. **多狗家庭**——一只狗一枚，家里 2-3 只狗就 2-3 枚
3. **不同 finish 收集**——同一只狗 × 不同 shape × 不同 finish（盾形银 + 八角铜 + 圆形炭黑……）
4. **备用件**——丢了 / 损坏的备份
5. **送礼**——朋友 / 家人 / 同事的狗

**功能拆解**：
- 客户账户系统（叠加在 guest checkout 之上，不强制注册——下单时 prompt "Save this design to your account?"）
- 订单 archive：每个订单保留 shape / color / 文字 / halftone 输出 + 用户是否选了「保留照片用于以后 reorder」consent
- "我的设计"页面：列出所有过往订单 + 一键 "Reorder" 按钮
- Reorder 流分叉：
  - "Use the same design"（直接进 cart，不调 AI 不收钱）
  - "Update photo for a new portrait"（重新走 designer，但 shape / color / 文字预填）
- 邮件触发器：
  - 狗狗"生日"提醒（首单填写宠物生日，**1 年后**自动 nudge："为它的 X 岁做一枚？"——首页 callout 「每年一枚」承诺的 ops 兑现）
  - 多狗家庭 nudge（购买 60 天后："还有别的狗在家吗？")

**前端改动估算**：
- 新页面：`account.html`（订单列表）+ 现有 `cart.html` 加 reorder 入口
- 现有 `checkout.html` 改 guest vs account 分叉
- 邮件模板（SendGrid）

**后端改动估算**：
- Account / Auth（OAuth via Google + Apple；不强制密码）
- 订单 schema 加 `archived_design`（shape / color / text / halftone_url / consent）
- Cron 邮件触发器

### v2.0 — NFC 升级（GMV 跑顺后）

**核心新功能**：钛合金 + 嵌入 NFC 芯片，扫码到走失模式 / 主人联系页

**v2 才做**：
- 工厂上 NFC 注塑批次（独立 SKU 序列）
- 后端 NFC 注册 / 扫码计数 / 走失切换
- profile.html 公开扫码档案页
- lost-found.html 走失服务专题页
- Twilio SMS 集成（走失通知）
- Care & Repair 物理服务

**v1 严守**：站点任何位置不出现 NFC / smart / lost mode / tap-to-call / medical card 字眼。完整规约 → memory `project_v1_nfc_cut.md`

### v3+ — 国际扩张 / 多产品线

- 国际发货（加拿大 → 英国 → 澳洲）
- 类目扩展可能性：猫牌、马项圈刻牌、手工皮项圈
- B2B 兽医诊所合作礼盒
- 多狗家庭折扣 / 礼品订阅服务

---

## 10. 关键风险 & 应对

| 风险 | 影响 | 应对 |
|---|---|---|
| **AI 出图不像客户的狗** | 退换纠纷 / 差评 | (a) Designer 实时预览 = "what you see is what we engrave" 法律措辞 ([returns.html](../returns.html) §04)；(b) 影雕调性是"工艺草图"不是"摄影翻译"，期望管理；(c) 不做 proof approval 但有 24h 取消窗口 |
| **AI 成本失控** | Margin 受损 | 邮箱 + IP 限流 + Turnstile 三层防御（[docs/api-generate.md](api-generate.md)）；100 个机器人攻击成本 < $1 |
| **工厂产能 / 品控** | 订单延迟 / 退货率高 | 7-10 个工作日提前给客户预期；工厂端 QA 流程；首批小批量验证 |
| **Stripe 审核驳回**（涉及 AI 用户照片处理） | 不能收单 | 法律页 ([privacy.html](../privacy.html) §03) 已明确 AI 数据流；Stripe 提交时附带 docs |
| **客户照片版权 / 隐私投诉** | 法律风险 | [terms.html](../terms.html) §03 用户保证拥有照片版权；上传内容审核（人物 / 儿童检测拒绝） |
| **NFC 客户期待**（已有市场预期） | 差评 / 询问 | 文案彻底回避 NFC 字眼；"made to outlast" 强调金属本身价值 |
| **国际客户拒收**（v1 美国 only） | 流失 | [shipping.html](../shipping.html) 明确不发国际 + 邮件挽留意向 |

---

## 11. 关键开放问题（按优先级）

### P0 上线前必拍板

- [ ] **工厂报价 + 毛利分析**——$79 售价是否够覆盖成本 + 70% 毛利目标？
- [ ] **真实域名**——marlowe.example 占位要换
- [ ] **真实工坊地址**——多处法律页用 `[Atelier address]` 占位
- [ ] **三个邮箱地址**——support@ / privacy@ / press@
- [ ] **律师 review 法律页**——尤其 [privacy.html](../privacy.html) §03 AI 数据处理 + [terms.html](../terms.html) §07 责任限制
- [ ] **Stripe 商家账号**审核
- [ ] **后端 API 实现** + Replicate / Cloudflare Turnstile / SendGrid 账号开通

### P1 上线后两周内决定

- [ ] **是否上 Newsletter capture**（流量起来后值得做）
- [ ] **是否做 Add-to-Cart 解锁无限改**（看 generate_to_checkout 数据）
- [ ] **GA4 vs Plausible**
- [ ] **税务 nexus 配置**（除加州外其他州何时开始收）

### P2 战略层

- [ ] **品牌名最终拍板**——MARLOWE 是占位，是否做正式商标注册？
- [ ] **首席摄影师 / 风格摄影**——Hero 实景照只有一张 ranger.png，需要更多 lifestyle
- [ ] **Influencer 合作策略**
- [ ] **B2B（兽医诊所 / pet boutique）渠道是否 v1.5 开**

---

## 12. 团队协作

### 文档地图

| 文件 | 用途 |
|---|---|
| `docs/product-plan.md` | **本文件**——产品全景 |
| [CLAUDE.md](../CLAUDE.md) | Claude Code 工作上下文，写代码前必读 |
| [docs/api-generate.md](api-generate.md) | `/api/generate` 后端规约（限流 + Turnstile + 错误码） |
| [docs/chat-bot.md](chat-bot.md) | 客服 FAQ 内容（EN/ZH 双语）+ UX 规约 + AI 升级路径 |
| [chat-widget.js](../chat-widget.js) | 客服聊天机器人前端实现（v1 scripted bot，无后端） |
| [memory/](../../.claude/projects/-Users-keqin123-Desktop-marlowe/memory/) | 项目长期决策记录（v1 砍 NFC 等） |
| 4 个法律页 | [privacy](../privacy.html) / [terms](../terms.html) / [returns](../returns.html) / [shipping](../shipping.html) |

### 角色 & 分工

- **产品 / 设计** — 你（拍板调性 + 业务参数）
- **前端** — 已完成 v1 静态原型；v2 看是否迁 React
- **后端** — 待对接：Stripe / Replicate / Redis / SendGrid / API 实现
- **法律** — 待 review 4 个法律页
- **工厂 / 供应链** — 待对接：钛合金 + PVD + 影雕产线 + 物流
- **营销** — v1 上线后启动：Instagram + Pinterest + Influencer

---

## Changelog

- **2026-05-07** — Initial product plan, capturing all decisions accumulated through v1.0 prototype.
