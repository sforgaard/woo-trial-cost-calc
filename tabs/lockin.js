/* ========== GE STRATEGY: LOCK-IN TREE (Tab 6) ========== */

const TREE_TIERS = [
    { tier: 1, gmv: 0, name: 'WCPay', pct: 32, difficulty: 2, value: 0, desc: 'Payment processing foundation', color: '#4ADE80' },
    { tier: 2, gmv: 50000, name: 'AutomateWoo', pct: 44, difficulty: 4, value: 99, desc: 'Marketing automation & retention', color: '#60A5FA' },
    { tier: 3, gmv: 100000, name: 'Subscriptions/CRM', pct: 55, difficulty: 6, value: 226, desc: 'Recurring revenue & customer data', color: '#A78BFA' },
    { tier: 4, gmv: 250000, name: 'Jetpack Security', pct: 68, difficulty: 7, value: 240, desc: 'Enterprise security & compliance', color: '#FBBF24' },
    { tier: 5, gmv: 500000, name: 'Pressable + Metorik', pct: 82, difficulty: 9, value: 1140, desc: 'Dedicated infrastructure & analytics', color: '#FF6B35' },
    { tier: 6, gmv: 1000000, name: 'Custom Rate + Capital', pct: 100, difficulty: 10, value: 0, desc: 'Custom pricing & financing', color: '#F87171' }
];

const TREE_NARRATIVES = [
    { maxTier: 0, title: 'No Ecosystem Ties', summary: 'This merchant has zero switching cost. They can move to Shopify tomorrow with no friction. Every competitor is one click away.', risk: 'CRITICAL', riskColor: '#F87171' },
    { maxTier: 1, title: 'Payment Foundation Only', summary: 'WCPay is running but can be replaced by Stripe or Shopify Payments in under a day. No ecosystem lock-in yet.', risk: 'HIGH', riskColor: '#F87171' },
    { maxTier: 2, title: 'Automation Thread Connected', summary: 'AutomateWoo workflows are woven into daily operations — abandoned cart emails, follow-up sequences, VIP rules. Rebuilding these on Klaviyo takes 2-4 weeks.', risk: 'MEDIUM-HIGH', riskColor: '#FBBF24' },
    { maxTier: 3, title: 'Revenue Model Entangled', summary: 'Subscription billing or CRM data lives in WooCommerce. Migration means re-creating recurring payment plans and customer histories — a 1-2 month project.', risk: 'MEDIUM', riskColor: '#FBBF24' },
    { maxTier: 4, title: 'Security Layer Bound', summary: 'Real-time backups, malware scanning, and WAF protection are deeply integrated. Switching means finding and configuring alternatives while maintaining uptime — a risky 2-4 week transition.', risk: 'MEDIUM-LOW', riskColor: '#60A5FA' },
    { maxTier: 5, title: 'Infrastructure Locked', summary: 'Dedicated Pressable hosting + Metorik analytics dashboards. The entire technical stack depends on WooCommerce. Migration is now a 3-6 month infrastructure project costing $50K-$150K.', risk: 'LOW', riskColor: '#4ADE80' },
    { maxTier: 6, title: 'Functionally Locked In', summary: 'Custom WCPay rates, WooCommerce Capital financing, and assigned CSM. This merchant has negotiated terms that Shopify can\'t match at this scale. Switching is economically irrational.', risk: 'MINIMAL', riskColor: '#4ADE80' }
];

function initLockin() {
    const slider = document.getElementById('lockin-gmv-slider');
    if (!slider) return;

    // Build tier labels
    renderTierLabels();

    slider.addEventListener('input', lockinUpdate);
    lockinUpdate();
}

function renderTierLabels() {
    const container = document.getElementById('lockin-tier-labels');
    if (!container) return;

    container.innerHTML = TREE_TIERS.map(t => `
        <div class="tree-tier-label" id="tree-label-${t.tier}" style="top:${t.pct}%;border-left-color:${t.color}">
            <span class="tree-tier-num" style="color:${t.color}">T${t.tier}</span>
            <span class="tree-tier-name">${t.name}</span>
            <span class="tree-tier-gmv">${t.gmv === 0 ? '$0' : fmt(t.gmv)}</span>
            <span class="tree-tier-diff">Difficulty: ${t.difficulty}/10</span>
        </div>
    `).join('');
}

function lockinUpdate() {
    const gmv = s2g(document.getElementById('lockin-gmv-slider').value);
    document.getElementById('lockin-gmv-display').textContent = fmt(gmv);

    let activeTiers = 0;
    let totalDifficulty = 0;
    let totalValue = 0;

    TREE_TIERS.forEach(t => {
        const active = gmv >= t.gmv;
        if (active) { activeTiers = t.tier; totalDifficulty = t.difficulty; if (t.value > 0) totalValue += t.value; }

        // Label visibility
        const label = document.getElementById(`tree-label-${t.tier}`);
        if (label) {
            label.classList.toggle('active', active);
            label.classList.toggle('next', !active && (!TREE_TIERS.find(x => gmv < x.gmv) || TREE_TIERS.find(x => gmv < x.gmv).tier === t.tier));
        }
    });

    // Clip-path reveal: show image from top to the current tier depth
    const revealPct = activeTiers > 0 ? TREE_TIERS[activeTiers - 1].pct : 25;
    const treeImg = document.getElementById('lockin-tree-img');
    if (treeImg) {
        treeImg.style.clipPath = `inset(0 0 ${100 - revealPct}% 0)`;
    }

    // Switching difficulty gauge
    const gauge = document.getElementById('lockin-gauge-fill');
    const scoreEl = document.getElementById('lockin-score');
    const labelEl = document.getElementById('lockin-gauge-label');
    if (gauge) {
        gauge.style.width = (totalDifficulty * 10) + '%';
        if (totalDifficulty <= 3) gauge.style.background = 'linear-gradient(90deg, #4ADE80, #60A5FA)';
        else if (totalDifficulty <= 6) gauge.style.background = 'linear-gradient(90deg, #60A5FA, #FBBF24)';
        else if (totalDifficulty <= 8) gauge.style.background = 'linear-gradient(90deg, #FBBF24, #FF6B35)';
        else gauge.style.background = 'linear-gradient(90deg, #FF6B35, #F87171)';
    }
    if (scoreEl) scoreEl.textContent = totalDifficulty + '/10';
    if (labelEl) {
        if (totalDifficulty <= 2) labelEl.textContent = 'Easy to Switch';
        else if (totalDifficulty <= 4) labelEl.textContent = 'Low Friction';
        else if (totalDifficulty <= 6) labelEl.textContent = 'Moderate Friction';
        else if (totalDifficulty <= 8) labelEl.textContent = 'Hard to Leave';
        else labelEl.textContent = 'Functionally Locked In';
    }

    // Narrative
    const narrative = TREE_NARRATIVES[activeTiers];
    const narrativeEl = document.getElementById('lockin-narrative');
    if (narrativeEl && narrative) {
        narrativeEl.innerHTML = `
            <div class="lockin-narrative-header">
                <span class="lockin-narrative-title">${narrative.title}</span>
                <span class="lockin-narrative-risk" style="color:${narrative.riskColor}">CHURN RISK: ${narrative.risk}</span>
            </div>
            <p class="lockin-narrative-text">${narrative.summary}</p>
        `;
    }

    // Stats row
    document.getElementById('lockin-tiers-active').textContent = activeTiers + '/6';
    document.getElementById('lockin-annual-value').textContent = totalValue > 0 ? fmtF(totalValue) + '/yr' : '$0';
    document.getElementById('lockin-migration-est').textContent = getMC ? fmtF(getMC(gmv, totalDifficulty)) : '—';
}

// Lazy init when tab becomes visible
const lockinObserver = new MutationObserver(() => {
    const tabEl = document.getElementById('tab-lockin');
    if (tabEl && tabEl.classList.contains('active') && !document.getElementById('tree-label-1')) {
        initLockin();
    }
});
const lockinTab = document.getElementById('tab-lockin');
if (lockinTab) {
    lockinObserver.observe(lockinTab, { attributes: true, attributeFilter: ['class'] });
    if (lockinTab.classList.contains('active')) initLockin();
}
