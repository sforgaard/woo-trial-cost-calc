/* ========== TCO CALCULATOR (Tab 1) ========== */
const PLANS = { basic: { name: 'Basic', monthly: 39, rate: 0.029, gatewayFee: 0.02, label: 'Basic ($39/mo)' }, grow: { name: 'Grow', monthly: 105, rate: 0.026, gatewayFee: 0.01, label: 'Grow ($105/mo)' }, advanced: { name: 'Advanced', monthly: 399, rate: 0.024, gatewayFee: 0.006, label: 'Advanced ($399/mo)' }, plus: { name: 'Plus', monthly: 2300, rate: 0.0215, gatewayFee: 0.0015, label: 'Plus ($2,300/mo)', variable: true, variableRate: 0.0025, variableFloor: 920000 * 12 } };
const GE_EQUIV = [{ gmv: 50000, mo: 100 }, { gmv: 100000, mo: 99 }, { gmv: 250000, mo: 0 }, { gmv: 500000, mo: 100 }, { gmv: 1000000, mo: 0 }];

let currentGMV = 500000, currentPlan = 'advanced', costChart = null, paybackChart = null;
let manualPlan = false, manualWooDev = false, manualShopifyDev = false, manualWooApps = false;

function snapGMV(g) { if (g >= 20000000) return Math.round(g / 1000000) * 1000000; if (g >= 1000000) return Math.round(g / 100000) * 100000; return Math.round(g / 50000) * 50000; }
function s2g(v) { const mn = Math.log(50000), mx = Math.log(50000000); return snapGMV(Math.round(Math.exp(mn + (v / 100) * (mx - mn)))) }
function g2s(g) { const mn = Math.log(50000), mx = Math.log(50000000); return Math.round(((Math.log(g) - mn) / (mx - mn)) * 100) }
function fmt(v) { if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'; if (v >= 1000) return '$' + Math.round(v).toLocaleString(); return '$' + v.toFixed(0) }
function fmtF(v) { return '$' + Math.round(v).toLocaleString() }
function defWooDev(g) { if (g < 1e5) return 500; if (g < 5e5) return 1500; if (g < 2e6) return 2500; if (g < 1e7) return 4000; return 5000 }
function defWooApps(g) { if (g < 1e5) return 50; if (g < 5e5) return 100; if (g < 2e6) return 200; return 300 }
function geAppCost(g) { let t = 0; GE_EQUIV.forEach(e => { if (g >= e.gmv) t += e.mo }); return t }
function defShopifyDev(g) { let b = 250; if (g >= 1e5) b = 500; if (g >= 5e5) b = 750; if (g >= 2e6) b = 1250; if (g >= 1e7) b = 2000; return b + geAppCost(g) }
function bestPlan(g) { if (g < 264000) return 'basic'; if (g < 1760000) return 'grow'; return 'advanced' }
function getSS(g) { if (g >= 1e6) return 10; if (g >= 5e5) return 9; if (g >= 25e4) return 7; if (g >= 1e5) return 6; if (g >= 5e4) return 4; return 2 }
function getMC(g, s) { let b = 8000; if (g >= 1e5) b = 2e4; if (g >= 25e4) b = 35000; if (g >= 5e5) b = 55000; if (g >= 1e6) b = 1e5; if (g >= 5e6) b = 175000; if (g >= 1e7) b = 3e5; return Math.round(b * (s / 10)) }
function calcWoo(g, dM, aM, ge) { let h = g < 1e5 ? 2400 : g < 5e5 ? 4200 : 6000, sec = g < 25e4 ? 1200 : 2400, d = dM * 12, a = aM * 12, r = 0.029; if (ge) { if (g >= 5e4) a = Math.max(0, a - 99); if (g >= 1e5) a = Math.max(0, a - 279); if (g >= 25e4) sec = 0; if (g >= 5e5) { h = 0; a = Math.max(0, a - 1188) } if (g >= 1e6) r = 0.025 } const p = g * r; return { platform: 0, payments: p, hosting: h, security: sec, dev: d, apps: Math.max(0, a), total: p + h + sec + d + Math.max(0, a) } }
function calcShopify(g, plan, dM, gw) { const p = PLANS[plan]; let pB = p.monthly * 12, pC = pB, vF = 0; if (p.variable && g > p.variableFloor) { const va = g * p.variableRate; if (va > pB) { vF = va - pB; pC = va } } const spG = g * (1 - gw / 100), tpG = g * (gw / 100), sp = spG * p.rate, tp = tpG * 0.029, ts = tpG * p.gatewayFee; let devBase = 250; if (g >= 1e5) devBase = 500; if (g >= 5e5) devBase = 750; if (g >= 2e6) devBase = 1250; if (g >= 1e7) devBase = 2000; const devOnly = devBase * 12; const appsCost = geAppCost(g) * 12; const d = dM * 12; return { platform: pB, spCost: sp, tpCost: tp, surcharge: ts, variable: vF, devOnly, appsCost, dev: d, total: pC + sp + tp + ts + d } }

function tcoUpdate() {
    currentGMV = s2g(document.getElementById('gmv-slider').value);
    document.getElementById('gmv-display').textContent = fmt(currentGMV);
    if (!manualWooDev) { const d = defWooDev(currentGMV); document.getElementById('woo-dev-slider').value = d; document.getElementById('woo-dev-display').textContent = fmtF(d) + '/mo'; document.getElementById('woo-dev-auto').style.display = 'inline-block' }
    if (!manualWooApps) { const a = defWooApps(currentGMV); document.getElementById('woo-apps-slider').value = a; document.getElementById('woo-apps-display').textContent = '$' + a + '/mo'; document.getElementById('woo-apps-auto').style.display = 'inline-block' }
    if (!manualShopifyDev) { const d = defShopifyDev(currentGMV); document.getElementById('shopify-dev-slider').value = Math.min(d, 4000); document.getElementById('shopify-dev-display').textContent = fmtF(d) + '/mo'; document.getElementById('shopify-dev-auto').style.display = 'inline-block' }
    if (!manualPlan) { const b = bestPlan(currentGMV); currentPlan = b; document.querySelectorAll('#shopify-plan-toggle .toggle-btn').forEach(x => x.classList.toggle('active', x.dataset.plan === b)); document.getElementById('plan-auto').style.display = 'inline-block'; document.getElementById('plan-auto-label').textContent = 'Most economical at this GMV' }
    const wD = parseInt(document.getElementById('woo-dev-slider').value), wA = parseInt(document.getElementById('woo-apps-slider').value), sD = parseInt(document.getElementById('shopify-dev-slider').value), gw = parseInt(document.getElementById('gateway-slider').value);
    document.getElementById('gateway-display').textContent = gw + '%';
    const woo = calcWoo(currentGMV, wD, wA, false), ge = calcWoo(currentGMV, wD, wA, true), shop = calcShopify(currentGMV, currentPlan, sD, gw);
    document.getElementById('woo-total').textContent = fmtF(woo.total); document.getElementById('woo-payments').textContent = fmtF(woo.payments); document.getElementById('woo-hosting').textContent = fmtF(woo.hosting); document.getElementById('woo-security').textContent = fmtF(woo.security); document.getElementById('woo-dev').textContent = fmtF(woo.dev); document.getElementById('woo-apps').textContent = fmtF(woo.apps);
    document.getElementById('wooge-total').textContent = fmtF(ge.total); document.getElementById('wooge-payments').textContent = fmtF(ge.payments); document.getElementById('wooge-dev').textContent = fmtF(ge.dev);
    ['wooge-hosting', 'wooge-security', 'wooge-apps'].forEach(id => { const el = document.getElementById(id); const v = id === 'wooge-hosting' ? ge.hosting : id === 'wooge-security' ? ge.security : ge.apps; if (v === 0) { el.textContent = 'Free \u2713'; el.classList.add('free') } else { el.textContent = fmtF(v); el.classList.remove('free') } });
    document.getElementById('shopify-total').textContent = fmtF(shop.total); document.getElementById('shopify-plan-label').textContent = PLANS[currentPlan].label; document.getElementById('shopify-platform').textContent = fmtF(shop.platform); document.getElementById('shopify-sp-cost').textContent = fmtF(shop.spCost); document.getElementById('shopify-tp-cost').textContent = shop.tpCost > 0 ? fmtF(shop.tpCost) : '$0'; document.getElementById('shopify-surcharge').textContent = shop.surcharge > 0 ? fmtF(shop.surcharge) : '$0'; document.getElementById('shopify-variable').textContent = shop.variable > 0 ? fmtF(shop.variable) : '$0'; document.getElementById('shopify-dev-cost').textContent = fmtF(shop.devOnly); document.getElementById('shopify-apps-cost').textContent = shop.appsCost > 0 ? fmtF(shop.appsCost) : '$0';
    const diff = shop.total - ge.total, score = getSS(currentGMV), mc = getMC(currentGMV, score);
    const vS = document.getElementById('verdict-savings'), vT = document.getElementById('verdict-text'), vD = document.getElementById('verdict-detail');
    if (diff > 0) { vS.textContent = fmtF(Math.abs(diff)) + '/yr'; vS.className = 'savings-amount ge-wins'; vT.textContent = 'Woo + Growth Engine saves you'; vD.textContent = 'At ' + fmt(currentGMV) + ' GMV, Woo+GE costs ' + fmtF(Math.abs(diff)) + '/yr less than Shopify ' + PLANS[currentPlan].name }
    else if (diff < 0) { const pb = Math.round(mc / Math.abs(diff) * 10) / 10; vS.textContent = fmtF(Math.abs(diff)) + '/yr'; vS.className = 'savings-amount shopify-wins'; vT.textContent = 'Shopify is cheaper by'; vD.textContent = 'But migration costs ~' + fmtF(mc) + '. Payback: ' + pb + ' years. Is it worth switching?' }
    else { vS.textContent = 'Break-even'; vS.className = 'savings-amount'; vT.textContent = 'Costs are roughly equal'; vD.textContent = '' }
    document.getElementById('switch-score').textContent = score + '/10'; document.getElementById('migration-cost').textContent = fmtF(mc);
    const fill = document.getElementById('switch-fill'); fill.style.width = (score * 10) + '%';
    const lbl = document.getElementById('switch-label');
    if (score <= 3) { lbl.textContent = 'Easy to Switch'; fill.style.background = 'linear-gradient(90deg,var(--positive),#FBBF24)' } else if (score <= 6) { lbl.textContent = 'Moderate Friction'; fill.style.background = 'linear-gradient(90deg,#FBBF24,var(--growth-engine))' } else if (score <= 8) { lbl.textContent = 'Hard to Leave'; fill.style.background = 'linear-gradient(90deg,var(--growth-engine),var(--negative))' } else { lbl.textContent = 'Functionally Locked In'; fill.style.background = 'linear-gradient(90deg,var(--growth-engine),var(--negative))' }
    document.querySelectorAll('.sw-tier').forEach(t => t.classList.toggle('active', currentGMV >= parseInt(t.dataset.gmv)));
    updateCostChart(); updatePaybackChart(mc, diff);
}

function updateCostChart() {
    const pts = [], w = [], ge = [], s = [];
    for (let g = 5e4; g <= 5e7; g *= 1.2) { const gv = Math.round(g); pts.push(gv); w.push(calcWoo(gv, defWooDev(gv), defWooApps(gv), false).total); ge.push(calcWoo(gv, defWooDev(gv), defWooApps(gv), true).total); s.push(calcShopify(gv, bestPlan(gv), defShopifyDev(gv), 20).total) }
    const lb = pts.map(g => fmt(g)); const chartOpts = { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1229', borderColor: '#2D2145', borderWidth: 1, titleColor: '#F5F0FF', bodyColor: '#A89CC8', padding: 10, callbacks: { title: i => 'GMV: ' + i[0].label, label: i => i.dataset.label + ': ' + fmtF(i.raw) } } }, scales: { x: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { size: 9 }, maxTicksLimit: 6 } }, y: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { size: 9 }, callback: v => fmt(v) } } } };
    if (costChart) { costChart.data.labels = lb; costChart.data.datasets[0].data = w; costChart.data.datasets[1].data = ge; costChart.data.datasets[2].data = s; costChart.update('none'); return }
    costChart = new Chart(document.getElementById('cost-chart').getContext('2d'), { type: 'line', data: { labels: lb, datasets: [{ label: 'WooCommerce', data: w, borderColor: '#873EFF', borderWidth: 2, pointRadius: 0, tension: 0.3, fill: false }, { label: 'Woo + GE', data: ge, borderColor: '#FF6B35', borderWidth: 3, pointRadius: 0, tension: 0.3, fill: false }, { label: 'Shopify', data: s, borderColor: '#96BF48', borderWidth: 2, pointRadius: 0, tension: 0.3, fill: false, borderDash: [6, 3] }] }, options: chartOpts });
}

function updatePaybackChart(mc, diff) {
    const yrs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], mL = yrs.map(() => mc), sav = Math.max(0, -diff), sL = yrs.map(y => y * sav), lb = yrs.map(y => 'Yr ' + y);
    if (paybackChart) { paybackChart.data.datasets[0].data = mL; paybackChart.data.datasets[1].data = sL; paybackChart.update('none'); return }
    paybackChart = new Chart(document.getElementById('payback-chart').getContext('2d'), { type: 'line', data: { labels: lb, datasets: [{ label: 'Migration Cost', data: mL, borderColor: '#F87171', borderWidth: 2, pointRadius: 0, tension: 0, fill: false, borderDash: [4, 4] }, { label: 'Cumulative Savings', data: sL, borderColor: '#96BF48', borderWidth: 3, pointRadius: 0, tension: 0, fill: false }] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1229', borderColor: '#2D2145', borderWidth: 1, titleColor: '#F5F0FF', bodyColor: '#A89CC8', padding: 10, callbacks: { label: i => i.datasetIndex === 0 ? 'Migration: ' + fmtF(i.raw) : 'Savings: ' + fmtF(i.raw) } } }, scales: { x: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { size: 9 } } }, y: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { size: 9 }, callback: v => fmt(v) } } } } });
}

// TCO Event Listeners
document.getElementById('gmv-slider').addEventListener('input', () => { manualPlan = false; manualWooDev = false; manualShopifyDev = false; manualWooApps = false; tcoUpdate() });
document.getElementById('woo-dev-slider').addEventListener('input', function () { manualWooDev = true; document.getElementById('woo-dev-auto').style.display = 'none'; document.getElementById('woo-dev-display').textContent = fmtF(parseInt(this.value)) + '/mo'; tcoUpdate() });
document.getElementById('woo-apps-slider').addEventListener('input', function () { manualWooApps = true; document.getElementById('woo-apps-auto').style.display = 'none'; document.getElementById('woo-apps-display').textContent = '$' + this.value + '/mo'; tcoUpdate() });
document.getElementById('shopify-dev-slider').addEventListener('input', function () { manualShopifyDev = true; document.getElementById('shopify-dev-auto').style.display = 'none'; document.getElementById('shopify-dev-display').textContent = fmtF(parseInt(this.value)) + '/mo'; tcoUpdate() });
document.getElementById('gateway-slider').addEventListener('input', tcoUpdate);
document.querySelectorAll('#shopify-plan-toggle .toggle-btn').forEach(btn => { btn.addEventListener('click', function () { manualPlan = true; document.querySelectorAll('#shopify-plan-toggle .toggle-btn').forEach(b => b.classList.remove('active')); this.classList.add('active'); currentPlan = this.dataset.plan; document.getElementById('plan-auto').style.display = 'none'; document.getElementById('plan-auto-label').textContent = this.dataset.plan === 'plus' ? 'Plus is a feature upgrade, not cost savings vs Advanced' : 'Manually selected'; tcoUpdate() }) });

// Initialize
document.getElementById('gmv-slider').value = g2s(500000);
tcoUpdate();
