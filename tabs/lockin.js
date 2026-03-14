/* ========== GE STRATEGY: LOCK-IN WEB (Tab 6) ========== */

const WEB_TIERS = [
    { tier: 1, gmv: 0, name: 'WCPay', icon: '💳', difficulty: 2, value: 0, desc: 'Payment processing foundation', color: '#4ADE80' },
    { tier: 2, gmv: 50000, name: 'AutomateWoo', icon: '⚡', difficulty: 4, value: 99, desc: 'Marketing automation & retention', color: '#60A5FA' },
    { tier: 3, gmv: 100000, name: 'Subscriptions/CRM', icon: '🔄', difficulty: 6, value: 226, desc: 'Recurring revenue & customer data', color: '#A78BFA' },
    { tier: 4, gmv: 250000, name: 'Jetpack Security', icon: '🛡️', difficulty: 7, value: 240, desc: 'Enterprise security & compliance', color: '#FBBF24' },
    { tier: 5, gmv: 500000, name: 'Pressable + Metorik', icon: '🏗️', difficulty: 9, value: 1140, desc: 'Dedicated infrastructure & analytics', color: '#FF6B35' },
    { tier: 6, gmv: 1000000, name: 'Custom Rate + Capital', icon: '🏆', difficulty: 10, value: 0, desc: 'Custom pricing & financing', color: '#F87171' }
];

const WEB_NARRATIVES = [
    { maxTier: 0, title: 'No Ecosystem Ties', summary: 'This merchant has zero switching cost. They can move to Shopify tomorrow with no friction. Every competitor is one click away.', risk: 'CRITICAL', riskColor: '#F87171' },
    { maxTier: 1, title: 'Payment Foundation Only', summary: 'WCPay is running but can be replaced by Stripe or Shopify Payments in under a day. No ecosystem lock-in yet.', risk: 'HIGH', riskColor: '#F87171' },
    { maxTier: 2, title: 'Automation Thread Connected', summary: 'AutomateWoo workflows are woven into daily operations — abandoned cart emails, follow-up sequences, VIP rules. Rebuilding these on Klaviyo takes 2-4 weeks.', risk: 'MEDIUM-HIGH', riskColor: '#FBBF24' },
    { maxTier: 3, title: 'Revenue Model Entangled', summary: 'Subscription billing or CRM data lives in WooCommerce. Migration means re-creating recurring payment plans and customer histories — a 1-2 month project.', risk: 'MEDIUM', riskColor: '#FBBF24' },
    { maxTier: 4, title: 'Security Layer Bound', summary: 'Real-time backups, malware scanning, and WAF protection are deeply integrated. Switching means finding and configuring alternatives while maintaining uptime — a risky 2-4 week transition.', risk: 'MEDIUM-LOW', riskColor: '#60A5FA' },
    { maxTier: 5, title: 'Infrastructure Locked', summary: 'Dedicated Pressable hosting + Metorik analytics dashboards. The entire technical stack depends on WooCommerce. Migration is now a 3-6 month infrastructure project costing $50K-$150K.', risk: 'LOW', riskColor: '#4ADE80' },
    { maxTier: 6, title: 'Functionally Locked In', summary: 'Custom WCPay rates, WooCommerce Capital financing, and assigned CSM. This merchant has negotiated terms that Shopify can\'t match at this scale. Switching is economically irrational.', risk: 'MINIMAL', riskColor: '#4ADE80' }
];

function initLockin() {
    const svg = document.getElementById('lockin-web-svg');
    if (!svg) return;

    const cx = 300, cy = 210, radius = 150;
    const angles = WEB_TIERS.map((_, i) => (i * 60 - 90) * Math.PI / 180);
    const nodes = angles.map(a => ({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }));

    // Build static SVG structure
    let svgContent = '';

    // Concentric rings (difficulty zones)
    [0.3, 0.55, 0.8, 1.0].forEach((r, i) => {
        const opacity = 0.04 + i * 0.02;
        svgContent += `<circle cx="${cx}" cy="${cy}" r="${radius * r}" fill="none" stroke="rgba(127,84,179,${opacity})" stroke-width="1" stroke-dasharray="4 4"/>`;
    });

    // Zone labels
    svgContent += `<text x="${cx}" y="${cy - radius * 0.3 - 8}" text-anchor="middle" fill="rgba(139,143,168,0.3)" font-size="7" font-weight="600">EASY TO LEAVE</text>`;
    svgContent += `<text x="${cx}" y="${cy - radius * 0.8 - 8}" text-anchor="middle" fill="rgba(139,143,168,0.3)" font-size="7" font-weight="600">HARD TO LEAVE</text>`;
    svgContent += `<text x="${cx}" y="${cy - radius - 14}" text-anchor="middle" fill="rgba(139,143,168,0.3)" font-size="7" font-weight="600">LOCKED IN</text>`;

    // Strands (lines from center to nodes) - initially hidden
    WEB_TIERS.forEach((t, i) => {
        const n = nodes[i];
        svgContent += `<line id="strand-${i}" x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" stroke="${t.color}" stroke-width="2" stroke-opacity="0" stroke-linecap="round" class="lockin-strand"/>`;
        // Secondary strand for glow effect
        svgContent += `<line id="glow-${i}" x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" stroke="${t.color}" stroke-width="6" stroke-opacity="0" stroke-linecap="round" class="lockin-glow"/>`;
    });

    // Center node (merchant)
    svgContent += `<circle cx="${cx}" cy="${cy}" r="28" fill="rgba(18,10,30,0.9)" stroke="var(--woo-purple)" stroke-width="2" id="center-ring"/>`;
    svgContent += `<text x="${cx}" y="${cy - 5}" text-anchor="middle" fill="var(--text-primary)" font-size="16">🏪</text>`;
    svgContent += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="var(--text-muted)" font-size="6.5" font-weight="600">MERCHANT</text>`;

    // Outer nodes
    WEB_TIERS.forEach((t, i) => {
        const n = nodes[i];
        // Node circle
        svgContent += `<circle id="node-bg-${i}" cx="${n.x}" cy="${n.y}" r="22" fill="rgba(18,10,30,0.8)" stroke="var(--border)" stroke-width="1.5" class="lockin-node"/>`;
        // Icon
        svgContent += `<text x="${n.x}" y="${n.y - 3}" text-anchor="middle" font-size="14" id="node-icon-${i}">${t.icon}</text>`;
        // Tier label
        svgContent += `<text x="${n.x}" y="${n.y + 10}" text-anchor="middle" fill="var(--text-muted)" font-size="5.5" font-weight="600" id="node-label-${i}">T${t.tier}</text>`;
        // Name label (outside node)
        const labelOffset = radius + 42;
        const lx = cx + labelOffset * Math.cos(angles[i]);
        const ly = cy + labelOffset * Math.sin(angles[i]);
        svgContent += `<text x="${lx}" y="${ly - 4}" text-anchor="middle" fill="var(--text-muted)" font-size="7" font-weight="600" id="node-name-${i}">${t.name}</text>`;
        svgContent += `<text x="${lx}" y="${ly + 5}" text-anchor="middle" fill="var(--text-muted)" font-size="6" id="node-gmv-${i}">${t.gmv === 0 ? '$0' : fmt(t.gmv)}</text>`;
    });

    svg.innerHTML = svgContent;

    // Slider listener
    document.getElementById('lockin-gmv-slider').addEventListener('input', lockinUpdate);
    lockinUpdate();
}

function lockinUpdate() {
    const gmv = s2g(document.getElementById('lockin-gmv-slider').value);
    document.getElementById('lockin-gmv-display').textContent = fmt(gmv);

    let activeTiers = 0;
    let totalDifficulty = 0;
    let totalValue = 0;

    WEB_TIERS.forEach((t, i) => {
        const active = gmv >= t.gmv;
        if (active) { activeTiers = t.tier; totalDifficulty = t.difficulty; if (t.value > 0) totalValue += t.value; }

        // Strand visibility
        const strand = document.getElementById(`strand-${i}`);
        const glow = document.getElementById(`glow-${i}`);
        const nodeBg = document.getElementById(`node-bg-${i}`);
        const nodeName = document.getElementById(`node-name-${i}`);
        const nodeGmv = document.getElementById(`node-gmv-${i}`);

        if (strand) {
            strand.setAttribute('stroke-opacity', active ? '0.8' : '0.05');
            strand.setAttribute('stroke-width', active ? '2.5' : '1');
        }
        if (glow) {
            glow.setAttribute('stroke-opacity', active ? '0.12' : '0');
        }
        if (nodeBg) {
            nodeBg.setAttribute('stroke', active ? t.color : 'var(--border)');
            nodeBg.setAttribute('stroke-width', active ? '2' : '1.5');
            nodeBg.setAttribute('fill', active ? `rgba(${hexToRgb(t.color)},0.08)` : 'rgba(18,10,30,0.8)');
        }
        if (nodeName) nodeName.setAttribute('fill', active ? t.color : 'var(--text-muted)');
        if (nodeGmv) nodeGmv.setAttribute('fill', active ? 'var(--text-secondary)' : 'var(--text-muted)');
    });

    // Update center ring color based on lock-in level
    const centerRing = document.getElementById('center-ring');
    if (centerRing) {
        if (activeTiers >= 5) centerRing.setAttribute('stroke', '#F87171');
        else if (activeTiers >= 3) centerRing.setAttribute('stroke', '#FBBF24');
        else centerRing.setAttribute('stroke', 'var(--woo-purple)');
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
    const narrative = WEB_NARRATIVES[activeTiers];
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
    document.getElementById('lockin-migration-est').textContent = fmtF(getMC(gmv, totalDifficulty));
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

// Lazy init when tab becomes visible
const lockinObserver = new MutationObserver(() => {
    const tabEl = document.getElementById('tab-lockin');
    if (tabEl && tabEl.classList.contains('active') && !document.getElementById('strand-0')) {
        initLockin();
    }
});
const lockinTab = document.getElementById('tab-lockin');
if (lockinTab) {
    lockinObserver.observe(lockinTab, { attributes: true, attributeFilter: ['class'] });
    if (lockinTab.classList.contains('active')) initLockin();
}
