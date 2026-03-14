// === PRICING CONFIG ===
const PLANS = {
    basic: { name: 'Basic', monthly: 39, rate: 0.029, gatewayFee: 0.02, label: 'Basic ($39/mo)' },
    grow: { name: 'Grow', monthly: 105, rate: 0.026, gatewayFee: 0.01, label: 'Grow ($105/mo)' },
    advanced: { name: 'Advanced', monthly: 399, rate: 0.024, gatewayFee: 0.006, label: 'Advanced ($399/mo)' },
    plus: { name: 'Plus', monthly: 2300, rate: 0.0215, gatewayFee: 0.0015, label: 'Plus ($2,300/mo)', variable: true, variableRate: 0.0025, variableFloor: 920000 * 12 }
};

// Shopify app equivalents for Growth Engine products (monthly cost to replace on Shopify)
const GE_SHOPIFY_EQUIVALENTS = [
    { gmv: 50000, name: 'AutomateWoo', shopifyApp: 'Klaviyo/Omnisend', monthlyCost: 100 },
    { gmv: 100000, name: 'WC Subscriptions', shopifyApp: 'Recharge', monthlyCost: 99 },
    { gmv: 250000, name: 'Jetpack Security', shopifyApp: 'Included', monthlyCost: 0 },
    { gmv: 500000, name: 'Metorik Analytics', shopifyApp: 'Triple Whale/Lifetimely', monthlyCost: 100 },
    { gmv: 1000000, name: 'Custom WCPay Rate', shopifyApp: 'N/A', monthlyCost: 0 }
];

// === STATE ===
let currentGMV = 500000, currentPlan = 'advanced', costChart = null, paybackChart = null;
let manualPlan = false, manualWooDev = false, manualShopifyDev = false, manualWooApps = false;

// === HELPERS ===
function snapGMV(g) { if (g >= 20000000) return Math.round(g / 1000000) * 1000000; if (g >= 1000000) return Math.round(g / 100000) * 100000; return Math.round(g / 50000) * 50000; }
function s2g(v) { const mn = Math.log(50000), mx = Math.log(50000000); return snapGMV(Math.round(Math.exp(mn + (v / 100) * (mx - mn)))); }
function g2s(g) { const mn = Math.log(50000), mx = Math.log(50000000); return Math.round(((Math.log(g) - mn) / (mx - mn)) * 100); }
function fmt(v) { if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M'; if (v >= 1000) return '$' + Math.round(v).toLocaleString(); return '$' + v.toFixed(0); }
function fmtF(v) { return '$' + Math.round(v).toLocaleString(); }

// === AUTO DEFAULTS ===
function defWooDev(g) { if (g < 100000) return 500; if (g < 500000) return 1500; if (g < 2000000) return 2500; if (g < 10000000) return 4000; return 5000; }
function defWooApps(g) { if (g < 100000) return 50; if (g < 500000) return 100; if (g < 2000000) return 200; return 300; }

function getGEShopifyAppCost(gmv) {
    // Cost of Shopify apps to replace the Growth Engine products that would be active at this GMV
    let total = 0;
    GE_SHOPIFY_EQUIVALENTS.forEach(ge => {
        if (gmv >= ge.gmv) total += ge.monthlyCost;
    });
    return total; // monthly
}

function defShopifyDev(g) {
    // Base dev costs for Shopify
    let base = 250;
    if (g >= 100000) base = 500;
    if (g >= 500000) base = 750;
    if (g >= 2000000) base = 1250;
    if (g >= 10000000) base = 2000;
    // Add Growth Engine equivalent app costs (what they'd need to buy on Shopify)
    const geApps = getGEShopifyAppCost(g);
    return base + geApps;
}

function bestPlan(g) {
    // Plus is never cheaper than Advanced on cost alone
    if (g < 264000) return 'basic';
    if (g < 1760000) return 'grow';
    return 'advanced';
}

function getSwitchScore(g) { if (g >= 1000000) return 10; if (g >= 500000) return 9; if (g >= 250000) return 7; if (g >= 100000) return 6; if (g >= 50000) return 4; return 2; }

function getMigrationCost(g, score) {
    let base = 15000;
    if (g >= 100000) base = 30000;
    if (g >= 250000) base = 55000;
    if (g >= 500000) base = 90000;
    if (g >= 1000000) base = 150000;
    if (g >= 5000000) base = 300000;
    if (g >= 10000000) base = 500000;
    return Math.round(base * (score / 10) * 1.2);
}

// === COST CALCULATIONS ===
function calcWoo(g, devMo, appsMo, withGE) {
    let hosting = g < 100000 ? 200 * 12 : g < 500000 ? 350 * 12 : 500 * 12;
    let security = g < 250000 ? 100 * 12 : 200 * 12;
    let dev = devMo * 12;
    let apps = appsMo * 12;
    let rate = 0.029;

    if (withGE) {
        if (g >= 50000) apps = Math.max(0, apps - 99);
        if (g >= 100000) apps = Math.max(0, apps - 279);
        if (g >= 250000) security = 0;
        if (g >= 500000) { hosting = 0; apps = Math.max(0, apps - 1188); }
        if (g >= 1000000) rate = 0.025;
    }

    const payments = g * rate;
    return { platform: 0, payments, hosting, security, dev, apps: Math.max(0, apps), total: payments + hosting + security + dev + Math.max(0, apps) };
}

function calcShopify(g, plan, devMo, gatewayPct) {
    const p = PLANS[plan];
    let platformBase = p.monthly * 12;
    let platformCost = platformBase;
    let variableFee = 0;

    if (p.variable && g > p.variableFloor) {
        const va = g * p.variableRate;
        if (va > platformBase) { variableFee = va - platformBase; platformCost = va; }
    }

    const spGMV = g * (1 - gatewayPct / 100); // through Shopify Payments
    const tpGMV = g * (gatewayPct / 100);      // through 3rd-party
    const spCost = spGMV * p.rate;             // Shopify Payments processing
    const tpCost = tpGMV * 0.029;             // 3rd-party processing (e.g. Stripe)
    const tpSurcharge = tpGMV * p.gatewayFee; // Shopify's surcharge on 3rd-party
    const dev = devMo * 12;

    return {
        platform: platformBase,
        spCost, tpCost, surcharge: tpSurcharge,
        variable: variableFee, dev,
        total: platformCost + spCost + tpCost + tpSurcharge + dev
    };
}

// === MAIN UPDATE ===
function update() {
    currentGMV = s2g(document.getElementById('gmv-slider').value);
    document.getElementById('gmv-display').textContent = fmt(currentGMV);

    if (!manualWooDev) {
        const d = defWooDev(currentGMV);
        document.getElementById('woo-dev-slider').value = d;
        document.getElementById('woo-dev-display').textContent = fmtF(d) + '/mo';
        document.getElementById('woo-dev-auto').style.display = 'inline-block';
    }
    if (!manualWooApps) {
        const a = defWooApps(currentGMV);
        document.getElementById('woo-apps-slider').value = a;
        document.getElementById('woo-apps-display').textContent = '$' + a + '/mo';
        document.getElementById('woo-apps-auto').style.display = 'inline-block';
    }
    if (!manualShopifyDev) {
        const d = defShopifyDev(currentGMV);
        document.getElementById('shopify-dev-slider').value = Math.min(d, 4000);
        document.getElementById('shopify-dev-display').textContent = fmtF(d) + '/mo';
        document.getElementById('shopify-dev-auto').style.display = 'inline-block';
    }
    if (!manualPlan) {
        const b = bestPlan(currentGMV);
        currentPlan = b;
        document.querySelectorAll('#shopify-plan-toggle .toggle-btn').forEach(x => x.classList.toggle('active', x.dataset.plan === b));
        document.getElementById('plan-auto').style.display = 'inline-block';
        document.getElementById('plan-auto-label').textContent = 'Most economical at this GMV';
    }

    const wDevMo = parseInt(document.getElementById('woo-dev-slider').value);
    const wAppsMo = parseInt(document.getElementById('woo-apps-slider').value);
    const sDevMo = parseInt(document.getElementById('shopify-dev-slider').value);
    const gwPct = parseInt(document.getElementById('gateway-slider').value);
    document.getElementById('gateway-display').textContent = gwPct + '%';

    const woo = calcWoo(currentGMV, wDevMo, wAppsMo, false);
    const ge = calcWoo(currentGMV, wDevMo, wAppsMo, true);
    const shop = calcShopify(currentGMV, currentPlan, sDevMo, gwPct);

    // Woo card
    document.getElementById('woo-total').textContent = fmtF(woo.total);
    document.getElementById('woo-payments').textContent = fmtF(woo.payments);
    document.getElementById('woo-hosting').textContent = fmtF(woo.hosting);
    document.getElementById('woo-security').textContent = fmtF(woo.security);
    document.getElementById('woo-dev').textContent = fmtF(woo.dev);
    document.getElementById('woo-apps').textContent = fmtF(woo.apps);

    // GE card
    document.getElementById('wooge-total').textContent = fmtF(ge.total);
    document.getElementById('wooge-payments').textContent = fmtF(ge.payments);
    ['wooge-hosting', 'wooge-security', 'wooge-apps'].forEach(id => {
        const el = document.getElementById(id);
        const val = id === 'wooge-hosting' ? ge.hosting : id === 'wooge-security' ? ge.security : ge.apps;
        if (val === 0) { el.textContent = 'Free ✓'; el.classList.add('free'); }
        else { el.textContent = fmtF(val); el.classList.remove('free'); }
    });
    document.getElementById('wooge-dev').textContent = fmtF(ge.dev);

    // Shopify card - split payment lines
    document.getElementById('shopify-total').textContent = fmtF(shop.total);
    document.getElementById('shopify-plan-label').textContent = PLANS[currentPlan].label;
    document.getElementById('shopify-platform').textContent = fmtF(shop.platform);
    document.getElementById('shopify-sp-cost').textContent = fmtF(shop.spCost);
    document.getElementById('shopify-tp-cost').textContent = shop.tpCost > 0 ? fmtF(shop.tpCost) : '$0';
    document.getElementById('shopify-surcharge').textContent = shop.surcharge > 0 ? fmtF(shop.surcharge) : '$0';
    document.getElementById('shopify-variable').textContent = shop.variable > 0 ? fmtF(shop.variable) : '$0';
    document.getElementById('shopify-dev-cost').textContent = fmtF(shop.dev);

    // Verdict
    const diff = shop.total - ge.total;
    const vS = document.getElementById('verdict-savings');
    const vT = document.getElementById('verdict-text');
    const vD = document.getElementById('verdict-detail');
    const score = getSwitchScore(currentGMV);
    const mc = getMigrationCost(currentGMV, score);

    if (diff > 0) {
        vS.textContent = fmtF(Math.abs(diff)) + '/yr';
        vS.className = 'savings-amount ge-wins';
        vT.textContent = 'Woo + Growth Engine saves you';
        vD.textContent = 'At ' + fmt(currentGMV) + ' GMV, WooCommerce with Growth Engine costs ' + fmtF(Math.abs(diff)) + '/yr less than Shopify ' + PLANS[currentPlan].name;
    } else if (diff < 0) {
        const payback = Math.abs(diff) > 0 ? Math.round(mc / Math.abs(diff) * 10) / 10 : 999;
        vS.textContent = fmtF(Math.abs(diff)) + '/yr';
        vS.className = 'savings-amount shopify-wins';
        vT.textContent = 'Shopify is cheaper by';
        vD.textContent = 'But migration costs ~' + fmtF(mc) + '. Payback: ' + payback + ' years. Is it worth switching?';
    } else {
        vS.textContent = 'Break-even';
        vS.className = 'savings-amount';
        vT.textContent = 'Costs are roughly equal';
        vD.textContent = '';
    }

    // Switching cost meter
    document.getElementById('switch-score').textContent = score + '/10';
    document.getElementById('migration-cost').textContent = fmtF(mc);
    const fill = document.getElementById('switch-fill');
    fill.style.width = (score * 10) + '%';
    const lbl = document.getElementById('switch-label');
    if (score <= 3) { lbl.textContent = 'Easy to Switch'; fill.style.background = 'linear-gradient(90deg,var(--positive),#FBBF24)'; }
    else if (score <= 6) { lbl.textContent = 'Moderate Friction'; fill.style.background = 'linear-gradient(90deg,#FBBF24,var(--growth-engine))'; }
    else if (score <= 8) { lbl.textContent = 'Hard to Leave'; fill.style.background = 'linear-gradient(90deg,var(--growth-engine),var(--negative))'; }
    else { lbl.textContent = 'Functionally Locked In'; fill.style.background = 'linear-gradient(90deg,var(--growth-engine),var(--negative))'; }

    document.querySelectorAll('.sw-tier').forEach(t => {
        t.classList.toggle('active', currentGMV >= parseInt(t.dataset.gmv));
    });

    updateCostChart();
    updatePaybackChart(mc, diff);
}

// === COST CURVES CHART ===
function updateCostChart() {
    const pts = [], wD = [], geD = [], sD = [];
    for (let g = 50000; g <= 50000000; g *= 1.2) {
        const gmv = Math.round(g); pts.push(gmv);
        const wd = defWooDev(gmv), wa = defWooApps(gmv), sd = defShopifyDev(gmv), bp = bestPlan(gmv);
        wD.push(calcWoo(gmv, wd, wa, false).total);
        geD.push(calcWoo(gmv, wd, wa, true).total);
        sD.push(calcShopify(gmv, bp, sd, 20).total);
    }
    const labels = pts.map(g => fmt(g));

    if (costChart) {
        costChart.data.labels = labels;
        costChart.data.datasets[0].data = wD;
        costChart.data.datasets[1].data = geD;
        costChart.data.datasets[2].data = sD;
        costChart.update('none');
        return;
    }

    costChart = new Chart(document.getElementById('cost-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'WooCommerce', data: wD, borderColor: '#873EFF', borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, tension: 0.3, fill: false },
                { label: 'Woo + Growth Engine', data: geD, borderColor: '#FF6B35', borderWidth: 3, pointRadius: 0, pointHoverRadius: 5, tension: 0.3, fill: false },
                { label: 'Shopify (best plan)', data: sD, borderColor: '#96BF48', borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, tension: 0.3, fill: false, borderDash: [6, 3] }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1A1229', borderColor: '#2D2145', borderWidth: 1,
                    titleColor: '#F5F0FF', bodyColor: '#A89CC8',
                    titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' },
                    padding: 12,
                    callbacks: { title: i => 'GMV: ' + i[0].label, label: i => i.dataset.label + ': ' + fmtF(i.raw) }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { family: 'Inter', size: 10 }, maxTicksLimit: 8 } },
                y: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { family: 'Inter', size: 10 }, callback: v => fmt(v) } }
            }
        }
    });
}

// === PAYBACK HORIZON CHART ===
function updatePaybackChart(migrationCost, annualDiff) {
    const years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const migLine = years.map(() => migrationCost);
    // annualDiff is shop.total - ge.total (positive = Woo+GE cheaper, negative = Shopify cheaper)
    const annualSavings = Math.max(0, -annualDiff); // savings from switching TO Shopify
    const savingsLine = years.map(y => y * annualSavings);

    const labels = years.map(y => 'Year ' + y);

    if (paybackChart) {
        paybackChart.data.datasets[0].data = migLine;
        paybackChart.data.datasets[1].data = savingsLine;
        paybackChart.update('none');
        return;
    }

    paybackChart = new Chart(document.getElementById('payback-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Migration Cost',
                    data: migLine,
                    borderColor: '#F87171',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0,
                    fill: false,
                    borderDash: [4, 4]
                },
                {
                    label: 'Cumulative Savings from Switching',
                    data: savingsLine,
                    borderColor: '#96BF48',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    tension: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1A1229', borderColor: '#2D2145', borderWidth: 1,
                    titleColor: '#F5F0FF', bodyColor: '#A89CC8',
                    titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' },
                    padding: 12,
                    callbacks: {
                        label: i => {
                            if (i.datasetIndex === 0) return 'Migration cost: ' + fmtF(i.raw);
                            return 'Cumulative savings: ' + fmtF(i.raw);
                        }
                    }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { family: 'Inter', size: 10 } } },
                y: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { family: 'Inter', size: 10 }, callback: v => fmt(v) } }
            }
        }
    });
}

// === EVENTS ===
document.getElementById('gmv-slider').addEventListener('input', () => {
    manualPlan = false; manualWooDev = false; manualShopifyDev = false; manualWooApps = false;
    update();
});

document.getElementById('woo-dev-slider').addEventListener('input', function () {
    manualWooDev = true;
    document.getElementById('woo-dev-auto').style.display = 'none';
    document.getElementById('woo-dev-display').textContent = fmtF(parseInt(this.value)) + '/mo';
    update();
});

document.getElementById('woo-apps-slider').addEventListener('input', function () {
    manualWooApps = true;
    document.getElementById('woo-apps-auto').style.display = 'none';
    document.getElementById('woo-apps-display').textContent = '$' + this.value + '/mo';
    update();
});

document.getElementById('shopify-dev-slider').addEventListener('input', function () {
    manualShopifyDev = true;
    document.getElementById('shopify-dev-auto').style.display = 'none';
    document.getElementById('shopify-dev-display').textContent = fmtF(parseInt(this.value)) + '/mo';
    update();
});

document.getElementById('gateway-slider').addEventListener('input', update);

document.querySelectorAll('#shopify-plan-toggle .toggle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        manualPlan = true;
        document.querySelectorAll('#shopify-plan-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentPlan = this.dataset.plan;
        document.getElementById('plan-auto').style.display = 'none';
        document.getElementById('plan-auto-label').textContent =
            this.dataset.plan === 'plus'
                ? 'Plus is a feature upgrade (custom checkout, B2B, Flow), not a cost savings vs Advanced'
                : 'Manually selected';
        update();
    });
});

// === INIT ===
document.getElementById('gmv-slider').value = g2s(500000);
update();
