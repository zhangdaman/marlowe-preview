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
              a: 'Production takes 7–10 business days. Shipping adds 3–5 business days. Most U.S. orders arrive within 11–16 business days from order placement.',
              link: { label: 'Shipping policy', href: 'shipping.html' },
            },
            {
              q: 'Where do you ship?',
              a: "All 50 U.S. states + D.C., U.S. military addresses (APO/FPO/DPO), and U.S. territories. We don't ship internationally yet.",
            },
            {
              q: 'Can I track my order?',
              a: 'Yes. We email a tracking number the day your tag ships, usually via USPS Priority or UPS Ground.',
            },
          ],
        },
        {
          id: 'cancel',
          label: 'Cancellations & changes',
          intro: 'You have a 24-hour window after ordering to make changes. After that, the order is locked.',
          questions: [
            {
              q: 'How do I cancel?',
              a: 'You can cancel any order, for any reason, within 24 hours of placing it. Email support@marlowe.example with your order number.',
              link: { label: 'Returns policy', href: 'returns.html' },
            },
            {
              q: 'Can I change my shipping address?',
              a: 'Yes, within the 24-hour cancellation window. Email us with your order number and the new address.',
            },
            {
              q: 'Can I change the design after ordering?',
              a: "The Designer's real-time preview is your final approval. Once 24 hours pass, the design is locked. We can't change spelling, swap shapes, or update the engraving after that point.",
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
              a: "You can regenerate as many times as you like before checkout (within reasonable limits). Once you've placed the order and the 24-hour window passes, the design is locked.",
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
          intro: 'Aerospace-grade titanium with low-relief and halftone engraving:',
          questions: [
            {
              q: "What's the tag made of?",
              a: 'Aerospace-grade titanium. Lighter than steel, hypoallergenic, and will not rust. We use precision low-relief engraving for the outline and halftone engraving for photo-level detail.',
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
          intro: 'Passwordless sign-in. We never store passwords. Magic link or Apple/Google.',
          questions: [
            {
              q: 'How do I sign in?',
              a: 'We use passwordless sign-in. Click "Sign in" and enter your email — we\'ll email a one-click link. Or use "Continue with Apple" / "Continue with Google" for instant sign-in. No password to remember.',
            },
            {
              q: "I don't remember signing up — do I have an account?",
              a: "If you've ever generated a portrait or placed an order with us, you already have an account tied to that email. Enter the same email at sign-in and we'll send a fresh link.",
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
              a: '$79 for any combination of shape (Shield, Octagon, Disc) and finish (5 options). Free engraving included. Free U.S. standard shipping included.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'Credit and debit cards, Apple Pay, and Google Pay — processed securely by Stripe. We never see or store your card number.',
            },
            {
              q: 'Are there any discounts?',
              a: "Not currently. We make every tag to order in California — there's no inventory clearance to discount.",
            },
            {
              q: 'Is there sales tax?',
              a: 'Sales tax is calculated at checkout based on your shipping address, per U.S. state requirements.',
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
              a: '生产需 7–10 个工作日，物流再加 3–5 个工作日。大多数美区订单从下单到收货约 11–16 个工作日。',
              link: { label: '物流政策', href: 'shipping.html' },
            },
            { q: '发货范围？', a: '美国 50 州 + DC + 军方地址（APO/FPO/DPO）+ 美属领地。暂不发国际。' },
            { q: '能追踪订单吗？', a: '可以。发货当天我们会邮件发送 USPS Priority 或 UPS Ground 的追踪号。' },
          ],
        },
        {
          id: 'cancel',
          label: '取消与修改',
          intro: '下单后有 24 小时窗口可以修改或取消。窗口关闭后订单锁定。',
          questions: [
            {
              q: '如何取消订单？',
              a: '下单后 24 小时内可任意取消。邮件 support@marlowe.example 加订单号。超过 24 小时订单进入生产，无法取消。',
              link: { label: '退换货政策', href: 'returns.html' },
            },
            { q: '能改收货地址吗？', a: '可以——在 24 小时取消窗口内。邮件附上订单号和新地址即可。' },
            { q: '下单后能改设计吗？', a: 'Designer 实时预览即视为你的最终确认。24 小时窗口关闭后，设计锁定，不能改刻字、形状或表面。' },
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
          ],
        },
        {
          id: 'designer',
          label: '设计器与 AI',
          intro: 'AI 影雕肖像如何生成：',
          questions: [
            { q: 'AI 肖像怎么生成？', a: '上传一张清晰的宠物照片，系统转换为适合金属雕刻的灰阶影雕图。Designer 实时预览，所见即所刻。' },
            { q: '如果不喜欢 AI 肖像怎么办？', a: '下单前可无限次重新生成（合理范围内）。下单后 24 小时窗口关闭，设计就锁定了。' },
            { q: '怎么重新生成？', a: '在最终预览页点击"换一张肖像"即可重新跑 AI。形状/底色/刻字保持不变，只换肖像。' },
            { q: '会跟我家狗完全一样吗？', a: '影雕本质是一种"风格化处理"——像照片精度的金属雕刻，不是照片复制。Designer 预览中看到的就是最终雕刻效果。如果不喜欢，不要进入结账。' },
          ],
        },
        {
          id: 'materials',
          label: '材质与保养',
          intro: '航天级钛合金 + 浅浮雕 + 影雕双工艺：',
          questions: [
            { q: '牌是什么材质？', a: '航天级钛合金。比钢更轻、低致敏、永不生锈。浅浮雕勾轮廓，影雕呈现照片级细节。' },
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
          intro: '无密码登录。我们从不存密码。邮件登录链接或 Apple/Google 一键登录。',
          questions: [
            { q: '怎么登录？', a: '我们用的是无密码登录。点"登录"输入邮箱，我们会发一封一键登录的邮件。或者使用"Apple 继续"/"Google 继续"一键登录。无需记密码。' },
            { q: '我没记得注册过——我有账户吗？', a: '如果你之前生成过肖像或下过单，那个邮箱就是你的账户。输入同一个邮箱，我们会发新的登录链接。' },
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
            { q: '一枚多少钱？', a: '$79，任意形状（盾形 / 八角 / 圆形）+ 任意表面（5 种）的组合都是统一价。免费刻字。美区免标准运费。' },
            { q: '支持哪些支付方式？', a: '信用卡、借记卡、Apple Pay、Google Pay——由 Stripe 安全处理。我们不接触也不存储你的卡号。' },
            { q: '有折扣吗？', a: '目前没有。每一枚都是按单制造，没有库存清仓的折扣空间。' },
            { q: '要交销售税吗？', a: '销售税在结账时根据你的收货地址自动计算，符合美国各州规定。' },
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
