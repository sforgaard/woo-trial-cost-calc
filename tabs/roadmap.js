/* ========== GROWTH ROADMAP (Tab 2) ========== */
const GE_TIERS = [
    {
        tier: 1, gmv: 0, name: 'WCPay Setup', icon: '💳',
        value: 0, valueLabel: 'Foundation',
        desc: 'Get set up with WooCommerce Payments. Accept credit cards, Apple Pay, and local payment methods from day one.',
        bridge: 'Start selling and build toward $50K to unlock marketing automation.',
        products: ['WCPay onboarding', 'Payment gateway', 'In-dashboard deposits']
    },
    {
        tier: 2, gmv: 50000, name: 'AutomateWoo', icon: '⚡',
        value: 99, valueLabel: '$99/yr value',
        desc: 'Automate abandoned cart recovery, post-purchase follow-ups, win-back campaigns, and VIP workflows without any coding.',
        bridge: 'Automation drives repeat purchases. Next unlock at $100K adds recurring revenue tools.',
        products: ['Abandoned cart emails', 'Post-purchase upsells', 'Customer win-back', 'VIP loyalty rules']
    },
    {
        tier: 3, gmv: 100000, name: 'Subscriptions / CRM', icon: '🔄',
        value: 226, valueLabel: '~$226/yr value',
        desc: 'Choose WC Subscriptions, WC Memberships, or Jetpack CRM. Build recurring revenue models or deeper customer relationships.',
        bridge: 'Recurring revenue stabilizes cash flow. At $250K, unlock enterprise-grade security.',
        products: ['WC Subscriptions ($279)', 'WC Memberships ($199)', 'Jetpack CRM ($199)', 'Choose one that fits your model']
    },
    {
        tier: 4, gmv: 250000, name: 'Jetpack Security', icon: '🛡️',
        value: 240, valueLabel: '$240/yr value',
        desc: 'Automated backups, malware scanning, brute force protection, and a web application firewall. Peace of mind at scale.',
        bridge: 'With security handled, focus on growth. At $500K you get dedicated hosting + analytics.',
        products: ['Real-time backups', 'Malware scanning', 'WAF protection', 'One-click restore']
    },
    {
        tier: 5, gmv: 500000, name: 'Pressable + Metorik', icon: '🏗️',
        value: 1140, valueLabel: '$1,140/yr value',
        desc: 'Managed WordPress hosting on Pressable (no more shared hosting bottlenecks) plus Metorik analytics for deep revenue insights.',
        bridge: 'Enterprise infrastructure in place. At $1M+, unlock custom payment rates and financing.',
        products: ['Pressable hosting ($540/yr)', 'Metorik analytics ($600/yr)', 'Dedicated infrastructure', 'Revenue intelligence']
    },
    {
        tier: 6, gmv: 1000000, name: 'Custom Rate + Capital', icon: '🏆',
        value: 0, valueLabel: 'Custom',
        desc: 'Negotiate custom WCPay processing rates, access WooCommerce Capital for business financing, and get an assigned CSM.',
        bridge: null,
        products: ['Custom WCPay rate', 'WooCommerce Capital', 'Assigned CSM', 'Custom package']
    }
];

let roadmapChart = null;

function roadmapUpdate() {
    const slider = document.getElementById('roadmap-gmv-slider');
    const gmv = s2g(slider.value);
    document.getElementById('roadmap-gmv-display').textContent = fmt(gmv);

    // Calculate total value unlocked
    let totalValue = 0;
    GE_TIERS.forEach(t => { if (gmv >= t.gmv && t.value > 0) totalValue += t.value });
    document.getElementById('roadmap-total-value').textContent = totalValue > 0 ? fmtF(totalValue) + '/yr' : '$0/yr';

    // Find next milestone
    const nextTier = GE_TIERS.find(t => gmv < t.gmv);
    const nextBanner = document.getElementById('roadmap-next-banner');
    if (nextTier) {
        const gap = nextTier.gmv - gmv;
        nextBanner.innerHTML = `🎯 You're <strong>${fmt(gap)}</strong> away from unlocking <strong>${nextTier.name}</strong>${nextTier.value > 0 ? ' (' + nextTier.valueLabel + ')' : ''}`;
        nextBanner.style.display = 'block';
    } else {
        nextBanner.innerHTML = '🏆 <strong>All milestones unlocked!</strong> You have the full Growth Engine suite.';
        nextBanner.style.display = 'block';
    }

    // Build timeline cards
    const timeline = document.getElementById('roadmap-timeline');
    timeline.innerHTML = '';
    GE_TIERS.forEach(t => {
        const unlocked = gmv >= t.gmv;
        const isCurrent = unlocked && (!nextTier || t.gmv === GE_TIERS[GE_TIERS.indexOf(nextTier) - 1]?.gmv);
        const isNext = nextTier && t.tier === nextTier.tier;

        const card = document.createElement('div');
        card.className = 'rm-tier' + (unlocked ? ' unlocked' : '') + (isCurrent ? ' current' : '') + (isNext ? ' next' : '');

        let badgeHTML = '';
        if (unlocked) badgeHTML = '<div class="rm-tier-badge">✓</div>';
        else if (isNext) badgeHTML = '<div class="rm-tier-badge" style="background:var(--info);color:#000">→</div>';

        const productsHTML = t.products.map(p => `<div style="font-size:0.6rem;color:var(--text-muted);padding:1px 0">• ${p}</div>`).join('');

        card.innerHTML = `
            ${badgeHTML}
            <div class="rm-tier-icon">${t.icon}</div>
            <div class="rm-tier-gmv">${t.gmv === 0 ? '$0' : fmt(t.gmv)}</div>
            <div class="rm-tier-name">${t.name}</div>
            <div class="rm-tier-desc">${t.desc}</div>
            ${productsHTML}
            <div class="rm-tier-value">${t.value > 0 ? t.valueLabel : t.tier === 6 ? 'Custom pricing' : 'Foundation'}</div>
            ${t.bridge && !unlocked ? `<div class="rm-tier-bridge">${t.bridge}</div>` : ''}
        `;
        timeline.appendChild(card);
    });

    updateRoadmapChart();
}

function updateRoadmapChart() {
    const gmvLevels = [0, 50000, 100000, 250000, 500000, 1000000, 2000000];
    const labels = gmvLevels.map(g => g === 0 ? '$0' : fmt(g));
    const cumValues = gmvLevels.map(g => {
        let total = 0;
        GE_TIERS.forEach(t => { if (g >= t.gmv && t.value > 0) total += t.value });
        return total;
    });

    if (roadmapChart) {
        roadmapChart.data.datasets[0].data = cumValues;
        roadmapChart.update('none');
        return;
    }

    roadmapChart = new Chart(document.getElementById('roadmap-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Annual GE Value',
                data: cumValues,
                backgroundColor: cumValues.map((_, i) => i < cumValues.length - 1 ? 'rgba(255,107,43,0.6)' : 'rgba(127,84,179,0.6)'),
                borderColor: cumValues.map((_, i) => i < cumValues.length - 1 ? '#FF6B35' : '#7F54B3'),
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1229', borderColor: '#2D2145', borderWidth: 1, callbacks: { label: i => 'Value: ' + fmtF(i.raw) + '/yr' } } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#6B5F82', font: { size: 10 } } },
                y: { grid: { color: 'rgba(45,33,69,0.4)' }, ticks: { color: '#6B5F82', font: { size: 9 }, callback: v => fmtF(v) } }
            }
        }
    });
}

// Roadmap Event Listeners
document.getElementById('roadmap-gmv-slider').addEventListener('input', roadmapUpdate);
roadmapUpdate();
