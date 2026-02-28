/* ========== CSM DASHBOARD (Tab 4) ========== */
const GE_PRODUCTS = [
    { id: 'wcpay', name: 'WCPay', tier: 1, minGmv: 0, annualValue: 0 },
    { id: 'automatewoo', name: 'AutomateWoo', tier: 2, minGmv: 50000, annualValue: 99 },
    { id: 'subscriptions', name: 'Subscriptions/CRM', tier: 3, minGmv: 100000, annualValue: 226 },
    { id: 'security', name: 'Jetpack Security', tier: 4, minGmv: 250000, annualValue: 240 },
    { id: 'pressable', name: 'Pressable Hosting', tier: 5, minGmv: 500000, annualValue: 540 },
    { id: 'metorik', name: 'Metorik Analytics', tier: 5, minGmv: 500000, annualValue: 600 },
    { id: 'customrate', name: 'Custom WCPay Rate', tier: 6, minGmv: 1000000, annualValue: 0 },
    { id: 'capital', name: 'WooCommerce Capital', tier: 6, minGmv: 1000000, annualValue: 0 }
];

const EXPANSION_SIGNALS = {
    50000: [
        { product: 'AutomateWoo', likelihood: 'high', reason: '7x adoption growth at this tier' },
        { product: 'MailPoet', likelihood: 'med', reason: '2.8x more likely for WCPay merchants' },
        { product: 'WC Subscriptions', likelihood: 'low', reason: 'Typically adopted at $100K+' }
    ],
    100000: [
        { product: 'WC Subscriptions', likelihood: 'high', reason: 'Revenue stabilization need' },
        { product: 'Jetpack Security', likelihood: 'med', reason: 'Growing data protection need' },
        { product: 'AutomateWoo', likelihood: 'high', reason: 'If not already adopted' }
    ],
    250000: [
        { product: 'Jetpack Security', likelihood: 'high', reason: '1.7x adoption for WCPay merchants' },
        { product: 'Pressable', likelihood: 'med', reason: 'Performance needs increasing' },
        { product: 'Metorik', likelihood: 'med', reason: 'Analytics becomes critical' }
    ],
    500000: [
        { product: 'Pressable + Metorik', likelihood: 'high', reason: '40x Metorik demand at this tier' },
        { product: 'Custom WCPay Rate', likelihood: 'low', reason: 'Typically at $1M+' }
    ],
    1000000: [
        { product: 'Custom WCPay Rate', likelihood: 'high', reason: 'Rate competition at enterprise level' },
        { product: 'WooCommerce Capital', likelihood: 'med', reason: 'Growth financing need' }
    ]
};

function initCSM() {
    const checkboxes = document.getElementById('csm-products');
    GE_PRODUCTS.forEach(p => {
        const label = document.createElement('label');
        label.className = 'csm-check';
        const valueTag = p.annualValue > 0 ? ` <span style="font-size:0.6rem;color:var(--text-muted)">(${fmtF(p.annualValue)}/yr)</span>` : '';
        label.innerHTML = `
            <input type="checkbox" data-product="${p.id}" data-tier="${p.tier}">
            <span class="csm-check-icon">✓</span>
            <span>${p.name}${valueTag}</span>
        `;
        label.addEventListener('click', function (e) {
            if (e.target.type !== 'checkbox') return;
            setTimeout(() => {
                this.classList.toggle('active', e.target.checked);
                csmUpdate();
            }, 0);
        });
        checkboxes.appendChild(label);
    });

    document.getElementById('csm-gmv-slider').addEventListener('input', csmUpdate);
    csmUpdate();
}

function csmUpdate() {
    const gmv = s2g(document.getElementById('csm-gmv-slider').value);
    document.getElementById('csm-gmv-display').textContent = fmt(gmv);

    // Count active products and calculate values
    const activeProducts = [];
    document.querySelectorAll('#csm-products input:checked').forEach(cb => {
        activeProducts.push(cb.dataset.product);
    });
    const numActive = activeProducts.length;

    // Calculate eligible and utilized product values
    let eligibleValue = 0, utilizedValue = 0;
    GE_PRODUCTS.forEach(p => {
        if (gmv >= p.minGmv && p.annualValue > 0) {
            eligibleValue += p.annualValue;
            if (activeProducts.includes(p.id)) utilizedValue += p.annualValue;
        }
    });
    const utilizationPct = eligibleValue > 0 ? Math.round((utilizedValue / eligibleValue) * 100) : 0;

    // Calculate switching score (custom based on active products + GMV)
    let switchScore = Math.min(10, numActive + (gmv >= 500000 ? 2 : gmv >= 100000 ? 1 : 0));
    if (numActive === 0) switchScore = 1;

    // Health score
    const eligible = GE_PRODUCTS.filter(p => gmv >= p.minGmv).length;
    const adoptionRate = eligible > 0 ? numActive / eligible : 0;
    const healthPct = Math.round(adoptionRate * 100);

    let healthColor, healthLabel;
    if (healthPct >= 75) { healthColor = 'var(--positive)'; healthLabel = 'Healthy - Well Retained'; }
    else if (healthPct >= 50) { healthColor = 'var(--warning)'; healthLabel = 'Moderate - Room to Grow'; }
    else if (healthPct >= 25) { healthColor = 'var(--growth-engine)'; healthLabel = 'At Risk - Low Adoption'; }
    else { healthColor = 'var(--negative)'; healthLabel = 'High Risk - Minimal Engagement'; }

    // Determine current tier
    let currentTier = 0;
    if (gmv >= 1e6) currentTier = 6;
    else if (gmv >= 5e5) currentTier = 5;
    else if (gmv >= 25e4) currentTier = 4;
    else if (gmv >= 1e5) currentTier = 3;
    else if (gmv >= 5e4) currentTier = 2;
    else currentTier = 1;

    // Progress steps
    const stepsHTML = [1, 2, 3, 4, 5, 6].map(t => {
        if (t < currentTier) return `<div class="csm-step active"></div>`;
        if (t === currentTier) return `<div class="csm-step active" style="background:var(--positive)"></div>`;
        if (t === currentTier + 1) return `<div class="csm-step next"></div>`;
        return `<div class="csm-step"></div>`;
    }).join('');

    // Recommended actions
    const actions = [];
    const eligibleNotActive = GE_PRODUCTS.filter(p => gmv >= p.minGmv && !activeProducts.includes(p.id));
    eligibleNotActive.forEach(p => {
        const valueNote = p.annualValue > 0 ? ` (${fmtF(p.annualValue)}/yr value)` : '';
        actions.push(`📦 <strong>Activate ${p.name}</strong> - Eligible at this GMV but not yet adopted${valueNote}`);
    });
    if (switchScore < 7) {
        actions.push(`⚠️ <strong>Deepen product adoption</strong> - Retention score is ${switchScore}/10. More active products = stronger ecosystem dependencies`);
    }
    if (gmv >= 500000 && !activeProducts.includes('pressable')) {
        actions.push(`🏗️ <strong>Infrastructure upgrade critical</strong> - At $500K+ GMV, shared hosting is a churn risk. Pressable migration should be top priority`);
    }
    if (gmv >= 1000000 && !activeProducts.includes('customrate')) {
        actions.push(`💰 <strong>Custom rate conversation</strong> - Proactively offer custom WCPay rate before merchant starts exploring alternatives`);
    }
    if (numActive >= 5) {
        actions.push(`🏆 <strong>QBR focus: value recap</strong> - Show cumulative savings from GE products. Reinforce the ecosystem value this merchant has built`);
    }

    // QBR talking points (no competitor mentions — positive retention framing)
    const qbrPoints = [];

    // Dynamic GE value based on active products
    if (utilizedValue > 0) {
        qbrPoints.push(`💰 "You're currently receiving <strong>${fmtF(utilizedValue)}/yr</strong> in Growth Engine product value at no extra cost."`);
    }
    if (eligibleValue > utilizedValue) {
        const gap = eligibleValue - utilizedValue;
        qbrPoints.push(`📦 "There's an additional <strong>${fmtF(gap)}/yr</strong> in eligible products you haven't activated yet — let me show you what's available."`);
    }
    if (currentTier < 6) {
        const nextGmv = [0, 50000, 100000, 250000, 500000, 1000000][currentTier];
        const gap = nextGmv - gmv;
        if (gap > 0) qbrPoints.push(`🎯 "You're <strong>${fmt(gap)}</strong> from your next Growth Engine milestone — new product unlocks are just around the corner."`);
    }
    if (numActive >= 3) {
        qbrPoints.push(`🔗 "You've built a strong ecosystem with ${numActive} integrated products — your automation workflows, data history, and infrastructure all compound in value over time."`);
    }
    if (gmv >= 1e6 && activeProducts.includes('customrate')) {
        qbrPoints.push(`🏆 "At your scale, you have the full Growth Engine suite plus custom pricing — you're getting the best of both worlds: enterprise infrastructure with open-source flexibility."`);
    }

    // Expansion signals
    const expKey = Object.keys(EXPANSION_SIGNALS).reverse().find(k => gmv >= parseInt(k)) || '50000';
    const signals = EXPANSION_SIGNALS[expKey] || [];
    const signalsHTML = signals.map(s => `
        <div class="csm-expansion-item">
            <span>${s.product} <span style="font-size:0.6rem;color:var(--text-muted)">- ${s.reason}</span></span>
            <span class="csm-exp-likelihood csm-exp-${s.likelihood}">${s.likelihood.toUpperCase()}</span>
        </div>
    `).join('');

    // Internal FYI: switching cost (not for merchant-facing conversation)
    const mc = getMC(gmv, switchScore);

    // Product Value Utilization bar
    let utilizationBarColor = 'var(--negative)';
    if (utilizationPct >= 75) utilizationBarColor = 'var(--positive)';
    else if (utilizationPct >= 50) utilizationBarColor = 'var(--warning)';
    else if (utilizationPct >= 25) utilizationBarColor = 'var(--growth-engine)';

    const valueUtilHTML = eligibleValue > 0 ? `
        <div class="csm-card-title" style="margin-top:14px">Product Value Utilization</div>
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:4px">
            <span style="color:var(--text-secondary)">Utilizing <strong style="color:${utilizationBarColor}">${fmtF(utilizedValue)}</strong> of <strong>${fmtF(eligibleValue)}</strong>/yr eligible</span>
            <span style="font-weight:700;color:${utilizationBarColor}">${utilizationPct}%</span>
        </div>
        <div style="background:var(--bg-input);border-radius:6px;height:10px;overflow:hidden;margin-bottom:4px">
            <div style="width:${utilizationPct}%;height:100%;background:${utilizationBarColor};border-radius:6px;transition:width 0.3s"></div>
        </div>
        ${utilizedValue < eligibleValue ? `<div style="font-size:0.65rem;color:var(--text-muted);font-style:italic">💡 ${fmtF(eligibleValue - utilizedValue)}/yr in product value is available but not yet activated</div>` : `<div style="font-size:0.65rem;color:var(--positive);font-style:italic">✅ All eligible product value is being utilized</div>`}
    ` : '';

    // Render results
    document.getElementById('csm-results').innerHTML = `
        <div class="csm-card">
            <div class="csm-card-title">Retention Health</div>
            <div class="csm-health-gauge">
                <div class="csm-health-score" style="color:${healthColor}">${healthPct}%</div>
                <div class="csm-health-label" style="color:${healthColor}">${healthLabel}</div>
            </div>
            <div style="font-size:0.72rem;color:var(--text-secondary);margin-bottom:8px">${numActive} of ${eligible} eligible products active | Retention Score: ${switchScore}/10</div>
            <div class="csm-progress-steps">${stepsHTML}</div>
            <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--text-muted);margin-bottom:12px"><span>Tier 1</span><span>Tier ${currentTier} (current)</span><span>Tier 6</span></div>
            ${valueUtilHTML}
            <div class="csm-card-title" style="margin-top:14px">QBR Talking Points</div>
            ${qbrPoints.map(p => `<div style="font-size:0.75rem;color:var(--text-secondary);padding:4px 0;line-height:1.5">${p}</div>`).join('')}
            <div style="margin-top:10px;padding:8px 10px;background:rgba(139,143,168,0.08);border:1px solid rgba(139,143,168,0.15);border-radius:6px">
                <div style="font-size:0.6rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;letter-spacing:0.5px;margin-bottom:4px">🔒 Internal Only — Est. Switching Cost</div>
                <div style="font-size:0.72rem;color:var(--text-secondary)">Replatforming at this GMV/dependency level: <strong style="color:var(--negative)">${fmtF(mc)}</strong> <span style="font-size:0.6rem;color:var(--text-muted)">(retention score ${switchScore}/10)</span></div>
            </div>
        </div>
        <div class="csm-card">
            <div class="csm-card-title">Recommended Actions</div>
            <ul class="csm-action-list">
                ${actions.map(a => `<li>${a}</li>`).join('')}
                ${actions.length === 0 ? '<li>✅ All eligible products activated. Focus on renewal and expansion conversations.</li>' : ''}
            </ul>
            <div class="csm-card-title" style="margin-top:16px">Expansion Signals</div>
            ${signalsHTML}
        </div>
    `;
}

initCSM();
