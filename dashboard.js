/* ============================================
   EarthSama — Admin Dashboard
   KMZ + GeoJSON + CSV + Platform API Exports
   ============================================ */

let submissions = [];
let filtered = [];
let selected = new Set();
let detailMap = null;
let exportMode = 'all'; // 'all', 'selected', or a single ID

const STATUS_LABELS = { submitted: 'Submitted', in_review: 'In Review', in_discussion: 'In Discussion', approved: 'Approved', needs_docs: 'Needs Docs' };
const LAND_LABELS = { forest: 'Forest', grassland: 'Grassland', cropland: 'Cropland', wetland: 'Wetland', arid: 'Arid', mixed: 'Mixed' };
const USE_LABELS = { agriculture: 'Agriculture', timber: 'Timber', ranching: 'Ranching', conservation: 'Conservation', unused: 'Unused', other: 'Other' };
const ENTITY_LABELS = { individual: 'Individual', company: 'Company / LLC', trust: 'Trust', nonprofit: 'Non-profit', government: 'Government', other: 'Other' };
const REGION_LABELS = { ncr: 'NCR', car: 'CAR — Cordillera', region1: 'Region I — Ilocos', region2: 'Region II — Cagayan Valley', region3: 'Region III — Central Luzon', region4a: 'Region IV-A — CALABARZON', region4b: 'Region IV-B — MIMAROPA', region5: 'Region V — Bicol', region6: 'Region VI — Western Visayas', region7: 'Region VII — Central Visayas', region8: 'Region VIII — Eastern Visayas', region9: 'Region IX — Zamboanga Peninsula', region10: 'Region X — Northern Mindanao', region11: 'Region XI — Davao', region12: 'Region XII — SOCCSKSARGEN', region13: 'Region XIII — Caraga', barmm: 'BARMM — Bangsamoro' };

// ======== Init ========

function init() {
  loadSubmissions();
  renderStats();
  applyFilters();
  document.getElementById('filter-search').addEventListener('input', debounce(applyFilters, 200));
  document.getElementById('filter-status').addEventListener('change', applyFilters);
  document.getElementById('filter-land').addEventListener('change', applyFilters);
}

function loadSubmissions() {
  try {
    submissions = JSON.parse(localStorage.getItem('earthsama_submissions') || '[]');
    submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch { submissions = []; }
}

function renderStats() {
  document.getElementById('stat-total').textContent = submissions.length;
  document.getElementById('stat-submitted').textContent = submissions.filter(s => s.status === 'submitted').length;
  document.getElementById('stat-in_review').textContent = submissions.filter(s => s.status === 'in_review').length;
  document.getElementById('stat-in_discussion').textContent = submissions.filter(s => s.status === 'in_discussion').length;
  document.getElementById('stat-approved').textContent = submissions.filter(s => s.status === 'approved').length;
  document.getElementById('stat-needs_docs').textContent = submissions.filter(s => s.status === 'needs_docs').length;
}

// ======== Filters ========

function applyFilters() {
  const search = document.getElementById('filter-search').value.toLowerCase().trim();
  const status = document.getElementById('filter-status').value;
  const land = document.getElementById('filter-land').value;

  filtered = submissions.filter(s => {
    if (status && s.status !== status) return false;
    if (land && s.land.land_type !== land) return false;
    if (search) {
      const hay = [s.id, s.owner.name, s.owner.email, s.owner.phone, s.location.address, LAND_LABELS[s.land.land_type] || ''].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
  renderTable();
}

// ======== Table ========

function renderTable() {
  const tbody = document.getElementById('table-body');
  const empty = document.getElementById('empty-state');
  const tableWrap = document.querySelector('.table-wrap');

  if (filtered.length === 0) { tableWrap.style.display = 'none'; empty.style.display = 'block'; return; }
  tableWrap.style.display = 'block'; empty.style.display = 'none';

  tbody.innerHTML = filtered.map(s => {
    const dateStr = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const checked = selected.has(s.id) ? 'checked' : '';
    return `<tr>
      <td class="row-check"><input type="checkbox" ${checked} onchange="toggleSelect('${esc(s.id)}', this.checked)"></td>
      <td><strong style="font-size:0.82rem">${esc(s.id)}</strong></td>
      <td>${esc(s.owner.name)}</td>
      <td class="hide-mobile">${esc(s.owner.email)}</td>
      <td>${esc(String(s.land.acreage))}</td>
      <td class="hide-mobile">${LAND_LABELS[s.land.land_type] || '—'}</td>
      <td>
        <select class="status-select status-${s.status}" onchange="updateStatus('${esc(s.id)}', this.value)">
          <option value="submitted" ${s.status==='submitted'?'selected':''}>Submitted</option>
          <option value="in_review" ${s.status==='in_review'?'selected':''}>In Review</option>
          <option value="in_discussion" ${s.status==='in_discussion'?'selected':''}>In Discussion</option>
          <option value="approved" ${s.status==='approved'?'selected':''}>Approved</option>
          <option value="needs_docs" ${s.status==='needs_docs'?'selected':''}>Needs Docs</option>
        </select>
      </td>
      <td class="hide-mobile">${dateStr}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn" onclick="openDetail('${esc(s.id)}')" title="View">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="action-btn" onclick="openExportModal('${esc(s.id)}')" title="Export">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="action-btn action-btn-danger" onclick="deleteSubmission('${esc(s.id)}')" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ======== Selection ========

function toggleSelect(id, checked) { if (checked) selected.add(id); else selected.delete(id); updateBulkBar(); }
function toggleSelectAll(checked) {
  if (checked) filtered.forEach(s => selected.add(s.id)); else selected.clear();
  updateBulkBar(); renderTable();
}
function clearSelection() { selected.clear(); document.getElementById('select-all').checked = false; updateBulkBar(); renderTable(); }
function updateBulkBar() {
  const bar = document.getElementById('bulk-bar');
  if (selected.size > 0) { bar.style.display = 'flex'; document.getElementById('bulk-count').textContent = `${selected.size} selected`; }
  else { bar.style.display = 'none'; }
}

// ======== Status / Delete ========

function updateStatus(id, status) {
  const s = submissions.find(x => x.id === id);
  if (s) { s.status = status; s.updated_at = new Date().toISOString(); saveSubmissions(); renderStats(); applyFilters(); }
}

function deleteSubmission(id) {
  if (!confirm('Delete this submission? This cannot be undone.')) return;
  submissions = submissions.filter(s => s.id !== id);
  selected.delete(id);
  saveSubmissions(); renderStats(); applyFilters(); updateBulkBar();
}

// ======== Detail Panel ========

function openDetail(id) {
  const s = submissions.find(x => x.id === id);
  if (!s) return;

  document.getElementById('detail-title').textContent = s.id;
  const dateStr = new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const addr = s.location.address || '—';
  const shortAddr = addr.length > 100 ? addr.substring(0, 97) + '...' : addr;
  const docsHtml = s.documents && s.documents.length > 0
    ? s.documents.map(d => `<div style="font-size:0.82rem;padding:0.25rem 0">${esc(d.name)} <span style="color:var(--text-muted)">(${formatSize(d.size)})</span></div>`).join('')
    : '<span style="color:var(--text-muted);font-size:0.82rem">No documents</span>';

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-section"><h4>Owner</h4>
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-item-label">Name</span><span class="detail-item-value">${esc(s.owner.name)}</span></div>
        <div class="detail-item"><span class="detail-item-label">Email</span><span class="detail-item-value">${esc(s.owner.email)}</span></div>
        <div class="detail-item"><span class="detail-item-label">Phone</span><span class="detail-item-value">${esc(s.owner.phone||'—')}</span></div>
        <div class="detail-item"><span class="detail-item-label">Region</span><span class="detail-item-value">${esc(s.owner.region||'—')}</span></div>
        <div class="detail-item"><span class="detail-item-label">Province</span><span class="detail-item-value">${esc(s.owner.province||'—')}</span></div>
        <div class="detail-item"><span class="detail-item-label">Municipality</span><span class="detail-item-value">${esc(s.owner.municipality||'—')}</span></div>
        <div class="detail-item"><span class="detail-item-label">Barangay</span><span class="detail-item-value">${esc(s.owner.barangay||'—')}</span></div>
        <div class="detail-item"><span class="detail-item-label">Entity</span><span class="detail-item-value">${ENTITY_LABELS[s.owner.entity_type]||'—'}</span></div>
      </div>
    </div>
    <div class="detail-section"><h4>Land</h4>
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-item-label">Acreage</span><span class="detail-item-value">${s.land.acreage} acres</span></div>
        <div class="detail-item"><span class="detail-item-label">Years Owned</span><span class="detail-item-value">${s.land.years_owned}</span></div>
        <div class="detail-item"><span class="detail-item-label">Land Type</span><span class="detail-item-value">${LAND_LABELS[s.land.land_type]||'—'}</span></div>
        <div class="detail-item"><span class="detail-item-label">Current Use</span><span class="detail-item-value">${USE_LABELS[s.land.current_use]||'—'}</span></div>
        <div class="detail-item"><span class="detail-item-label">Encumbrances</span><span class="detail-item-value">${s.land.has_encumbrances?'Yes':'No'}</span></div>
        ${s.land.encumbrance_detail?`<div class="detail-item"><span class="detail-item-label">Details</span><span class="detail-item-value">${esc(s.land.encumbrance_detail)}</span></div>`:''}
      </div>
    </div>
    <div class="detail-section"><h4>Documents</h4>${docsHtml}</div>
    <div class="detail-section"><h4>Location</h4>
      <div class="detail-grid">
        <div class="detail-item" style="grid-column:span 2"><span class="detail-item-label">Address</span><span class="detail-item-value">${esc(shortAddr)}</span></div>
        <div class="detail-item"><span class="detail-item-label">Coordinates</span><span class="detail-item-value">${s.location.lat?s.location.lat.toFixed(5)+', '+s.location.lng.toFixed(5):'—'}</span></div>
        <div class="detail-item"><span class="detail-item-label">Drawn Area</span><span class="detail-item-value">${s.location.area_acres?'~'+s.location.area_acres+' acres':'—'}</span></div>
      </div>
      <div class="detail-map" id="detail-map-el"></div>
    </div>
    <div class="detail-section"><h4>Meta</h4>
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-item-label">Submitted</span><span class="detail-item-value">${dateStr}</span></div>
        <div class="detail-item"><span class="detail-item-label">Status</span><span class="detail-item-value"><span class="status-badge status-${s.status}">${STATUS_LABELS[s.status] || s.status}</span></span></div>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary btn-sm" onclick="closeDetail();openExportModal('${esc(s.id)}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </button>
    </div>`;

  document.getElementById('detail-panel').style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (s.location.lat) {
    setTimeout(() => {
      const el = document.getElementById('detail-map-el');
      if (!el) return;
      if (detailMap) { detailMap.remove(); detailMap = null; }
      detailMap = L.map(el, { center:[s.location.lat,s.location.lng], zoom:14, zoomControl:false, dragging:false, scrollWheelZoom:false, doubleClickZoom:false, touchZoom:false, attributionControl:false });
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:19}).addTo(detailMap);
      if (s.location.polygon && s.location.polygon.length >= 3) {
        const poly = L.polygon(s.location.polygon, {color:'#a67c1a',weight:2,fillColor:'#a67c1a',fillOpacity:0.25}).addTo(detailMap);
        detailMap.fitBounds(poly.getBounds(), {padding:[20,20]});
      } else { L.marker([s.location.lat,s.location.lng]).addTo(detailMap); }
    }, 200);
  }
}

function closeDetail() {
  document.getElementById('detail-panel').style.display = 'none';
  document.body.style.overflow = '';
  if (detailMap) { detailMap.remove(); detailMap = null; }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDetail(); closeExportModal(); } });

// ======== Export Modal ========

function openExportModal(mode) {
  exportMode = mode;
  const subs = getExportSubs();
  if (subs.length === 0) { alert('No submissions with location data to export.'); return; }

  document.getElementById('export-count').textContent = `${subs.length} parcel${subs.length === 1 ? '' : 's'}`;
  document.getElementById('export-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeExportModal() {
  document.getElementById('export-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function getExportSubs() {
  if (exportMode === 'all') return submissions.filter(s => s.location && s.location.lat);
  if (exportMode === 'selected') return submissions.filter(s => selected.has(s.id) && s.location && s.location.lat);
  // Single ID
  const s = submissions.find(x => x.id === exportMode);
  return s && s.location && s.location.lat ? [s] : [];
}

async function doExport(format) {
  const subs = getExportSubs();
  if (subs.length === 0) { alert('No exportable submissions.'); return; }

  closeExportModal();

  switch (format) {
    case 'kml': downloadFile(buildBulkKML(subs), `earthsama-${subs.length}-parcels.kml`, 'application/vnd.google-earth.kml+xml'); break;
    case 'kmz': await exportKMZ(subs); break;
    case 'geojson': downloadFile(JSON.stringify(buildGeoJSON(subs), null, 2), `earthsama-${subs.length}-parcels.geojson`, 'application/geo+json'); break;
    case 'csv': downloadFile(buildCSV(subs), `earthsama-${subs.length}-parcels.csv`, 'text/csv'); break;
    case 'restor': downloadFile(JSON.stringify(buildRestorPayload(subs), null, 2), `earthsama-restor-${subs.length}.json`, 'application/json'); break;
    case 'gee': downloadFile(JSON.stringify(buildGEEPayload(subs), null, 2), `earthsama-gee-${subs.length}.json`, 'application/json'); break;
    case 'earthsama': downloadFile(JSON.stringify(buildEarthSamaPayload(subs), null, 2), `earthsama-earthsama-${subs.length}.json`, 'application/json'); break;
    case 'zip': await exportFullZip(subs); break;
  }
}

// ======== KML Builder ========

function buildPlacemarkGeometry(s) {
  if (s.location.polygon && s.location.polygon.length >= 3) {
    const coords = s.location.polygon.map(p => `${p[1]},${p[0]},0`).join(' ');
    const f = s.location.polygon[0];
    return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${coords} ${f[1]},${f[0]},0</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
  }
  if (s.location.lat) return `<Point><coordinates>${s.location.lng},${s.location.lat},0</coordinates></Point>`;
  return '';
}

function buildBulkKML(subs) {
  const placemarks = subs.map(s => {
    const area = s.location.area_acres ? ` | ~${s.location.area_acres} ac` : '';
    return `    <Placemark>
      <name>${escXml(s.owner.name)} - ${escXml(s.id)}</name>
      <description>${escXml(s.land.acreage + ' acres | ' + (LAND_LABELS[s.land.land_type]||'') + area)}
Status: ${escXml(s.status)}
${escXml(s.location.address||'')}</description>
      <styleUrl>#boundary</styleUrl>
      ${buildPlacemarkGeometry(s)}
    </Placemark>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>EarthSama Export - ${subs.length} Parcels</name>
    <description>Exported ${new Date().toISOString()}</description>
    <Style id="boundary">
      <LineStyle><color>ff205e1b</color><width>2</width></LineStyle>
      <PolyStyle><color>404caf50</color></PolyStyle>
    </Style>
    <Style id="boundaryApproved">
      <LineStyle><color>ff4caf50</color><width>3</width></LineStyle>
      <PolyStyle><color>6044bb44</color></PolyStyle>
    </Style>
${placemarks}
  </Document>
</kml>`;
}

// ======== KMZ (Zipped KML) ========

async function exportKMZ(subs) {
  const zip = new JSZip();
  const kml = buildBulkKML(subs);
  zip.file('doc.kml', kml);

  // Add metadata JSON
  const meta = subs.map(s => ({
    id: s.id, status: s.status, owner: s.owner.name, email: s.owner.email,
    acreage: s.land.acreage, land_type: s.land.land_type, current_use: s.land.current_use,
    lat: s.location.lat, lng: s.location.lng, area_acres: s.location.area_acres,
    submitted: s.created_at
  }));
  zip.file('metadata.json', JSON.stringify(meta, null, 2));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  triggerDownload(blob, `earthsama-${subs.length}-parcels.kmz`);
}

// ======== GeoJSON ========

function buildGeoJSON(subs) {
  return {
    type: 'FeatureCollection',
    name: 'EarthSama Submissions',
    generated: new Date().toISOString(),
    features: subs.map(s => {
      let geometry = null;
      if (s.location.polygon && s.location.polygon.length >= 3) {
        // GeoJSON polygon: [lng, lat] and closed ring
        const ring = s.location.polygon.map(p => [p[1], p[0]]);
        ring.push([s.location.polygon[0][1], s.location.polygon[0][0]]);
        geometry = { type: 'Polygon', coordinates: [ring] };
      } else if (s.location.lat) {
        geometry = { type: 'Point', coordinates: [s.location.lng, s.location.lat] };
      }

      return {
        type: 'Feature',
        id: s.id,
        geometry,
        properties: {
          id: s.id,
          status: s.status,
          owner_name: s.owner.name,
          owner_email: s.owner.email,
          owner_phone: s.owner.phone || null,
          owner_region: s.owner.region || null,
          owner_province: s.owner.province || null,
          entity_type: s.owner.entity_type,
          acreage: s.land.acreage,
          land_type: s.land.land_type,
          current_use: s.land.current_use,
          years_owned: s.land.years_owned,
          has_encumbrances: s.land.has_encumbrances,
          area_acres_drawn: s.location.area_acres || null,
          address: s.location.address || null,
          submitted_at: s.created_at,
          documents: (s.documents || []).map(d => d.name)
        }
      };
    })
  };
}

// ======== CSV ========

function buildCSV(subs) {
  const headers = ['id','status','owner_name','owner_email','owner_phone','owner_region','owner_province','owner_municipality','owner_barangay','entity_type','acreage','land_type','current_use','years_owned','has_encumbrances','latitude','longitude','area_acres_drawn','address','submitted_at','documents'];

  const rows = subs.map(s => [
    s.id, s.status, s.owner.name, s.owner.email, s.owner.phone||'',
    s.owner.region||'', s.owner.province||'', s.owner.municipality||'', s.owner.barangay||'', s.owner.entity_type, s.land.acreage, s.land.land_type, s.land.current_use,
    s.land.years_owned, s.land.has_encumbrances ? 'Yes' : 'No',
    s.location.lat, s.location.lng, s.location.area_acres||'',
    s.location.address||'', s.created_at,
    (s.documents||[]).map(d => d.name).join('; ')
  ]);

  const csvEsc = v => {
    const str = String(v ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? '"' + str.replace(/"/g, '""') + '"' : str;
  };

  return [headers.join(','), ...rows.map(r => r.map(csvEsc).join(','))].join('\n');
}

// ======== Restor.eco Adapter ========

function buildRestorPayload(subs) {
  return {
    _format: 'restor.eco',
    _version: '1.0',
    _exported: new Date().toISOString(),
    _description: 'Import this file into restor.eco to register monitoring sites. Each feature represents a land parcel submitted for project case development.',
    _instructions: 'Go to restor.eco > My Sites > Import > Upload GeoJSON. This payload is a GeoJSON FeatureCollection with Restor-compatible properties.',
    type: 'FeatureCollection',
    features: subs.map(s => {
      let geometry = null;
      if (s.location.polygon && s.location.polygon.length >= 3) {
        const ring = s.location.polygon.map(p => [p[1], p[0]]);
        ring.push([s.location.polygon[0][1], s.location.polygon[0][0]]);
        geometry = { type: 'Polygon', coordinates: [ring] };
      } else if (s.location.lat) {
        geometry = { type: 'Point', coordinates: [s.location.lng, s.location.lat] };
      }

      return {
        type: 'Feature',
        geometry,
        properties: {
          name: `${s.owner.name} - ${s.id}`,
          site_type: 'carbon_project',
          ecosystem: mapToRestorEcosystem(s.land.land_type),
          area_ha: s.location.area_acres ? (s.location.area_acres * 0.404686).toFixed(2) : null,
          intervention: mapToRestorIntervention(s.land.current_use),
          status: s.status,
          owner: s.owner.name,
          contact_email: s.owner.email,
          start_date: s.created_at.split('T')[0],
          notes: `${s.land.acreage} acres | ${LAND_LABELS[s.land.land_type]||''} | ${USE_LABELS[s.land.current_use]||''}`
        }
      };
    })
  };
}

function mapToRestorEcosystem(landType) {
  const map = { forest: 'tropical_forest', grassland: 'grassland', cropland: 'cropland', wetland: 'wetland', arid: 'dryland', mixed: 'mosaic' };
  return map[landType] || 'other';
}

function mapToRestorIntervention(use) {
  const map = { agriculture: 'agroforestry', timber: 'reforestation', ranching: 'silvopasture', conservation: 'protection', unused: 'restoration' };
  return map[use] || 'other';
}

// ======== Google Earth Engine Adapter ========

function buildGEEPayload(subs) {
  return {
    _format: 'google_earth_engine',
    _version: '1.0',
    _exported: new Date().toISOString(),
    _description: 'GEE-compatible FeatureCollection. Import via ee.FeatureCollection() from GeoJSON or upload as an asset in the GEE Code Editor.',
    _instructions: 'Upload to GEE: Code Editor > Assets > New > Table Upload > Select this file. Properties are mapped to GEE feature properties for filtering and analysis.',
    type: 'FeatureCollection',
    columns: {
      id: 'String', status: 'String', owner_name: 'String', region: 'String', province: 'String',
      acreage: 'Float', land_type: 'String', current_use: 'String',
      area_ha: 'Float', submitted_at: 'String'
    },
    features: subs.map(s => {
      let geometry = null;
      if (s.location.polygon && s.location.polygon.length >= 3) {
        const ring = s.location.polygon.map(p => [p[1], p[0]]);
        ring.push([s.location.polygon[0][1], s.location.polygon[0][0]]);
        geometry = { type: 'Polygon', coordinates: [ring] };
      } else if (s.location.lat) {
        geometry = { type: 'Point', coordinates: [s.location.lng, s.location.lat] };
      }

      return {
        type: 'Feature',
        geometry,
        properties: {
          system_index: s.id,
          id: s.id,
          status: s.status,
          owner_name: s.owner.name,
          region: s.owner.region || null,
          province: s.owner.province || null,
          acreage: s.land.acreage,
          land_type: s.land.land_type,
          current_use: s.land.current_use,
          years_owned: s.land.years_owned,
          area_ha: s.location.area_acres ? parseFloat((s.location.area_acres * 0.404686).toFixed(4)) : null,
          submitted_at: s.created_at
        }
      };
    })
  };
}

// ======== EarthSama Mobile Farming App Adapter ========

function buildEarthSamaPayload(subs) {
  return {
    _format: 'earthsama',
    _version: '1.1',
    _schema: '1.0',
    _exported: new Date().toISOString(),
    _count: subs.length,
    _total_hectares: parseFloat(subs.reduce((sum, s) => sum + (s.land.acreage || 0) * 0.404686, 0).toFixed(2)),
    _description: 'API-ready payload for the EarthSama farm & carbon platform. POST to bulk-import parcels with owner, geospatial, carbon, and value chain keypairs.',
    api: {
      endpoint: '/api/v1/parcels/bulk-import',
      method: 'POST',
      content_type: 'application/json',
      auth: 'Bearer <your-api-token>',
      idempotency: 'external_id'
    },
    parcels: subs.map(s => {
      let boundary = null;
      if (s.location.polygon && s.location.polygon.length >= 3) {
        const ring = s.location.polygon.map(p => ({ lat: p[0], lng: p[1] }));
        ring.push({ lat: s.location.polygon[0][0], lng: s.location.polygon[0][1] });
        boundary = { type: 'polygon', coordinates: ring };
      } else if (s.location.lat) {
        boundary = { type: 'point', coordinates: { lat: s.location.lat, lng: s.location.lng } };
      }

      // Derive hectares for all area fields
      const acreage = s.land.acreage || 0;
      const hectares = parseFloat((acreage * 0.404686).toFixed(4));
      const areaAcresCalc = s.location.area_acres || null;
      const areaHaCalc = areaAcresCalc ? parseFloat((areaAcresCalc * 0.404686).toFixed(4)) : null;

      return {
        // === IDENTITY ===
        external_id: s.id,
        source: 'earthsama-onboard',
        source_version: '3.1',
        status: s.status,
        created_at: s.created_at,
        updated_at: s.updated_at || s.created_at,

        // === OWNER / FARMER PROFILE ===
        // Keypair contract: downstream platform creates farmer_id on ingest
        owner: {
          name: s.owner.name,
          email: s.owner.email,
          phone: s.owner.phone || null,
          entity_type: s.owner.entity_type,
          // PH administrative hierarchy — PSGC-aligned codes
          region: s.owner.region || null,
          region_code: s.owner.region_code || null,
          province: s.owner.province || null,
          province_code: s.owner.province_code || null,
          municipality: s.owner.municipality || null,
          municipality_code: s.owner.municipality_code || null,
          barangay: s.owner.barangay || null
        },

        // === PARCEL / LAND ===
        parcel: {
          name: `${s.owner.name} - ${LAND_LABELS[s.land.land_type] || 'Land'}`,
          acreage: acreage,
          hectares: hectares,
          land_type: s.land.land_type,
          land_type_label: LAND_LABELS[s.land.land_type] || null,
          current_use: s.land.current_use,
          current_use_label: USE_LABELS[s.land.current_use] || null,
          years_owned: s.land.years_owned,
          has_encumbrances: s.land.has_encumbrances,
          encumbrance_detail: s.land.encumbrance_detail || null
        },

        // === GEOSPATIAL ===
        location: {
          address: s.location.address || null,
          center: { lat: s.location.lat, lng: s.location.lng },
          boundary: boundary,
          area_acres_calculated: areaAcresCalc,
          area_hectares_calculated: areaHaCalc,
          // GeoJSON-compatible geometry for direct map ingestion
          geojson: boundary && boundary.type === 'polygon'
            ? { type: 'Polygon', coordinates: [s.location.polygon.map(p => [p[1], p[0]]).concat([[s.location.polygon[0][1], s.location.polygon[0][0]]])] }
            : s.location.lat ? { type: 'Point', coordinates: [s.location.lng, s.location.lat] }
            : null
        },

        // === CARBON / AGRICARBON ===
        carbon: {
          eligible: s.status === 'approved',
          assessment_status: s.status,
          submitted_at: s.created_at,
          approved_at: s.status === 'approved' ? (s.updated_at || null) : null,
          program: 'earthsama',
          // Downstream platform populates these after field verification
          project_id: null,
          methodology: null,
          baseline_year: null,
          crediting_period_years: null,
          estimated_annual_tco2e: null
        },

        // === FOOD SECURITY / VALUE CHAIN ===
        valuechain: {
          // Downstream platform populates after farmer onboarding
          crop_types: [],
          harvest_cycle: null,
          cooperative_id: null,
          supply_chain_tier: null,
          traceability_id: null
        },

        // === DOCUMENTS ===
        documents: (s.documents || []).map(d => ({
          filename: d.name,
          size_bytes: d.size,
          mime_type: d.type,
          // Downstream platform populates after upload to object storage
          storage_url: null,
          verified: false
        })),

        // === KML ===
        kml: s.kml || null,

        // === METADATA ===
        metadata: {
          imported_at: new Date().toISOString(),
          source_platform: 'EarthSama Land Submission Portal',
          source_version: '3.1',
          schema_version: '1.0',
          // Thresholds context for region/province qualification
          thresholds: {
            region_goal_ha: 100000,
            province_goal_ha: 10000
          }
        }
      };
    })
  };
}

// ======== Full ZIP Bundle ========

async function exportFullZip(subs) {
  const zip = new JSZip();
  const ts = new Date().toISOString().split('T')[0];

  // KML
  zip.file(`earthsama-${ts}.kml`, buildBulkKML(subs));

  // GeoJSON
  zip.file(`earthsama-${ts}.geojson`, JSON.stringify(buildGeoJSON(subs), null, 2));

  // CSV
  zip.file(`earthsama-${ts}.csv`, buildCSV(subs));

  // Platform JSONs
  const platforms = zip.folder('platforms');
  platforms.file('restor.json', JSON.stringify(buildRestorPayload(subs), null, 2));
  platforms.file('google-earth-engine.json', JSON.stringify(buildGEEPayload(subs), null, 2));
  platforms.file('earthsama.json', JSON.stringify(buildEarthSamaPayload(subs), null, 2));

  // Individual KMLs per parcel
  const parcels = zip.folder('individual-parcels');
  subs.forEach(s => {
    parcels.file(`${s.id}.kml`, buildBulkKML([s]));
  });

  // README
  zip.file('README.txt', `EarthSama Export Bundle
========================
Generated: ${new Date().toISOString()}
Parcels: ${subs.length}

Files included:
- earthsama-${ts}.kml          → Open in Google Earth (all parcels)
- earthsama-${ts}.geojson      → Standard GeoJSON for web maps, APIs
- earthsama-${ts}.csv          → Spreadsheet with all submission fields
- platforms/restor.json          → Import into restor.eco
- platforms/google-earth-engine.json → Upload as GEE asset
- platforms/earthsama.json       → POST to EarthSama API
- individual-parcels/            → One KML file per parcel

Usage:
  Google Earth:  Open the .kml file directly
  Restor.eco:    My Sites > Import > Upload restor.json
  GEE:           Code Editor > Assets > Table Upload > google-earth-engine.json
  EarthSama:     POST platforms/earthsama.json to /api/v1/parcels/bulk-import
  QGIS/ArcGIS:   Import .kml or .geojson
`);

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  triggerDownload(blob, `earthsama-export-${subs.length}-parcels-${ts}.zip`);
}

// ======== Download Helpers ========

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ======== Persistence ========

function saveSubmissions() {
  try { localStorage.setItem('earthsama_submissions', JSON.stringify(submissions)); }
  catch (e) { console.error('Save error:', e); }
}

// ======== Helpers ========

function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function escXml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function formatSize(b) { if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(0)+' KB'; return (b/1048576).toFixed(1)+' MB'; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(()=>fn(...a), ms); }; }

// ======== Error Panel ========

function toggleErrorPanel() {
  const panel = document.getElementById('error-panel');
  const isVisible = panel.style.display !== 'none';
  panel.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) renderErrors();
}

function refreshErrors() {
  renderErrors();
}

function clearErrors() {
  if (typeof EarthSamaLog !== 'undefined') EarthSamaLog.clear();
  renderErrors();
}

function getErrorLog() {
  try { return JSON.parse(localStorage.getItem('earthsama_errors') || '[]'); }
  catch { return []; }
}

function renderErrors() {
  const errors = getErrorLog();
  const typeFilter = document.getElementById('error-filter-type').value;
  const pageFilter = document.getElementById('error-filter-page').value;

  const filtered = errors.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (pageFilter && e.page !== pageFilter) return false;
    return true;
  });

  // Update badge
  const badge = document.getElementById('error-badge');
  if (errors.length > 0) {
    badge.style.display = 'inline';
    badge.textContent = errors.length;
  } else {
    badge.style.display = 'none';
  }

  document.getElementById('error-summary').textContent = `${filtered.length} of ${errors.length} errors`;

  const list = document.getElementById('error-list');

  if (filtered.length === 0) {
    list.innerHTML = '<div class="error-empty">No errors logged</div>';
    return;
  }

  const TYPE_COLORS = {
    js_error: '#DC2626',
    promise_rejection: '#D97706',
    fetch_error: '#2563EB',
    console_error: '#7C3AED',
    manual: '#6B7280'
  };

  const TYPE_LABELS = {
    js_error: 'JS Error',
    promise_rejection: 'Promise',
    fetch_error: 'Fetch',
    console_error: 'Console',
    manual: 'Log'
  };

  list.innerHTML = filtered.map((e, i) => {
    const color = TYPE_COLORS[e.type] || '#6B7280';
    const label = TYPE_LABELS[e.type] || e.type;
    const time = new Date(e.timestamp);
    const timeStr = time.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) +
      ' ' + time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let details = '';
    if (e.file) details += `<span class="err-detail">File: ${esc(e.file)}${e.line ? ':' + e.line : ''}</span>`;
    if (e.fetchUrl) details += `<span class="err-detail">URL: ${esc(e.fetchUrl)}</span>`;
    if (e.status) details += `<span class="err-detail">Status: ${e.status}</span>`;

    const stackHtml = e.stack
      ? `<details class="err-stack-wrap"><summary>Stack trace</summary><pre class="err-stack">${esc(e.stack)}</pre></details>`
      : '';

    return `<div class="err-item">
      <div class="err-header">
        <span class="err-type" style="background:${color}">${label}</span>
        <span class="err-page">${esc(e.page || '')}</span>
        <span class="err-time">${timeStr}</span>
      </div>
      <div class="err-message">${esc(e.message)}</div>
      ${details ? '<div class="err-details">' + details + '</div>' : ''}
      ${stackHtml}
    </div>`;
  }).join('');
}

// Update error badge on load
function updateErrorBadge() {
  const errors = getErrorLog();
  const badge = document.getElementById('error-badge');
  if (errors.length > 0) {
    badge.style.display = 'inline';
    badge.textContent = errors.length;
  }
}

// ======== Boot ========
init();
updateErrorBadge();
