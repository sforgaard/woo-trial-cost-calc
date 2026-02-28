/* ========== AE PLAYBOOK (Tab 3) ========== */
const PLAYBOOK = [
    {
        tier: 1, gmv: '$0', name: 'WCPay Setup',
        talkTrack: '"Let\'s get your first sale processing through WCPay. It takes about 5 minutes to set up, and you\'ll have payments, deposits, and dispute management all inside your WordPress dashboard. No separate Stripe login needed."',
        objections: [
            { q: '"I already have Stripe set up, why switch?"', a: 'You don\'t have to switch. WCPay runs on Stripe\'s infrastructure but gives you everything inside the WooCommerce dashboard - see your revenue, manage disputes, track deposits without switching tabs. Many merchants run both side by side.' },
            { q: '"What are the fees?"', a: '2.9% + $0.30 per transaction, the same as Stripe direct. At scale ($1M+ GMV), Growth Engine unlocks custom rates. You\'re also not locked in - no gateway surcharges if you want to use another processor alongside WCPay.' },
            { q: '"Is WCPay reliable enough for my business?"', a: 'WCPay processes payments through Stripe\'s infrastructure, the same platform that handles payments for Amazon, Shopify, and Instacart. 99.999% uptime.' }
        ],
        stickiness: [
            { name: 'WCPay', wcpay: 100, nonWcpay: 0 },
            { name: 'WC Services', wcpay: 78.3, nonWcpay: 63.4 },
            { name: 'WooCommerce Tax', wcpay: 78.3, nonWcpay: 63.4 }
        ],
        risks: ['Don\'t push WCPay as the ONLY gateway. Data shows merchants who keep existing gateways alongside WCPay have better outcomes.', 'Frame it as "add WCPay alongside your existing setup" not "replace Stripe with WCPay."']
    },
    {
        tier: 2, gmv: '$50K', name: 'AutomateWoo',
        talkTrack: '"You\'re doing $50K+ in annual revenue - that means you have repeat customers worth nurturing. AutomateWoo lets you automate abandoned cart recovery, post-purchase upsells, and win-back campaigns. What are you doing manually today that takes the most time?"',
        objections: [
            { q: '"I already use Klaviyo/Mailchimp for email."', a: 'AutomateWoo isn\'t just email - it\'s workflow automation native to Woo. It triggers on WooCommerce events (cart abandoned, subscription renewed, product reviewed) that external tools can\'t see without complex integration. Most merchants use both.' },
            { q: '"I don\'t have time to set up automations."', a: 'AutomateWoo comes with pre-built workflows. Abandoned cart recovery takes 10 minutes to configure and typically recovers 5-15% of abandoned carts. What\'s 10% of your monthly abandoned cart value?' },
            { q: '"How is this different from Shopify Flow?"', a: 'Shopify Flow is limited to Shopify\'s ecosystem. AutomateWoo integrates with your existing WordPress plugins, CRM, membership tools, and custom post types. It\'s automation that adapts to YOUR stack, not Shopify\'s.' }
        ],
        stickiness: [
            { name: 'AutomateWoo', wcpay: 1.7, nonWcpay: 0.3 },
            { name: 'MailPoet', wcpay: 6.2, nonWcpay: 2.2 },
            { name: 'WC Services', wcpay: 78.3, nonWcpay: 63.4 }
        ],
        risks: ['AutomateWoo workflows take weeks to rebuild on another platform. This is one of the strongest switching cost creators.', 'Merchants who adopt AutomateWoo are 5.7x more likely to be WCPay users - it\'s a gateway to deeper platform adoption.']
    },
    {
        tier: 3, gmv: '$100K', name: 'Subscriptions / CRM',
        talkTrack: '"At $100K, the question shifts from \'how do I get customers?\' to \'how do I keep them?\' What\'s your growth model - recurring revenue through subscriptions, exclusive access through memberships, or deeper customer relationships through CRM?"',
        objections: [
            { q: '"Recharge/Bold is the industry standard for subscriptions."', a: 'WC Subscriptions is native to WooCommerce - no API dependency, no per-transaction fees beyond payment processing, and full control over your subscriber data. Recharge charges $99/mo + $0.65 per transaction. At your volume, that\'s real money.' },
            { q: '"I\'m not sure my products work as subscriptions."', a: 'Subscriptions aren\'t just boxes. Think: consumables on auto-ship, access to premium content, VIP pricing tiers, maintenance plans. What percentage of your customers reorder within 90 days? Those are subscription candidates.' },
            { q: '"We already have a CRM - HubSpot/Salesforce."', a: 'Jetpack CRM lives inside WordPress and syncs with WooCommerce automatically. No integration middleware, no data lag, no per-seat pricing. It\'s built for merchants who want customer context without enterprise CRM complexity.' }
        ],
        stickiness: [
            { name: 'WC Subscriptions', wcpay: 6.2, nonWcpay: 1.9 },
            { name: 'WC Memberships', wcpay: 2.4, nonWcpay: 0.8 },
            { name: 'AutomateWoo', wcpay: 1.7, nonWcpay: 0.3 }
        ],
        risks: ['Subscription revenue model is the strongest lock-in. Merchants won\'t migrate mid-billing-cycle for thousands of subscribers.', 'This is a consultative sale - the AE needs to understand the merchant\'s business model, not just push a product.']
    },
    {
        tier: 4, gmv: '$250K', name: 'Jetpack Security',
        talkTrack: '"At $250K in annual revenue, your store processes sensitive customer data every day. A breach doesn\'t just cost money - it costs trust. A one-day outage at your GMV means roughly $685 in lost sales. Jetpack Security gives you automated backups, malware scanning, and brute force protection."',
        objections: [
            { q: '"My host already provides backups."', a: 'Host-level backups are typically daily snapshots. Jetpack does real-time backups - every order, every product change, every customer update is captured. If something breaks at 2pm, you restore to 1:59pm, not yesterday.' },
            { q: '"We haven\'t had security issues so far."', a: 'WordPress sites are targeted in 90% of all CMS-based attacks. At $250K+ GMV, you\'re holding enough customer PII and payment data to be a target. This is insurance, not a fix for an existing problem.' },
            { q: '"Shopify handles security for me."', a: 'True - and that\'s included in your Shopify plan. But you\'re also giving up control. With WooCommerce + Jetpack Security, you own your security stack AND your data. Shopify can change their terms, restrict your access, or flag your account.' }
        ],
        stickiness: [
            { name: 'Jetpack', wcpay: 34.1, nonWcpay: 20.1 },
            { name: 'WC Services', wcpay: 78.3, nonWcpay: 63.4 },
            { name: 'WC Subscriptions', wcpay: 6.2, nonWcpay: 1.9 }
        ],
        risks: ['Jetpack Security creates backup history dependency - merchants accumulate months of restore points they can\'t transfer.', 'This is the "trust" tier. Success here builds the relationship for Tier 5 infrastructure conversation.']
    },
    {
        tier: 5, gmv: '$500K', name: 'Pressable + Metorik',
        talkTrack: '"You\'ve outgrown shared hosting. At $500K, page load speed directly impacts your conversion rate - every 100ms of latency costs you roughly 1% of revenue. Pressable gives you managed WordPress hosting built for WooCommerce, and Metorik gives you the analytics to understand what\'s actually driving your growth."',
        objections: [
            { q: '"My current hosting works fine."', a: 'At $500K GMV, you\'re likely running 500+ orders/month. Test your site during peak traffic - if load time exceeds 2 seconds, you\'re leaving money on the table. Pressable is optimized for WooCommerce with auto-scaling, CDN, and 24/7 support.' },
            { q: '"Google Analytics gives me everything I need."', a: 'GA tells you about traffic. Metorik tells you about revenue - customer lifetime value, cohort retention, subscription MRR, product margin analysis, email-triggered reports. It\'s the difference between "how many visitors" and "which customers matter."' },
            { q: '"That\'s a lot of infrastructure change at once."', a: 'Pressable handles the migration for you - they\'ll move your site with zero downtime. And Metorik connects to WooCommerce in one click. This isn\'t months of work; it\'s a few hours of setup for enterprise-grade infrastructure.' }
        ],
        stickiness: [
            { name: 'Metorik', wcpay: 0.8, nonWcpay: 0.2 },
            { name: 'Jetpack', wcpay: 34.1, nonWcpay: 20.1 },
            { name: 'AutomateWoo', wcpay: 1.7, nonWcpay: 0.3 }
        ],
        risks: ['This is the first real-expense tier ($1,140/yr value). Make the ROI case: Pressable\'s performance improvement should drive measurable conversion gains.', 'After this tier, migration becomes a multi-month infrastructure project - this is the critical retention inflection point.']
    },
    {
        tier: 6, gmv: '$1M+', name: 'Custom Rate + Capital',
        talkTrack: '"Let\'s build your custom package. At $1M+ you qualify for custom WCPay processing rates, access to WooCommerce Capital for business financing, and a dedicated CSM. What\'s most important to your business right now - lower processing costs, growth capital, or strategic support?"',
        objections: [
            { q: '"Shopify Plus can probably offer me better rates."', a: 'They might - Shopify processes $181B/yr through Stripe, which gives them volume leverage. But consider the total picture: WooCommerce has zero gateway surcharges, you own your data and code, and you have $2K-$5K/yr in free GE products. The question isn\'t just rates - it\'s total cost and total control.' },
            { q: '"I need growth capital but I don\'t want to be locked in."', a: 'WooCommerce Capital works similarly to Shopify Capital or PayPal Working Capital. The key difference: your store isn\'t locked to a proprietary platform. If you ever want to change payment processors or hosting, your loan terms don\'t change.' },
            { q: '"At $1M I should probably be on Shopify Plus for reliability."', a: 'Let\'s look at the numbers together. [Open TCO Calculator] With your GE unlocks, the migration cost is $100K+ with a 7+ year payback. Your store already runs on enterprise infrastructure (Pressable) with enterprise security (Jetpack). What specific reliability concern are you trying to solve?' }
        ],
        stickiness: [
            { name: 'All GE Products', wcpay: 100, nonWcpay: 0 },
            { name: 'Jetpack', wcpay: 34.1, nonWcpay: 20.1 },
            { name: 'WC Subscriptions', wcpay: 6.2, nonWcpay: 1.9 }
        ],
        risks: ['This is the "double squeeze" zone - Shopify\'s negotiated rates widen their advantage. Focus on total ecosystem value, not rate matching.', 'WCPay adoption drops to 15.4% at this tier. Lost merchants here represent $656K/yr in at-risk net margin.']
    }
];

function initPlaybook() {
    const tiersEl = document.getElementById('playbook-tiers');
    PLAYBOOK.forEach((p, i) => {
        const btn = document.createElement('div');
        btn.className = 'pb-tier-btn' + (i === 0 ? ' active' : '');
        btn.innerHTML = `<div class="pb-gmv">${p.gmv}</div><div class="pb-name">${p.name}</div>`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pb-tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPlaybook(i);
        });
        tiersEl.appendChild(btn);
    });
    renderPlaybook(0);
}

function renderPlaybook(index) {
    const p = PLAYBOOK[index];
    const detail = document.getElementById('playbook-detail');

    const objectionsHTML = p.objections.map(o => `
        <li>
            <div class="pb-objection-q">${o.q}</div>
            <div class="pb-objection-a">${o.a}</div>
        </li>
    `).join('');

    const stickinessHTML = p.stickiness.map(s => `
        <div class="pb-stick-item">
            <div class="pb-stick-name">${s.name}</div>
            <div class="pb-stick-bar">
                <div class="pb-stick-fill" style="width:${s.wcpay}%;background:var(--woo-purple);min-width:2px"></div>
                <div class="pb-stick-pct">${s.wcpay}% WCPay</div>
            </div>
            <div class="pb-stick-bar">
                <div class="pb-stick-fill" style="width:${s.nonWcpay}%;background:var(--text-muted);min-width:2px"></div>
                <div class="pb-stick-pct">${s.nonWcpay}% Non-WCPay</div>
            </div>
        </div>
    `).join('');

    const risksHTML = p.risks.map(r => `
        <div class="pb-risk-item">
            <span class="pb-risk-flag">⚠</span> ${r}
        </div>
    `).join('');

    detail.innerHTML = `
        <div class="pb-section">
            <div class="pb-section-title">💬 Talk Track</div>
            <div class="pb-talk-track">${p.talkTrack}</div>
        </div>
        <div class="pb-section">
            <div class="pb-section-title">🛡️ Objection Handlers</div>
            <ul class="pb-objections">${objectionsHTML}</ul>
        </div>
        <div class="pb-section">
            <div class="pb-section-title">📊 Plugin Stickiness (WCPay vs Non-WCPay Adoption)</div>
            <div class="pb-stickiness-grid">${stickinessHTML}</div>
        </div>
        <div class="pb-section">
            <div class="pb-section-title">⚡ Risk Flags & Notes</div>
            ${risksHTML}
        </div>
    `;
}

initPlaybook();
