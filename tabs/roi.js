/* ========== ROI & ANALYTICS (Tab 5) ========== */

// Data from territory plan p.38-40 and TrialFindings.xlsx
const ROI_TIERS = [
    { tier: 1, reward: 'WCPay Setup', gmv: '$0', totalMerchs: 3177, wcpayMerchs: 822, wcpayRate: 25.9, baseEnroll: 0, atRiskRev: 0, churnSaved: 0, oppCost: 0, programCost: 0 },
    { tier: 2, reward: 'AutomateWoo', gmv: '$50K', totalMerchs: 2382, wcpayMerchs: 624, wcpayRate: 26.2, baseEnroll: 5, atRiskRev: 0, churnSaved: 5, oppCost: 11791, programCost: 0 },
    { tier: 3, reward: 'WC Subs/CRM', gmv: '$100K', totalMerchs: 231, wcpayMerchs: 59, wcpayRate: 25.5, baseEnroll: 10, atRiskRev: 172, churnSaved: 15, oppCost: 5221, programCost: 0 },
    { tier: 4, reward: 'Jetpack Security', gmv: '$250K', totalMerchs: 194, wcpayMerchs: 52, wcpayRate: 26.8, baseEnroll: 20, atRiskRev: 0, churnSaved: 25, oppCost: 9312, programCost: 0 },
    { tier: 5, reward: 'Pressable+Metorik', gmv: '$500K', totalMerchs: 192, wcpayMerchs: 47, wcpayRate: 24.5, baseEnroll: 35, atRiskRev: 5626, churnSaved: 40, oppCost: 36288, programCost: 40320 },
    { tier: 6, reward: 'Custom Rate', gmv: '$1M+', totalMerchs: 260, wcpayMerchs: 40, wcpayRate: 15.4, baseEnroll: 50, atRiskRev: 656140, churnSaved: 50, oppCost: 0, programCost: 0 }
];

const BASELINE_ADOPTION = 26.2;

// Churn destination data from TrialFindings.xlsx
const CHURN_DATA = {
    outflow: [
        { platform: 'Shopify', count: 604, color: '#95BF47' },
        { platform: 'Custom', count: 137, color: '#60A5FA' },
        { platform: 'Magento', count: 6, color: '#F97316' },
        { platform: 'Wix', count: 3, color: '#3B82F6' },
        { platform: 'Squarespace', count: 7, color: '#8B5CF6' },
        { platform: 'BigCommerce', count: 2, color: '#EC4899' },
        { platform: 'Other', count: 45, color: '#6B7280' }
    ],
    shopifyByTier: [
        { tier: '$1-$50K', merchants: 75, gmvAtRisk: 1875000, avgGmv: 25000 },
        { tier: '$50K-$250K', merchants: 65, gmvAtRisk: 8125000, avgGmv: 125000 },
        { tier: '$250K-$500K', merchants: 44, gmvAtRisk: 11000000, avgGmv: 250000 },
        { tier: '$500K-$1M', merchants: 29, gmvAtRisk: 14500000, avgGmv: 500000 },
        { tier: '$1M-$2M', merchants: 56, gmvAtRisk: 56000000, avgGmv: 1000000 },
        { tier: '$2M-$4M', merchants: 57, gmvAtRisk: 114000000, avgGmv: 2000000 },
        { tier: '$4M-$8M', merchants: 57, gmvAtRisk: 228000000, avgGmv: 4000000 },
        { tier: '$8M-$16M', merchants: 100, gmvAtRisk: 800000000, avgGmv: 8000000 },
        { tier: '$16M-$50M', merchants: 91, gmvAtRisk: 2275000000, avgGmv: 25000000 }
    ]
};

// Plugin stickiness data from PDF p.33
const STICKINESS_DATA = [
    { name: 'WC Services/Tax', wcpay: 78.3, nonWcpay: 63.4, multiplier: '1.2x' },
    { name: 'Jetpack', wcpay: 34.1, nonWcpay: 20.1, multiplier: '1.7x' },
    { name: 'MailPoet', wcpay: 6.2, nonWcpay: 2.2, multiplier: '2.8x' },
    { name: 'WC Subscriptions', wcpay: 6.2, nonWcpay: 1.9, multiplier: '3.3x' },
    { name: 'WC Memberships', wcpay: 2.4, nonWcpay: 0.8, multiplier: '3.0x' },
    { name: 'AutomateWoo', wcpay: 1.7, nonWcpay: 0.3, multiplier: '5.7x' },
    { name: 'Metorik', wcpay: 0.8, nonWcpay: 0.2, multiplier: '4.0x' }
];

// Tool adoption growth factors by GMV tier
const ADOPTION_CURVES = [
    { name: 'Metorik', growth: 40, color: '#FF6B35' },
    { name: 'WC Subscriptions', growth: 12, color: '#7F54B3' },
    { name: 'AutomateWoo', growth: 7, color: '#60A5FA' },
    { name: 'WC Memberships', growth: 5, color: '#95BF47' },
    { name: 'MailPoet', growth: 3, color: '#F97316' }
];

let wcpayChart = null, churnChart = null, stickinessChartInst = null, adoptionChart = null, shopifyTierChart = null;
let geToggleOn = false;

function roiUpdate() {
    const enrollMult = parseInt(document.getElementById('roi-enrollment-slider').value) / 100;
    const churnMult = parseInt(document.getElementById('roi-churn-slider').value) / 100;
    document.getElementById('roi-enrollment-display').textContent = enrollMult.toFixed(2) + 'x';
    document.getElementById('roi-churn-display').textContent = churnMult.toFixed(2) + 'x';

    let totalAtRisk = 0, totalRevSaved = 0, totalProgramCost = 0, totalOppCost = 0;

    ROI_TIERS.forEach(t => {
        const adjEnroll = Math.min(100, t.baseEnroll * enrollMult);
        const adjChurn = Math.min(100, t.churnSaved * churnMult);
        const revSaved = t.atRiskRev * (adjChurn / 100);
        totalAtRisk += t.atRiskRev;
        totalRevSaved += revSaved;
        totalProgramCost += t.programCost * (adjEnroll / t.baseEnroll || 1);
        totalOppCost += t.oppCost * (adjEnroll / t.baseEnroll || 1);
    });

    const totalCost = totalProgramCost + totalOppCost;
    const roi = totalCost > 0 ? totalRevSaved / totalCost : 0;

    const output = document.getElementById('roi-output');
    output.innerHTML = `
        <div class="roi-stat">
            <div class="roi-stat-value" style="color:var(--growth-engine)">${roi.toFixed(1)}x</div>
            <div class="roi-stat-label">Fully Loaded ROI</div>
        </div>
        <div class="roi-stat">
            <div class="roi-stat-value" style="color:var(--positive)">${fmtF(Math.round(totalRevSaved))}</div>
            <div class="roi-stat-label">Revenue Saved/yr</div>
        </div>
        <div class="roi-stat">
            <div class="roi-stat-value" style="color:var(--negative)">${fmtF(Math.round(totalProgramCost))}</div>
            <div class="roi-stat-label">Program Cost/yr</div>
        </div>
        <div class="roi-stat">
            <div class="roi-stat-value" style="color:var(--warning)">${fmtF(Math.round(totalOppCost))}</div>
            <div class="roi-stat-label">Opp Cost (foregone rev)</div>
        </div>
    `;
}

function initWCPayChart() {
    const labels = ROI_TIERS.map(t => t.gmv);
    const actual = ROI_TIERS.map(t => t.wcpayRate);
    const baseline = ROI_TIERS.map(() => BASELINE_ADOPTION);

    wcpayChart = new Chart(document.getElementById('wcpay-adoption-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Actual Adoption', data: actual, backgroundColor: 'rgba(127,84,179,0.7)', borderColor: '#7F54B3', borderWidth: 1, borderRadius: 4 },
                { label: 'Baseline (26.2%)', data: baseline, type: 'line', borderColor: '#F87171', borderWidth: 2, borderDash: [4, 4], pointRadius: 0, fill: false }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: '#8b8fa8', font: { size: 10 } } }, tooltip: { callbacks: { label: i => i.dataset.label + ': ' + i.raw.toFixed(1) + '%' } } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#6B5F82', font: { size: 9 } } },
                y: { min: 0, max: 35, grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { size: 9 }, callback: v => v + '%' } }
            }
        }
    });
}

function toggleGE(on) {
    geToggleOn = on;
    document.getElementById('roi-ge-off').classList.toggle('active', !on);
    document.getElementById('roi-ge-on').classList.toggle('active', on);

    if (wcpayChart) {
        const actual = ROI_TIERS.map(t => t.wcpayRate);
        if (on) {
            // Project GE impact: boost adoption toward baseline at higher tiers
            const projected = ROI_TIERS.map((t, i) => {
                const boost = [0, 2, 5, 8, 12, 8]; // Projected adoption lift %
                return Math.min(35, t.wcpayRate + boost[i]);
            });
            wcpayChart.data.datasets[0].data = projected;
            wcpayChart.data.datasets[0].label = 'Projected w/ GE';
            wcpayChart.data.datasets[0].backgroundColor = 'rgba(255,107,43,0.7)';
            wcpayChart.data.datasets[0].borderColor = '#FF6B35';
        } else {
            wcpayChart.data.datasets[0].data = actual;
            wcpayChart.data.datasets[0].label = 'Actual Adoption';
            wcpayChart.data.datasets[0].backgroundColor = 'rgba(127,84,179,0.7)';
            wcpayChart.data.datasets[0].borderColor = '#7F54B3';
        }
        wcpayChart.update();
    }
}

function initChurnChart() {
    const data = CHURN_DATA.outflow;
    churnChart = new Chart(document.getElementById('churn-chart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.platform),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: data.map(d => d.color),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#8b8fa8', font: { size: 10 }, padding: 8 } },
                tooltip: {
                    callbacks: {
                        label: i => {
                            const total = i.dataset.data.reduce((a, b) => a + b, 0);
                            return i.label + ': ' + i.raw + ' merchants (' + Math.round(i.raw / total * 100) + '%)';
                        }
                    }
                }
            }
        }
    });
}

function initStickinessChart() {
    const labels = STICKINESS_DATA.map(s => s.name);
    stickinessChartInst = new Chart(document.getElementById('stickiness-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'WCPay Merchants', data: STICKINESS_DATA.map(s => s.wcpay), backgroundColor: 'rgba(127,84,179,0.7)', borderRadius: 4 },
                { label: 'Non-WCPay', data: STICKINESS_DATA.map(s => s.nonWcpay), backgroundColor: 'rgba(139,143,168,0.4)', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: { legend: { labels: { color: '#8b8fa8', font: { size: 10 } } }, tooltip: { callbacks: { label: i => i.dataset.label + ': ' + i.raw + '%' } } },
            scales: {
                x: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { size: 9 }, callback: v => v + '%' } },
                y: { grid: { display: false }, ticks: { color: '#8b8fa8', font: { size: 9 } } }
            }
        }
    });
}

function initAdoptionChart() {
    const gmvLabels = ['<$100K', '$100K-250K', '$250K-500K', '$500K-1M', '$1M+'];
    const datasets = ADOPTION_CURVES.map(tool => ({
        label: tool.name,
        data: gmvLabels.map((_, i) => {
            // Simulate growth curve: start at base, grow by factor
            const base = 1;
            return +(base * Math.pow(tool.growth, i / (gmvLabels.length - 1))).toFixed(1);
        }),
        borderColor: tool.color,
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
        fill: false
    }));

    adoptionChart = new Chart(document.getElementById('adoption-curve-chart').getContext('2d'), {
        type: 'line',
        data: { labels: gmvLabels, datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#8b8fa8', font: { size: 10 } } }, tooltip: { callbacks: { label: i => i.dataset.label + ': ' + i.raw + 'x base adoption' } } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#6B5F82', font: { size: 9 } } },
                y: { grid: { color: 'rgba(45,33,69,0.4)' }, title: { display: true, text: 'Adoption Multiplier', color: '#6B5F82', font: { size: 9 } }, ticks: { color: '#6B5F82', font: { size: 9 }, callback: v => v + 'x' } }
            }
        }
    });
}

function initShopifyTierChart() {
    const data = CHURN_DATA.shopifyByTier;
    shopifyTierChart = new Chart(document.getElementById('shopify-tier-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: data.map(d => d.tier),
            datasets: [
                {
                    label: 'Merchants Leaving',
                    data: data.map(d => d.merchants),
                    backgroundColor: 'rgba(248,113,113,0.6)',
                    borderColor: '#F87171',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'GMV at Risk',
                    data: data.map(d => d.gmvAtRisk),
                    type: 'line',
                    borderColor: '#95BF47',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#8b8fa8', font: { size: 10 } } },
                tooltip: { callbacks: { label: i => i.datasetIndex === 0 ? i.raw + ' merchants' : 'GMV at risk: ' + fmt(i.raw) } }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#6B5F82', font: { size: 8 } } },
                y: { position: 'left', grid: { color: 'rgba(45,33,69,0.4)' }, title: { display: true, text: 'Merchants', color: '#6B5F82', font: { size: 9 } }, ticks: { color: '#6B5F82', font: { size: 9 } } },
                y1: { position: 'right', grid: { display: false }, title: { display: true, text: 'GMV at Risk', color: '#6B5F82', font: { size: 9 } }, ticks: { color: '#6B5F82', font: { size: 9 }, callback: v => fmt(v) } }
            }
        }
    });
}

// Initialize all ROI charts
function initROI() {
    document.getElementById('roi-enrollment-slider').addEventListener('input', roiUpdate);
    document.getElementById('roi-churn-slider').addEventListener('input', roiUpdate);
    document.getElementById('roi-ge-off').addEventListener('click', () => toggleGE(false));
    document.getElementById('roi-ge-on').addEventListener('click', () => toggleGE(true));

    roiUpdate();
    initWCPayChart();
    initChurnChart();
    initStickinessChart();
    initAdoptionChart();
    initShopifyTierChart();
}

// Lazy init charts when tab becomes visible
const roiObserver = new MutationObserver(() => {
    const tabEl = document.getElementById('tab-roi');
    if (tabEl && tabEl.classList.contains('active') && !wcpayChart) {
        initROI();
    }
});
roiObserver.observe(document.getElementById('tab-roi'), { attributes: true, attributeFilter: ['class'] });

// Also init if tab is already active on load
if (document.getElementById('tab-roi').classList.contains('active')) {
    initROI();
}
