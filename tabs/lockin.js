/* ========== GE STRATEGY: LOCK-IN TREE (Tab 6) ========== */

const TREE_TIERS = [
    { tier: 1, gmv: 0, name: 'WCPay', pct: 38.77, difficulty: 2, value: 0, color: '#4ADE80', labelPct: 34.41 },
    { tier: 2, gmv: 50000, name: 'AutomateWoo', pct: 48.02, difficulty: 4, value: 99, color: '#60A5FA', labelPct: 43.40 },
    { tier: 3, gmv: 100000, name: 'Subscriptions/CRM', pct: 59.73, difficulty: 6, value: 226, color: '#A78BFA', labelPct: 53.88 },
    { tier: 4, gmv: 250000, name: 'Jetpack Security', pct: 69.94, difficulty: 7, value: 240, color: '#FBBF24', labelPct: 64.83 },
    { tier: 5, gmv: 500000, name: 'Pressable + Metorik', pct: 81.73, difficulty: 9, value: 1140, color: '#FF6B35', labelPct: 75.83 },
    { tier: 6, gmv: 1000000, name: 'Custom Rate + Capital', pct: 100, difficulty: 10, value: 0, color: '#F87171', labelPct: 90.87 }
];

const TREE_NARRATIVES = [
    { title: 'No Roots Planted', summary: 'No ecosystem roots. This merchant can be uprooted by any competitor overnight. Zero switching friction.', risk: 'CRITICAL', riskColor: '#F87171' },
    { title: 'Surface Roots Only', summary: 'WCPay provides a shallow foothold, but the roots haven\'t gripped yet. A competitor can pull this merchant out with one tug. Swap to Stripe or Shopify Payments in a day.', risk: 'HIGH', riskColor: '#F87171' },
    { title: 'First Tendrils Woven In', summary: 'AutomateWoo workflows are woven into daily operations: abandoned cart sequences, follow-ups, VIP rules. Ripping these out means rebuilding on Klaviyo: 2-4 weeks of replanting.', risk: 'MEDIUM-HIGH', riskColor: '#FBBF24' },
    { title: 'Roots Grip the Revenue Model', summary: 'Subscription billing and CRM data are now embedded in the soil. Uprooting means re-creating recurring plans and customer histories, a 1-2 month excavation project.', risk: 'MEDIUM', riskColor: '#FBBF24' },
    { title: 'Taproots Around Security', summary: 'Real-time backups, malware scanning, and WAF are wrapped around the core. Pulling these roots risks the whole plant. Switching security mid-operation is a dangerous 2-4 week transplant.', risk: 'MEDIUM-LOW', riskColor: '#60A5FA' },
    { title: 'Deep Infrastructure Entanglement', summary: 'Dedicated Pressable hosting and Metorik analytics dashboards. The root system IS the infrastructure now. Extraction is a 3-6 month, $50K-$150K demolition project.', risk: 'LOW', riskColor: '#4ADE80' },
    { title: 'Bedrock: Impossible to Uproot', summary: 'Custom WCPay rates, WooCommerce Capital financing, assigned CSM. The roots have reached bedrock. No competitor can offer equivalent terms. Leaving is economically irrational.', risk: 'MINIMAL', riskColor: '#4ADE80' }
];

/* Sales script lines that appear next to the tree at each tier depth */
const TIER_SCRIPTS = [
    '', // None
    '"WCPay setup + onboarding drip"',
    '"You\'re doing X manually — let\'s automate it"',
    '"What\'s your growth model: recurring revenue, membership, or account management?"',
    '"At your scale, a breach costs $X/day. Let\'s protect the business"',
    '"Your analytics and infrastructure should scale with you"',
    '"Let\'s negotiate your rate and discuss growth financing"'
];

/* Ground level baseline: the % from top where roots begin. */
const GROUND_PCT = 30.06;

let currentTier = 0;

function initLockin() {
    buildDepthMarkers();
    buildTierLabels();

    // Sync heights after image loads
    const treeImg = document.getElementById('lockin-tree-img');
    if (treeImg) {
        if (treeImg.complete) syncHeights();
        else treeImg.addEventListener('load', syncHeights);
        window.addEventListener('resize', syncHeights);
    }

    document.querySelectorAll('#lockin-tier-selector .tier-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#lockin-tier-selector .tier-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTier = parseInt(this.dataset.tier);
            lockinUpdate();
        });
    });

    lockinUpdate();
}

function buildDepthMarkers() {
    const container = document.getElementById('lockin-depth-markers');
    if (!container) return;
    container.innerHTML = TREE_TIERS.map(t => {
        /* Map difficulty to a position within the root zone (0-100% of the depth bar).
           The depth bar represents the root zone only (ground to bottom). */
        const positionPct = (t.difficulty / 10) * 100;
        return `<div class="depth-marker" style="top:${positionPct}%">
            <span class="depth-marker-line" style="background:${t.color}"></span>
            <span class="depth-marker-val" style="color:${t.color}">${t.difficulty}</span>
        </div>`;
    }).join('');
}

function buildTierLabels() {
    const container = document.getElementById('lockin-tier-labels');
    if (!container) return;
    container.innerHTML = TREE_TIERS.map(t =>
        `<div class="tier-label" data-tier="${t.tier}" style="top:${t.labelPct}%">
            <span class="tier-label-tag" style="border-color:${t.color};color:${t.color}">T${t.tier}</span>
            <span class="tier-label-text">${TIER_SCRIPTS[t.tier]}</span>
        </div>`
    ).join('');
}

function syncHeights() {
    const treeFrame = document.querySelector('.lockin-tree-frame');
    const labelsEl = document.getElementById('lockin-tier-labels');
    const depthBar = document.querySelector('.lockin-depth-bar');
    const depthTrack = document.querySelector('.depth-bar-track');
    if (treeFrame) {
        const treeH = treeFrame.offsetHeight;
        if (labelsEl) labelsEl.style.height = treeH + 'px';
        /* Depth bar track starts at ground level and extends to the bottom of the tree.
           Ground is at GROUND_PCT% from the top. */
        const rootZoneH = treeH * (1 - GROUND_PCT / 100) * 0.87;
        if (depthTrack) depthTrack.style.height = rootZoneH + 'px';
        if (depthBar) depthBar.style.paddingTop = (treeH * GROUND_PCT / 100) + 'px';
    }
}

function lockinUpdate() {
    const activeTiers = currentTier;
    let totalDifficulty = 0;
    let totalValue = 0;

    TREE_TIERS.forEach(t => {
        if (activeTiers >= t.tier) {
            totalDifficulty = t.difficulty;
            if (t.value > 0) totalValue += t.value;
        }
    });

    // Clip-path reveal
    const revealPct = activeTiers > 0 ? TREE_TIERS[activeTiers - 1].pct : GROUND_PCT;
    const treeImg = document.getElementById('lockin-tree-img');
    if (treeImg) {
        treeImg.style.clipPath = `inset(0 0 ${100 - revealPct}% 0)`;
    }

    // Depth meter fill
    const depthFill = document.getElementById('lockin-depth-fill');
    if (depthFill) {
        const fillPct = (totalDifficulty / 10) * 100;
        depthFill.style.height = fillPct + '%';
        if (totalDifficulty <= 3) depthFill.style.background = 'linear-gradient(180deg, #4ADE80, #60A5FA)';
        else if (totalDifficulty <= 6) depthFill.style.background = 'linear-gradient(180deg, #60A5FA, #A78BFA)';
        else if (totalDifficulty <= 8) depthFill.style.background = 'linear-gradient(180deg, #FBBF24, #FF6B35)';
        else depthFill.style.background = 'linear-gradient(180deg, #FF6B35, #F87171)';
    }

    // Animate depth markers
    document.querySelectorAll('.depth-marker').forEach((m, i) => {
        m.classList.toggle('active', activeTiers >= (i + 1));
    });

    // Animate tier labels
    document.querySelectorAll('.tier-label').forEach(lbl => {
        const tier = parseInt(lbl.dataset.tier);
        lbl.classList.toggle('active', activeTiers >= tier);
    });

    // Score & label
    const scoreEl = document.getElementById('lockin-score');
    const labelEl = document.getElementById('lockin-gauge-label');
    if (scoreEl) scoreEl.textContent = totalDifficulty;
    if (labelEl) {
        if (totalDifficulty === 0) labelEl.textContent = 'No Roots';
        else if (totalDifficulty <= 2) labelEl.textContent = 'Surface Roots';
        else if (totalDifficulty <= 4) labelEl.textContent = 'Shallow Grip';
        else if (totalDifficulty <= 6) labelEl.textContent = 'Deep Roots';
        else if (totalDifficulty <= 8) labelEl.textContent = 'Entangled';
        else labelEl.textContent = 'Bedrock';
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

    // Stats
    document.getElementById('lockin-tiers-active').textContent = activeTiers + '/6';
    document.getElementById('lockin-annual-value').textContent = totalValue > 0 ? fmtF(totalValue) + '/yr' : '$0';
    const migCost = activeTiers > 0 ? getMC(TREE_TIERS[activeTiers - 1].gmv, totalDifficulty) : 0;
    document.getElementById('lockin-migration-est').textContent = migCost > 0 ? fmtF(migCost) : '$0';

    // Highlight active tier buttons with color
    document.querySelectorAll('#lockin-tier-selector .tier-btn').forEach(btn => {
        const tier = parseInt(btn.dataset.tier);
        if (tier > 0 && tier <= activeTiers) {
            btn.style.borderColor = TREE_TIERS[tier - 1].color;
            btn.style.color = TREE_TIERS[tier - 1].color;
        } else {
            btn.style.borderColor = '';
            btn.style.color = '';
        }
    });
}

// Init when tab becomes visible
let lockinInited = false;
function tryInitLockin() {
    if (lockinInited) return;
    const tabEl = document.getElementById('tab-lockin');
    if (tabEl && tabEl.classList.contains('active')) {
        initLockin();
        lockinInited = true;
    }
}
tryInitLockin();
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(tryInitLockin, 50));
});
