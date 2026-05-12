# Marlowe v1 后端对接清单

> **目的**：把当前前端的功能、数据形状、API 需求、第三方依赖一次性讲清楚，让后端工程师不用反复看代码就能开工。
>
> **配套阅读**：
> - 全产品方案：[product-plan.md](product-plan.md)
> - Generate API 防滥用：[api-generate.md](api-generate.md)
> - 认证系统：[auth.md](auth.md)
> - 项圈产品：[collars.md](collars.md)
> - 客服 FAQ（EN+ZH）：[chat-bot.md](chat-bot.md)
> - 项目通用约定：[../CLAUDE.md](../CLAUDE.md)

---

## 0. 技术栈约定

| 类别 | 技术 | 备注 |
|---|---|---|
| 支付 | Stripe | Payment Element + Payment Method Messaging |
| 支付方式 | 卡 / Apple Pay / Google Pay / Klarna / Afterpay / Affirm | BNPL 在 Stripe Dashboard 开启即可自动出现 |
| 认证 | Supabase Auth | Magic Link + Apple OAuth + Google OAuth |
| AI 出图 | Replicate API 或自部署 SD + ControlNet | halftone portrait pipeline，输出同时用于网站预览 + 影雕机源文件 |
| 邮件 | SendGrid | 订单确认、生产通知、发货通知 |
| 防滥用 | Cloudflare Turnstile + Redis 限流 | 见 §3.1 |
| 文件存储 | S3 / Supabase Storage / Cloudflare R2（选一） | 用户上传照片 + AI 出图存档 |
| 数据库 | PostgreSQL（Supabase 自带） | 见 §2 数据模型 |
| 市场 | 仅美国境内 | USD、美国地址 + 州缩写、美国电话 |
| 税务 | Stripe Tax 或 TaxJar | 结账时服务端计算 |

---

## 1. 页面清单（23 个页面 + 2 个共享脚本）

| 角色 | EN | ZH | 主要功能 |
|---|---|---|---|
| 首页 | `index.html` | `index-zh.html` | 营销页 |
| 设计器 | `designer.html` | `designer-zh.html` | 3 阶段：上传 / 定制 / 生成 |
| 项圈页 | `collars.html` | `collars-zh.html` | 单独购买项圈 |
| 购物车 | `cart.html` | `cart-zh.html` | localStorage 驱动 |
| 结账 | `checkout.html` | `checkout-zh.html` | 地址 + Stripe Payment Element |
| 感谢页 | `thank-you.html` | `thank-you-zh.html` | 订单确认 + 4 步时间线 |
| 登录 | `login.html` | `login-zh.html` | Magic link + OAuth |
| 回跳页 | `auth-callback.html` | `auth-callback-zh.html` | Supabase session 落地 |
| 账户中心 | `account.html` | `account-zh.html` | 订单列表 + 历史生成 |
| 法律页 | `privacy.html` `terms.html` `returns.html` `shipping.html` `contact.html` | 仅 EN（ZH footer 有「以上为英文页面」备注） | 静态 |
| 共享 JS | `auth-state.js` | 同 | Supabase wrapper（5 个函数体待替换） |
| 共享 JS | `chat-widget.js` | 同 | 客服 FAQ widget，按 `<html lang>` 切换 |

---

## 2. 数据模型

### `profiles`（关联 Supabase auth.users）

```sql
id            uuid PRIMARY KEY REFERENCES auth.users(id)
email         text
display_name  text
created_at    timestamptz DEFAULT now()
```

### `designs` — 用户每次 AI 生成都写一条（独立于订单）

> **关键**：用户可能 generate 多次才下单，每次 generate 都要存档供 account 页「历史生成」展示。

```sql
id            uuid PRIMARY KEY
user_id       uuid REFERENCES profiles(id)
shape         text DEFAULT 'shield'   -- v1 只有 shield，留位置给 octagon/disc
color         text                    -- silver | brass | teal | charcoal | copper
pet_name      varchar(12)
pet_phone     varchar(20)
photo_url     text                    -- 用户上传原照（S3）
halftone_url  text                    -- AI 出图，同时是影雕机源文件
tag_id        varchar(12)             -- 客户看到的 one-of-one 编号（如 A8K2-9X1）
created_at    timestamptz DEFAULT now()
last_used_at  timestamptz             -- 下过单就更新
```

### `orders`

```sql
id                       uuid PRIMARY KEY
display_id               varchar(12) UNIQUE   -- 客户看到的 M-XXXXXX
user_id                  uuid REFERENCES profiles(id) NULL  -- guest 结账允许 null
contact_email            text
contact_phone            text
shipping_first_name      text
shipping_last_name       text
shipping_address1        text
shipping_address2        text
shipping_city            text
shipping_state           varchar(2)            -- 美国州缩写
shipping_zip             varchar(10)
shipping_country         text DEFAULT 'US'
subtotal_cents           int
tax_cents                int
total_cents              int
status                   text                  -- received | in_production | shipped | delivered | cancelled
stripe_payment_intent_id text
created_at               timestamptz DEFAULT now()
updated_at               timestamptz
```

### `order_items_tag` — 钛合金牌订单项

```sql
id              uuid PRIMARY KEY
order_id        uuid REFERENCES orders(id)
design_id       uuid REFERENCES designs(id)   -- 关联到 AI 生成稿
shape           text
color           text
pet_name        varchar(12)
pet_phone       varchar(20)
photo_url       text
halftone_url    text
tag_id          varchar(12)
unit_price_cents int DEFAULT 10900
quantity        int DEFAULT 1
```

### `order_items_collar` — 皮革项圈订单项

```sql
id              uuid PRIMARY KEY
order_id        uuid REFERENCES orders(id)
color           text                  -- tan | saddle | black
size            text                  -- xs | s | m | l | xl
unit_price_cents int DEFAULT 4900
quantity        int DEFAULT 1
```

---

## 3. API 端点清单

> 前端代码里用 `TODO BACKEND` 标记了 23 处替换点，grep 可定位。

### 3.1 Generate API（核心、最复杂）

**`POST /api/generate`** — Designer stage-2 末尾点击「Generate my portrait」时触发

**Request**:
```http
POST /api/generate
Content-Type: multipart/form-data
Authorization: Bearer <supabase_jwt>

photo: <File>           # 用户上传，<=10MB，jpg/png/webp
finish: string          # silver | brass | teal | charcoal | copper
pet_name: string        # <=12 chars
pet_phone: string
turnstile_token: string # Cloudflare 验证 token
```

**Response 200**:
```json
{
  "design_id": "uuid",
  "halftone_url": "https://.../halftone.png",
  "tag_id": "A8K2-9X1"
}
```

**Response 429 / 400** — 见 `docs/api-generate.md` 错误码

**三层防护**（细节见 `docs/api-generate.md`）：
1. Cloudflare Turnstile token 校验
2. 用户限流：5 次/小时，15 次/天（基于 `user_id`）
3. IP 限流：5 次/小时（防同一 IP 注册多账号刷）

**流程**：验码 → 限流 → 上传 photo 到 S3 → 调 Replicate / 自部署 SD → 落 `designs` 表 → 返回 `halftone_url`

**前端落点**：`designer.html` / `designer-zh.html` 的 `startGeneration()` 函数（搜「TODO BACKEND」）

---

### 3.2 Orders API

#### `POST /api/orders` — Checkout 提交时

**Request**（前端已固定，见 `checkout.html` 第 590 行 `placeOrder()`）：
```json
{
  "contact": {
    "email": "user@example.com",
    "phone": "(555) 555-1234"
  },
  "shipping": {
    "firstName": "Jane",
    "lastName": "Doe",
    "address1": "123 Main St",
    "address2": "Apt 4",
    "city": "Brooklyn",
    "state": "NY",
    "zip": "11201",
    "country": "US"
  },
  "items": [
    {
      "productType": "tag",
      "shape": "shield",
      "color": "silver",
      "petName": "SADIE",
      "petPhone": "555-814-2901",
      "tagId": "A8K2-9X1",
      "quantity": 1,
      "unitPrice": 109
    },
    {
      "productType": "collar",
      "color": "tan",
      "size": "M",
      "quantity": 1,
      "unitPrice": 49
    }
  ],
  "subtotal": 158
}
```

**Response 200**:
```json
{
  "orderId": "M3K2X9",
  "clientSecret": "pi_3..._secret_..."   // Stripe PaymentIntent client_secret
}
```

**服务端逻辑**：
1. 创建 `orders` 行（status = `received`）
2. 把 items 拆成 `order_items_tag` + `order_items_collar`
3. 调 Stripe 建 PaymentIntent（金额 = subtotal + tax）
4. 返回 `{ orderId, clientSecret }` 给前端
5. 前端用 `stripe.confirmPayment({ clientSecret, return_url: '...thank-you.html?order=' + orderId })`
6. 支付成功 → Stripe webhook → 后端把 status 改为 `received`（或保持 `received`，下单后 24 小时进入 `in_production`）

#### `GET /api/orders/:displayId` — Thank-you 页 + Account 页查详情

```json
{
  "orderId": "M3K2X9",
  "placedAt": "2026-05-11T12:00:00Z",
  "status": "in_production",
  "totalCents": 15800,
  "items": [...]
}
```

#### `POST /api/orders/:displayId/cancel` — 24 小时取消窗口

下单 24 小时内可取消：把 status 改为 `cancelled`，调 Stripe 退款，发送邮件。

---

### 3.3 Account API（登录后）

#### `GET /api/me` — 账户中心 header
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "Jane",
  "provider": "magic_link",  // 或 apple / google
  "signedInAt": "2026-05-11T12:00:00Z"
}
```

#### `GET /api/me/orders` — 订单列表
```json
[
  {
    "id": "M3K2X9",
    "placed_at": "2026-05-11T12:00:00Z",
    "status": "in_production",
    "total_cents": 15800,
    "items_count": 2
  }
]
```

#### `GET /api/me/designs` — 历史生成（account 页 §02）
```json
[
  {
    "id": "uuid",
    "shape": "shield",
    "color": "silver",
    "pet_name": "SADIE",
    "pet_phone": "555-814-2901",
    "photo_url": "https://.../photo.jpg",
    "halftone_url": "https://.../halftone.png",
    "tag_id": "A8K2-9X1",
    "created_at": "2026-05-11T12:00:00Z"
  }
]
```

#### `GET /api/me/designs/:id` — 单条设计
designer 页用 `?design=<id>` 参数读取，预填 state 回 stage-2 让用户重新定制。

---

### 3.4 Auth API（Supabase 自带，无需自建）

前端通过 Supabase SDK 直接调用：
- `supabase.auth.signInWithOtp({ email })` — Magic Link
- `supabase.auth.signInWithOAuth({ provider: 'apple' | 'google' })`
- `supabase.auth.signOut()`
- `supabase.auth.onAuthStateChange()` — 监听登录态

**回跳 URL**：
- EN: `https://marlowe.com/auth-callback.html`
- ZH: `https://marlowe.com/auth-callback-zh.html`

**前端包装层** `auth-state.js` 已经定义好接口，后端只需把 5 个函数体替换为 Supabase 调用：
- `getUser()`
- `signInWithMagicLink(email)`
- `signInWithProvider(provider)`
- `signOut()`
- `requireAuth(redirectTo)`

---

### 3.5 Stripe 集成

| Widget | 挂载位置 | 用途 |
|---|---|---|
| `Payment Element` | `checkout.html` 的 `#payment-element` | 真正的支付输入框 |
| `Payment Method Messaging` | `cart*.html` / `designer*.html` / `collars*.html` 的 `#bnpl-mount-*` | 自动显示「分 4 期 $X.XX 免息」 |
| Apple/Google Pay | Payment Element 自带 | 一键支付 |

**Webhook 要监听的事件**：
- `payment_intent.succeeded` → orders.status = `received`，发送确认邮件
- `payment_intent.payment_failed` → 通知用户
- `charge.refunded` → orders.status = `cancelled`

---

## 4. 环境变量

```bash
# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# AI 出图
REPLICATE_API_TOKEN=          # 或自部署 GPU 的 endpoint URL

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# 邮件
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=hello@marlowe.com

# 限流
REDIS_URL=

# 文件存储（S3 / Supabase Storage / R2 三选一）
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=

# 税务（v1 可暂用 Stripe Tax）
TAXJAR_API_KEY=               # 可选
```

---

## 5. 前端 localStorage / sessionStorage 约定

| Key | 类型 | 用途 | 后端接入后 |
|---|---|---|---|
| `marlowe_cart` | localStorage | 购物车（仍前端驱动） | 保留 |
| `marlowe_last_order` | localStorage | mock 订单 | **删除**，改读 API |
| `marlowe_auth_user` | localStorage | mock 用户态 | **删除**，Supabase 自管 |
| `marlowe_auth_pending` | localStorage | mock magic link | **删除** |
| `marlowe_auth_redirect_to` | sessionStorage | 登录后回跳路径 | 保留（前端自管） |

---

## 6. 关键业务规则

1. **定价**：钛合金牌 $109，皮革项圈 $49，统一定价不打折（v1）。BNPL 4 期均分。
2. **配送**：美国境内免邮。生产 7–10 工作日 + 物流 3–5 天 = **11–16 个工作日到货**。
3. **取消窗口**：下单后 24 小时内可任意取消；过窗口进入生产，不能改不能退。
4. **退换政策**：制造缺陷 / 刻字错误 / 发错款 / 物流损坏 → 14 天内重做或退款。详见 `returns.html`。
5. **Generate 防滥用**：三层（Turnstile + 用户限流 + IP 限流），细节见 `docs/api-generate.md`。
6. **AI 出图规范**：halftone 灰阶肖像，**同一张图既给客户预览也直接驱动影雕机**——所以输出尺寸 / 灰阶 bit 深度要匹配工厂参数（待工厂确认后写到 CLAUDE.md §7）。
7. **形状**：v1 数据库 enum 只放 `shield`，但 designer JS / SVG 渲染器保留 octagon + disc 实现，v1.5 上线时只需打开 UI 注释 + 扩 enum。
8. **多语言**：前端 `<html lang="zh">` 自检并切到 zh 路由。**所有面向客户的字符串都需要 EN/ZH 两版**——订单确认邮件、SMS、错误信息、Stripe 支付页文案都要双语支持。
9. **金属表面名称**（前后端必须严格匹配代号）：

   | code | EN | ZH |
   |---|---|---|
   | `silver` | Titanium Silver | 钛本色 |
   | `brass` | Champagne Gold | 香槟金 |
   | `teal` | Sky Blue | 钛蓝 |
   | `charcoal` | Storm Black | 深炭黑 |
   | `copper` | Rose Copper | 玫瑰铜 |

10. **项圈尺寸**：`xs` (25-33 cm) / `s` (30-40 cm) / `m` (35-50 cm) / `l` (45-60 cm) / `xl` (55-70 cm)，宽度统一 25 mm。

---

## 7. 邮件 / 通知触发点（SendGrid）

| 事件 | 收件人 | 内容 |
|---|---|---|
| 订单确认 | 客户 | 订单号、items、合计、预计交付时间 |
| 24 小时窗口提醒（可选） | 客户 | 距进入生产还有 X 小时 |
| 进入生产 | 客户 | 「你的牌在工作台上了」 |
| 发货 | 客户 | 物流单号 + 跟踪链接 |
| 送达（可选） | 客户 | 「希望你和狗狗喜欢」 |
| 退换申请 | 客户 + 客服内部 | 收到退换申请 |
| 异常订单 | 客服内部 | 支付失败 / 生产异常 |

所有邮件都要 EN/ZH 两版，按 `user.locale` 选择。

---

## 8. 给后端的实施顺序建议

```
Week 1: Supabase + auth-state.js 真接入（其他功能的前提）
Week 2: orders API + Stripe checkout（含 webhook 处理）
Week 3: generate API + Turnstile + 限流 + Replicate 集成
Week 4: account API（orders + designs 列表）
Week 5: SendGrid 订单确认 / 发货通知邮件（双语模板）
Week 6: 联调 + 工厂端 halftone 文件传输
```

---

## 9. 23 处 `TODO BACKEND` 标记位置

```
designer.html / designer-zh.html        ×4   generate API + Turnstile + 限流 + 历史 design 读取
checkout.html / checkout-zh.html        ×4   POST /api/orders + Stripe Payment Element 挂载
cart.html / cart-zh.html                ×2   Stripe Payment Method Messaging 挂载
collars.html / collars-zh.html          ×2   同上
auth-state.js                           ×5   5 个函数体替换 supabase.auth.*
auth-callback.html / auth-callback-zh.html ×2   Supabase onAuthStateChange 监听
account.html / account-zh.html          ×4   GET /api/me/orders + /api/me/designs
```

grep 命令：
```bash
grep -rn "TODO BACKEND" . --include="*.html" --include="*.js"
```

---

## 10. 上线前 checklist

- [ ] Supabase 项目创建 + OAuth providers（Apple / Google）配置完成
- [ ] Stripe 账户开通 + Klarna / Afterpay / Affirm 在 Dashboard 启用
- [ ] Replicate 或自部署 GPU 的 halftone pipeline 跑通
- [ ] Cloudflare Turnstile 站点 key 申请 + 限流 Redis 部署
- [ ] SendGrid 模板（EN + ZH 各 6-7 套）
- [ ] S3 / R2 bucket + 上传权限
- [ ] Stripe Tax 或 TaxJar 接入
- [ ] 域名 + HTTPS 证书
- [ ] CDN（前端静态资源）
- [ ] 工厂端 halftone 文件接收协议确认
- [ ] 测试环境跑通端到端（注册 → 上传 → generate → cart → checkout → 邮件 → account 看历史）
- [ ] 上线前生产环境 smoke test
