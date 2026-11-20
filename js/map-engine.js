"use strict";
/* نقشهٔ تهران (MapLibre GL + OpenFreeMap) با همان API قبلیِ PsPsMap؛ zoom به مقیاس Leaflet (z = zoom_maplibre + 1) گزارش می‌شود */
(function () {
  try {
    maplibregl.setRTLTextPlugin("https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js", true);
  } catch (err) { /* بدون پلاگین، برچسب‌های فارسی جدا از هم نمایش داده می‌شوند */ }
})();
function buildTehranStyle() {
  /* پالت سایت: کرم #f3ead9 ، جوهر #171715 ، قرمز #f03420 */
  const INK = '#171715', CREAM = '#f3ead9', RED = '#f03420';
  const NAME = ['coalesce', ['get', 'name:fa'], ['get', 'name']];
  const FONT = ['Noto Sans Regular'], FONTB = ['Noto Sans Bold'];
  const inClass = list => ['match', ['get', 'class'], list, true, false];
  const zoomW = w => ['interpolate', ['exponential', 1.5], ['zoom'], 6, w * 0.15, 12, w, 18, w * 9];
  function road(id, classes, color, casing, w, minzoom, cw) {
    const f = inClass(classes);
    return [
      {id: id + '-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom, filter: f,
       layout: {'line-cap': 'round', 'line-join': 'round'}, paint: {'line-color': casing, 'line-width': zoomW(w + (cw || 1.6))}},
      {id, type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom, filter: f,
       layout: {'line-cap': 'round', 'line-join': 'round'}, paint: {'line-color': color, 'line-width': zoomW(w)}}
    ];
  }
  return {
    version: 8,
    name: 'PsPs Tehran',
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: {type: 'vector', url: 'https://tiles.openfreemap.org/planet',
            attribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'},
      dem: {type: 'raster-dem', encoding: 'terrarium', tileSize: 256, maxzoom: 15,
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            attribution: 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Mapzen/AWS Terrain Tiles</a>'}
    },
    layers: [
      {id: 'bg', type: 'background', paint: {'background-color': CREAM}},
      {id: 'landcover', type: 'fill', source: 'omt', 'source-layer': 'landcover',
       paint: {'fill-color': ['match', ['get', 'class'], 'wood', '#E6D8BF', 'grass', '#EBDFCA', 'farmland', '#EFE5D3', 'sand', '#F0E6D4', 'ice', '#F5EEE2', '#ECE1CD'], 'fill-opacity': 0.9}},
      {id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park',
       paint: {'fill-color': '#E3D3B6', 'fill-opacity': 0.9, 'fill-outline-color': '#B9A58A'}},
      {id: 'hillshade', type: 'hillshade', source: 'dem',
       paint: {'hillshade-exaggeration': 0.28, 'hillshade-shadow-color': '#8E7B66', 'hillshade-highlight-color': '#F8F1E4', 'hillshade-accent-color': '#B9A58A'}},
      {id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: {'fill-color': '#E2D2B8'}},
      {id: 'water-edge', type: 'line', source: 'omt', 'source-layer': 'water', minzoom: 10,
       paint: {'line-color': INK, 'line-opacity': 0.55, 'line-width': 1.2}},
      {id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway',
       paint: {'line-color': '#C9B393', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.4, 16, 3]}},
      {id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 13,
       paint: {'fill-color': '#e8dcc2', 'fill-outline-color': '#bba98a', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.5, 16, 0.95]}},
      {id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 11, filter: inClass(['rail']),
       paint: {'line-color': '#8c7a68', 'line-width': 1, 'line-dasharray': [4, 3]}},
      {id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 15, filter: inClass(['path']),
       paint: {'line-color': '#a8946f', 'line-width': 1.2, 'line-dasharray': [2, 2]}},
      ...road('road-minor', ['minor', 'service', 'track'], '#F8F1E4', '#CDBB9E', 2.2, 13),
      ...road('road-tertiary', ['tertiary'], '#F8F1E4', '#B9A585', 3.2, 11),
      ...road('road-secondary', ['secondary'], '#F6D9CF', '#8E7B66', 3.8, 9, 1.8),
      ...road('road-primary', ['primary'], '#F2B4A4', INK, 4.4, 8, 1.8),
      ...road('road-trunk', ['trunk'], '#EE8C77', INK, 5, 6, 1.9),
      ...road('road-motorway', ['motorway'], RED, INK, 5.6, 5, 2),
      {id: 'road-names', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 13,
       layout: {'symbol-placement': 'line', 'text-field': NAME, 'text-font': FONT, 'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 17, 13], 'text-max-angle': 30},
       paint: {'text-color': INK, 'text-halo-color': CREAM, 'text-halo-width': 1.8}},
      {id: 'place-small', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 11,
       filter: inClass(['suburb', 'quarter', 'neighbourhood', 'hamlet']),
       layout: {'text-field': NAME, 'text-font': FONT, 'text-size': ['interpolate', ['linear'], ['zoom'], 11, 11, 16, 15], 'text-max-width': 7, 'symbol-sort-key': ['coalesce', ['get', 'rank'], 99]},
       paint: {'text-color': '#5A4A40', 'text-halo-color': CREAM, 'text-halo-width': 1.8}},
      {id: 'place-town', type: 'symbol', source: 'omt', 'source-layer': 'place',
       filter: inClass(['town', 'village']),
       layout: {'text-field': NAME, 'text-font': FONTB, 'text-size': ['interpolate', ['linear'], ['zoom'], 8, 11, 14, 16], 'text-max-width': 7, 'symbol-sort-key': ['coalesce', ['get', 'rank'], 99]},
       paint: {'text-color': INK, 'text-halo-color': CREAM, 'text-halo-width': 2}},
      {id: 'place-city', type: 'symbol', source: 'omt', 'source-layer': 'place',
       filter: inClass(['city', 'state', 'country']),
       layout: {'text-field': NAME, 'text-font': FONTB, 'text-size': ['interpolate', ['linear'], ['zoom'], 4, 12, 12, 24], 'text-max-width': 8, 'symbol-sort-key': ['coalesce', ['get', 'rank'], 99]},
       paint: {'text-color': RED, 'text-halo-color': CREAM, 'text-halo-width': 2.2}}
    ]
  };
}
class PsPsMap {
  constructor(el, { lat = 35.706, lng = 51.399, zoom = 13, onPick = null, onMove = null, onMarker = null, onLocate = null } = {}) {
    this.el = el;
    this.onPick = onPick;
    this.onMove = onMove;
    this.onMarker = onMarker;
    this.onLocate = onLocate;
    el.classList.add("psps-map");
    this.statusEl = document.createElement("div");
    this.statusEl.className = "map-tile-status";
    this.statusEl.hidden = true;
    this.statusEl.setAttribute("role", "status");
    this.statusEl.textContent = "نقشه بارگذاری نشد. اتصال اینترنت را بررسی کن؛ مختصات را همچنان می‌توانی دستی وارد کنی.";
    this.markers = [];
    this.pins = [];
    this.errors = 0;
    this.user = null;
    let map;
    try {
      map = this.map = new maplibregl.Map({
        container: el, style: buildTehranStyle(), center: [lng, lat], zoom: zoom - 1,
        minZoom: 2, maxZoom: 17, attributionControl: false, dragRotate: false, pitchWithRotate: false,
        renderWorldCopies: true, hash: false
      });
    } catch (err) {
      this.map = null;
      this.statusEl.textContent = "این مرورگر نقشهٔ برداری (WebGL) را پشتیبانی نمی‌کند؛ مختصات را می‌توانی دستی وارد کنی.";
      this.statusEl.hidden = false;
      el.appendChild(this.statusEl);
      return;
    }
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation && map.keyboard.disableRotation();
    map.scrollZoom.disable();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), "top-left");
    const self = this;
    class LocControl {
      onAdd() {
        const box = document.createElement("div");
        box.className = "maplibregl-ctrl maplibregl-ctrl-group psps-loc";
        const b = document.createElement("button");
        b.type = "button";
        b.title = "موقعیت من";
        b.setAttribute("aria-label", "رفتن به موقعیت من");
        b.textContent = "◎";
        b.addEventListener("click", (e) => {
          e.preventDefault();
          if (self.onLocate) self.onLocate(self);
        });
        box.appendChild(b);
        this.box = box;
        return box;
      }
      onRemove() { this.box.remove(); }
    }
    map.addControl(new LocControl(), "top-left");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    el.appendChild(this.statusEl);
    const nav = el.querySelectorAll(".maplibregl-ctrl-zoom-in,.maplibregl-ctrl-zoom-out");
    if (nav[0]) { nav[0].textContent = "+"; nav[0].title = "بزرگ‌نمایی"; nav[0].setAttribute("aria-label", "بزرگ‌نمایی"); }
    if (nav[1]) { nav[1].textContent = "−"; nav[1].title = "کوچک‌نمایی"; nav[1].setAttribute("aria-label", "کوچک‌نمایی"); }
    map.on("error", () => {
      if (++this.errors >= 3) this.statusEl.hidden = false;
    });
    map.on("data", (e) => {
      if (e.dataType === "source" && e.isSourceLoaded) {
        this.errors = 0;
        this.statusEl.hidden = true;
      }
    });
    map.on("load", () => {
      this.ready = true;
      map.addSource("me-acc", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "me-acc-fill", type: "fill", source: "me-acc", paint: { "fill-color": "#f03420", "fill-opacity": 0.12 } });
      map.addLayer({ id: "me-acc-line", type: "line", source: "me-acc", paint: { "line-color": "#f03420", "line-width": 1 } });
      if (this.user) this.showUser(this.user.lat, this.user.lng, this.user.acc);
    });
    map.on("click", (e) => {
      map.scrollZoom.enable();
      if (this.onPick) this.onPick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });
    map.on("moveend", () => {
      if (this.onMove) this.onMove({ lat: this.lat, lng: this.lng, zoom: this.zoom });
    });
    el.addEventListener("mouseleave", () => map.scrollZoom.disable());
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(el);
    } else window.addEventListener("resize", () => this.resize());
    setTimeout(() => this.resize(), 0);
  }
  get lat() { return this.map ? this.map.getCenter().lat : 35.706; }
  get lng() { return this.map ? this.map.getCenter().lng : 51.399; }
  get zoom() { return this.map ? this.map.getZoom() + 1 : 13; }
  setView(lat, lng, zoom) {
    if (!this.map || !isFinite(lat) || !isFinite(lng)) return;
    const z = zoom == null ? this.zoom : Math.max(3, Math.min(18, zoom));
    this.map.easeTo({ center: [lng, lat], zoom: z - 1, duration: 600 });
  }
  resize() {
    if (this.map && this.el.clientWidth && this.el.clientHeight) this.map.resize();
  }
  setMarkers(list) {
    this.markers = list;
    if (!this.map) return;
    this.pins.forEach((p) => p.remove());
    this.pins = [];
    const e = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    for (const m of list) {
      const wrap = document.createElement("div");
      wrap.className = "map-pin";
      wrap.style.zIndex = m.urgent ? 500 : 0;
      wrap.innerHTML = '<button type="button" style="--i:' + (m.i || 0) + '" class="marker' + (m.urgent ? " urgent" : "") + (m.drop ? " drop" : "") + '" aria-label="' + e(m.ariaLabel || m.label) + '"><span class="marker-face">' + (m.html || "") + '</span></button><span class="marker-label" dir="auto">' + e(m.label) + "</span>";
      wrap.querySelector("button").addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (this.onMarker) this.onMarker(m);
      });
      this.pins.push(new maplibregl.Marker({ element: wrap, anchor: "top-left" }).setLngLat([m.lng, m.lat]).addTo(this.map));
    }
  }
  showUser(lat, lng, acc) {
    this.user = { lat, lng, acc };
    if (!this.map) return;
    if (!this.meMarker) {
      const w = document.createElement("div");
      w.className = "me-cat";
      w.style.zIndex = 900;
      w.setAttribute("role", "img");
      w.setAttribute("aria-label", "موقعیت من");
      w.innerHTML = '<span class="me-ring"></span><span class="me-pin">' + CAT_PIN + '</span><span class="me-tag">من اینجام</span>';
      this.meMarker = new maplibregl.Marker({ element: w, anchor: "top-left" }).setLngLat([lng, lat]).addTo(this.map);
    } else this.meMarker.setLngLat([lng, lat]);
    if (!this.ready) return;
    const r = Math.max(acc || 0, 10), pts = [], k = 111320, cl = Math.cos(lat * Math.PI / 180) || 1e-6;
    for (let i = 0; i <= 64; i++) {
      const a = i / 64 * 2 * Math.PI;
      pts.push([lng + r * Math.cos(a) / (k * cl), lat + r * Math.sin(a) / k]);
    }
    this.map.getSource("me-acc").setData({ type: "Feature", geometry: { type: "Polygon", coordinates: [pts] } });
  }
}
