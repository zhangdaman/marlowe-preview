/* MARLOWE — Chat Bot Widget v1
 * Scripted bot (button-only). No AI, no backend.
 * Auto-detects page lang via <html lang>; loads matching FAQ.
 * Single-file: CSS + DOM + data + state machine.
 * Reference: docs/chat-bot.md
 */
(function () {
  'use strict';

  // ====================================================================
  // FAQ DATA — keep in sync with docs/chat-bot.md
  // ====================================================================

  const FAQ = {
    en: {
      ui: {
        toggleLabel: 'Help',
        headerTitle: 'Marlowe — How can we help?',
        greeting: "Hi, I'm Marlowe's helper. What can I help with today?",
        chooseTopic: 'Choose a topic:',
        backToTopics: '← Back to topics',
        askAnother: 'Ask another question',
        emailSupport: 'Email support',
        emailFooter: "Or email support@marlowe.example — we reply within 1 business day.",
        readPolicy: 'Read full policy:',
        closeAria: 'Close chat',
      },
      topics: [
        {
          id: 'shipping',
          label: 'Shipping & delivery',
          intro: "Here's what we ship, where, and how long it takes:",
          questions: [
            {
              q: 'How long does delivery take?',
              a: "After you approve the design at checkout, you have a 24-hour safety window (engraving doesn't start during it). After that, production takes 7–10 business days and shipping adds 5–8. Most U.S. orders arrive within 13–19 business days of placing the order.",
              link: { label: 'Shipping policy', href: 'shipping.html' },
            },
            {
              q: 'Where do you ship?',
              a: "All 50 U.S. states + D.C., U.S. military addresses (APO/FPO/DPO), and U.S. territories. We don't ship internationally yet.",
            },
            {
              q: 'Can I track my order?',
              a: 'Yes. We email a tracking number the day your tag ships. We ship via DHL Express with U.S. final-mile handed off to USPS or UPS depending on your address.',
            },
          ],
        },
        {
          id: 'cancel',
          label: 'Cancellations & redos',
          intro: 'You approve every detail before paying. After payment, you have 24 hours to request a redo or a full refund — engraving only starts after that window closes.',
          questions: [
            {
              q: 'How do I cancel?',
              a: 'Within 24 hours of payment, click Request Redo in your confirmation email (or just reply to it). A real person reaches out and you choose: free redo, or full refund within 3–5 business days. After 24 hours, engraving has started and the order is final.',
              link: { label: 'Returns policy', href: 'returns.html' },
            },
            {
              q: "I don't love the design — can I change it?",
              a: "Yes. In the Designer you can regenerate as many times as you like before checkout. After payment, you still have 24 hours to click Request Redo in your confirmation email — we'll work with you on a free redo.",
            },
            {
              q: 'Can I change my shipping address?',
              a: 'Within the 24-hour safety window after payment, yes — email support@marlowe.example with your order number and the new address. After 24 hours, engraving starts and the shipping label is locked.',
            },
            {
              q: "When does engraving actually start?",
              a: "Exactly 24 hours after your payment, unless you've clicked Request Redo or replied to the confirmation email in that window. We use that buffer as a safety net — no irreversible work happens in those first 24 hours.",
            },
          ],
        },
        {
          id: 'returns',
          label: 'Returns & exchanges',
          intro: "Custom goods are final sale, with exceptions for our errors and shipping damage:",
          questions: [
            {
              q: "What's covered?",
              a: "Manufacturing defects, engraving errors that don't match what you submitted, wrong shape or finish shipped, and damage in transit. Contact us within 14 days of delivery.",
              link: { label: 'Returns policy', href: 'returns.html' },
            },
            {
              q: 'How do I start a return?',
              a: 'Email support@marlowe.example within 14 days of delivery with your order number and clear photos of the issue. We respond within 1 business day and send a prepaid shipping label if a return is approved.',
            },
            {
              q: 'Will I get a refund or a remake?',
              a: "Our default is to remake the tag at no cost to you. If a remake isn't possible, we issue a full refund through Stripe.",
            },
            {
              q: "What about damage years later?",
              a: "Titanium itself rarely fails — it outlasts plated steel, doesn't tarnish, doesn't rust. Normal wear over years is expected and within the design intent. For manufacturing defects or engraving errors, contact us within 14 days of delivery (see Returns policy).",
            },
          ],
        },
        {
          id: 'designer',
          label: 'The Designer & AI',
          intro: 'How the AI portrait generation works:',
          questions: [
            {
              q: 'How does the AI portrait work?',
              a: 'Upload a clear photo of your dog. Our system converts it into a halftone (point-pattern) grayscale portrait suitable for engraving on metal. The Designer shows you a real-time preview; what you see is what we engrave.',
            },
            {
              q: "What if I don't like the AI portrait?",
              a: "Two layers of safety. Before checkout, you can regenerate the portrait up to 3 times for free in the Designer. After checkout, you have 24 hours to click Request Redo in your confirmation email — a real person works with you on a free redo. Engraving only starts after that 24-hour window closes.",
            },
            {
              q: 'Can I regenerate the portrait?',
              a: 'Yes — in the final preview screen, click "Try a different portrait" to run the AI again. Same shape, finish, and engraving; fresh portrait.',
            },
            {
              q: 'Will it look exactly like my dog?',
              a: "The halftone process is a stylization — like a fine engraving made from a photo, not a photo-realistic copy. The Designer preview shows you the actual portrait that will be engraved. If you don't love it, don't proceed to checkout.",
            },
          ],
        },
        {
          id: 'materials',
          label: 'Materials & care',
          intro: 'Aerospace-grade titanium — same alloy as Apollo and surgical implants:',
          questions: [
            {
              q: "What's the tag made of?",
              a: 'Aerospace-grade titanium — the same alloy used in the Apollo lunar module hull, surgical implants, and high-end watch cases. We engrave it with low-relief for the outline and halftone for photo-level detail.',
            },
            {
              q: 'Why titanium instead of steel or brass?',
              a: "Three reasons: it's 60% lighter than aluminum and twice as hard as steel; it never rusts (unlike steel and unlike brass which oxidizes green); and it's hypoallergenic (same reason it's used for body implants). Brass tags eventually turn green; aluminum tags bend. Titanium does neither.",
            },
            {
              q: "Is it heavy on my dog's neck?",
              a: "No. Titanium is dramatically lighter than it looks — about 60% the weight of aluminum at the same volume, and about half the weight of stainless steel. Most owners say their dog doesn't notice it's there.",
            },
            {
              q: 'Will it set off airport security?',
              a: "No. Titanium is non-magnetic and doesn't trigger standard metal detectors the way steel does. Same reason titanium-frame eyeglasses don't.",
            },
            {
              q: 'What if my dog chews it?',
              a: "Titanium is harder than dog enamel. Aggressive chewers can put cosmetic scratches on the polished surface, but the tag won't bend, crack, or break — and the engraving is cut into the metal, not painted on, so it stays readable.",
            },
            {
              q: 'Will it irritate sensitive skin?',
              a: "No. We use the same medical-grade titanium used for surgical implants. It doesn't cause skin reactions, even in dogs with nickel sensitivity or allergic dermatitis.",
            },
            {
              q: 'Will it rust or fade?',
              a: "No. Titanium does not rust. The engraving is cut into the metal — not printed — so it won't wear off with daily use.",
            },
            {
              q: 'How do I clean it?',
              a: 'Wipe with a soft cloth. For deeper cleaning, use mild soap and water; rinse and dry. Avoid bleach or abrasive polishes.',
            },
            {
              q: 'How do I attach it to a collar?',
              a: 'Use any standard split ring or S-hook. The suspension hole fits 6mm rings comfortably.',
            },
          ],
        },
        {
          id: 'photo',
          label: "My pet's photo",
          intro: 'Your photo is used once, kept for one year, and never sold or used to train AI models.',
          questions: [
            {
              q: 'What do you do with my photo?',
              a: 'We process it through our AI pipeline to generate the halftone portrait used on your tag. The portrait is stored as part of your order record. Your original photo is deleted one year after your order ships.',
              link: { label: 'Privacy policy', href: 'privacy.html' },
            },
            {
              q: 'Will my photo train AI models?',
              a: 'No. We never use customer photos to train AI models — ours or anyone else\'s.',
            },
            {
              q: 'How long do you keep my photo?',
              a: 'Original uploaded photos: deleted one year after your order ships. Halftone portraits: kept with your order record (7 years for tax compliance).',
            },
            {
              q: 'Can I delete my photo?',
              a: 'Yes. Email privacy@marlowe.example to request deletion. We respond within 30 days.',
            },
          ],
        },
        {
          id: 'account',
          label: 'Account & login',
          intro: 'Passwordless sign-in. We never store passwords. 6-digit email code or Google.',
          questions: [
            {
              q: 'How do I sign in?',
              a: 'We use passwordless sign-in. Click "Sign in" and enter your email — we\'ll email you a 6-digit code to type back. Or use "Continue with Google" for one-tap sign-in. No password to remember.',
            },
            {
              q: "I don't remember signing up — do I have an account?",
              a: "If you've ever generated a portrait or placed an order with us, you already have an account tied to that email. Enter the same email at sign-in and we'll send you a fresh 6-digit code.",
            },
            {
              q: 'Can I check out without signing in?',
              a: 'Yes — adding to cart and checking out work without an account. The only step that requires sign-in is generating an AI portrait, since each generation has a real cost. Signing in also saves your design so you can reorder.',
            },
            {
              q: 'How do I delete my account?',
              a: 'Email privacy@marlowe.example with the subject "Delete my account". We respond within 30 days. Linked orders are anonymized for tax compliance; saved designs and uploaded photos are deleted.',
              link: { label: 'Privacy policy', href: 'privacy.html' },
            },
          ],
        },
        {
          id: 'pricing',
          label: 'Pricing & payment',
          intro: 'Single price for any combination, secure payment, no inventory discounts.',
          questions: [
            {
              q: 'How much does a tag cost?',
              a: '$109 for the Shield tag in either of 2 titanium finishes (Titanium Silver or Gunmetal). Free engraving included. Free U.S. standard shipping included.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'Credit and debit cards, Apple Pay, and Google Pay — processed securely by Stripe. We never see or store your card number.',
            },
            {
              q: 'Are there any discounts?',
              a: "Not currently. We make every tag to order — there's no inventory clearance to discount.",
            },
            {
              q: 'Is there sales tax?',
              a: 'Sales tax is calculated at checkout based on your shipping address, per U.S. state requirements.',
            },
            {
              q: 'How much does a collar cost?',
              a: '$49 for any color (Tan, Saddle, Black) and any size (XS–XL). Free U.S. shipping. If you add it to a tag order, both ship together.',
            },
            {
              q: 'Can I pay in installments?',
              a: "Yes — at checkout you can pay in 4 interest-free installments via Klarna, Afterpay, or Affirm. For a $109 tag that's $27.25 every 2 weeks. No application, no credit-check impact for the Pay-in-4 option. All processed securely through Stripe.",
            },
          ],
        },
        {
          id: 'collars',
          label: 'Collars',
          intro: 'Veg-tan leather collar with titanium hardware. $49. Optional companion to the tag.',
          questions: [
            {
              q: "What's the collar made of?",
              a: 'Full-grain vegetable-tanned cowhide, 3–4 mm thick, with brushed titanium buckle and D-ring. Hand saddle-stitched, edges burnished and beeswax-sealed.',
              link: { label: 'Collar spec', href: 'collars.html' },
            },
            {
              q: 'What sizes do you offer?',
              a: 'Five sizes — XS (25–33 cm), S (30–40 cm), M (35–50 cm), L (45–60 cm), XL (55–70 cm). Width is 25 mm (1") across all sizes. The product page has a full sizing chart with breed references.',
            },
            {
              q: 'How do I measure my dog?',
              a: "Wrap a soft tape around the base of the dog's neck where the collar will sit, then add about 2 cm (0.75\") for comfort. If your dog is between sizes, size up — leather softens with wear and our buckle has 7 adjustment holes.",
            },
            {
              q: 'Can I exchange if the size is wrong?',
              a: 'Yes — free size or color exchanges within 30 days of delivery, as long as the collar is unworn or only lightly tried on. This is more lenient than our tag policy because collars are not personalized.',
            },
            {
              q: 'Do I have to buy a collar with my tag?',
              a: 'No. The collar is an optional companion. You can buy a tag alone, a collar alone, or both together. If both are in the order, they ship together.',
            },
            {
              q: 'Will the leather match my titanium tag?',
              a: 'The collar hardware (buckle, D-ring) is the same titanium grade as the tag. Titanium Silver pairs most cleanly with all three leathers; Gunmetal looks especially sharp against Saddle or Black.',
            },
            {
              q: 'How do I care for the leather?',
              a: 'Wipe with a damp cloth and dry naturally. Treat with a small amount of unscented leather conditioner every 3–6 months. Avoid prolonged soaking. Tan leather will darken with use — this is expected patina, not damage.',
            },
          ],
        },
        {
          id: 'human',
          label: 'Talk to a person',
          intro: 'We respond within 1 business day, often sooner.',
          questions: [
            {
              q: 'Order & product help',
              a: 'support@marlowe.example',
              email: 'support@marlowe.example',
            },
            {
              q: 'Privacy & data requests',
              a: 'privacy@marlowe.example',
              email: 'privacy@marlowe.example',
            },
            {
              q: 'Press & wholesale',
              a: 'press@marlowe.example',
              email: 'press@marlowe.example',
            },
          ],
        },
      ],
    },

    zh: {
      ui: {
        toggleLabel: '客服',
        headerTitle: 'Marlowe 客服',
        greeting: '你好，我是 Marlowe 客服助手。需要哪方面的帮助？',
        chooseTopic: '请选择主题：',
        backToTopics: '← 返回主题',
        askAnother: '再问一个',
        emailSupport: '邮件联系',
        emailFooter: '或者邮件 support@marlowe.example —— 我们 1 个工作日内回复。',
        readPolicy: '详见：',
        closeAria: '关闭客服',
      },
      topics: [
        {
          id: 'shipping',
          label: '物流与配送',
          intro: '我们发什么、发到哪里、多久能到：',
          questions: [
            {
              q: '多久能收到？',
              a: '你在结账时已确认设计，付款后 24 小时安全窗里不会开雕。窗口过后，生产 7–10 个工作日，物流 5–8 个工作日。大多数美区订单从下单到收货约 13–19 个工作日。',
              link: { label: '物流政策', href: 'shipping.html' },
            },
            { q: '发货范围？', a: '美国 50 州 + DC + 军方地址（APO/FPO/DPO）+ 美属领地。暂不发国际。' },
            { q: '能追踪订单吗？', a: '可以。发货当天我们会邮件发送 DHL Express 追踪号；最后一公里由 USPS 或 UPS 派送。' },
          ],
        },
        {
          id: 'cancel',
          label: '取消与修改',
          intro: '付款前你已在结账页逐项确认了设计。付款后还有 24 小时安全窗——这期间可重做或全额退款，雕刻只在 24 小时之后才开始。',
          questions: [
            {
              q: '如何取消订单？',
              a: '付款后 24 小时内，点击确认邮件里的 Request Redo（或直接回复邮件），客服会跟你对接：免费重做，或 3–5 个工作日内全额退款，看你选。24 小时之后雕刻已开始，订单终局。',
              link: { label: '退换货政策', href: 'returns.html' },
            },
            {
              q: '不喜欢设计——能改吗？',
              a: '可以。Designer 里下单前能无限次重新生成。付款后 24 小时内还能点 Request Redo 让客服帮你免费重做。',
            },
            {
              q: '能改收货地址吗？',
              a: '在付款后 24 小时安全窗内可以——邮件 support@marlowe.example 附订单号和新地址。24 小时后雕刻已开始、运单锁定。',
            },
            {
              q: '什么时候真正开始雕刻？',
              a: '付款后 24 小时整。除非你在这 24 小时内点了 Request Redo 或回复了确认邮件——否则一过窗口立即开雕。我们用这个缓冲做安全网，前 24 小时不会有任何不可逆操作。',
            },
          ],
        },
        {
          id: 'returns',
          label: '退换货',
          intro: '定制商品 final sale，但我们承担制造缺陷、错件错色和物流损坏：',
          questions: [
            {
              q: '什么情况支持退换？',
              a: '制造缺陷、刻字错误（与你提交的不一致）、发错形状或表面、物流损坏。收货后 14 天内联系我们。',
              link: { label: '退换货政策', href: 'returns.html' },
            },
            { q: '如何申请退换？', a: '收货 14 天内邮件 support@marlowe.example，附订单号和问题照片。我们 1 个工作日内回复。如批准，我们寄出预付运费的退货标签。' },
            { q: '退款还是重做？', a: '我们的默认方案是免费重做。如果无法重做，我们通过 Stripe 全额退款。' },
            { q: '几年后坏了怎么办？', a: '钛合金牌本身极少出问题——它比镀铬不锈钢更耐用，不掉色不生锈。日常使用磨损在我们的预期之内。如果是制造缺陷或刻字错误，14 天内联系我们处理（详见退换政策）。' },
          ],
        },
        {
          id: 'designer',
          label: '设计器与 AI',
          intro: 'AI 影雕肖像如何生成：',
          questions: [
            { q: 'AI 肖像怎么生成？', a: '上传一张清晰的宠物照片，系统转换为适合金属雕刻的灰阶影雕图。Designer 实时预览，所见即所刻。' },
            { q: '如果不喜欢 AI 肖像怎么办？', a: '两层保险。下单前在 Designer 里可以免费重新生成 3 次。付款后 24 小时内还能点 Request Redo 让客服帮你免费重做。窗口过后才开雕。' },
            { q: '怎么重新生成？', a: '在最终预览页点击"换一张肖像"即可重新跑 AI。形状/底色/刻字保持不变，只换肖像。' },
            { q: '会跟我家狗完全一样吗？', a: '影雕本质是一种"风格化处理"——像照片精度的金属雕刻，不是照片复制。Designer 预览中看到的就是最终雕刻效果。如果不喜欢，不要进入结账。' },
          ],
        },
        {
          id: 'materials',
          label: '材质与保养',
          intro: '航天级钛合金——阿波罗登月舱外壳同款金属：',
          questions: [
            { q: '牌是什么材质？', a: '航天级钛合金——阿波罗登月舱外壳、外科植入物、高端手表表壳的同款金属。浅浮雕勾轮廓，影雕呈现照片级细节。' },
            { q: '为什么用钛合金而不是钢或铜？', a: '三个原因：比铝轻 60%、比钢硬一倍（不会凹陷）；永不生锈（钢会锈，铜会氧化变绿）；低致敏（医用植入物同款）。铜牌时间久了会绿，铝牌会弯曲、印刷会磨掉。钛合金这些都不会。' },
            { q: '戴在狗脖子上会重吗？', a: '不重。钛合金比看起来轻得多——同体积比铝轻 60%、比不锈钢轻一半。多数主人说狗根本感觉不到。' },
            { q: '过机场安检会响吗？', a: '不会。钛合金是非磁性金属，不会像钢制品那样触发标准金属探测器。钛框眼镜也是同理。' },
            { q: '狗狗咬怎么办？', a: '钛合金比犬齿硬。咬合凶猛的狗可能在镜面留下表面划痕，但牌不会弯、不会裂、不会断——刻字是切刻进金属里的，不是印刷的，照样清晰可读。' },
            { q: '会刺激敏感皮肤吗？', a: '不会。我们用的是外科植入物级钛合金。即使对镍过敏或有过敏性皮炎的狗也适用——这正是它被选为植入物材质的原因。' },
            { q: '会生锈或褪色吗？', a: '不会。钛合金不锈，刻字是切刻而非印刷，日常使用不会磨平。' },
            { q: '怎么清洁？', a: '用软布擦拭。需要深度清洁可用温和肥皂水冲洗后擦干。避免漂白剂或粗糙的抛光剂。' },
            { q: '怎么扣到项圈上？', a: '标准分裂环或 S 钩都行。悬挂孔适配 6mm 环。' },
          ],
        },
        {
          id: 'photo',
          label: '我的宠物照片',
          intro: '你的照片只用一次，保留 1 年，绝不出售也不用于训练 AI。',
          questions: [
            {
              q: '你们怎么处理我的照片？',
              a: '经过 AI pipeline 处理为影雕肖像，作为订单记录保存。原始上传照片在订单发货 1 年后删除。',
              link: { label: '隐私政策', href: 'privacy.html' },
            },
            { q: '会用我的照片训练 AI 模型吗？', a: '不会。我们绝不使用客户照片训练 AI 模型——无论是我们的还是别人的。' },
            { q: '照片保留多久？', a: '原始上传照片：发货后 1 年删除。影雕肖像：随订单记录保留（税务合规要求 7 年）。' },
            { q: '能删除我的照片吗？', a: '可以。邮件 privacy@marlowe.example 申请删除，我们 30 天内响应。' },
          ],
        },
        {
          id: 'account',
          label: '账户与登录',
          intro: '无密码登录。我们从不存密码。邮箱 6 位验证码或 Google 一键登录。',
          questions: [
            { q: '怎么登录？', a: '无密码登录。点"登录"输入邮箱，我们发一封 6 位验证码邮件，回到页面输入即可。或者使用 Google 一键登录。无需记密码。' },
            { q: '我没记得注册过——我有账户吗？', a: '如果你之前生成过肖像或下过单，那个邮箱就是你的账户。输入同一个邮箱，我们会发新的 6 位验证码。' },
            { q: '能不登录就结账吗？', a: '可以——加入购物车和结账不需要账户。只有"生成 AI 肖像"这一步需要登录，因为每次生成都有真实成本。登录后我们会保存你的设计，方便日后再订。' },
            {
              q: '怎么删除我的账户？',
              a: '邮件 privacy@marlowe.example，主题写"删除账户"。我们 30 天内响应。关联订单做匿名化处理（税务合规要保留）；保存的设计与上传的照片会删除。',
              link: { label: '隐私政策', href: 'privacy.html' },
            },
          ],
        },
        {
          id: 'pricing',
          label: '价格与支付',
          intro: '统一定价，安全支付，按单制造无折扣。',
          questions: [
            { q: '一枚多少钱？', a: '$109，盾形钛合金牌，2 种表面处理可选（钛本色 / 枪黑色），免费刻字，美区免标准运费。' },
            { q: '支持哪些支付方式？', a: '信用卡、借记卡、Apple Pay、Google Pay——由 Stripe 安全处理。我们不接触也不存储你的卡号。' },
            { q: '有折扣吗？', a: '目前没有。每一枚都是按单制造，没有库存清仓的折扣空间。' },
            { q: '要交销售税吗？', a: '销售税在结账时根据你的收货地址自动计算，符合美国各州规定。' },
            { q: '项圈多少钱？', a: '$49，任意颜色（Tan / Saddle / Black）和尺寸（XS–XL）。美区免运费。跟牌一起下单的话两件一起发货。' },
            { q: '可以分期吗？', a: '可以——结账时可选 Klarna、Afterpay 或 Affirm 分 4 期免息。$109 的牌就是每 2 周 $27.25。Pay-in-4 不查信用、不影响信用记录。全部由 Stripe 安全处理。' },
          ],
        },
        {
          id: 'collars',
          label: '皮革项圈',
          intro: '植鞣牛皮 + 钛合金扣件。$49。牌的可选配件。',
          questions: [
            {
              q: '项圈用什么材质？',
              a: '全粒面植鞣牛皮，3–4 mm 厚，配钛合金 brushed 扣件和 D 环。手工马鞍缝法，边缘打磨 + 蜂蜡封边。',
              link: { label: '项圈详情', href: 'collars-zh.html' },
            },
            { q: '有几个尺寸？', a: '五个尺码——XS（25–33 cm）、S（30–40 cm）、M（35–50 cm）、L（45–60 cm）、XL（55–70 cm）。宽度统一 25 mm（1 英寸）。产品页有完整尺寸表 + 适配犬种。' },
            { q: '怎么给狗量颈围？', a: '用软尺绕狗脖子项圈位置一圈，加大约 2 cm（0.75 英寸）作为舒适余量。介于两档之间时——选大的。皮革会软化，扣环上有 7 个调节孔。' },
            { q: '尺寸不合可以换吗？', a: '可以——收货 30 天内免费换码或换色，只要未佩戴或仅试戴。这比牌的政策宽松，因为项圈没有个性化定制。' },
            { q: '必须跟牌一起买吗？', a: '不必。项圈是可选配件——可以只买牌、只买项圈、或两个一起。两个一起的话一并发货。' },
            { q: '皮革会跟钛合金牌配吗？', a: '项圈的扣件（buckle、D 环）跟牌是同款钛合金等级。钛本色跟三种皮色都干净好搭；枪黑色配马鞍棕或墨黑特别有质感。' },
            { q: '皮革怎么保养？', a: '湿布擦拭，自然风干。每 3–6 个月涂一点无香皮革保养油（saddle soap、mink oil 或 beeswax balm）。避免长时间泡水。Tan 色会随使用变深——这是包浆，不是损坏。' },
          ],
        },
        {
          id: 'human',
          label: '联系真人',
          intro: '我们 1 个工作日内回复，通常更快。',
          questions: [
            { q: '订单与产品', a: 'support@marlowe.example', email: 'support@marlowe.example' },
            { q: '隐私与数据请求', a: 'privacy@marlowe.example', email: 'privacy@marlowe.example' },
            { q: '媒体与合作', a: 'press@marlowe.example', email: 'press@marlowe.example' },
          ],
        },
      ],
    },
  };

  // ====================================================================
  // STYLES
  // ====================================================================

  const STYLES = `
    .mw-chat-toggle {
      position: fixed;
      right: 24px;
      bottom: 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: #1F2937;
      color: #F5F1E8;
      border: 1.5px solid #1F2937;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      z-index: 200;
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms;
      box-shadow: 0 8px 24px -8px rgba(31, 41, 55, 0.3);
    }
    .mw-chat-toggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px -8px rgba(31, 41, 55, 0.45);
    }
    .mw-chat-toggle svg { width: 16px; height: 16px; flex-shrink: 0; }
    .mw-chat-toggle.hidden { display: none; }

    .mw-chat-panel {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 380px;
      max-width: calc(100vw - 24px);
      max-height: 80vh;
      height: 560px;
      background: #FBF8F1;
      border: 1px solid #1F2937;
      box-shadow: 0 24px 48px -16px rgba(31, 41, 55, 0.18);
      z-index: 201;
      display: flex;
      flex-direction: column;
      font-family: 'Manrope', system-ui, sans-serif;
      animation: mw-chat-slide-in 250ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes mw-chat-slide-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .mw-chat-panel.hidden { display: none; }
    @media (max-width: 480px) {
      .mw-chat-panel { right: 12px; left: 12px; bottom: 12px; width: auto; }
    }

    .mw-chat-header {
      background: #8E6F47;
      color: #F5F1E8;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .mw-chat-header-title {
      font-family: 'Fraunces', serif;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    .mw-chat-close {
      background: none;
      border: none;
      color: #F5F1E8;
      cursor: pointer;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 200ms;
    }
    .mw-chat-close:hover { opacity: 1; }
    .mw-chat-close svg { width: 18px; height: 18px; }

    .mw-chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .mw-chat-body::-webkit-scrollbar { width: 6px; }
    .mw-chat-body::-webkit-scrollbar-track { background: transparent; }
    .mw-chat-body::-webkit-scrollbar-thumb { background: rgba(31, 41, 55, 0.18); border-radius: 3px; }

    .mw-msg {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      animation: mw-msg-in 200ms ease-out;
    }
    @keyframes mw-msg-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .mw-msg-avatar {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border: 1px solid #B8956A;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #8E6F47;
      background: #FBF8F1;
    }
    .mw-msg-bubble {
      flex: 1;
      background: #F5F1E8;
      border: 1px solid rgba(31, 41, 55, 0.08);
      padding: 12px 14px;
      font-family: 'Fraunces', serif;
      font-size: 14px;
      line-height: 1.55;
      color: #1F2937;
    }
    .mw-msg-bubble strong { font-weight: 500; }
    .mw-msg-bubble a {
      color: #8E6F47;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .mw-msg-bubble a:hover { color: #1F2937; }

    .mw-trace {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(31, 41, 55, 0.5);
      align-self: flex-end;
      max-width: 80%;
      text-align: right;
      padding: 0 4px;
      animation: mw-msg-in 200ms ease-out;
    }

    .mw-chat-footer {
      border-top: 1px solid rgba(31, 41, 55, 0.08);
      padding: 14px 16px;
      background: #FBF8F1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .mw-chat-prompt {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #8E6F47;
      margin-bottom: 4px;
    }
    .mw-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .mw-chip {
      background: #F5F1E8;
      border: 1px solid rgba(31, 41, 55, 0.18);
      padding: 8px 12px;
      font-family: 'Manrope', sans-serif;
      font-size: 12px;
      color: #1F2937;
      cursor: pointer;
      transition: all 200ms;
      text-align: left;
      line-height: 1.3;
    }
    .mw-chip:hover {
      border-color: #B8956A;
      background: #EDE8DA;
    }
    .mw-chip.muted {
      color: #374151;
      border-style: dashed;
    }
    .mw-chip.muted:hover {
      border-style: solid;
      color: #1F2937;
    }
    .mw-email-link {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.1em;
      color: #8E6F47;
      text-align: center;
      padding: 4px 0;
      text-decoration: underline;
      text-underline-offset: 3px;
      display: block;
    }
    .mw-email-link:hover { color: #1F2937; }
  `;

  // ====================================================================
  // STATE + DOM
  // ====================================================================

  let lang = 'en';
  let data = FAQ.en;
  let currentTopicId = null;
  let panel = null;
  let toggle = null;
  let bodyEl = null;
  let footerEl = null;

  function detectLang() {
    const htmlLang = (document.documentElement.lang || 'en').toLowerCase();
    if (htmlLang.startsWith('zh')) return 'zh';
    return 'en';
  }

  function injectStyles() {
    if (document.getElementById('mw-chat-styles')) return;
    const s = document.createElement('style');
    s.id = 'mw-chat-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2), attrs[k]);
        } else if (k === 'aria-label') node.setAttribute('aria-label', attrs[k]);
        else node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function buildToggle() {
    const btn = el('button', {
      class: 'mw-chat-toggle',
      'aria-label': data.ui.toggleLabel,
      onclick: open,
    }, [
      el('span', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' }),
      data.ui.toggleLabel,
    ]);
    return btn;
  }

  function buildPanel() {
    const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    bodyEl = el('div', { class: 'mw-chat-body' });
    footerEl = el('div', { class: 'mw-chat-footer' });

    return el('div', { class: 'mw-chat-panel hidden', role: 'dialog', 'aria-label': data.ui.headerTitle }, [
      el('div', { class: 'mw-chat-header' }, [
        el('div', { class: 'mw-chat-header-title' }, data.ui.headerTitle),
        el('button', { class: 'mw-chat-close', 'aria-label': data.ui.closeAria, onclick: close, html: closeIcon }),
      ]),
      bodyEl,
      footerEl,
    ]);
  }

  // ====================================================================
  // RENDERERS
  // ====================================================================

  function clearBody() { bodyEl.innerHTML = ''; }
  function clearFooter() { footerEl.innerHTML = ''; }

  function botMessage(text, opts) {
    opts = opts || {};
    const bubble = el('div', { class: 'mw-msg-bubble' });
    bubble.appendChild(document.createTextNode(text));
    if (opts.link) {
      bubble.appendChild(el('br'));
      bubble.appendChild(el('span', { html: data.ui.readPolicy + ' ' }));
      bubble.appendChild(el('a', { href: opts.link.href }, opts.link.label));
    }
    if (opts.email) {
      bubble.innerHTML = '';
      bubble.appendChild(el('a', { href: 'mailto:' + opts.email }, opts.email));
    }
    return el('div', { class: 'mw-msg' }, [
      el('div', { class: 'mw-msg-avatar' }, '§'),
      bubble,
    ]);
  }

  function trace(label) {
    return el('div', { class: 'mw-trace' }, '— ' + label);
  }

  function renderRoot() {
    currentTopicId = null;
    clearBody();
    clearFooter();

    bodyEl.appendChild(botMessage(data.ui.greeting));

    footerEl.appendChild(el('div', { class: 'mw-chat-prompt' }, data.ui.chooseTopic));
    const chips = el('div', { class: 'mw-chips' });
    data.topics.forEach(topic => {
      chips.appendChild(el('button', {
        class: 'mw-chip',
        onclick: () => renderTopic(topic.id),
      }, topic.label));
    });
    footerEl.appendChild(chips);
    footerEl.appendChild(el('a', {
      class: 'mw-email-link',
      href: 'mailto:support@marlowe.example',
    }, data.ui.emailFooter));

    scrollBody();
  }

  function renderTopic(topicId) {
    const topic = data.topics.find(t => t.id === topicId);
    if (!topic) return renderRoot();
    currentTopicId = topicId;

    bodyEl.appendChild(trace(topic.label));
    bodyEl.appendChild(botMessage(topic.intro));

    clearFooter();
    footerEl.appendChild(el('div', { class: 'mw-chat-prompt' }, data.ui.chooseTopic));
    const chips = el('div', { class: 'mw-chips' });
    topic.questions.forEach((q, idx) => {
      chips.appendChild(el('button', {
        class: 'mw-chip',
        onclick: () => renderAnswer(topicId, idx),
      }, q.q));
    });
    footerEl.appendChild(chips);
    footerEl.appendChild(buildBackRow());

    scrollBody();
  }

  function renderAnswer(topicId, qIdx) {
    const topic = data.topics.find(t => t.id === topicId);
    if (!topic) return renderRoot();
    const q = topic.questions[qIdx];
    if (!q) return renderTopic(topicId);

    bodyEl.appendChild(trace(q.q));
    bodyEl.appendChild(botMessage(q.a, { link: q.link, email: q.email }));

    clearFooter();
    const row = el('div', { class: 'mw-chips' });
    row.appendChild(el('button', {
      class: 'mw-chip muted',
      onclick: () => { clearBodyExceptGreeting(); renderRoot(); },
    }, data.ui.askAnother));
    row.appendChild(el('button', {
      class: 'mw-chip muted',
      onclick: () => window.location.href = 'mailto:support@marlowe.example',
    }, data.ui.emailSupport));
    footerEl.appendChild(row);

    scrollBody();
  }

  function buildBackRow() {
    const row = el('div', { class: 'mw-chips' });
    row.appendChild(el('button', {
      class: 'mw-chip muted',
      onclick: () => { clearBodyExceptGreeting(); renderRoot(); },
    }, data.ui.backToTopics));
    row.appendChild(el('button', {
      class: 'mw-chip muted',
      onclick: () => window.location.href = 'mailto:support@marlowe.example',
    }, data.ui.emailSupport));
    return row;
  }

  function clearBodyExceptGreeting() {
    // Soft reset — wipe transcript, fresh start
    clearBody();
  }

  function scrollBody() {
    requestAnimationFrame(() => { bodyEl.scrollTop = bodyEl.scrollHeight; });
  }

  // ====================================================================
  // CONTROLS
  // ====================================================================

  function open() {
    panel.classList.remove('hidden');
    toggle.classList.add('hidden');
    if (!bodyEl.children.length) renderRoot();
  }

  function close() {
    panel.classList.add('hidden');
    toggle.classList.remove('hidden');
    // Reset on close so next open is fresh
    clearBody();
    clearFooter();
  }

  // ====================================================================
  // INIT
  // ====================================================================

  function init() {
    lang = detectLang();
    data = FAQ[lang] || FAQ.en;

    injectStyles();
    toggle = buildToggle();
    panel = buildPanel();

    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
