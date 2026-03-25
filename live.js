/* ============================================
   EarthSama — Live Public Dashboard
   17 Regions + 82 Provinces
   Thresholds: Region 100K ha, Province 10K ha
   ============================================ */

// ======== Thresholds ========
const REGION_THRESHOLD = 100000;  // 100K hectares approved → OMTSE + Apl support
const PROVINCE_THRESHOLD = 10000; // 10K hectares approved → province qualifies

// ======== 17 Administrative Regions (keyed by PSGC code) ========
const REGIONS = {
  '130000000': { name: 'NCR', fullName: 'National Capital Region', lat: 14.5995, lng: 120.9842 },
  '140000000': { name: 'CAR', fullName: 'Cordillera Administrative Region', lat: 17.3513, lng: 121.1719 },
  '010000000': { name: 'Region I', fullName: 'Ilocos Region', lat: 16.0832, lng: 120.6200 },
  '020000000': { name: 'Region II', fullName: 'Cagayan Valley', lat: 16.9754, lng: 121.8107 },
  '030000000': { name: 'Region III', fullName: 'Central Luzon', lat: 15.4828, lng: 120.7120 },
  '040000000': { name: 'Region IV-A', fullName: 'CALABARZON', lat: 14.1008, lng: 121.0794 },
  '170000000': { name: 'Region IV-B', fullName: 'MIMAROPA Region', lat: 12.8797, lng: 121.0770 },
  '050000000': { name: 'Region V', fullName: 'Bicol Region', lat: 13.4210, lng: 123.4137 },
  '060000000': { name: 'Region VI', fullName: 'Western Visayas', lat: 11.0050, lng: 122.5373 },
  '070000000': { name: 'Region VII', fullName: 'Central Visayas', lat: 9.8500, lng: 123.8907 },
  '080000000': { name: 'Region VIII', fullName: 'Eastern Visayas', lat: 11.0439, lng: 124.9587 },
  '090000000': { name: 'Region IX', fullName: 'Zamboanga Peninsula', lat: 8.1540, lng: 123.2588 },
  '100000000': { name: 'Region X', fullName: 'Northern Mindanao', lat: 8.0202, lng: 124.6857 },
  '110000000': { name: 'Region XI', fullName: 'Davao Region', lat: 7.1907, lng: 125.4553 },
  '120000000': { name: 'Region XII', fullName: 'SOCCSKSARGEN', lat: 6.2707, lng: 124.6857 },
  '160000000': { name: 'Region XIII', fullName: 'Caraga', lat: 8.9475, lng: 125.5406 },
  '150000000': { name: 'BARMM', fullName: 'Bangsamoro', lat: 6.9568, lng: 124.2422 }
};

// Map region display name to PSGC code for backward compat with old submissions
const REGION_NAME_TO_CODE = {};
for (const [code, info] of Object.entries(REGIONS)) {
  REGION_NAME_TO_CODE[info.fullName.toLowerCase()] = code;
  REGION_NAME_TO_CODE[info.name.toLowerCase()] = code;
}
// Also map old keys for legacy submissions
const OLD_KEY_MAP = {
  ncr: '130000000', car: '140000000', region1: '010000000', region2: '020000000',
  region3: '030000000', region4a: '040000000', region4b: '170000000', region5: '050000000',
  region6: '060000000', region7: '070000000', region8: '080000000', region9: '090000000',
  region10: '100000000', region11: '110000000', region12: '120000000', region13: '160000000',
  barmm: '150000000'
};

function resolveRegionCode(s) {
  // Try region_code first (new submissions)
  if (s.owner && s.owner.region_code && REGIONS[s.owner.region_code]) return s.owner.region_code;
  // Try old key format
  const region = s.owner && s.owner.region;
  if (!region) return null;
  if (OLD_KEY_MAP[region]) return OLD_KEY_MAP[region];
  // Try name match
  const lower = region.toLowerCase();
  if (REGION_NAME_TO_CODE[lower]) return REGION_NAME_TO_CODE[lower];
  // Fuzzy match
  for (const [name, code] of Object.entries(REGION_NAME_TO_CODE)) {
    if (lower.includes(name) || name.includes(lower)) return code;
  }
  return null;
}

// ======== 82 Provinces by Region ========
const PROVINCES = {
  // NCR — 1
  ncr:      ['Metro Manila'],
  // CAR — 6
  car:      ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'],
  // Region I — 4
  region1:  ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  // Region II — 5
  region2:  ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  // Region III — 7
  region3:  ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'],
  // Region IV-A — 5
  region4a: ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  // Region IV-B — 5
  region4b: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'],
  // Region V — 6
  region5:  ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'],
  // Region VI — 6
  region6:  ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental'],
  // Region VII — 4
  region7:  ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'],
  // Region VIII — 6
  region8:  ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'],
  // Region IX — 3
  region9:  ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  // Region X — 5
  region10: ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
  // Region XI — 5
  region11: ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'],
  // Region XII — 4
  region12: ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'],
  // Region XIII — 5
  region13: ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
  // BARMM — 6
  barmm:    ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi']
};

let liveMap = null;
let regionMarkers = {};
let currentView = 'regions'; // 'regions' or 'provinces'

// ======== Init ========

function init() {
  const submissions = loadSubmissions();
  const metrics = computeMetrics(submissions);
  renderHeroStats(metrics);
  initMap(metrics);
  renderRegionList(metrics);
  renderRecentActivity(submissions);
}

function loadSubmissions() {
  try {
    return JSON.parse(localStorage.getItem('earthsama_submissions') || '[]');
  } catch { return []; }
}

// ======== Metrics ========

function computeMetrics(submissions) {
  const regionData = {};
  const provinceData = {};

  // Initialize all regions by PSGC code
  for (const [code, info] of Object.entries(REGIONS)) {
    regionData[code] = { ...info, key: code, hectares: 0, approvedHectares: 0, count: 0, approved: 0 };
  }

  let totalHectares = 0;
  let totalApprovedHectares = 0;
  let totalApproved = 0;

  submissions.forEach(s => {
    const regionCode = resolveRegionCode(s);
    const province = s.owner && s.owner.province;
    const municipality = s.owner && s.owner.municipality;
    const barangay = s.owner && s.owner.barangay;
    const acreage = s.land ? s.land.acreage : 0;
    const hectares = acreage * 0.404686;
    const isApproved = s.status === 'approved';

    totalHectares += hectares;
    if (isApproved) {
      totalApproved++;
      totalApprovedHectares += hectares;
    }

    if (regionCode && regionData[regionCode]) {
      regionData[regionCode].hectares += hectares;
      regionData[regionCode].count++;
      if (isApproved) {
        regionData[regionCode].approved++;
        regionData[regionCode].approvedHectares += hectares;
      }
    }

    if (province) {
      const provKey = province.toLowerCase().trim();
      if (!provinceData[provKey]) {
        provinceData[provKey] = {
          name: province, region: regionCode || '', key: provKey,
          municipality: municipality || '', barangay: barangay || '',
          hectares: 0, approvedHectares: 0, count: 0, approved: 0
        };
      }
      provinceData[provKey].hectares += hectares;
      provinceData[provKey].count++;
      if (isApproved) {
        provinceData[provKey].approved++;
        provinceData[provKey].approvedHectares += hectares;
      }
    }
  });

  const activeRegions = Object.values(regionData).filter(r => r.count > 0).length;
  const qualifiedRegions = Object.values(regionData).filter(r => r.approvedHectares >= REGION_THRESHOLD).length;
  const qualifiedProvinces = Object.values(provinceData).filter(p => p.approvedHectares >= PROVINCE_THRESHOLD).length;
  const totalProvinceCount = 82; // Fixed PH province count

  return {
    totalHectares,
    totalApprovedHectares,
    totalSubmissions: submissions.length,
    totalApproved,
    activeRegions,
    qualifiedRegions,
    qualifiedProvinces,
    totalProvinces: totalProvinceCount,
    regions: regionData,
    provinces: provinceData
  };
}

// ======== Hero Stats ========

function renderHeroStats(metrics) {
  document.getElementById('total-hectares').textContent = formatNumber(metrics.totalHectares.toFixed(0));
  document.getElementById('total-submissions').textContent = formatNumber(metrics.totalSubmissions);
  document.getElementById('total-approved-ha').textContent = formatNumber(metrics.totalApprovedHectares.toFixed(0));
  document.getElementById('qualified-regions').textContent = `${metrics.qualifiedRegions} / 17`;
  document.getElementById('qualified-provinces').textContent = `${metrics.qualifiedProvinces} / ${metrics.totalProvinces}`;
}

function formatNumber(n) {
  return Number(n).toLocaleString();
}

// ======== Map ========

function initMap(metrics) {
  liveMap = L.map('live-map', {
    center: [12.8797, 121.7740],
    zoom: 6,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OSM',
    maxZoom: 18
  }).addTo(liveMap);

  renderMapMarkers(metrics);
}

function renderMapMarkers(metrics) {
  // Clear existing
  Object.values(regionMarkers).forEach(m => liveMap.removeLayer(m));
  regionMarkers = {};

  for (const [key, region] of Object.entries(metrics.regions)) {
    const pct = Math.min(region.approvedHectares / REGION_THRESHOLD, 1);
    const color = getThresholdColor(pct);
    const hasData = region.count > 0;
    const radius = hasData ? Math.max(14, Math.min(40, 14 + pct * 26)) : 8;

    const circle = L.circleMarker([region.lat, region.lng], {
      radius: radius,
      fillColor: color,
      color: pct >= 1 ? '#1B5E20' : '#6B7280',
      weight: pct >= 1 ? 2.5 : 1.5,
      fillOpacity: hasData ? 0.75 : 0.12,
      opacity: hasData ? 0.9 : 0.3
    }).addTo(liveMap);

    const pctDisplay = (pct * 100).toFixed(1);
    const statusText = pct >= 1
      ? '<div style="color:#1B5E20;font-weight:700">OMTSE + Apl Supported</div>'
      : `<div style="color:#B45309">${formatNumber(region.approvedHectares.toFixed(0))} / ${formatNumber(REGION_THRESHOLD)} ha approved (${pctDisplay}%)</div>`;

    const tooltipContent = `<div class="choropleth-tooltip">
      <strong>${region.name} — ${region.fullName}</strong>
      <div class="tt-stat">${formatNumber(region.hectares.toFixed(0))} ha committed</div>
      <div>${formatNumber(region.approvedHectares.toFixed(0))} ha approved</div>
      ${statusText}
      <div>${region.count} submission${region.count !== 1 ? 's' : ''}</div>
    </div>`;

    circle.bindTooltip(tooltipContent, {
      direction: 'top',
      offset: [0, -radius],
      className: 'choropleth-tooltip-wrap'
    });

    // Label
    if (hasData) {
      const labelText = pct >= 1
        ? `${formatNumber(region.approvedHectares.toFixed(0))} ha`
        : `${pctDisplay}%`;
      const labelColor = pct >= 1 ? '#1B5E20' : '#B45309';
      const label = L.divIcon({
        className: 'region-label',
        html: `<div style="
          font-family: Inter, sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          color: ${labelColor};
          text-align: center;
          white-space: nowrap;
          text-shadow: 0 0 3px white, 0 0 5px white;
          pointer-events: none;
        ">${labelText}</div>`,
        iconSize: [70, 16],
        iconAnchor: [35, -radius - 2]
      });
      L.marker([region.lat, region.lng], { icon: label, interactive: false }).addTo(liveMap);
    }

    regionMarkers[key] = circle;
  }
}

function getThresholdColor(pct) {
  if (pct <= 0) return '#E5E7EB';
  if (pct < 0.25) return '#FEF3C7';  // amber-50
  if (pct < 0.5) return '#FDE68A';   // amber-200
  if (pct < 0.75) return '#A5D6A7';  // green-200
  if (pct < 1) return '#66BB6A';     // green-400
  return '#1B5E20';                   // green-900 — qualified!
}

function getColor(intensity) {
  const colors = [
    [232, 245, 233],
    [165, 214, 167],
    [102, 187, 106],
    [46, 125, 50],
    [27, 94, 32]
  ];
  const idx = Math.min(intensity * (colors.length - 1), colors.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const t = idx - lower;
  const r = Math.round(colors[lower][0] + (colors[upper][0] - colors[lower][0]) * t);
  const g = Math.round(colors[lower][1] + (colors[upper][1] - colors[lower][1]) * t);
  const b = Math.round(colors[lower][2] + (colors[upper][2] - colors[lower][2]) * t);
  return `rgb(${r},${g},${b})`;
}

// ======== Sidebar ========

function setView(view) {
  currentView = view;
  document.getElementById('btn-view-regions').classList.toggle('active', view === 'regions');
  document.getElementById('btn-view-provinces').classList.toggle('active', view === 'provinces');

  const metrics = computeMetrics(loadSubmissions());
  if (view === 'regions') {
    renderRegionList(metrics);
  } else {
    renderProvinceList(metrics);
  }
}

function renderRegionList(metrics) {
  const list = document.getElementById('region-list');
  const sorted = Object.values(metrics.regions).sort((a, b) => b.approvedHectares - a.approvedHectares);

  list.innerHTML = sorted.map(r => {
    const pct = Math.min(r.approvedHectares / REGION_THRESHOLD, 1);
    const pctDisplay = (pct * 100).toFixed(1);
    const qualified = pct >= 1;
    const barColor = qualified ? '#1B5E20' : pct > 0.5 ? '#66BB6A' : pct > 0 ? '#F59E0B' : '#E5E7EB';

    return `<div class="region-item" onmouseenter="highlightRegion('${r.key}')" onmouseleave="unhighlightRegion('${r.key}')">
      <div class="region-info">
        <div class="region-name">
          ${qualified ? '<span class="qualified-badge">Supported</span>' : ''}
          ${esc(r.name)} <span class="region-sub-inline">${esc(r.fullName)}</span>
        </div>
        <div class="threshold-bar">
          <div class="threshold-fill" style="width:${pct * 100}%;background:${barColor}"></div>
        </div>
        <div class="region-sub">
          ${formatNumber(r.approvedHectares.toFixed(0))} / ${formatNumber(REGION_THRESHOLD)} ha approved
          &middot; ${r.count} parcel${r.count !== 1 ? 's' : ''}
          &middot; ${pctDisplay}%
        </div>
      </div>
      <div class="region-hectares">${formatNumber(r.hectares.toFixed(0))} <span>ha</span></div>
    </div>`;
  }).join('');
}

function renderProvinceList(metrics) {
  const list = document.getElementById('region-list');
  const allProvinces = Object.values(metrics.provinces).sort((a, b) => b.approvedHectares - a.approvedHectares);

  if (allProvinces.length === 0) {
    list.innerHTML = '<div class="recent-empty">No province data yet.</div>';
    return;
  }

  list.innerHTML = allProvinces.map(p => {
    const pct = Math.min(p.approvedHectares / PROVINCE_THRESHOLD, 1);
    const pctDisplay = (pct * 100).toFixed(1);
    const qualified = pct >= 1;
    const barColor = qualified ? '#1B5E20' : pct > 0.5 ? '#66BB6A' : pct > 0 ? '#F59E0B' : '#E5E7EB';
    const regionName = p.region && REGIONS[p.region] ? REGIONS[p.region].name : '';

    return `<div class="region-item">
      <div class="region-info">
        <div class="region-name">
          ${qualified ? '<span class="qualified-badge">Qualified</span>' : ''}
          ${esc(p.name)}
        </div>
        <div class="threshold-bar">
          <div class="threshold-fill" style="width:${pct * 100}%;background:${barColor}"></div>
        </div>
        <div class="region-sub">
          ${formatNumber(p.approvedHectares.toFixed(0))} / ${formatNumber(PROVINCE_THRESHOLD)} ha approved
          &middot; ${esc(regionName)}
          &middot; ${p.count} parcel${p.count !== 1 ? 's' : ''}
        </div>
      </div>
      <div class="region-hectares">${formatNumber(p.hectares.toFixed(0))} <span>ha</span></div>
    </div>`;
  }).join('');
}

function highlightRegion(key) {
  const marker = regionMarkers[key];
  if (marker) {
    marker.setStyle({ weight: 3, fillOpacity: 0.9 });
    marker.openTooltip();
  }
}

function unhighlightRegion(key) {
  const marker = regionMarkers[key];
  if (marker) {
    const subs = loadSubmissions().filter(s => s.owner && s.owner.region === key);
    marker.setStyle({ weight: 1.5, fillOpacity: subs.length > 0 ? 0.75 : 0.12 });
    marker.closeTooltip();
  }
}

// ======== Recent Activity ========

function renderRecentActivity(submissions) {
  const list = document.getElementById('recent-list');
  const recent = submissions
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  if (recent.length === 0) {
    list.innerHTML = '<div class="recent-empty">No submissions yet. Be the first to submit your land!</div>';
    return;
  }

  list.innerHTML = recent.map(s => {
    const regionCode = resolveRegionCode(s);
    const region = regionCode && REGIONS[regionCode] ? REGIONS[regionCode].name : '';
    const province = s.owner && s.owner.province ? s.owner.province : '';
    const location = [province, region].filter(Boolean).join(', ');
    const hectares = (s.land.acreage * 0.404686).toFixed(1);
    const timeAgo = getTimeAgo(new Date(s.created_at));
    const nameParts = (s.owner.name || '').split(' ');
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1][0]}.`
      : nameParts[0];

    return `<div class="recent-card">
      <div class="recent-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div class="recent-info">
        <div class="recent-name">${esc(maskedName)} — ${hectares} ha</div>
        <div class="recent-meta">${esc(location)} | ${timeAgo}</div>
      </div>
    </div>`;
  }).join('');
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ======== Helpers ========

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// ======== Auto-refresh ========
setInterval(() => {
  const submissions = loadSubmissions();
  const metrics = computeMetrics(submissions);
  renderHeroStats(metrics);
  if (currentView === 'regions') renderRegionList(metrics);
  else renderProvinceList(metrics);
  renderRecentActivity(submissions);
}, 30000);

// ======== Boot ========
init();
