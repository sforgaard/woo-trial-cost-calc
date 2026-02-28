/* ========== CSM DASHBOARD (Tab 4) ========== */
const GE_PRODUCTS = [
    { id: 'wcpay', name: 'WCPay', tier: 1, minGmv: 0 },
    { id: 'automatewoo', name: 'AutomateWoo', tier: 2, minGmv: 50000 },
    { id: 'subscriptions', name: 'Subscriptions/CRM', tier: 3, minGmv: 100000 },
    { id: 'security', name: 'Jetpack Security', tier: 4, minGmv: 250000 },
    { id: 'pressable', name: 'Pressable Hosting', tier: 5, minGmv: 500000 },
    { id: 'metorik', name: 'Metorik Analytics', tier: 5, minGmv: 500000 },
    { id: 'customrate', name: 'Custom WCPay Rate', tier: 6, minGmv: 1000000 },
    { id: 'capital', name: 'WooCommerce Capital', tier: 6, minGmv: 1000000 }
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
        { product: 'Custom WCPay Rate', likelihood: 'high', reason: 'Rate competition with Shopify Plus' },
        { product: 'WooCommerce Capital', likelihood: 'med', reason: 'Growth financing need' }
    ]
};

function initCSM() {
    const checkboxes = document.getElementById('csm-products');
    GE_PRODUCTS.forEach(p => {
        const label = document.createElement('label');
        label.className = 'csm-check';
        label.innerHTML = `
            <input type="checkbox" data-product="${p.id}" data-tier="${p.tier}">
            <span class="csm-check-icon">✓</span>
            <span>${p.name}</span>
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

    // Count active products
    const activeProducts = [];
    document.querySelectorAll('#csm-products input:checked').forEach(cb => {
        activeProducts.push(cb.dataset.product);
    });
    const numActive = activeProducts.length;
    const maxProducts = GE_PRODUCTS.length;

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
        actions.push(`📦 <strong>Activate ${p.name}</strong> - Eligible at this GMV but not yet adopted`);
    });
    if (switchScore < 7) {
        actions.push(`⚠️ <strong>Increase lock-in</strong> - Switching score is ${switchScore}/10. Priority: activate more GE products to build dependencies`);
    }
    if (gmv >= 500000 && !activeProducts.includes('pressable')) {
        actions.push(`🏗️ <strong>Infrastructure upgrade critical</strong> - At $500K+ GMV, shared hosting is a churn risk. Pressable migration should be top priority`);
    }
    if (gmv >= 1000000 && !activeProducts.includes('customrate')) {
        actions.push(`💰 <strong>Custom rate conversation</strong> - Shopify Plus can negotiate below 2%. Proactively offer custom WCPay rate before merchant starts shopping`);
    }
    if (numActive >= 5) {
        actions.push(`🏆 <strong>QBR focus: value recap</strong> - Show cumulative savings from GE products. Reinforce the ecosystem value this merchant has built`);
    }

    // QBR talking points
    const qbrPoints = [];
    const geValue = GE_TIERS.filter(t => gmv >= t.gmv).reduce((sum, t) => sum + t.value, 0);
    if (geValue > 0) qbrPoints.push(`💰 "Your Growth Engine unlocks are saving you <strong>${fmtF(geValue)}/yr</strong> in free products."`);
    const mc = getMC(gmv, switchScore);
    qbrPoints.push(`🔒 "Migration to Shopify at your scale would cost approximately <strong>${fmtF(mc)}</strong>."`);
    if (currentTier < 6) {
        const nextGmv = [0, 50000, 100000, 250000, 500000, 1000000][currentTier];
        const gap = nextGmv - gmv;
        if (gap > 0) qbrPoints.push(`🎯 "You're <strong>${fmt(gap)}</strong> from your next Growth Engine milestone."`);
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

    // Render results
    document.getElementById('csm-results').innerHTML = `
        <div class="csm-card">
            <div class="csm-card-title">Retention Health</div>
            <div class="csm-health-gauge">
                <div class="csm-health-score" style="color:${healthColor}">${healthPct}%</div>
                <div class="csm-health-label" style="color:${healthColor}">${healthLabel}</div>
            </div>
            <div style="font-size:0.72rem;color:var(--text-secondary);margin-bottom:8px">${numActive} of ${eligible} eligible products active | Switch Score: ${switchScore}/10</div>
            <div class="csm-progress-steps">${stepsHTML}</div>
            <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--text-muted);margin-bottom:12px"><span>Tier 1</span><span>Tier ${currentTier} (current)</span><span>Tier 6</span></div>
            <div class="csm-card-title" style="margin-top:12px">QBR Talking Points</div>
            ${qbrPoints.map(p => `<div style="font-size:0.75rem;color:var(--text-secondary);padding:4px 0;line-height:1.5">${p}</div>`).join('')}
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
