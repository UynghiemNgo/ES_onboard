/* ============================================
   EarthSama — App Logic
   Typeform-style one-question-at-a-time flow
   Leaflet + KML import/export + Doc upload
   ============================================ */

// ======== Slide IDs in order ========
const SLIDES = [
  'q-name', 'q-email', 'q-phone', 'q-location', 'q-entity',
  'q-land-size', 'q-land-type', 'q-use', 'q-encumbrance', 'q-docs',
  'q-map', 'q-review'
];
const TOTAL_SLIDES = SLIDES.length;

let currentSlide = 0;
let transitioning = false;
let map = null;
let mapMode = 'draw';
let marker = null;
let drawnItems = null;
let currentPolygon = null;
let polygonLatLngs = [];
let selectedLocation = { address: '', lat: null, lng: null, polygon: [], areaAcres: null };
let kmlString = '';
let uploadedDocuments = [];
let layers = {};
let activeLayer = null;

// ======== Typeform Navigation ========

function tfNext() {
  if (transitioning) return;
  if (!validateSlide(currentSlide)) return;
  if (currentSlide < SLIDES.length - 1) {
    tfGo(currentSlide + 1, 'down');
  }
}

function tfPrev() {
  if (transitioning) return;
  if (currentSlide > 0) {
    tfGo(currentSlide - 1, 'up');
  }
}

function tfGoTo(slideId) {
  const idx = SLIDES.indexOf(slideId);
  if (idx >= 0 && idx !== currentSlide) {
    tfGo(idx, idx > currentSlide ? 'down' : 'up');
  }
}

function tfGo(nextIdx, direction) {
  if (transitioning || nextIdx === currentSlide) return;
  transitioning = true;

  const oldSlide = document.getElementById(SLIDES[currentSlide]);
  const newSlide = document.getElementById(SLIDES[nextIdx]);

  // If going to review, populate it
  if (SLIDES[nextIdx] === 'q-review') populateReview();

  // Animate out
  oldSlide.classList.add(direction === 'down' ? 'tf-out-up' : 'tf-out-down');

  setTimeout(() => {
    oldSlide.classList.remove('active', 'tf-out-up', 'tf-out-down');
    newSlide.classList.add('active', direction === 'down' ? 'tf-in-up' : 'tf-in-down');

    currentSlide = nextIdx;
    updateProgress();

    // Auto-focus input
    setTimeout(() => {
      newSlide.classList.remove('tf-in-up', 'tf-in-down');
      transitioning = false;

      const input = newSlide.querySelector('input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]), textarea');
      if (input && input.offsetParent !== null) input.focus();

      // Init map if map slide
      if (SLIDES[nextIdx] === 'q-map') {
        if (!map) setTimeout(() => { initMap(); preCenterMap(); }, 100);
        else setTimeout(() => { map.invalidateSize(); preCenterMap(); }, 100);

        // Auto-show tutorial on first visit
        if (!localStorage.getItem('earthsama_tut_seen')) {
          setTimeout(openTutorial, 500);
          localStorage.setItem('earthsama_tut_seen', '1');
        }
      }
    }, 350);
  }, 250);
}

function updateProgress() {
  const pct = ((currentSlide + 1) / TOTAL_SLIDES * 100);
  document.getElementById('tf-progress').style.width = pct + '%';

  // Bottom bar: back button + counter
  const backBtn = document.getElementById('tf-back');
  backBtn.style.visibility = currentSlide > 0 ? 'visible' : 'hidden';
  document.getElementById('tf-counter').textContent = `${currentSlide + 1} of ${TOTAL_SLIDES}`;
}

// ======== Typeform Card Selection ========

function tfSelectCard(btn) {
  const container = btn.closest('.tf-cards');
  container.querySelectorAll('.tf-card').forEach(c => c.classList.remove('selected'));
  btn.classList.add('selected');

  // Set hidden field value
  const slide = btn.closest('.tf-slide');
  const hidden = slide.querySelector('input[type="hidden"]');
  if (hidden) hidden.value = btn.dataset.val;

  // Auto-advance after short delay
  setTimeout(() => tfNext(), 300);
}

function tfSelectEncumbrance(btn) {
  const container = btn.closest('.tf-cards');
  container.querySelectorAll('.tf-card').forEach(c => c.classList.remove('selected'));
  btn.classList.add('selected');

  const detailGroup = document.getElementById('encumbrance-detail-group');
  if (btn.dataset.val === 'yes') {
    detailGroup.style.display = 'block';
    setTimeout(() => document.getElementById('encumbrance-detail').focus(), 100);
  } else {
    detailGroup.style.display = 'none';
  }
}

// ======== Keyboard: Enter to continue ========

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const active = document.querySelector('.tf-slide.active');
    if (!active) return;

    // Don't intercept Enter on textarea
    if (e.target.tagName === 'TEXTAREA') return;
    // Don't intercept when autocomplete is open
    const acList = document.getElementById('location-search-list');
    if (acList && acList.classList.contains('active')) return;

    e.preventDefault();
    tfNext();
  }

  // A-F keys to select cards on card slides
  const key = e.key.toUpperCase();
  if (key >= 'A' && key <= 'F' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const active = document.querySelector('.tf-slide.active');
    if (!active) return;
    // Only trigger if no input is focused
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    const cards = active.querySelectorAll('.tf-card');
    const idx = key.charCodeAt(0) - 65; // A=0, B=1, etc.
    if (idx < cards.length) {
      cards[idx].click();
    }
  }
});

// ======== PSGC Smart Location Search ========

let barangaysLoaded = false;
let locationIndex = null;
let selectedLocationData = null;

function buildLocationIndex() {
  if (locationIndex) return;
  locationIndex = [];

  for (const [regionCode, regionName] of Object.entries(PH_GEO.regions)) {
    const provs = PH_GEO.provinces[regionCode] || [];
    for (const prov of provs) {
      locationIndex.push({
        type: 'province',
        display: prov.n,
        sub: regionName,
        province: prov.n, provinceCode: prov.c,
        region: regionName, regionCode: regionCode,
        municipality: '', municipalityCode: '', barangay: '',
        searchText: prov.n.toLowerCase()
      });

      const munis = PH_GEO.municipalities[prov.c] || [];
      for (const muni of munis) {
        locationIndex.push({
          type: 'municipality',
          display: muni.n,
          sub: `${prov.n}, ${regionName}`,
          municipality: muni.n, municipalityCode: muni.c,
          province: prov.n, provinceCode: prov.c,
          region: regionName, regionCode: regionCode,
          barangay: '',
          searchText: muni.n.toLowerCase()
        });
      }
    }
  }
}

function addBarangaysToIndex() {
  if (typeof PH_BARANGAYS === 'undefined') return;
  const muniLookup = {};
  for (const item of locationIndex) {
    if (item.type === 'municipality') muniLookup[item.municipalityCode] = item;
  }

  for (const [muniCode, brgys] of Object.entries(PH_BARANGAYS)) {
    const parent = muniLookup[muniCode];
    if (!parent) continue;
    for (const brgyName of brgys) {
      locationIndex.push({
        type: 'barangay',
        display: brgyName,
        sub: `${parent.municipality}, ${parent.province}`,
        barangay: brgyName,
        municipality: parent.municipality, municipalityCode: muniCode,
        province: parent.province, provinceCode: parent.provinceCode,
        region: parent.region, regionCode: parent.regionCode,
        searchText: brgyName.toLowerCase()
      });
    }
  }
}

function initLocationSearch() {
  const input = document.getElementById('location-search');
  const list = document.getElementById('location-search-list');
  let highlighted = -1;
  let debounceTimer = null;

  if (!barangaysLoaded) {
    const script = document.createElement('script');
    script.src = 'ph-barangays.js';
    script.onload = () => {
      barangaysLoaded = true;
      buildLocationIndex();
      addBarangaysToIndex();
    };
    document.head.appendChild(script);
  }

  buildLocationIndex();

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      list.innerHTML = '';
      highlighted = -1;
      if (q.length < 2) { list.classList.remove('active'); return; }

      const starts = [];
      const contains = [];
      for (const item of locationIndex) {
        if (starts.length + contains.length >= 40) break;
        if (item.searchText.startsWith(q)) starts.push(item);
        else if (item.searchText.includes(q)) contains.push(item);
      }
      const matches = [...starts, ...contains].slice(0, 25);

      if (matches.length === 0) {
        list.innerHTML = '<div class="autocomplete-empty">No matches found</div>';
        list.classList.add('active');
        return;
      }

      matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        const typeLabel = item.type === 'barangay' ? 'Brgy' : item.type === 'municipality' ? 'Muni/City' : 'Province';
        const idx = item.display.toLowerCase().indexOf(q);
        const nameHtml = idx >= 0
          ? item.display.substring(0, idx) + '<mark>' + item.display.substring(idx, idx + q.length) + '</mark>' + item.display.substring(idx + q.length)
          : item.display;
        div.innerHTML = `<div>${nameHtml} <span style="font-size:0.65rem;color:var(--text-muted);font-weight:500">${typeLabel}</span></div><div class="autocomplete-item-sub">${item.sub}</div>`;
        div.addEventListener('click', () => selectLocation(item));
        list.appendChild(div);
      });
      list.classList.add('active');
    }, 120);
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.autocomplete-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlighted = Math.min(highlighted + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('highlighted', i === highlighted));
      if (items[highlighted]) items[highlighted].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlighted = Math.max(highlighted - 1, 0);
      items.forEach((el, i) => el.classList.toggle('highlighted', i === highlighted));
      if (items[highlighted]) items[highlighted].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && items[highlighted]) {
        e.preventDefault();
        e.stopPropagation();
        items[highlighted].click();
      }
    } else if (e.key === 'Escape') {
      list.classList.remove('active');
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrap')) list.classList.remove('active');
  });
}

function selectLocation(item) {
  selectedLocationData = item;

  document.getElementById('owner-region').value = item.region;
  document.getElementById('owner-region-code').value = item.regionCode;
  document.getElementById('owner-province').value = item.province;
  document.getElementById('owner-province-code').value = item.provinceCode;
  document.getElementById('owner-municipality').value = item.municipality;
  document.getElementById('owner-municipality-code').value = item.municipalityCode;
  document.getElementById('owner-barangay').value = item.barangay;

  document.getElementById('display-barangay').textContent = item.barangay || '\u2014';
  document.getElementById('display-municipality').textContent = item.municipality || '\u2014';
  document.getElementById('display-province').textContent = item.province;
  document.getElementById('display-region').textContent = item.region;
  document.getElementById('location-result').style.display = 'block';

  document.getElementById('location-search').style.display = 'none';
  document.getElementById('location-search-list').classList.remove('active');

  const parts = [item.barangay, item.municipality, item.province, 'Philippines'].filter(Boolean);
  selectedLocationData.mapQuery = parts.join(', ');
}

function clearLocationSelection() {
  selectedLocationData = null;
  document.getElementById('location-search').style.display = '';
  document.getElementById('location-search').value = '';
  document.getElementById('location-result').style.display = 'none';
  ['owner-region', 'owner-region-code', 'owner-province', 'owner-province-code',
   'owner-municipality', 'owner-municipality-code', 'owner-barangay'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

initLocationSearch();
updateProgress(); // Show initial progress for Q1

// ======== Validation ========

function validateSlide(idx) {
  const slideId = SLIDES[idx];
  clearErrors();

  switch (slideId) {
    case 'q-name':
      if (!val('owner-name')) { showSlideError('owner-name', 'Please enter your name'); return false; }
      return true;
    case 'q-email':
      if (!val('owner-email') || !isEmail(val('owner-email'))) { showSlideError('owner-email', 'Please enter a valid email'); return false; }
      return true;
    case 'q-location':
      if (!val('owner-region') || !val('owner-province')) {
        showSlideError('location-search', 'Please search and select your location');
        return false;
      }
      return true;
    case 'q-entity':
      if (!val('entity-type')) { shakeSlide(); return false; }
      return true;
    case 'q-land-size':
      if (!val('acreage') || parseFloat(val('acreage')) <= 0) { showSlideError('acreage', 'Enter estimated hectares'); return false; }
      if (!val('years-owned')) { showSlideError('years-owned', 'Enter years owned'); return false; }
      return true;
    case 'q-land-type':
      if (!val('land-type')) { shakeSlide(); return false; }
      return true;
    case 'q-use':
      if (!val('current-use')) { shakeSlide(); return false; }
      return true;
    case 'q-map':
      if (!selectedLocation.lat) {
        shakeSlide();
        return false;
      }
      return true;
    default:
      return true;
  }
}

function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

function showSlideError(inputId, msg) {
  const input = document.getElementById(inputId);
  if (!input || input.type === 'hidden') {
    // For hidden inputs (like location-search when hidden), find the visible input
    const slide = document.querySelector('.tf-slide.active');
    const visibleInput = slide.querySelector('input:not([type="hidden"]):not([type="file"])');
    if (visibleInput) {
      visibleInput.classList.add('tf-error');
      showErrorMsg(visibleInput, msg);
    } else {
      shakeSlide();
    }
    return;
  }
  input.classList.add('tf-error');
  showErrorMsg(input, msg);
}

function showErrorMsg(input, msg) {
  // Remove existing
  const existing = input.parentElement.querySelector('.tf-error-msg');
  if (existing) existing.remove();

  const span = document.createElement('span');
  span.className = 'tf-error-msg';
  span.textContent = msg;
  input.insertAdjacentElement('afterend', span);
  shakeSlide();
}

function clearErrors() {
  document.querySelectorAll('.tf-error').forEach(el => el.classList.remove('tf-error'));
  document.querySelectorAll('.tf-error-msg').forEach(el => el.remove());
}

function shakeSlide() {
  const slide = document.querySelector('.tf-slide.active');
  if (slide) {
    slide.classList.add('tf-shake');
    setTimeout(() => slide.classList.remove('tf-shake'), 500);
  }
}

// ======== Consent checkbox ========
document.getElementById('consent-check').addEventListener('change', function() {
  document.getElementById('submit-btn').disabled = !this.checked;
});

// ======== Document Upload ========

const MAX_FILES = 5;
const MAX_SIZE = 2 * 1024 * 1024;

function initDocUpload() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('doc-file-input');

  zone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') input.click();
  });

  input.addEventListener('change', () => {
    handleDocFiles(input.files);
    input.value = '';
  });

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleDocFiles(e.dataTransfer.files);
  });
}

function handleDocFiles(fileList) {
  const files = Array.from(fileList);
  for (const file of files) {
    if (uploadedDocuments.length >= MAX_FILES) { alert(`Maximum ${MAX_FILES} files allowed.`); break; }
    if (file.size > MAX_SIZE) { alert(`"${file.name}" exceeds 2MB limit.`); continue; }

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedDocuments.push({ name: file.name, size: file.size, type: file.type, base64: e.target.result });
      renderUploadList();
    };
    reader.readAsDataURL(file);
  }
}

function removeDocument(index) {
  uploadedDocuments.splice(index, 1);
  renderUploadList();
}

function renderUploadList() {
  const list = document.getElementById('upload-list');
  if (uploadedDocuments.length === 0) { list.innerHTML = ''; return; }

  list.innerHTML = uploadedDocuments.map((doc, i) => {
    const isImage = doc.type.startsWith('image/');
    const sizeStr = doc.size < 1024 ? doc.size + ' B' :
      doc.size < 1024 * 1024 ? (doc.size / 1024).toFixed(0) + ' KB' :
      (doc.size / (1024 * 1024)).toFixed(1) + ' MB';

    const iconHtml = isImage
      ? `<img src="${esc(doc.base64)}" alt="">`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

    return `<div class="upload-item">
      <div class="upload-item-icon">${iconHtml}</div>
      <div class="upload-item-info">
        <div class="upload-item-name">${esc(doc.name)}</div>
        <div class="upload-item-size">${sizeStr}</div>
      </div>
      <button class="upload-item-remove" onclick="removeDocument(${i})" title="Remove">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`;
  }).join('');
}

initDocUpload();

// ======== Leaflet Map ========

function initMap() {
  map = L.map('map', {
    center: [12.8797, 121.7740],
    zoom: 6,
    zoomControl: true,
    tap: true,
    touchZoom: true,
    dragging: true
  });

  if (window.innerWidth <= 640) map.zoomControl.setPosition('bottomright');

  layers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri', maxZoom: 19 });
  layers.street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OSM', maxZoom: 19 });
  layers.topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: 'OpenTopoMap', maxZoom: 17 });

  layers.satellite.addTo(map);
  activeLayer = 'satellite';

  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  map.on('click', onMapClick);
  setupSearch();
  setupKMLDrop();
  setMapMode('draw');
}

async function preCenterMap() {
  if (!selectedLocationData || !selectedLocationData.mapQuery) return;
  const query = selectedLocationData.mapQuery;
  const searchInput = document.getElementById('map-search');
  if (searchInput) searchInput.value = query;
  try {
    const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q: query, format: 'json', limit: '1', countrycodes: 'ph' });
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (data.length > 0) {
      const r = data[0];
      const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
      map.setView([lat, lng], 14);
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng], { icon: pinIcon() }).addTo(map);
      selectedLocation.lat = lat;
      selectedLocation.lng = lng;
      selectedLocation.address = r.display_name;
      updateMapInfo();
    }
  } catch (e) { /* user can search manually */ }
}

function setupSearch() {
  const input = document.getElementById('map-search');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const q = input.value.trim();
      if (q) geocodeSearch(q);
    }
  });
}

async function geocodeSearch(query) {
  const input = document.getElementById('map-search');
  input.style.opacity = '0.5';
  try {
    const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q: query, format: 'json', limit: '1', addressdetails: '1' });
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (data.length > 0) {
      const r = data[0];
      const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
      map.setView([lat, lng], 15);
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng], { icon: pinIcon() }).addTo(map);
      selectedLocation.lat = lat;
      selectedLocation.lng = lng;
      selectedLocation.address = r.display_name;
      updateMapInfo();
      generateKML();
    } else {
      alert('Location not found. Try a more specific query.');
    }
  } catch { alert('Search failed. Please try again.'); }
  finally { input.style.opacity = '1'; }
}

function pinIcon() {
  return L.divIcon({
    className: 'custom-pin',
    html: '<svg width="32" height="42" viewBox="0 0 32 42" fill="none"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#8B6914"/><circle cx="16" cy="16" r="6" fill="white"/></svg>',
    iconSize: [32, 42], iconAnchor: [16, 42]
  });
}

function onMapClick(e) {
  const { lat, lng } = e.latlng;

  if (mapMode === 'pin') {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng], { icon: pinIcon() }).addTo(map);
    selectedLocation.lat = lat;
    selectedLocation.lng = lng;
    selectedLocation.address = '';
    reverseGeocode(lat, lng);
    updateMapInfo();
    generateKML();
    document.getElementById('info-kml').style.display = 'flex';

  } else if (mapMode === 'draw') {
    polygonLatLngs.push([lat, lng]);
    if (currentPolygon) { drawnItems.removeLayer(currentPolygon); currentPolygon = null; }

    if (polygonLatLngs.length === 1) {
      currentPolygon = L.circleMarker([lat, lng], { radius: 6, color: '#8B6914', fillColor: '#a67c1a', fillOpacity: 1, weight: 2 });
    } else if (polygonLatLngs.length === 2) {
      currentPolygon = L.polyline(polygonLatLngs, { color: '#8B6914', weight: 2, dashArray: '6,4' });
    } else {
      currentPolygon = L.polygon(polygonLatLngs, { color: '#8B6914', weight: 2, fillColor: '#a67c1a', fillOpacity: 0.2 });
      const acres = (computeArea(polygonLatLngs) * 0.000247105).toFixed(1);
      selectedLocation.areaAcres = parseFloat(acres);
      document.getElementById('info-area').style.display = 'flex';
      document.getElementById('selected-area').textContent = `~${acres} acres`;
      document.getElementById('info-kml').style.display = 'flex';
    }
    drawnItems.addLayer(currentPolygon);

    const c = centroid(polygonLatLngs);
    selectedLocation.lat = c[0];
    selectedLocation.lng = c[1];
    selectedLocation.polygon = polygonLatLngs.map(p => [p[0], p[1]]);
    if (!selectedLocation.address) reverseGeocode(c[0], c[1]);
    updateMapInfo();
    generateKML();
  }
}

function computeArea(pts) {
  const R = 6378137;
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const [lat1, lng1] = [pts[i][0] * Math.PI / 180, pts[i][1] * Math.PI / 180];
    const [lat2, lng2] = [pts[j][0] * Math.PI / 180, pts[j][1] * Math.PI / 180];
    a += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs(a * R * R / 2);
}

function centroid(pts) {
  let la = 0, lo = 0;
  pts.forEach(p => { la += p[0]; lo += p[1]; });
  return [la / pts.length, lo / pts.length];
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch('https://nominatim.openstreetmap.org/reverse?' + new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'json' }), { headers: { 'Accept': 'application/json' } });
    const d = await res.json();
    if (d.display_name) { selectedLocation.address = d.display_name; updateMapInfo(); }
  } catch {
    selectedLocation.address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    updateMapInfo();
  }
}

function updateMapInfo() {
  document.getElementById('selected-coords').textContent =
    selectedLocation.lat ? `${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}` : 'Click map or search';
}

function setMapMode(mode) {
  mapMode = mode;
  document.getElementById('btn-pin').classList.toggle('active', mode === 'pin');
  document.getElementById('btn-draw').classList.toggle('active', mode === 'draw');
  const hint = document.getElementById('draw-hint');
  if (hint) hint.style.display = mode === 'draw' ? 'flex' : 'none';
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.style.cursor = mode === 'draw' ? 'crosshair' : '';
}

function setLayer(type) {
  if (!map || !layers[type]) return;
  if (activeLayer && layers[activeLayer]) map.removeLayer(layers[activeLayer]);
  layers[type].addTo(map);
  activeLayer = type;
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === type);
  });
}

function clearMap() {
  if (marker) { map.removeLayer(marker); marker = null; }
  if (currentPolygon) { drawnItems.removeLayer(currentPolygon); currentPolygon = null; }
  drawnItems.clearLayers();
  polygonLatLngs = [];
  selectedLocation = { address: '', lat: null, lng: null, polygon: [], areaAcres: null };
  kmlString = '';
  document.getElementById('selected-coords').textContent = 'Click map or search';
  document.getElementById('info-area').style.display = 'none';
  document.getElementById('info-kml').style.display = 'none';
}

// ======== KML Import ========

function setupKMLDrop() {
  const container = document.getElementById('map-container');
  const overlay = document.getElementById('map-drop-overlay');
  const fileInput = document.getElementById('kml-file-input');

  let dragCounter = 0;

  container.addEventListener('dragenter', (e) => { e.preventDefault(); dragCounter++; overlay.classList.add('active'); });
  container.addEventListener('dragover', (e) => e.preventDefault());
  container.addEventListener('dragleave', () => { dragCounter--; if (dragCounter <= 0) { overlay.classList.remove('active'); dragCounter = 0; } });
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    overlay.classList.remove('active');
    dragCounter = 0;
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.kml')) readKMLFile(file);
    else alert('Please drop a .kml file.');
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) readKMLFile(fileInput.files[0]);
    fileInput.value = '';
  });
}

function readKMLFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try { importKML(e.target.result); }
    catch (err) { alert('Could not parse KML file.'); console.error('KML parse error:', err); }
  };
  reader.readAsText(file);
}

function importKML(kmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlText, 'text/xml');

  if (doc.querySelector('parsererror')) { alert('Invalid KML file format.'); return; }
  clearMap();

  const coordsEl = doc.querySelector('Polygon LinearRing coordinates') || doc.querySelector('Polygon coordinates');

  if (coordsEl) {
    const coordText = coordsEl.textContent.trim();
    const points = coordText.split(/\s+/).map(c => {
      const parts = c.split(',');
      return [parseFloat(parts[1]), parseFloat(parts[0])];
    }).filter(p => !isNaN(p[0]) && !isNaN(p[1]));

    if (points.length > 1) {
      const first = points[0], last = points[points.length - 1];
      if (Math.abs(first[0] - last[0]) < 0.0001 && Math.abs(first[1] - last[1]) < 0.0001) points.pop();
    }

    if (points.length >= 3) {
      polygonLatLngs = points;
      currentPolygon = L.polygon(polygonLatLngs, { color: '#8B6914', weight: 2, fillColor: '#a67c1a', fillOpacity: 0.2 });
      drawnItems.addLayer(currentPolygon);
      map.fitBounds(currentPolygon.getBounds(), { padding: [30, 30] });

      const acres = (computeArea(polygonLatLngs) * 0.000247105).toFixed(1);
      selectedLocation.areaAcres = parseFloat(acres);
      document.getElementById('info-area').style.display = 'flex';
      document.getElementById('selected-area').textContent = `~${acres} acres`;
      document.getElementById('info-kml').style.display = 'flex';

      const c = centroid(polygonLatLngs);
      selectedLocation.lat = c[0];
      selectedLocation.lng = c[1];
      selectedLocation.polygon = polygonLatLngs.map(p => [p[0], p[1]]);
      reverseGeocode(c[0], c[1]);
      updateMapInfo();
      generateKML();
      return;
    }
  }

  const pointCoords = doc.querySelector('Point coordinates');
  if (pointCoords) {
    const parts = pointCoords.textContent.trim().split(',');
    const lng = parseFloat(parts[0]), lat = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      marker = L.marker([lat, lng], { icon: pinIcon() }).addTo(map);
      map.setView([lat, lng], 15);
      selectedLocation.lat = lat;
      selectedLocation.lng = lng;
      reverseGeocode(lat, lng);
      updateMapInfo();
      generateKML();
      document.getElementById('info-kml').style.display = 'flex';
      return;
    }
  }

  alert('No recognizable geometry found in the KML file.');
}

// ======== KML Generation ========

function generateKML() {
  const name = val('owner-name') || 'Land Submission';
  const now = new Date().toISOString();
  let geometry = '';

  if (polygonLatLngs.length >= 3) {
    const coords = polygonLatLngs.map(p => `${p[1]},${p[0]},0`).join(' ');
    const first = polygonLatLngs[0];
    geometry = `<Polygon><outerBoundaryIs><LinearRing><coordinates>${coords} ${first[1]},${first[0]},0</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
  } else if (selectedLocation.lat) {
    geometry = `<Point><coordinates>${selectedLocation.lng},${selectedLocation.lat},0</coordinates></Point>`;
  }

  const area = selectedLocation.areaAcres ? `\nEstimated area: ~${selectedLocation.areaAcres} acres` : '';

  kmlString = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escXml(name)} - Land Boundary</name>
    <description>Carbon credit land submission.${escXml(area)}
Generated: ${now}</description>
    <Style id="landBoundary">
      <LineStyle><color>ff205e1b</color><width>2</width></LineStyle>
      <PolyStyle><color>404caf50</color></PolyStyle>
    </Style>
    <Placemark>
      <name>${escXml(name)} - Parcel</name>
      <description>${escXml(selectedLocation.address || '')}${escXml(area)}</description>
      <styleUrl>#landBoundary</styleUrl>
      ${geometry}
    </Placemark>
  </Document>
</kml>`;
}

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function downloadKML() {
  if (!kmlString && selectedLocation.lat) generateKML();
  if (!kmlString) { alert('Draw a boundary or drop a pin first.'); return; }
  const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
  triggerDL(blob, `land-boundary-${Date.now()}.kml`);
}

async function downloadKMZ() {
  if (!kmlString && selectedLocation.lat) generateKML();
  if (!kmlString) { alert('Draw a boundary or drop a pin first.'); return; }
  if (typeof JSZip === 'undefined') { downloadKML(); return; }

  const zip = new JSZip();
  zip.file('doc.kml', kmlString);
  zip.file('metadata.json', JSON.stringify({
    owner: val('owner-name'), email: val('owner-email'),
    acreage: val('acreage'), land_type: val('land-type'),
    lat: selectedLocation.lat, lng: selectedLocation.lng,
    area_acres: selectedLocation.areaAcres,
    exported: new Date().toISOString()
  }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  triggerDL(blob, `land-boundary-${Date.now()}.kmz`);
}

function triggerDL(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ======== Review ========

function populateReview() {
  const entityLabels = { individual: 'Individual', company: 'Company / LLC', trust: 'Trust', nonprofit: 'Non-profit', government: 'Government', other: 'Other' };
  const landLabels = { forest: 'Forest / Woodland', grassland: 'Grassland / Pasture', cropland: 'Cropland / Agricultural', wetland: 'Wetland / Marsh', arid: 'Arid / Semi-arid', mixed: 'Mixed Use' };
  const useLabels = { agriculture: 'Active Agriculture', timber: 'Timber / Forestry', ranching: 'Ranching / Livestock', conservation: 'Conservation / Protected', unused: 'Unused / Fallow', other: 'Other' };

  document.getElementById('review-owner').innerHTML = `
    <div class="review-item"><span class="review-label">Name</span><span class="review-value">${esc(val('owner-name'))}</span></div>
    <div class="review-item"><span class="review-label">Email</span><span class="review-value">${esc(val('owner-email'))}</span></div>
    <div class="review-item"><span class="review-label">Phone</span><span class="review-value">${esc(val('owner-phone') || '\u2014')}</span></div>
    <div class="review-item"><span class="review-label">Region</span><span class="review-value">${esc(val('owner-region') || '\u2014')}</span></div>
    <div class="review-item"><span class="review-label">Province</span><span class="review-value">${esc(val('owner-province') || '\u2014')}</span></div>
    <div class="review-item"><span class="review-label">Municipality</span><span class="review-value">${esc(val('owner-municipality') || '\u2014')}</span></div>
    <div class="review-item"><span class="review-label">Barangay</span><span class="review-value">${esc(val('owner-barangay') || '\u2014')}</span></div>
    <div class="review-item"><span class="review-label">Entity</span><span class="review-value">${entityLabels[val('entity-type')] || '\u2014'}</span></div>`;

  document.getElementById('review-land').innerHTML = `
    <div class="review-item"><span class="review-label">Hectares</span><span class="review-value">${esc(val('acreage'))}</span></div>
    <div class="review-item"><span class="review-label">Years Owned</span><span class="review-value">${esc(val('years-owned'))}</span></div>
    <div class="review-item"><span class="review-label">Land Type</span><span class="review-value">${landLabels[val('land-type')] || '\u2014'}</span></div>
    <div class="review-item"><span class="review-label">Current Use</span><span class="review-value">${useLabels[val('current-use')] || '\u2014'}</span></div>`;

  const docsSection = document.getElementById('review-docs-section');
  const docsEl = document.getElementById('review-docs');
  if (uploadedDocuments.length > 0) {
    docsSection.style.display = 'block';
    docsEl.innerHTML = '<div class="review-doc-list">' + uploadedDocuments.map(d =>
      `<div class="review-doc-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        ${esc(d.name)}
      </div>`
    ).join('') + '</div>';
  } else {
    docsSection.style.display = 'none';
  }

  const addr = selectedLocation.address || '\u2014';
  const shortAddr = addr.length > 80 ? addr.substring(0, 77) + '...' : addr;
  document.getElementById('review-location').innerHTML = `
    <div class="review-item"><span class="review-label">Address</span><span class="review-value">${esc(shortAddr)}</span></div>
    <div class="review-item"><span class="review-label">Coordinates</span><span class="review-value">${selectedLocation.lat ? selectedLocation.lat.toFixed(5) + ', ' + selectedLocation.lng.toFixed(5) : '\u2014'}</span></div>
    ${selectedLocation.areaAcres ? `<div class="review-item"><span class="review-label">Drawn Area</span><span class="review-value">~${selectedLocation.areaAcres} acres</span></div>` : ''}`;

  const reviewMapEl = document.getElementById('review-map');
  if (selectedLocation.lat) {
    setTimeout(() => {
      reviewMapEl.innerHTML = '';
      const mini = L.map(reviewMapEl, {
        center: [selectedLocation.lat, selectedLocation.lng], zoom: 14,
        zoomControl: false, dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false, attributionControl: false
      });
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(mini);
      if (polygonLatLngs.length >= 3) {
        const poly = L.polygon(polygonLatLngs, { color: '#a67c1a', weight: 2, fillColor: '#a67c1a', fillOpacity: 0.25 }).addTo(mini);
        mini.fitBounds(poly.getBounds(), { padding: [20, 20] });
      } else {
        L.marker([selectedLocation.lat, selectedLocation.lng], { icon: pinIcon() }).addTo(mini);
      }
    }, 120);
  }

  document.getElementById('review-kml-section').style.display = kmlString ? 'block' : 'none';
}

function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

// ======== Supabase Client ========

const SUPABASE_URL = 'https://poirrcnsplasdcnlnuvc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaXJyY25zcGxhc2RjbmxudXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjIxNzQsImV4cCI6MjA4OTk5ODE3NH0.xmkjrAbMZE3gxvCVMX6Ad0eYDpZoxmUGSA5bZ0oeu4M';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ======== Submit ========

async function submitForm() {
  generateKML();

  const email = val('owner-email');
  const acreageVal = parseFloat(val('acreage'));

  const row = {
    full_name: val('owner-name'),
    email: email,
    phone: val('owner-phone'),
    land_type: val('land-type'),
    acreage: isNaN(acreageVal) ? null : acreageVal,
    current_use: val('current-use'),
    region: val('owner-region'),
    province: val('owner-province'),
    municipality: val('owner-municipality'),
    barangay: val('owner-barangay'),
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    polygon: selectedLocation.polygon && selectedLocation.polygon.length > 0
      ? selectedLocation.polygon : null,
    entity_type: val('entity-type')
  };

  // Show submitting state
  const submitBtn = document.querySelector('#q-review .tf-ok');
  if (submitBtn) { submitBtn.textContent = 'Submitting...'; submitBtn.disabled = true; }

  const { data, error } = await sb
    .from('submissions')
    .insert([row])
    .select('tracking_code')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    alert('Submission failed: ' + (error.message || 'Unknown error. Please try again.'));
    if (submitBtn) { submitBtn.textContent = 'Submit'; submitBtn.disabled = false; }
    return;
  }

  // Redirect to confirmation page with tracking code
  const trackingCode = data.tracking_code;
  window.location.href = 'submit.html?code=' + encodeURIComponent(trackingCode) + '&email=' + encodeURIComponent(email);
}

// ======== Map Tutorial ========

let tutFrame = 0;
const TUT_TOTAL = 4;

function openTutorial() {
  tutFrame = 0;
  renderTutorial();
  document.getElementById('tut-overlay').style.display = 'flex';
}

function closeTutorial() {
  document.getElementById('tut-overlay').style.display = 'none';
}

function tutNext() {
  if (tutFrame < TUT_TOTAL - 1) {
    tutFrame++;
    renderTutorial();
  } else {
    closeTutorial();
  }
}

function tutPrev() {
  if (tutFrame > 0) {
    tutFrame--;
    renderTutorial();
  }
}

function renderTutorial() {
  // Show active frame
  document.querySelectorAll('.tut-frame').forEach((f, i) => {
    f.classList.toggle('active', i === tutFrame);
  });

  // Dots
  document.querySelectorAll('.tut-dot').forEach((d, i) => {
    d.classList.toggle('active', i === tutFrame);
  });

  // Back button
  document.getElementById('tut-btn-back').style.display = tutFrame > 0 ? 'inline-flex' : 'none';

  // Next button text
  document.getElementById('tut-btn-next').textContent = tutFrame === TUT_TOTAL - 1 ? 'Got it!' : 'Next';
}
