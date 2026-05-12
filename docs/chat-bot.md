# Chat Bot — FAQ Spec & UX

> v1 scripted bot (button-based). No AI, no backend. Pure frontend, served from `chat-widget.js`. Future AI upgrade path documented at the bottom.

---

## 1. Design principles

1. **Heritage tone, not techy.** No green pulsing bubble, no emoji, no "Hi! 👋". Brass icon, charcoal text, Fraunces serif for greeting.
2. **Button-only.** No free-form input box (v1). Users click pre-written topic chips → see canned answer → see related sub-chips or back / email.
3. **Don't interrupt.** No auto-popup, no "we noticed you've been here for 30s". Folded by default, opens only on click.
4. **Fallback always visible.** Every screen shows "Email support@movacraft.example, reply within 1 business day" as last-resort exit.
5. **Bilingual.** Auto-detects `document.documentElement.lang` (en/zh) → loads matching FAQ.
6. **Stateless.** No history persisted. Each page-load is a fresh session. Deferred to v1.5+.

## 2. Visual spec

### Folded state (default)
- Position: fixed, right: 24px, bottom: 24px, z-index: 200
- Size: ~120×44 pill button
- Style: `background: var(--charcoal); color: var(--cream)` + small chat-bubble SVG icon (1.5px stroke, no fill) + text "Help" / "客服"
- Hover: slight `translateY(-2px)` + shadow

### Open state
- Position: fixed, right: 24px, bottom: 24px
- Size: 380×560 (mobile: full width minus 24px gutter, max-height 80vh)
- Style: `background: var(--cream-light)` + 1px charcoal border + slight `box-shadow: 0 24px 48px -16px rgba(0,0,0,0.18)`
- Header: brass-deep band with title "Mova Craft — How can we help?" / "Mova Craft 客服" + close X
- Body: scrollable message list
- Footer: pinned topic chips (when at root) OR "← Back" / "Email support" buttons (deeper levels)

### Message style
- Bot bubble: cream-light bg, charcoal text, Fraunces serif body for warm tone, 14px line-height 1.55
- "User clicked X" trace: just shows the chip text in JetBrains Mono small caps, dimmed (no fake user bubble — we know it was a click, not a typed message)
- Bot avatar: a simple "§" mark in brass, no animal / no emoji

## 3. Conversation flow

```
Open
  ↓
Greeting bot message
  ↓
8 topic chips
  ↓ (click topic)
Topic intro bot message + 1-3 sub-question chips + "← Back" + "Email support"
  ↓ (click sub-question)
Answer bot message (1-3 sentences) + optional "Read full policy: [link]"
  + "Ask another question" + "Email support"
```

Every leaf answer ends with two persistent options: **Ask another question** (returns to topic root) and **Email support** (opens `mailto:`).

## 4. FAQ content — English

### Greeting
> Hi, I'm Mova Craft's helper. What can I help with today?

### Topic 1 — Shipping & delivery

**How long does delivery take?**
> After you approve the design at checkout, you have a 24-hour safety window (engraving doesn't start during it). After that, production takes 7–10 business days and shipping adds 5–8. Most U.S. orders arrive within 13–19 business days of placing the order.
> Read full policy: [Shipping](shipping.html)

**Where do you ship?**
> All 50 U.S. states + D.C., U.S. military addresses (APO/FPO/DPO), and U.S. territories. We don't ship internationally yet.

**Can I track my order?**
> Yes. We email a tracking number the day your tag ships. We ship via DHL Express with U.S. final-mile handed off to USPS or UPS depending on your address.

### Topic 2 — Cancellations & redos

**How do I cancel?**
> Within 24 hours of payment, click Request Redo in your confirmation email (or just reply to it). A real person reaches out and you choose: free redo, or full refund within 3–5 business days. After 24 hours, engraving has started and the order is final.
> Read full policy: [Returns](returns.html)

**Can I change my shipping address?**
> Within the 24-hour safety window after payment, yes — email support@movacraft.example with your order number and the new address. After 24 hours, engraving starts and the shipping label is locked.

**Can I change the design after payment?**
> Yes, within the 24-hour safety window. Click Request Redo in your confirmation email — we'll work with you on a free redo. After 24 hours the design is locked.

**When does engraving actually start?**
> Exactly 24 hours after your payment, unless you've clicked Request Redo or replied to the confirmation email in that window. We use that buffer as a safety net — no irreversible work happens in those first 24 hours.

### Topic 3 — Returns & exchanges

**What's covered?**
> Manufacturing defects, engraving errors that don't match what you submitted, wrong shape or finish shipped, and damage in transit. Contact us within 14 days of delivery.
> Read full policy: [Returns](returns.html)

**How do I start a return?**
> Email support@movacraft.example within 14 days of delivery with your order number and clear photos of the issue. We respond within 1 business day and send a prepaid shipping label if a return is approved.

**Will I get a refund or a remake?**
> Our default is to remake the tag at no cost to you. If a remake isn't possible — same defect twice, or you no longer want the tag — we issue a full refund through Stripe.

**What about damage years later?**
> Titanium itself rarely fails — it outlasts plated steel, doesn't tarnish, doesn't rust. Normal wear over years is expected and within the design intent. For manufacturing defects or engraving errors, contact us within 14 days of delivery (see Returns policy).

### Topic 4 — The Designer & AI

**How does the AI portrait work?**
> Upload a clear photo of your dog. Our system converts it into a halftone (point-pattern) grayscale portrait suitable for engraving on metal. The Designer shows you a real-time preview; what you see is what we engrave.

**What if I don't like the AI portrait?**
> Two layers of safety. Before checkout, you can regenerate the portrait up to 3 times for free in the Designer. After checkout, you have 24 hours to click Request Redo in your confirmation email — a real person works with you on a free redo. Engraving only starts after that 24-hour window closes.

**Can I regenerate the portrait?**
> Yes — in the final preview screen, click "Try a different portrait" to run the AI again. Same shape, finish, and engraving; fresh portrait.

**Will it look exactly like my dog?**
> The halftone process is a stylization — like a fine engraving made from a photo, not a photo-realistic copy. The Designer preview shows you the actual portrait that will be engraved. If you don't love it, don't proceed to checkout.

### Topic 5 — Materials & care

**What's the tag made of?**
> Aerospace-grade titanium — the same alloy used in the Apollo lunar module hull, surgical implants, and high-end watch cases. We engrave it with low-relief for the outline and halftone for photo-level detail.

**Why titanium instead of steel or brass?**
> Three reasons: it's 60% lighter than aluminum and twice as hard as steel (so it doesn't dent), it never rusts (unlike steel and unlike brass which oxidizes green), and it's hypoallergenic (same reason it's used for body implants). Brass tags eventually turn green; aluminum tags bend and the print rubs off. Titanium does neither.

**Is it heavy on my dog's neck?**
> No. Titanium is dramatically lighter than it looks — about 60% the weight of aluminum at the same volume, and about half the weight of stainless steel. Most owners say their dog doesn't notice it's there.

**Will it set off airport security?**
> No. Titanium is non-magnetic and doesn't trigger standard metal detectors the way steel does. Same reason titanium-frame eyeglasses don't.

**What if my dog chews it?**
> Titanium is harder than dog enamel. Aggressive chewers can put cosmetic scratches on the polished surface, but the tag won't bend, crack, or break — and the engraving is cut into the metal, not painted on, so it stays readable.

**Will it irritate sensitive skin?**
> No. We use the same medical-grade titanium used for surgical implants. It's specifically chosen because it doesn't cause skin reactions, even in dogs with nickel sensitivity or allergic dermatitis.

**Will it rust or fade?**
> No. Titanium does not rust. The engraving is cut into the metal — not printed — so it won't wear off with daily use.

**How do I clean it?**
> Wipe with a soft cloth. For deeper cleaning, use mild soap and water; rinse and dry. Avoid bleach or abrasive polishes.

**How do I attach it to a collar?**
> Use any standard split ring or S-hook. The suspension hole fits 6mm rings comfortably.

### Topic 6 — My pet's photo

**What do you do with my photo?**
> We process it through our AI pipeline (Replicate or equivalent) to generate the halftone portrait used on your tag. The portrait is stored as part of your order record. Your original photo is deleted one year after your order ships.
> Read full policy: [Privacy](privacy.html)

**Will my photo train AI models?**
> No. We never use customer photos to train AI models — ours or anyone else's.

**How long do you keep my photo?**
> Original uploaded photos: deleted one year after your order ships. Halftone portraits: kept with your order record (7 years for tax compliance).

**Can I delete my photo?**
> Yes. Email privacy@movacraft.example to request deletion. We respond within 30 days.

### Topic 7 — Account & login

**How do I sign in?**
> We use passwordless sign-in. Click "Sign in" and enter your email — we'll email you a 6-digit code to type back. Or use "Continue with Google" for one-tap sign-in. No password to remember.

**I don't remember signing up — do I have an account?**
> If you've ever generated a portrait or placed an order with us, you already have an account tied to that email. Enter the same email at sign-in and we'll send you a fresh 6-digit code.

**Can I check out without signing in?**
> Yes — adding to cart and checking out work without an account. The only step that requires sign-in is generating an AI portrait, since each generation has a real cost. Signing in also saves your design so you can reorder.

**How do I delete my account?**
> Email privacy@movacraft.example with the subject "Delete my account". We respond within 30 days. Linked orders are anonymized for tax compliance; saved designs and uploaded photos are deleted.

### Topic 8 — Pricing & payment

**How much does a tag cost?**
> $109 for the Shield tag in either of 2 titanium finishes (Titanium Silver or Gunmetal). Free engraving included. Free U.S. standard shipping included.

**What payment methods do you accept?**
> Credit and debit cards, Apple Pay, and Google Pay — processed securely by Stripe. We never see or store your card number.

**Are there any discounts?**
> Not currently. We make every tag to order — there's no inventory clearance to discount.

**Is there sales tax?**
> Sales tax is calculated at checkout based on your shipping address, per U.S. state requirements.

**How much does a collar cost?**
> $49 for any color (Tan, Saddle, Black) and any size (XS–XL). Free U.S. shipping. If you add it to a tag order, both ship together.

**Can I pay in installments?**
> Yes — at checkout Stripe shows the Klarna, Afterpay, and Affirm options if you want them. Pay-in-4 has no credit-check impact.

### Topic 9 — Collars

**What's the collar made of?**
> Full-grain vegetable-tanned cowhide, 3–4 mm thick, with brushed titanium buckle and D-ring. Hand saddle-stitched, edges burnished and beeswax-sealed.
> Read full spec: [Collars](collars.html)

**What sizes do you offer?**
> Five sizes — XS (25–33 cm), S (30–40 cm), M (35–50 cm), L (45–60 cm), XL (55–70 cm). Width is 25 mm (1") across all sizes.

**How do I measure my dog?**
> Wrap a soft tape around the base of the dog's neck where the collar will sit, then add about 2 cm (0.75") for comfort. If your dog is between sizes, size up — leather softens with wear and our buckle has 7 adjustment holes.

**Can I exchange if the size is wrong?**
> Yes — free size or color exchanges within 30 days of delivery, as long as the collar is unworn or only lightly tried on. This is more lenient than our tag policy because collars are not personalized.

**Do I have to buy a collar with my tag?**
> No. The collar is an optional companion. You can buy a tag alone, a collar alone, or both together. If both are in the order, they ship together.

**Will the leather match my titanium tag?**
> The collar hardware (buckle, D-ring) is the same titanium grade as the tag. Titanium Silver pairs most cleanly with all three leathers; Gunmetal looks especially sharp against Saddle or Black.

**How do I care for the leather?**
> Wipe with a damp cloth and dry naturally. Treat with a small amount of unscented leather conditioner every 3–6 months. Avoid prolonged soaking. Tan leather will darken with use — this is expected patina, not damage.

### Topic 10 — Talk to a person

> We respond within 1 business day, often sooner.
>
> - **Order & product help** — support@movacraft.example
> - **Privacy & data requests** — privacy@movacraft.example
> - **Press & wholesale** — press@movacraft.example

## 5. FAQ content — 中文（zh 页面用）

### Greeting
> 你好，我是 Mova Craft 客服助手。需要哪方面的帮助？

### 主题 1 — 物流与配送

**多久能收到？**
> 你在结账时已确认设计，付款后 24 小时安全窗里不会开雕。窗口过后，生产 7–10 个工作日，物流 5–8 个工作日。大多数美区订单从下单到收货约 13–19 个工作日。
> 详见 [物流政策](shipping.html)

**发货范围？**
> 美国 50 州 + DC + 军方地址（APO/FPO/DPO）+ 美属领地。暂不发国际。

**能追踪订单吗？**
> 可以。发货当天我们会邮件发送 DHL Express 追踪号；最后一公里由 USPS 或 UPS 派送。

### 主题 2 — 取消与修改

**如何取消订单？**
> 付款后 24 小时内，点击确认邮件里的 Request Redo（或直接回复邮件），客服会跟你对接：免费重做，或 3–5 个工作日内全额退款，看你选。24 小时之后雕刻已开始，订单终局。
> 详见 [退换货政策](returns.html)

**能改收货地址吗？**
> 在付款后 24 小时安全窗内可以——邮件 support@movacraft.example 附订单号和新地址。24 小时后雕刻已开始、运单锁定。

**付款后能改设计吗？**
> 24 小时安全窗内可以。点击确认邮件里的 Request Redo，我们安排客服跟你免费重做。24 小时后设计锁定。

**什么时候真正开始雕刻？**
> 付款后 24 小时整。除非你在这 24 小时内点了 Request Redo 或回复了确认邮件——否则一过窗口立即开雕。我们用这个缓冲做安全网，前 24 小时不会有任何不可逆操作。

### 主题 3 — 退换货

**什么情况支持退换？**
> 制造缺陷、刻字错误（与你提交的不一致）、发错形状或表面、物流损坏。收货后 14 天内联系我们。
> 详见 [退换货政策](returns.html)

**如何申请退换？**
> 收货 14 天内邮件 support@movacraft.example，附订单号和问题照片。我们 1 个工作日内回复。如批准，我们寄出预付运费的退货标签。

**退款还是重做？**
> 我们的默认方案是免费重做。如果无法重做（同样问题反复出现、或你不再想要），我们通过 Stripe 全额退款。

**几年后坏了怎么办？**
> 钛合金牌本身极少出问题——它比镀铬不锈钢更耐用，不掉色不生锈。日常使用磨损在我们的预期之内。如果是制造缺陷或刻字错误，14 天内联系我们处理（详见退换政策）。

### 主题 4 — 设计器与 AI

**AI 肖像怎么生成？**
> 上传一张清晰的宠物照片，系统转换为适合金属雕刻的灰阶影雕图。Designer 实时预览，所见即所刻。

**如果不喜欢 AI 肖像怎么办？**
> 两层保险。下单前在 Designer 里可以免费重新生成 3 次。付款后 24 小时内还能点 Request Redo 让客服帮你免费重做。窗口过后才开雕。

**怎么重新生成？**
> 在最终预览页点击"换一张肖像"即可重新跑 AI。形状/底色/刻字保持不变，只换肖像。

**会跟我家狗完全一样吗？**
> 影雕本质是一种"风格化处理"——像照片精度的金属雕刻，不是照片复制。Designer 预览中看到的就是最终雕刻效果。如果不喜欢，不要进入结账。

### 主题 5 — 材质与保养

**牌是什么材质？**
> 航天级钛合金——阿波罗登月舱外壳、外科植入物、高端手表表壳的同款金属。浅浮雕勾轮廓，影雕呈现照片级细节。

**为什么用钛合金而不是钢或铜？**
> 三个原因：比铝轻 60%、比钢硬一倍（不会凹陷）；永不生锈（钢会锈，铜会氧化变绿）；低致敏（医用植入物同款）。铜牌时间久了会绿，铝牌会弯曲、印刷会磨掉。钛合金这些都不会。

**戴在狗脖子上会重吗？**
> 不重。钛合金比看起来轻得多——同体积比铝轻 60%、比不锈钢轻一半。多数主人说狗根本感觉不到。

**过机场安检会响吗？**
> 不会。钛合金是非磁性金属，不会像钢制品那样触发标准金属探测器。钛框眼镜也是同理。

**狗狗咬怎么办？**
> 钛合金比犬齿硬。咬合凶猛的狗可能在镜面留下表面划痕，但牌不会弯、不会裂、不会断——刻字是切刻进金属里的，不是印刷的，照样清晰可读。

**会刺激敏感皮肤吗？**
> 不会。我们用的是外科植入物级钛合金。即使对镍过敏或有过敏性皮炎的狗也适用——这正是它被选为植入物材质的原因。

**会生锈或褪色吗？**
> 不会。钛合金不锈，刻字是切刻而非印刷，日常使用不会磨平。

**怎么清洁？**
> 用软布擦拭。需要深度清洁可用温和肥皂水冲洗后擦干。避免漂白剂或粗糙的抛光剂。

**怎么扣到项圈上？**
> 标准分裂环或 S 钩都行。悬挂孔适配 6mm 环。

### 主题 6 — 我的宠物照片

**你们怎么处理我的照片？**
> 经过 AI pipeline（Replicate 或等效服务）处理为影雕肖像，作为订单记录保存。原始上传照片在订单发货 1 年后删除。
> 详见 [隐私政策](privacy.html)

**会用我的照片训练 AI 模型吗？**
> 不会。我们绝不使用客户照片训练 AI 模型——无论是我们的还是别人的。

**照片保留多久？**
> 原始上传照片：发货后 1 年删除。影雕肖像：随订单记录保留（税务合规要求 7 年）。

**能删除我的照片吗？**
> 可以。邮件 privacy@movacraft.example 申请删除，我们 30 天内响应。

### 主题 7 — 账户与登录

**怎么登录？**
> 无密码登录。点"登录"输入邮箱，我们发一封 6 位验证码邮件，回到页面输入即可。或者使用 Google 一键登录。无需记密码。

**我没记得注册过——我有账户吗？**
> 如果你之前生成过肖像或下过单，那个邮箱就是你的账户。输入同一个邮箱，我们会发新的 6 位验证码。

**能不登录就结账吗？**
> 可以——加入购物车和结账不需要账户。只有"生成 AI 肖像"这一步需要登录，因为每次生成都有真实成本。登录后我们会保存你的设计，方便日后再订。

**怎么删除我的账户？**
> 邮件 privacy@movacraft.example，主题写"删除账户"。我们 30 天内响应。关联订单做匿名化处理（税务合规要保留）；保存的设计与上传的照片会删除。

### 主题 8 — 价格与支付

**一枚多少钱？**
> $109，盾形钛合金牌，2 种表面处理可选（钛本色 / 枪黑色），免费刻字，美区免标准运费。

**支持哪些支付方式？**
> 信用卡、借记卡、Apple Pay、Google Pay——由 Stripe 安全处理。我们不接触也不存储你的卡号。

**有折扣吗？**
> 目前没有。每一枚都是按单制造，没有库存清仓的折扣空间。

**要交销售税吗？**
> 销售税在结账时根据你的收货地址自动计算，符合美国各州规定。

**项圈多少钱？**
> $49，任意颜色（Tan / Saddle / Black）和尺寸（XS–XL）。美区免运费。跟牌一起下单的话两件一起发货。

**可以分期吗？**
> 可以——结账时 Stripe 会展示 Klarna、Afterpay、Affirm 选项，需要就用。Pay-in-4 不查信用、不影响信用记录。

### 主题 9 — 皮革项圈

**项圈用什么材质？**
> 全粒面植鞣牛皮，3–4 mm 厚，配钛合金 brushed 扣件和 D 环。手工马鞍缝法，边缘打磨 + 蜂蜡封边。
> 详见 [项圈页面](collars.html)

**有几个尺寸？**
> 五个尺码——XS（25–33 cm）、S（30–40 cm）、M（35–50 cm）、L（45–60 cm）、XL（55–70 cm）。宽度统一 25 mm（1 英寸）。

**怎么给狗量颈围？**
> 用软尺绕狗脖子项圈位置一圈，加大约 2 cm（0.75 英寸）作为舒适余量。介于两档之间时——选大的。皮革会软化，扣环上有 7 个调节孔。

**尺寸不合可以换吗？**
> 可以——收货 30 天内免费换码或换色，只要未佩戴或仅试戴。这比牌的政策宽松，因为项圈没有个性化定制。

**必须跟牌一起买吗？**
> 不必。项圈是可选配件——可以只买牌、只买项圈、或两个一起。两个一起的话一并发货。

**皮革会跟钛合金牌配吗？**
> 项圈的扣件（buckle、D 环）跟牌是同款钛合金等级。钛本色跟三种皮色都干净好搭；枪黑色配马鞍棕或墨黑特别有质感。

**皮革怎么保养？**
> 湿布擦拭，自然风干。每 3–6 个月涂一点无香皮革保养油。避免长时间泡水。Tan 色会随使用变深——这是包浆，不是损坏。

### 主题 10 — 联系真人

> 我们 1 个工作日内回复，通常更快。
>
> - **订单与产品** — support@movacraft.example
> - **隐私与数据请求** — privacy@movacraft.example
> - **媒体与合作** — press@movacraft.example

## 6. Trigger conditions for "Email support"

Show the email-support escape hatch on every screen, not just the deepest leaf:

- Greeting screen — small "Or email support@..." link below the topic chips
- Topic intro — "← Back" + "Email support" buttons
- Leaf answer — "Ask another question" + "Email support" buttons

Rationale: never trap the user in the bot. Heritage brand cardinal rule = if AI/bot can't help, real human is one click away.

## 7. Where the widget mounts

| Page | Mount? | Why |
|---|---|---|
| `index.html` / `index-zh.html` | ✅ | Decision gate — answer "is this the right product for me?" |
| `designer.html` / `designer-zh.html` | ✅ | High-friction page — AI / customization questions |
| `cart.html` | ✅ | Pre-checkout doubt — answers shipping / pricing |
| `checkout.html` | ✅ | Pre-payment objections — payment / security |
| `thank-you.html` | ✅ | Post-purchase reassurance — what's next |
| `privacy.html` / `terms.html` / `returns.html` / `shipping.html` / `contact.html` | ❌ | Users reading legal want to focus, not be interrupted |

## 8. v1.5+ upgrade path → AI

Same widget UI, swap the response source:

1. Replace the inline FAQ data with a `POST /api/chat` call
2. Backend reads user message + system prompt (this entire `chat-bot.md` + product-plan.md + 4 legal pages as RAG context)
3. LLM (Claude Sonnet or equivalent) generates response
4. Add `<input>` box for free-form questions (currently disabled)
5. Add Cloudflare Turnstile for chat (similar to generate API rate limit)
6. Persist chat history (localStorage 7d + backend 90d)
7. Slack integration when LLM confidence < threshold → human handoff

Estimated v1.5 cost: ~$0.005/message LLM cost. 1000 chats/month ≈ $5/month — still cheaper than any SaaS option.

## 9. Maintenance

When any of the following changes, **update this file first** (single source of truth), then `chat-widget.js` re-pulls its data from here:

- Pricing ($109 anywhere → search and replace)
- Cancellation window (24h)
- Shipping range (US-only currently)
- Photo retention (1 year)
- Tax policy
- Email addresses

This file is the canonical FAQ. The widget is its UI projection.

---

## Changelog

- **2026-05-07** — Initial spec, scripted bot v1, button-only.
