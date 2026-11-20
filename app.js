"use strict";

const CFG = window.PSPS_CONFIG || { FEATURES: {}, CITIES: [] };
const FEATURES = CFG.FEATURES || {};
const CITIES = CFG.CITIES && CFG.CITIES.length ? CFG.CITIES : [
  { id: "همه شهرها", label: "همهٔ شهرها", lat: 33.5, lng: 53.0, zoom: 6 },
  { id: "تهران", label: "تهران", lat: 35.706, lng: 51.399, zoom: 13 }
];

const clone = (o) => JSON.parse(JSON.stringify(o));
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const fa = (n) => Number(n).toLocaleString("fa-IR");
const esc = (s) => String(s != null ? s : "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const JM = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const pd = (x) => String(x).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
const pad2 = (n) => String(n).padStart(2, "0");

function g2j(gy, gm, gd) { var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; var gy2 = gm > 2 ? gy + 1 : gy; var days = 355666 + 365 * gy + ~~((gy2 + 3) / 4) - ~~((gy2 + 99) / 100) + ~~((gy2 + 399) / 400) + gd + g_d_m[gm - 1]; var jy = -1595 + 33 * ~~(days / 12053); days %= 12053; jy += 4 * ~~(days / 1461); days %= 1461; if (days > 365) { jy += ~~((days - 1) / 365); days = (days - 1) % 365; } var jm, jd; if (days < 186) { jm = 1 + ~~(days / 31); jd = 1 + days % 31; } else { jm = 7 + ~~((days - 186) / 30); jd = 1 + (days - 186) % 30; } return [jy, jm, jd]; }
function j2g(jy, jm, jd) { jy += 1595; var days = -355668 + 365 * jy + ~~(jy / 33) * 8 + ~~((jy % 33 + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186); var gy = 400 * ~~(days / 146097); days %= 146097; if (days > 36524) { gy += 100 * ~~(--days / 36524); days %= 36524; if (days >= 365) days++; } gy += 4 * ~~(days / 1461); days %= 1461; if (days > 365) { gy += ~~((days - 1) / 365); days = (days - 1) % 365; } var gd = days + 1; var sal = [0, 31, gy % 4 === 0 && gy % 100 !== 0 || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; var gm; for (gm = 0; gm < 13 && gd > sal[gm]; gm++) gd -= sal[gm]; return [gy, gm, gd]; }
function jMonthLen(y, m) { if (m <= 6) return 31; if (m <= 11) return 30; const g = j2g(y, 12, 30), b = g2j(g[0], g[1], g[2]); return b[1] === 12 && b[2] === 30 ? 30 : 29; }
const jopt = (v, t, sel) => `<option value="${v}"${sel ? " selected" : ""}>${t}</option>`;
function fillJDays(y, m, d) { const n = jMonthLen(y, m); d = Math.min(Math.max(1, d || 1), n); $("#jD").innerHTML = Array.from({ length: n }, (_, i) => jopt(i + 1, pd(i + 1), i + 1 === d)).join(""); }
function setSeen(dt) {
  const j = g2j(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()), now = new Date(), ny = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate())[0];
  $("#jY").innerHTML = [ny - 1, ny].map((y) => jopt(y, pd(y), y === j[0])).join("");
  $("#jM").innerHTML = JM.map((n, i) => jopt(i + 1, n, i + 1 === j[1])).join("");
  fillJDays(j[0], j[1], j[2]);
  $("#jH").innerHTML = Array.from({ length: 24 }, (_, h) => jopt(h, pd(pad2(h)), h === dt.getHours())).join("");
  const mm = Math.floor(dt.getMinutes() / 5) * 5;
  $("#jMin").innerHTML = Array.from({ length: 12 }, (_, k) => jopt(k * 5, pd(pad2(k * 5)), k * 5 === mm)).join("");
  syncSeen();
}
function syncSeen() {
  const y = +$("#jY").value, m = +$("#jM").value;
  fillJDays(y, m, +$("#jD").value);
  const d = +$("#jD").value, h = +$("#jH").value, mi = +$("#jMin").value, g = j2g(y, m, d);
  $("#seenAt").value = `${g[0]}-${pad2(g[1])}-${pad2(g[2])}T${pad2(h)}:${pad2(mi)}`;
  const fut = new Date($("#seenAt").value).getTime() > Date.now() + 6e4;
  $("#seenPreview").textContent = `${pd(d)} ${JM[m - 1]} ${pd(y)}، ساعت ${pd(pad2(h))}:${pd(pad2(mi))}` + (fut ? " — این زمان هنوز نرسیده!" : "");
}

const needs = { food: "آب و غذا", vet: "دامپزشک", shelter: "پناه امن", transport: "جابه‌جایی", follow: "بررسی دوباره" };
const partnerKinds = { vet: "دامپزشکی", clinic_24h: "کلینیک شبانه‌روزی", petshop: "پت‌شاپ", shelter: "پناهگاه / حامی" };
const svgi = (inner, cls = "") => `<svg class="g ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const CAT_HEAD = '<path d="M4.5 10.5 4 4l4.6 2.6h6.8L20 4l-.5 6.5a8 8 0 0 1 .5 2.6c0 4-3.6 7-8 7s-8-3-8-7c0-.9.2-1.7.5-2.6z"/>';
const G = {
  food: '<path d="M3 12h18c0 4.4-3.6 8-9 8s-9-3.6-9-8z"/><circle cx="8" cy="8.2" r="1.3"/><circle cx="12" cy="6.2" r="1.3"/><circle cx="16" cy="8.2" r="1.3"/>',
  water: '<path d="M12 3c3.6 4.6 6 7.3 6 10.4a6 6 0 0 1-12 0C6 10.3 8.4 7.6 12 3z"/>',
  vet: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/>',
  shelter: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-4.5a2 2 0 0 1 4 0V20"/>',
  transport: '<path d="M8.5 7V5.8A1.8 1.8 0 0 1 10.3 4h3.4a1.8 1.8 0 0 1 1.8 1.8V7"/><rect x="3.5" y="7" width="17" height="12.5" rx="3"/><path d="M9 11v4.5M12 11v4.5M15 11v4.5"/>',
  follow: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  camera: '<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/>',
  pin: '<path d="M12 21s7-5.6 7-11.2A7 7 0 0 0 5 9.8C5 15.4 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
  heart: '<path d="M12 20s-8-4.9-8-10.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.4C20 15.1 12 20 12 20z"/>',
  hand: '<path d="M7 12V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5v-1a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0v6.5m0-3.500a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.500a6 6 0 0 1-5-2.700L4.5 14.500a1.5 1.5 0 0 1 2.5-1.700L7 14"/>',
  run: '<circle cx="14" cy="4.5" r="1.8"/><path d="M13 8l-3 4.2 3.5 2.3-1.2 5.500M13 8l3.2 2.5 2.8.5M10 12.200l-3.5 1.3"/>',
  check: '<path d="M5 12.5 10 17.5 19.5 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  siren: '<path d="M6 18v-5a6 6 0 0 1 12 0v5"/><path d="M4 18h16v2.500H4z"/><path d="M12 3v2M4.5 6l1.5 1.300M19.5 6 18 7.3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.500V12l3 2"/>',
  paw: '<circle cx="6.5" cy="11" r="1.9"/><circle cx="10" cy="6.8" r="1.9"/><circle cx="14" cy="6.8" r="1.9"/><circle cx="17.5" cy="11" r="1.9"/><path d="M12 12.500c-3 0-5 2.6-5 4.6 0 1.5 1.3 2.3 2.8 2 .8-.2 1.4-.5 2.2-.5s1.4.3 2.2.5c1.5.3 2.8-.5 2.8-2 0-2-2-4.6-5-4.600z"/>',
  ok: CAT_HEAD + '<circle cx="9" cy="12.5" r=".9" fill="currentColor"/><circle cx="15" cy="12.5" r=".9" fill="currentColor"/><path d="M10.2 16.200c1 .9 2.6.9 3.6 0"/>',
  tired: CAT_HEAD + '<path d="M7.6 12.800q1.4 1.1 2.8 0M13.6 12.800q1.4 1.1 2.8 0"/><path d="M11 16.800h2"/>',
  hurt: CAT_HEAD + '<path d="M8 11.500l2 2M10 11.500l-2 2M14 11.500l2 2M16 11.500l-2 2"/><path d="M10 16.500q1-1 2 0t2 0"/><rect x="12.5" y="5.2" width="6" height="3" rx="1" transform="rotate(30 15.5 6.7)" fill="#f3ead9"/>',
  kitten: CAT_HEAD + '<circle cx="9" cy="12.5" r="1.6"/><circle cx="15" cy="12.5" r="1.6"/><path d="M11 16l1 .8 1-.8"/>',
  unknown: CAT_HEAD + '<path d="M10.6 11.200a1.5 1.5 0 1 1 2.2 1.300c-.6.4-.8.7-.8 1.400M12 16.300v.1"/>'
};
const gi = (k, cls) => svgi(G[k] || "", cls);
const CONDS = ["ok", "tired", "hurt", "kitten", "unknown"];
const CAT_PIN = '<svg viewBox="0 0 48 58" aria-hidden="true"><path d="M7 21 5.5 4.5 21 10.500z" fill="#f03420" stroke="#171715" stroke-width="2.6" stroke-linejoin="round"/><path d="M41 21 42.5 4.5 27 10.500z" fill="#f03420" stroke="#171715" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 56C24 56 5 38.5 5 26 5 15.5 13.5 9 24 9s19 6.5 19 17C43 38.5 24 56 24 56z" fill="#f03420" stroke="#171715" stroke-width="2.6" stroke-linejoin="round"/><path d="M9.5 17 9 9.800l6.5 2.600z" fill="#f3ead9"/><path d="M38.5 17l.5-7.2-6.5 2.600z" fill="#f3ead9"/><ellipse cx="17" cy="26" rx="2.6" ry="3.4" fill="#171715"/><ellipse cx="31" cy="26" rx="2.6" ry="3.4" fill="#171715"/><path d="M22 32.500h4l-2 2.600z" fill="#171715" stroke="#171715" stroke-width="1" stroke-linejoin="round"/><path d="M9 31.500l6.5 1.200M10 36.500l5.5-1.200M39 31.500l-6.5 1.200M38 36.500l-5.5-1.2" stroke="#171715" stroke-width="2" stroke-linecap="round"/></svg>';
window.CAT_PIN = CAT_PIN;
const COND_TEXT = $$("#catCondition option").map((o) => o.textContent);

function stageOf(c) { return c.status === "done" ? 3 : c.status === "going" ? 2 : 1; }
function needTag(n) { return `<span class="need-tag ic">${G[n] ? gi(n) : ""}${needs[n] || esc(n)}</span>`; }
function miniTrack(c) {
  const s = stageOf(c);
  return `<div class="mini-track ${c.status === "done" ? "done" : ""}" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<i class="${i < s ? "on" : i === s ? "cur" : ""}"></i>`).join("")}</div>`;
}

function catArt(type = 0, hero = false) {
  if (hero) return '<button type="button" class="hc" aria-label="گربهٔ PsPs؛ روی گربه بزن"><span class="hc-body"><span class="hc-pin"></span><span class="hc-cat"></span><span class="hc-eye l"><b><i></i></b></span><span class="hc-eye r"><b><i></i></b></span></span><span class="hero-speech" lang="en" dir="ltr" aria-live="polite">PsPs!</span></button>';
  return `<span class="doodle-cat doodle-${type % 5}" role="img" aria-label="تصویرسازی گربه با خط‌های دست‌کشیده"></span>`;
}
$("#heroArt").innerHTML = catArt(0, true);

const at = (mins) => new Date(Date.now() - mins * 6e4).toISOString();
const sample = [
  { id: "sample-1", name: "نارنجیِ پارک", city: "تهران", type: 0, address: "تهران، پارک لاله، نزدیک ورودی شرقی", lat: 35.7104, lng: 51.3912, seen: at(25), created: at(20), condition: "بی‌حال", description: "کنار بوته‌های ورودی نشسته بود. نزدیک شد ولی حرکتش کم بود؛ قلاده نداشت.", given: "آب تازه و کمی غذا گذاشتم؛ کمی آب خورد.", needs: ["vet", "transport"], needText: "به بررسی دامپزشک و یک آدمیوزاد برای جابه‌جایی نیاز دارد.", urgent: true, status: "open", events: [] },
  { id: "sample-2", name: "پنبه", city: "تهران", type: 2, address: "تهران، محدودهٔ بلوار کشاورز", lat: 35.7064, lng: 51.3972, seen: at(65), created: at(60), condition: "هوشیار و فعال", description: "گربهٔ سفید با لکهٔ کرم؛ کنار دیوار مغازه استراحت می‌کرد.", given: "کمی غذا گذاشتم؛ ظرف آب همراه نداشتم.", needs: ["food"], needText: "یک ظرف آب تازه و بررسی دوباره در طول روز.", urgent: false, status: "open", events: [] },
  { id: "sample-3", name: "دودی", city: "تهران", type: 1, address: "تهران، محدودهٔ میدان ولیعصر", lat: 35.7114, lng: 51.4072, seen: at(110), created: at(100), condition: "هوشیار و فعال", description: "زیر ماشین پارک‌شده پناه گرفته بود. احتمال دارد جایش را عوض کرده باشد.", given: "از فاصله عکس گرفتم؛ هنوز کمکی انجام نداده‌ام.", needs: ["shelter", "follow"], needText: "اول حضورش بررسی شود؛ سپس یک محل امن برای استراحت.", urgent: false, status: "open", events: [] },
  { id: "sample-4", name: "فندق کوچولو", city: "تهران", type: 4, address: "تهران، محدودهٔ خیابان انقلاب", lat: 35.7014, lng: 51.3952, seen: at(160), created: at(150), condition: "بچه‌گربهٔ تنها", description: "بچه‌گربه‌ای با چشم‌های باز کنار پیاده‌رو دیده شد؛ وضعیت مادر مشخص نیست.", given: "محل را بررسی کردم و مشاهده را ثبت کردم.", needs: ["follow", "shelter"], needText: "به حضور یک آدمیوزاد برای بررسی دوبارهٔ شرایط و محل نیاز دارد.", urgent: false, status: "open", events: [] },
  { id: "sample-5", name: "زیتون", city: "تهران", type: 3, address: "تهران، محدودهٔ پارک دانشجو", lat: 35.7004, lng: 51.4052, seen: at(260), created: at(250), condition: "هوشیار و فعال", description: "گربهٔ تیره کنار فضای سبز دیده شد.", given: "ظرف آب و غذا گذاشته شد؛ در پیگیری دوباره حال عمومی‌اش بهتر بود.", needs: [], needText: "نیاز ثبت‌شده فعلاً برطرف شده است.", urgent: false, status: "done", events: [{ at: at(120), text: "آب و غذا تأمین شد و نیاز فعلی برطرف شد.", kind: "پیگیری نمونه" }] }
];

let data = [];
let moderationData = [];
let partners = [];
let activeCity = "تهران";
let activeFilter = "all";
let currentPage = "explore";
let listView = false;
let step = 0;
let photoDataUrl = null;
let photoBlob = null;
let selectedId = null;
let previousFocus = null;
let pickerMap = null;
let authMode = "login";
let lastSubmitTs = 0;
let userPos = null;
let locating = false;
let animateNext = true;
let countedOnce = false;

function loadDemoStorage() {
  try {
    const raw = localStorage.getItem("psps-dev-demo-v1");
    data = raw ? JSON.parse(raw) : clone(sample);
    if (!Array.isArray(data)) throw Error();
  } catch (e) {
    data = clone(sample);
  }
}
function persistDemo() {
  try {
    localStorage.setItem("psps-dev-demo-v1", JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

function toast(msg) {
  $("#toast").innerHTML = '<i class="spr spr-paw" aria-hidden="true"></i><span>' + esc(msg) + "</span>";
  $("#toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("show"), 4200);
}
function relative(iso) {
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 6e4));
  return d < 1 ? "همین حالا" : d < 60 ? `${fa(d)} دقیقه پیش` : d < 1440 ? `${fa(Math.floor(d / 60))} ساعت پیش` : `${fa(Math.floor(d / 1440))} روز پیش`;
}
function fullDate(iso) {
  const dt = new Date(iso), j = g2j(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  return `${pd(j[2])} ${JM[j[1] - 1]} ${pd(j[0])}، ساعت ${pd(pad2(dt.getHours()))}:${pd(pad2(dt.getMinutes()))}`;
}
function statusBadge(c) {
  return `<span class="status-badge ${c.status === "done" ? "done" : c.status === "going" ? "going" : c.urgent ? "urgent" : ""}">${c.status === "done" ? icon("check") : '<span class="' + (c.urgent ? "red-dot" : "green-dot") + '"></span>'}${c.status === "done" ? "نیاز فعلی برطرف شده" : c.status === "going" ? "آدمیوزاد در راه است" : c.urgent ? "نیازمند پیگیری فوری" : "در انتظار آدمیوزاد"}</span>`;
}
function thumb(c) {
  return c.photo ? `<img src="${esc(c.photo)}" alt="عکس ${esc(c.name)}" loading="lazy">` : catArt(c.type);
}
function distance(a, b, c, d) {
  const r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r;
  const v = Math.pow(Math.sin(x / 2), 2) + Math.cos(a * r) * Math.cos(c * r) * Math.pow(Math.sin(y / 2), 2);
  return 6371e3 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
function distTag(c) {
  if (!userPos) return "";
  const m = distance(userPos.lat, userPos.lng, c.lat, c.lng);
  return `<i class="meta-divider"></i><span>${m < 1e3 ? fa(Math.max(10, Math.round(m / 10) * 10)) + " متر" : fa(Number((m / 1e3).toFixed(1))) + " کیلومتر"}</span>`;
}

function card(c, i) {
  return `<article class="cat-card" style="--i:${Math.min(i || 0, 12)}" data-cat="${esc(c.id)}" tabindex="0" role="button" aria-label="مشاهده پروندهٔ ${esc(c.name)}"><div class="card-top"><div class="cat-thumb">${thumb(c)}</div><div class="card-info"><h3>${esc(c.name)}</h3>${statusBadge(c)}</div></div><p class="card-description">${esc(c.needText)}</p><div class="card-meta">${icon("pin")}<span>${esc(c.city || "تهران")} · ${esc(c.address.split("،").slice(0, 2).join("،"))}</span><i class="meta-divider"></i>${icon("clock")}<span>${relative(c.seen)}</span>${distTag(c)}</div>${miniTrack(c)}<div class="needs-row">${c.needs.map(needTag).join("")}${String(c.id).startsWith("sample") ? '<span class="need-tag">پروندهٔ نمونه</span>' : ""}${icon("arrow").replace("<svg", '<svg class="card-arrow"')}</div></article>`;
}

function matches(c) {
  const q = $("#search").value.trim().toLowerCase();
  const cityOk = activeCity === "همه شهرها" || !c.city || c.city === activeCity;
  return cityOk &&
    (!q || [c.name, c.city, c.address, c.description, c.needText].join(" ").toLowerCase().includes(q)) &&
    (activeFilter === "all" || (activeFilter === "urgent" && c.urgent && c.status !== "done") || (c.status !== "done" && c.needs.includes(activeFilter)));
}

function countUp(el, to) {
  const from = 0, t0 = performance.now(), dur = 900;
  const tick = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fa(Math.round(from + (to - from) * e)); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function bumpNum(el, val) {
  const txt = fa(val);
  if (el.textContent !== txt) { el.textContent = txt; el.style.animation = "none"; void el.offsetWidth; el.style.animation = "countPop .5s var(--spring)"; }
}

function partnersEnabled() {
  return Boolean(FEATURES.PARTNERS_ENABLED || (!window.PsPsBackend.isLive && FEATURES.PARTNERS_DEMO_PREVIEW));
}

function nearestPartnersForReport(c) {
  if (!partnersEnabled() || !partners.length) return [];
  const wantVet = c.needs.includes("vet") || c.urgent;
  return partners
    .filter((p) => !wantVet || p.kind === "vet" || p.kind === "clinic_24h")
    .map((p) => ({ ...p, distM: distance(c.lat, c.lng, p.lat, p.lng) }))
    .sort((a, b) => (b.is_featured - a.is_featured) || (a.distM - b.distM))
    .slice(0, 2);
}

function detailHTML(c) {
  const s = stageOf(c), ci = COND_TEXT.indexOf(c.condition);
  const nodes = [["follow", "دیده شد"], ["siren", "نیاز ثبت شد"], ["run", "در راه است"], ["check", "رفع شد"]];
  const evIcon = (e) => e.kind === "نیاز فعلی برطرف شد" ? ["ok", "check"] : e.kind === "آدمیوزاد در راه است" ? ["go", "run"] : e.kind === "لغو اعلام حضور" ? ["", "close"] : ["", "follow"];
  const short = c.address.split("،").slice(0, 3).join("،") || c.address;
  const isLive = window.PsPsBackend.isLive;
  const canDelete = c.mine || window.PsPsBackend.isModerator;
  const nearPartners = nearestPartnersForReport(c);

  return `<div class="detail-cover">${thumb(c)}${statusBadge(c)}<button class="icon-btn" data-close="detailDialog" aria-label="بستن پرونده">${icon("close")}</button></div>
<div class="detail-body"><div class="detail-title"><h2>${esc(c.name)}</h2><small>${String(c.id).startsWith("sample") ? "پروندهٔ نمونه" : (c.city || "تهران") + (isLive ? " · زنده" : " · محلی")}</small></div>
<div class="journey ${c.status === "done" ? "is-done" : ""}" style="--p:${s / 3}" role="img" aria-label="مرحلهٔ پرونده: ${nodes[s][1]}"><span class="jfill"></span>${nodes.map((n, i) => `<div class="j ${i <= s ? "on" : ""} ${i === s ? "cur" : ""}"><b>${gi(n[0])}</b><span>${n[1]}</span></div>`).join("")}</div>
<div class="stats"><div class="stat">${gi("clock")}<div><small>آخرین مشاهده</small><b>${relative(c.seen)}</b></div></div><div class="stat">${gi("pin")}<div><small>محل</small><b>${esc(short)}</b></div></div></div>
<details class="coords"><summary>${gi("pin", "")}جزئیات زمان و مختصات</summary><div class="detail-data"><p>آخرین مشاهده: ${fullDate(c.seen)}</p><p>زمان ثبت اولیه: ${fullDate(c.created)}</p><p>مختصات مشاهده: <bdi><code>${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}</code></bdi></p></div></details>
<div class="sec-t">${gi("heart")}حالش چطور بود؟</div>
<div class="mood">${CONDS.map((k, i) => `<span class="${i === ci ? "on" : ""}">${gi(k)}<em>${esc(COND_TEXT[i] || "")}</em></span>`).join("")}</div>
<div class="bubble">${esc(c.description)}</div>
<div class="sec-t">${gi("siren")}هنوز چی لازمه؟</div>
${c.needs.length ? `<div class="need-big">${c.needs.map((n, i) => `<div style="--i:${i}"><span class="ni">${gi(n)}</span>${needs[n] || esc(n)}</div>`).join("")}</div>${c.needText ? `<p class="field-hint">${esc(c.needText)}</p>` : ""}` : `<div class="all-good"><span class="ni">${gi("check")}</span>فعلاً همه‌چیز رسیدگی شده</div>`}
<div class="given-card"><span class="ni">${gi("hand")}</span><div><small>تا اینجا چی شده</small><p>${esc(c.given)}</p></div></div>
${c.status === "going" ? `<div class="going-banner">${gi("run")}یه آدمیوزاد داره میاد</div>` : ""}
<div class="detail-actions" style="margin-top:16px"><button class="primary" id="goingBtn" ${c.status === "done" ? "disabled" : ""}>${icon(c.goingByMe ? "check" : "heart")}${c.goingByMe ? "لغو اعلام حضور من" : c.status === "done" ? "نیاز فعلی برطرف شده" : "در راه هستم"}</button><a class="secondary" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}">${icon("pin")}مسیریابی</a></div>
${nearPartners.length ? `<div class="nearby-partners-box"><h4>نزدیک‌ترین دامپزشکی‌های همکار</h4>${nearPartners.map((p) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap"><span><strong>${esc(p.name)}</strong> (${fa((p.distM / 1000).toFixed(1))} کیلومتر)${p.discount_text ? " · " + esc(p.discount_text) : ""}</span><a class="secondary" style="padding:4px 10px;font-size:12px" data-partner-click="${esc(p.id)}" data-partner-action="directions" data-report-id="${esc(c.id)}" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">مسیر</a></div>`).join("")}</div>` : ""}
<div class="detail-meta-bar">
  <button type="button" class="ghost-danger" id="flagReportBtn">گزارش تخلف / اسپم</button>
  ${canDelete && !String(c.id).startsWith("sample") ? `<button type="button" class="ghost-danger" id="deleteReportBtn">حذف این گزارش</button>` : ""}
</div>
<p class="field-hint">محل مربوط به زمان مشاهده است؛ حضور فعلی گربه تضمین‌شده نیست.</p>
<div class="sec-t">${gi("clock")}ردِ پیگیری‌ها</div>
<div class="tl">${[...c.events].reverse().map((e) => { const [k, ic] = evIcon(e); return `<div class="tl-i ${k}"><span class="ti">${gi(ic)}</span><div><b>${esc(e.kind)}</b><small>${fullDate(e.at)}</small><p>${esc(e.text)}</p></div></div>`; }).join("")}<div class="tl-i first"><span class="ti">${gi("paw")}</span><div><b>اولین مشاهده ثبت شد</b><small>${fullDate(c.created)}</small><p>${esc(c.given)}</p></div></div></div>
<form id="updateForm" class="update-box gfx"><div class="ub-head"><span class="ni">${gi("paw")}</span><h3>تو هم دیدیش یا کمکی کردی؟</h3></div>
<div class="quick" id="updQuick">${[["water", "آب دادم"], ["food", "غذا دادم"], ["ok", "حالش بهتر بود"], ["vet", "بردمش دامپزشک"], ["follow", "دیگه ندیدمش"]].map((q) => `<button type="button" data-t="${q[1]}">${gi(q[0])}${q[1]}</button>`).join("")}</div>
<label><span class="vh">نتیجهٔ پیگیری</span><textarea id="updateText" required maxlength="700" placeholder="چه دیدی و چه کاری انجام دادی؟"></textarea></label>
<label class="switch"><input type="checkbox" id="sawAgain"><span class="sw-ico">${gi("follow")}</span><span class="sw-txt">دوباره همین‌جا دیدمش<small>زمان آخرین مشاهده به‌روز می‌شود</small></span><i class="sw"></i></label>
<span class="mini-q need-lab">الان چی لازمه؟</span>
<div class="need-options tiles">${Object.entries(needs).map(([k, v]) => `<label class="nt"><input type="checkbox" name="updatedNeeds" value="${k}" ${c.needs.includes(k) ? "checked" : ""}><span class="nt-ico">${gi(k)}</span><b>${v}</b><i class="nt-chk">${gi("check")}</i></label>`).join("")}</div>
<label><span class="vh">توضیح نیاز فعلی</span><textarea id="updatedNeedText" required maxlength="500">${esc(c.needText)}</textarea></label>
<label class="switch ok"><input type="checkbox" id="resolved" ${c.status === "done" ? "checked" : ""}><span class="sw-ico">${gi("check")}</span><span class="sw-txt">همه‌چیز رسیدگی شد<small>پرونده بسته می‌شود</small></span><i class="sw"></i></label>
<button class="primary" type="submit">ثبت به‌روزرسانی ${icon("check")}</button><p class="field-hint">${isLive ? "تغییرات به‌صورت زنده برای سایر کاربران شهر نمایش داده می‌شود." : "در حالت نمایشی، تغییرات فقط در همین مرورگر ذخیره می‌شود."}</p></form></div>`;
}

function initUpdateForm() {
  const f = $("#updateForm");
  if (!f) return;
  f.noValidate = true;
  const r = $("#resolved"), sync = () => { f.classList.toggle("is-resolved", r.checked); $("#updatedNeedText").required = !r.checked; };
  r.addEventListener("change", sync);
  sync();
  $$("#updQuick button").forEach((b) => b.onclick = () => {
    const t = $("#updateText"), s = b.dataset.t;
    if (!t.value.includes(s)) t.value = (t.value.trim() ? t.value.trim() + "؛ " : "") + s;
    b.classList.add("on");
  });
}

function celebrate(kind) {
  const dd = $("#detailDialog"); const host = dd.open && !dd.classList.contains("closing") ? dd : (document.querySelector("dialog[open]:not(.closing)") || document.body);
  const txt = { report: ["ثبت شد!", "ممنون که دیدیش؛ حالا بقیه هم می‌تونن کمک کنن"], going: ["آدمیوزاد در راهه!", "ممنون که پیگیری رو برعهده گرفتی"], done: ["نیاز برطرف شد!", "یه گربه امشب راحت‌تر می‌خوابه"] }[kind];
  const d = document.createElement("div");
  d.className = "cele " + kind;
  d.setAttribute("role", "status");
  d.innerHTML = `<div class="cele-card">${CAT_PIN.replace("<svg ", '<svg class="cat" ')}<b>${txt[0]}</b><small>${txt[1]}</small></div>` + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2, r = 130 + (i % 3) * 30; return `<i class="paw spr spr-paw" style="--i:${i};--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;--r:${(i % 2 ? 1 : -1) * 40}deg"></i>`; }).join("");
  host.appendChild(d);
  setTimeout(() => d.classList.add("out"), 1500);
  setTimeout(() => d.remove(), 2050);
}

(function initReportGraphics() {
  $$("[data-ic]").forEach((el) => el.innerHTML = gi(el.dataset.ic));
  const ct = $("#condTiles");
  if (ct) {
    ct.innerHTML = COND_TEXT.map((t, i) => `<label><input type="radio" name="cond" value="${i}" ${i === 0 ? "checked" : ""}>${gi(CONDS[i])}<span>${esc(t)}</span></label>`).join("");
    ct.addEventListener("change", (e) => { $("#catCondition").value = COND_TEXT[Number(e.target.value)]; });
  }
  const no = $("#needOptions");
  let manual = false;
  const compose = () => {
    const sel = $$("#needOptions input:checked").map((x) => needs[x.value]);
    $("#needDescription").value = sel.length ? "نیاز به " + sel.join("، ") + " دارد." : "";
  };
  if (no) {
    no.innerHTML = Object.entries(needs).map(([k, v]) => `<label class="nt"><input type="checkbox" value="${k}"><span class="nt-ico">${gi(k)}</span><b>${v}</b><i class="nt-chk">${gi("check")}</i></label>`).join("");
    no.addEventListener("change", () => { if (!manual) compose(); });
    $("#needDescription").addEventListener("input", () => { manual = true; });
  }
  const hq = $("#helpQuick");
  if (hq) {
    hq.innerHTML = [["water", "آب دادم"], ["food", "غذا دادم"], ["camera", "فقط عکس گرفتم"], ["hand", "هنوز کاری نکردم"]].map((q) => `<button type="button" data-t="${q[1]}">${gi(q[0])}${q[1]}</button>`).join("");
    hq.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const t = $("#helpGiven");
      if (!t.value.includes(b.dataset.t)) t.value = (t.value.trim() ? t.value.trim() + "؛ " : "") + b.dataset.t;
      b.classList.add("on");
    });
  }
  $("#reportForm").addEventListener("reset", () => {
    manual = false;
    $$("#helpQuick button").forEach((b) => b.classList.remove("on"));
    setTimeout(() => { if ($("#catCondition")) $("#catCondition").selectedIndex = 0; }, 0);
  });
})();

function renderPartnersPage() {
  const listEl = $("#partnersResults");
  if (!listEl) return;
  if (!partners.length) {
    listEl.innerHTML = `<div class="empty"><i class="spr spr-heart" aria-hidden="true"></i><h3>هنوز دامپزشکی یا پت‌شاپ همکاری در این شهر ثبت نشده است.</h3><p>با افزایش کاربران، کلینیک‌ها و پت‌شاپ‌های معتبر این شهر اینجا نمایش داده می‌شوند.</p><a class="primary" href="${esc(CFG.PARTNER_CONTACT_URL || "#")}">درخواست همکاری دامپزشکی / پت‌شاپ</a></div>`;
    return;
  }
  listEl.innerHTML = partners.map((p) => `
    <article class="partner-card ${p.is_featured ? "featured" : ""}">
      <div class="partner-badges">
        <span class="partner-badge">${esc(partnerKinds[p.kind] || p.kind)}</span>
        ${p.is_featured ? '<span class="partner-badge featured">پیشنهاد ویژه</span>' : ""}
        ${p.is_verified ? '<span class="partner-badge verified">تأییدشده</span>' : ""}
      </div>
      <h3 style="margin:2px 0">${esc(p.name)}</h3>
      <p style="margin:0;font-size:13px;opacity:.85">${esc(p.address)}</p>
      ${p.working_hours ? `<small>ساعت کاری: ${esc(p.working_hours)}</small>` : ""}
      ${p.discount_text ? `<div class="partner-coupon">${esc(p.discount_text)}</div>` : ""}
      <div class="partner-actions">
        ${p.phone ? `<a href="tel:${esc(p.phone)}" data-partner-click="${esc(p.id)}" data-partner-action="call">تماس</a>` : ""}
        <a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" data-partner-click="${esc(p.id)}" data-partner-action="directions">مسیریابی</a>
        ${p.website ? `<a target="_blank" rel="noopener noreferrer" href="${esc(p.website)}" data-partner-click="${esc(p.id)}" data-partner-action="website">وب‌سایت</a>` : ""}
      </div>
    </article>`).join("");
}

function renderModerationPage() {
  const el = $("#moderationResults");
  if (!el) return;
  if (!window.PsPsBackend.isModerator) {
    el.innerHTML = `<div class="empty"><h3>دسترسی مخصوص ناظران</h3><p>برای مشاهدهٔ صف بررسی تخلف‌ها، نقش حساب کاربری باید moderator یا admin باشد.</p></div>`;
    return;
  }
  const flagged = moderationData.filter((r) => r.flagsCount > 0 || r.moderationStatus !== "approved");
  if (!flagged.length) {
    el.innerHTML = `<div class="empty"><h3>صف نظارت پاک است!</h3><p>هیچ گزارش نیازمند بررسی یا پرچم‌گذاری‌شده‌ای وجود ندارد.</p></div>`;
    return;
  }
  el.innerHTML = flagged.map((r) => `
    <article class="mod-card">
      <div class="mod-card-head">
        <strong>${esc(r.name)} — ${esc(r.city)}</strong>
        <span class="mod-pill ${r.moderationStatus === "under_review" ? "review" : r.moderationStatus === "hidden" ? "hidden" : "approved"}">
          ${r.moderationStatus === "under_review" ? "در انتظار بررسی" : r.moderationStatus === "hidden" ? "مخفی‌شده" : "تأییدشده"} (${fa(r.flagsCount)} گزارش تخلف)
        </span>
      </div>
      <p style="margin:0;font-size:13px">${esc(r.address)} — ${esc(r.description)}</p>
      <div class="mod-actions">
        <button type="button" class="secondary" data-mod-action="approved" data-mod-id="${esc(r.id)}">تأیید و نمایش عمومی</button>
        <button type="button" class="ghost-danger" data-mod-action="hidden" data-mod-id="${esc(r.id)}">مخفی‌سازی</button>
        <button type="button" class="secondary" data-cat="${esc(r.id)}">مشاهدهٔ پرونده</button>
      </div>
    </article>`).join("");
}

function render() {
  const anim = animateNext; animateNext = false;
  const filtered = data.filter(matches);
  $("#results").classList.toggle("anim", anim);
  $("#myResults").classList.toggle("anim", anim);
  $("#results").innerHTML = filtered.map(card).join("") || '<div class="empty"><i class="spr spr-heart" aria-hidden="true"></i><h3>اینجا هنوز خبری نیست.</h3><p>جستجو، شهر یا فیلتر را تغییر بده یا اولین گزارش این محله را ثبت کن.</p><button class="secondary" id="resetFilters">نمایش همه</button></div>';
  $("#resultCount").textContent = `${fa(filtered.length)} پرونده (${activeCity})`;
  const nOpen = data.filter((c) => c.status !== "done").length, nDone = data.filter((c) => c.status === "done").length;
  if (!countedOnce) { countedOnce = true; countUp($("#needCount"), nOpen); countUp($("#doneCount"), nDone); } else { bumpNum($("#needCount"), nOpen); bumpNum($("#doneCount"), nDone); }

  const catMarkers = filtered.map((c, i) => ({
    i, drop: anim, id: c.id, lat: c.lat, lng: c.lng, label: c.name,
    ariaLabel: `پروندهٔ ${c.name}`,
    html: c.photo ? `<img src="${esc(c.photo)}" alt="">` : catArt(c.type),
    urgent: c.urgent && c.status !== "done"
  }));
  liveMap.setMarkers(catMarkers);

  const mine = data.filter((c) => c.mine || c.goingByMe || (c.events || []).some((e) => e.mine));
  $("#myResults").innerHTML = mine.length ? mine.map(card).join("") : `<div class="empty"><i class="spr spr-heart" aria-hidden="true"></i><h3>رد مهربانی‌ات از اینجا شروع می‌شود.</h3><p>یک مشاهده ثبت کن یا آدمیوزادِ یکی از گربه‌ها شو.</p><button class="primary" data-page="explore">دیدن گربه‌ها ${icon("arrow")}</button></div>`;

  if (partnersEnabled()) renderPartnersPage();
  if (window.PsPsBackend.isModerator) renderModerationPage();
}

function setPage(page) {
  currentPage = page;
  animateNext = true;
  ["explore", "mine", "partners", "moderation", "guide"].forEach((p) => {
    const el = $("#" + p + "Page");
    if (el) el.hidden = p !== page;
  });
  $$("[data-page]").forEach((b) => {
    const on = b.dataset.page === page;
    b.classList.toggle("active", on);
    if (b.closest("nav")) on ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current");
  });
  const pg = $("#" + page + "Page");
  if (pg) { pg.style.animation = "none"; void pg.offsetWidth; pg.style.animation = ""; }
  $("#sidebar").classList.remove("open");
  $("#navScrim").classList.remove("show");
  if (page === "moderation" && window.PsPsBackend.isModerator) refreshModeration();
  render();
  if (page === "explore") requestAnimationFrame(() => liveMap.resize());
  try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); }
}

function setView(list) {
  if (listView !== list) animateNext = true;
  listView = list;
  $("#viewSwitch").classList.toggle("is-list", list);
  $("#mapViewBtn").setAttribute("aria-pressed", String(!list));
  $("#listViewBtn").setAttribute("aria-pressed", String(list));
  $("#workspace").classList.toggle("list-mode", list);
  $("#mapViewBtn").classList.toggle("active", !list);
  $("#listViewBtn").classList.toggle("active", list);
  if (animateNext) render();
  if (!list) requestAnimationFrame(() => liveMap.resize());
}

function openDialog(id) {
  previousFocus = document.activeElement;
  $("#" + id).showModal();
}
function closeDialog(id) {
  const d = typeof id === "string" ? $("#" + id) : id;
  if (!d || !d.open || d.classList.contains("closing")) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { d.close(); return; }
  d.classList.add("closing");
  setTimeout(() => { d.classList.remove("closing"); d.close(); }, 230);
}

$$("dialog").forEach((d) => {
  d.addEventListener("cancel", (e) => { e.preventDefault(); closeDialog(d); });
  d.addEventListener("close", () => {
    if (!$$("dialog").some((x) => x.open) && previousFocus && previousFocus.isConnected) previousFocus.focus();
  });
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(d);
    }
  });
});

function requireAuthOrPrompt(actionLabel) {
  if (!window.PsPsBackend.isLive) return true;
  if (window.PsPsBackend.user) return true;
  toast(`برای ${actionLabel}، ابتدا وارد حساب کاربری شو.`);
  openAuthDialog("login");
  return false;
}

function openAuthDialog(mode = "login") {
  authMode = mode;
  $("#authMsg").textContent = "";
  $("#authMsg").classList.remove("ok");
  $$("#authTabs button").forEach((b) => b.classList.toggle("active", b.dataset.authMode === mode));
  $("#signupFields").hidden = mode !== "signup";
  $("#authSubmitBtn").textContent = mode === "signup" ? "ساخت حساب رایگان" : "ورود به حساب";
  $("#authSignedInBox").hidden = !window.PsPsBackend.user;
  $("#authFormWrap").hidden = Boolean(window.PsPsBackend.user);
  if (window.PsPsBackend.user) {
    const p = window.PsPsBackend.profile;
    $("#authUserSummary").textContent = `${p?.display_name || "کاربر"} (${window.PsPsBackend.user.email}) — نقش: ${p?.role || "user"}`;
  }
  openDialog("authDialog");
}

function updateAuthUI(user, profile) {
  const isLive = window.PsPsBackend.isLive;
  const sideName = $("#sideUserName");
  const sideSub = $("#sideUserSub");
  const sideAvatar = $("#sideAvatar");
  const topAuthBtn = $("#authTopBtn");
  const modeTag = $("#modeTag");
  const banner = $("#modeBanner");
  const storageNote = $("#storageNote");

  if (!isLive) {
    sideName.textContent = "آدمیوزاد مهربان";
    sideSub.textContent = "حالت نمایشی (بدون اتصال Supabase)";
    sideAvatar.textContent = "م";
    topAuthBtn.classList.remove("signed-in");
    topAuthBtn.innerHTML = '<span class="dot"></span>حالت نمایشی';
    modeTag.innerHTML = "<i></i>حالت نمایشی";
    banner.className = "mode-banner demo";
    banner.hidden = false;
    banner.innerHTML = `<div><strong>حالت نمایشی فعال است:</strong> برای اتصال واقعی و رایگان، کلیدهای <code>Supabase</code> را در <code>config.js</code> قرار دهید (راهنما در <code>README-FA.md</code>).</div>`;
    storageNote.innerHTML = `${icon("shield")} این نسخه فعلاً به Supabase متصل نشده و تغییرات فقط در مرورگر خودت ذخیره می‌شود.`;
  } else {
    modeTag.innerHTML = '<i style="background:#1d8f52"></i>نسخهٔ زنده';
    banner.hidden = true;
    storageNote.innerHTML = `${icon("shield")} متصل به دیتابیس زندهٔ Supabase با امنیت RLS و همگام‌سازی لحظه‌ای.`;
    if (user) {
      const name = profile?.display_name || user.email?.split("@")[0] || "آدمیوزاد";
      sideName.textContent = name;
      sideSub.textContent = profile?.role === "admin" ? "مدیر سامانه" : profile?.role === "moderator" ? "ناظر داوطلب" : `کاربر تأییدشده · ${profile?.city || "تهران"}`;
      sideAvatar.textContent = name.trim().charAt(0) || "م";
      topAuthBtn.classList.add("signed-in");
      topAuthBtn.innerHTML = `<span class="dot"></span>${esc(name)}`;
    } else {
      sideName.textContent = "ورود / ثبت‌نام";
      sideSub.textContent = "برای ثبت گزارش و کمک وارد شو";
      sideAvatar.textContent = "؟";
      topAuthBtn.classList.remove("signed-in");
      topAuthBtn.innerHTML = '<span class="dot"></span>ورود / ثبت‌نام';
    }
  }

  // نمایش یا مخفی‌سازی تب ناظران و تب دامپزشکی/پت‌شاپ
  $$('[data-page="moderation"]').forEach((el) => { el.hidden = !window.PsPsBackend.isModerator; });
  $$('[data-page="partners"]').forEach((el) => { el.hidden = !partnersEnabled(); });
}

function localDatetime() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
}

function startReport() {
  if (!requireAuthOrPrompt("ثبت گزارش جدید")) return;
  if ($("#detailDialog").open) closeDialog("detailDialog");
  $("#reportForm").reset();
  step = 0;
  photoDataUrl = null;
  photoBlob = null;
  $("#photoPreview").hidden = true;
  $("#photoPreview").removeAttribute("src");
  $("#uploadPrompt").hidden = false;
  $("#formError").textContent = "";
  $("#seenAt").value = localDatetime();
  setSeen(new Date());
  $$("#seenQuick button").forEach((b, i) => b.classList.toggle("on", i === 0));
  $("#nearbyWarning").hidden = true;
  if ($("#reportCity")) $("#reportCity").value = activeCity === "همه شهرها" ? "تهران" : activeCity;
  $("#locationHint").textContent = "اگر هنوز کنار گربه هستی، موقعیت فعلی را بگیر؛ در غیر این صورت مختصات محل مشاهده را وارد کن.";
  renderStep();
  openDialog("reportDialog");
}

["#jY", "#jM", "#jD", "#jH", "#jMin"].forEach((id) => $(id).addEventListener("change", () => { syncSeen(); $$("#seenQuick button").forEach((b) => b.classList.remove("on")); }));
$("#seenQuick").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; setSeen(new Date(Date.now() - Number(b.dataset.m) * 6e4)); $$("#seenQuick button").forEach((x) => x.classList.toggle("on", x === b)); });

let lastStep = 0;
function renderStep() {
  const back = step < lastStep; lastStep = step;
  $$("[data-form-step]").forEach((x) => { const on = Number(x.dataset.formStep) === step; x.hidden = !on; if (on) { x.classList.toggle("back", back); x.style.animation = "none"; void x.offsetWidth; x.style.animation = ""; } });
  $$("[data-step]").forEach((x) => { x.classList.toggle("active", Number(x.dataset.step) <= step); x.classList.toggle("cur", Number(x.dataset.step) === step); });
  $$("#stepper i").forEach((x, k) => x.classList.toggle("on", k < step));
  $("#prevStep").hidden = step === 0;
  $("#nextStep").hidden = step === 2;
  $("#submitReport").hidden = step !== 2;
  $("#stepCount").textContent = `مرحلهٔ ${fa(step + 1)} از ۳`;
  $("#reportDialog").scrollTop = 0;
  if (step === 1) requestAnimationFrame(() => {
    if (!pickerMap) pickerMap = new PsPsMap($("#pickMap"), {
      lat: liveMap.lat, lng: liveMap.lng, zoom: Math.max(13, liveMap.zoom),
      onPick: (p) => setPickLocation(p.lat, p.lng),
      onLocate: () => $("#getLocation").click()
    });
    if (userPos) pickerMap.showUser(userPos.lat, userPos.lng, userPos.acc);
    pickerMap.resize();
    setTimeout(() => pickerMap && pickerMap.resize(), 300);
  });
}

function fieldName(f) {
  const l = f.closest("label");
  if (!l) return "این بخش";
  const own = [...l.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
  return own || (l.querySelector(".vh") ? l.querySelector(".vh").textContent.trim() : "این بخش");
}
function flagField(f, msg, errEl) {
  if (errEl) { errEl.textContent = ""; void errEl.offsetWidth; errEl.textContent = msg; if (window.matchMedia && matchMedia("(max-width:760px)").matches) toast(msg); } else toast(msg);
  const target = f.type === "file" ? f.closest(".upload") : f;
  target.classList.remove("invalid"); void target.offsetWidth; target.classList.add("invalid");
  const clear = () => target.classList.remove("invalid");
  f.addEventListener("input", clear, { once: true }); f.addEventListener("change", clear, { once: true });
  try { target.scrollIntoView({ behavior: "smooth", block: "center" }); if (f.type !== "file") f.focus({ preventScroll: true }); } catch (e) {}
}
function checkFields(scope, errEl) {
  for (const f of scope.querySelectorAll("input,textarea")) {
    if (f.type === "file" || f.type === "radio" || f.type === "checkbox" || f.closest("[hidden]")) continue;
    const v = f.value.trim();
    if (f.required && !v) { flagField(f, `«${fieldName(f)}» را پر کن.`, errEl); return false; }
    if (v && f.type === "number" && (!f.checkValidity() || !isFinite(Number(v)))) { flagField(f, `مقدار «${fieldName(f)}» معتبر نیست.`, errEl); return false; }
  }
  return true;
}
function validStep() {
  const err = $("#formError");
  if (step === 0 && !photoDataUrl) {
    flagField($("#photoInput"), "یک عکس برای شناسایی گربه انتخاب کن.", err);
    return false;
  }
  if (!checkFields($(`[data-form-step="${step}"]`), err)) return false;
  if (step === 1 && new Date($("#seenAt").value).getTime() > Date.now() + 6e4) {
    flagField($("#jH"), "زمان مشاهده نمی‌تواند در آینده باشد.", err);
    return false;
  }
  if (step === 2 && !$$("#needOptions input:checked").length) {
    err.textContent = ""; void err.offsetWidth; err.textContent = "حداقل یک نیاز باقی‌مانده را انتخاب کن.";
    const no = $("#needOptions"); no.classList.remove("invalid-shake"); void no.offsetWidth; no.style.animation = "shake .45s"; setTimeout(() => no.style.animation = "", 500);
    return false;
  }
  $("#formError").textContent = "";
  return true;
}
$("#nextStep").onclick = () => { if (validStep()) { step++; renderStep(); } };
$("#prevStep").onclick = () => { if (step > 0) { step--; $("#formError").textContent = ""; renderStep(); } };

// فشرده‌سازی تصویر و حذف متادیتای EXIF قبل از آپلود به Supabase Storage
function compressPhoto(file) {
  const maxDim = FEATURES.PHOTO_MAX_DIMENSION || 1080;
  const quality = FEATURES.PHOTO_QUALITY || 0.78;
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const ratio = Math.min(1, maxDim / Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = Math.round(im.width * ratio);
      c.height = Math.round(im.height * ratio);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const dataUrl = c.toDataURL("image/jpeg", quality);
      c.toBlob((blob) => {
        if (!blob) return rej(new Error("blob failed"));
        res({ dataUrl, blob });
      }, "image/jpeg", quality);
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("image load failed")); };
    im.src = url;
  });
}

$("#photoInput").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (!f.type.startsWith("image/")) { toast("لطفاً یک فایل تصویر انتخاب کن."); return; }
  if (f.size > 20 * 1024 * 1024) { e.target.value = ""; toast("حجم عکس باید کمتر از ۲۰ مگابایت باشد."); return; }
  try {
    const out = await compressPhoto(f);
    photoDataUrl = out.dataUrl;
    photoBlob = out.blob;
    $("#photoPreview").src = photoDataUrl;
    $("#photoPreview").hidden = false;
    $("#uploadPrompt").hidden = true;
  } catch (e2) {
    photoDataUrl = null;
    photoBlob = null;
    e.target.value = "";
    toast("این تصویر قابل خواندن نیست؛ عکس دیگری انتخاب کن.");
  }
};

function geoOnce(o) { return new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, o)); }
async function getPosition() {
  if (!navigator.geolocation) { const e = new Error("unsupported"); e.code = -1; throw e; }
  try { return await geoOnce({ enableHighAccuracy: true, timeout: 1e4, maximumAge: 0 }); }
  catch (err) { if (err && err.code === 1) throw err; return await geoOnce({ enableHighAccuracy: false, timeout: 15e3, maximumAge: 12e4 }); }
}
async function ipLocate() {
  const r = await Promise.race([fetch("https://get.geojs.io/v1/ip/geo.json"), new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 7e3))]);
  const d = await r.json(), lat = parseFloat(d.latitude), lng = parseFloat(d.longitude);
  if (!isFinite(lat) || !isFinite(lng)) throw new Error("bad");
  return { coords: { latitude: lat, longitude: lng, accuracy: 2e4 } };
}
function geoMessage(err) {
  const c = err && err.code;
  if (c === -1) return "این مرورگر موقعیت‌یابی را پشتیبانی نمی‌کند؛ نقطه را روی نقشه لمس کن.";
  if (c === 1) return window.isSecureContext === false ? "مرورگر موقعیت‌یابی را فقط روی https اجازه می‌دهد." : "دسترسی به موقعیت داده نشد؛ اجازهٔ Location را روشن کن.";
  if (c === 3) return "دریافت موقعیت طول کشید؛ بیرون از ساختمان یا با GPS روشن دوباره امتحان کن.";
  return "موقعیت در دسترس نیست؛ GPS و اینترنت را بررسی کن.";
}
async function findMe() {
  if (locating) return { ok: false, busy: true, msg: "در حال یافتن موقعیت…" };
  locating = true;
  try {
    let pos, approx = false;
    try { pos = await getPosition(); }
    catch (err) {
      if (err && err.code === 1 && window.isSecureContext !== false) throw err;
      try { pos = await ipLocate(); approx = true; } catch (e2) { throw err; }
    }
    const lat = pos.coords.latitude, lng = pos.coords.longitude, acc = pos.coords.accuracy || 0;
    userPos = { lat, lng, acc, approx };
    liveMap.showUser(lat, lng, acc);
    if (pickerMap) pickerMap.showUser(lat, lng, acc);
    return { ok: true, lat, lng, acc, approx };
  } catch (err) {
    return { ok: false, msg: geoMessage(err) };
  } finally { locating = false; }
}
async function locateMain(silent) {
  const btn = $("#locateBtn");
  btn.disabled = true; btn.textContent = "◎ در حال یافتن موقعیت…";
  const r = await findMe();
  btn.disabled = false; btn.textContent = "◎ موقعیت من";
  if (!r.ok) { if (!silent && !r.busy) toast(r.msg); return; }
  liveMap.setView(r.lat, r.lng, r.approx ? 12 : r.acc > 400 ? 15 : 16);
  $("#mapCenterLabel").textContent = r.approx ? "موقعیت تقریبی (بر پایهٔ IP)" : `موقعیت تو · دقت ${fa(Math.round(r.acc))} متر`;
  render();
  if (!silent) toast(r.approx ? "فقط موقعیت تقریبی پیدا شد؛ برای دقت بیشتر GPS را روشن کن." : "موقعیتت پیدا شد.");
}
$("#getLocation").onclick = async () => {
  const b = $("#getLocation");
  b.disabled = true; b.textContent = "در حال دریافت موقعیت…";
  const r = await findMe();
  b.disabled = false; b.innerHTML = icon("locate") + (r.ok ? " دریافت دوبارهٔ موقعیت" : " تلاش دوباره برای موقعیت‌یابی");
  if (!r.ok) { $("#locationHint").textContent = r.msg; return; }
  setPickLocation(r.lat, r.lng);
  if (pickerMap) pickerMap.setView(r.lat, r.lng, r.approx ? 13 : 16);
  $("#locationHint").textContent = r.approx ? "موقعیت تقریبی به دست آمد؛ نقطهٔ دقیق را روی نقشه لمس کن." : `موقعیت فعلی دریافت شد؛ دقت تقریبی ${fa(Math.round(r.acc))} متر.`;
  checkNearby();
};

function setPickLocation(lat, lng) {
  $("#lat").value = lat.toFixed(6);
  $("#lng").value = lng.toFixed(6);
  if (pickerMap) pickerMap.setMarkers([{ lat, lng, label: "محل دیدن گربه", ariaLabel: "محل انتخاب‌شده", html: catArt(0), urgent: true }]);
  checkNearby();
}
function checkNearby() {
  const a = Number($("#lat").value), b = Number($("#lng").value);
  if (!$("#lat").value || !$("#lng").value) return;
  const close = data.filter((c) => distance(a, b, c.lat, c.lng) < 350 && c.status !== "done");
  $("#nearbyWarning").hidden = !close.length;
  $("#nearbyWarning").innerHTML = close.length ? `در حدود ۳۵۰ متری این نقطه پرونده وجود دارد؛ قبل از ثبت تازه بررسی کن: ${close.map((c) => `<button type="button" data-nearby="${esc(c.id)}">${esc(c.name)}</button>`).join("، ")}<br>نزدیکی موقعیت به‌تنهایی به معنی یکسان بودن گربه‌ها نیست.` : "";
}
function syncManualLocation() {
  const a = Number($("#lat").value), b = Number($("#lng").value);
  if ($("#lat").value && $("#lng").value && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180) {
    if (pickerMap) {
      pickerMap.setView(a, b, Math.max(13, pickerMap.zoom));
      pickerMap.setMarkers([{ lat: a, lng: b, label: "محل دیدن گربه", ariaLabel: "محل انتخاب‌شده", html: catArt(0), urgent: true }]);
    }
    checkNearby();
  }
}
$("#lat").onchange = syncManualLocation;
$("#lng").onchange = syncManualLocation;

// ثبت گزارش (زنده در Supabase یا حالت نمایشی)
$("#reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (step !== 2 || !validStep()) return;

  const cooldown = (FEATURES.REPORT_COOLDOWN_SECONDS || 45) * 1000;
  if (Date.now() - lastSubmitTs < cooldown) {
    const left = Math.ceil((cooldown - (Date.now() - lastSubmitTs)) / 1000);
    $("#formError").textContent = `برای جلوگیری از اسپم، ${fa(left)} ثانیه دیگر دوباره تلاش کن.`;
    return;
  }

  const submitBtn = $("#submitReport");
  submitBtn.disabled = true;
  submitBtn.textContent = "در حال ثبت…";

  try {
    const payload = {
      name: $("#catName").value.trim(),
      city: $("#reportCity") ? $("#reportCity").value : "تهران",
      condition: $("#catCondition").value,
      description: $("#catDescription").value.trim(),
      address: $("#address").value.trim(),
      lat: Number($("#lat").value),
      lng: Number($("#lng").value),
      seen: new Date($("#seenAt").value).toISOString(),
      given: $("#helpGiven").value.trim(),
      needs: $$("#needOptions input:checked").map((x) => x.value),
      needText: $("#needDescription").value.trim(),
      urgent: $("#urgent").checked,
      type: Math.floor(Math.random() * 5)
    };

    let created;
    if (window.PsPsBackend.isLive) {
      if (!requireAuthOrPrompt("ثبت گزارش")) return;
      if (photoBlob) {
        const up = await window.PsPsBackend.uploadPhotoBlob(photoBlob);
        payload.photoUrl = up.publicUrl;
        payload.photoPath = up.path;
      }
      created = await window.PsPsBackend.createReport(payload);
      data.unshift(created);
    } else {
      created = {
        ...payload,
        id: "cat-" + ((globalThis.crypto?.randomUUID?.()) || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`),
        mine: true,
        photo: photoDataUrl,
        created: new Date().toISOString(),
        status: "open",
        events: []
      };
      data.unshift(created);
      if (!persistDemo()) {
        data.shift();
        throw new Error("فضای مرورگر پر است؛ با عکس کم‌حجم‌تر امتحان کن.");
      }
    }

    lastSubmitTs = Date.now();
    closeDialog("reportDialog");
    activeFilter = "all";
    $("#search").value = "";
    $$("[data-filter]").forEach((b) => b.classList.toggle("active", b.dataset.filter === "all"));
    setPage("explore");
    setView(false);
    setTimeout(() => liveMap.setView(created.lat, created.lng, 15), 120);
    toast(window.PsPsBackend.isLive ? "گزارش روی نقشهٔ زنده ثبت شد!" : "گزارش در حالت نمایشی ثبت شد.");
    openDetail(created.id);
    celebrate("report");
  } catch (err) {
    $("#formError").textContent = err.message || "خطا در ثبت گزارش؛ اتصال اینترنت را بررسی کن.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<bdi dir="ltr" lang="en">PsPs it!</bdi> ${icon("check")}`;
  }
});

function openDetail(id) {
  const c = data.find((x) => x.id === id) || moderationData.find((x) => x.id === id);
  if (!c) return;
  selectedId = id;
  $("#detailContent").innerHTML = detailHTML(c);
  initUpdateForm();

  $("#goingBtn").onclick = async () => {
    if (!requireAuthOrPrompt("اعلام حضور")) return;
    const btn = $("#goingBtn");
    btn.disabled = true;
    try {
      if (window.PsPsBackend.isLive) {
        const { nextGoing, nextStatus } = await window.PsPsBackend.toggleGoing(c);
        c.goingByMe = nextGoing;
        c.status = nextStatus;
        await refreshReports();
      } else {
        c.goingByMe = !c.goingByMe;
        c.status = c.goingByMe ? "going" : "open";
        c.events.push({ at: new Date().toISOString(), text: c.goingByMe ? "برای بررسی شرایط اعلام حضور کردم." : "اعلام حضورم را لغو کردم؛ به آدمیوزاد دیگری نیاز است.", kind: c.goingByMe ? "آدمیوزاد در راه است" : "لغو اعلام حضور", mine: true });
        persistDemo();
      }
      render();
      openDetail(c.id);
      toast(c.goingByMe ? "اعلام حضورت ثبت شد!" : "اعلام حضورت لغو شد.");
      if (c.goingByMe) celebrate("going");
    } catch (err) {
      toast(err.message || "خطا در ثبت اعلام حضور.");
    } finally { btn.disabled = false; }
  };

  const flagBtn = $("#flagReportBtn");
  if (flagBtn) {
    flagBtn.onclick = () => {
      if (!requireAuthOrPrompt("ثبت گزارش تخلف")) return;
      $("#flagReportId").value = c.id;
      $("#flagDetails").value = "";
      $("#flagMsg").textContent = "";
      openDialog("flagDialog");
    };
  }

  const delBtn = $("#deleteReportBtn");
  if (delBtn) {
    delBtn.onclick = async () => {
      if (!confirm("این گزارش به صورت دائمی حذف شود؟")) return;
      try {
        if (window.PsPsBackend.isLive) {
          await window.PsPsBackend.deleteReport(c.id, c.photoPath);
          await refreshReports();
        } else {
          data = data.filter((x) => x.id !== c.id);
          persistDemo();
        }
        closeDialog("detailDialog");
        render();
        toast("گزارش حذف شد.");
      } catch (err) {
        toast(err.message || "حذف گزارش انجام نشد.");
      }
    };
  }

  $("#updateForm").onsubmit = async (e) => {
    e.preventDefault();
    if (!requireAuthOrPrompt("ثبت پیگیری")) return;
    const resolved = $("#resolved").checked;
    const chosen = $$('input[name="updatedNeeds"]:checked').map((x) => x.value);
    const text = $("#updateText").value.trim();
    const needText = $("#updatedNeedText").value.trim();
    if (!text) { flagField($("#updateText"), "بنویس چه دیدی یا چه کاری انجام دادی؛ دکمه‌های آماده هم کمک می‌کنند."); return; }
    if (!resolved && !chosen.length) { toast("یک نیاز باقی‌مانده انتخاب کن یا رفع نیاز را تأیید کن."); return; }
    if (!resolved && !needText) { flagField($("#updatedNeedText"), "نیاز فعلی را کوتاه توضیح بده."); return; }

    try {
      if (window.PsPsBackend.isLive) {
        await window.PsPsBackend.addReportUpdate(c, { text, sawAgain: $("#sawAgain").checked, needs: chosen, needText, resolved });
        await refreshReports();
      } else {
        const now = new Date().toISOString();
        c.events.push({ at: now, text, kind: resolved ? "نیاز فعلی برطرف شد" : "به‌روزرسانی وضعیت", mine: true });
        if ($("#sawAgain").checked) c.seen = now;
        c.needs = resolved ? [] : chosen;
        c.needText = resolved ? "نیاز ثبت‌شده فعلاً برطرف شده است." : needText;
        c.status = resolved ? "done" : c.goingByMe ? "going" : "open";
        if (resolved) c.goingByMe = false;
        persistDemo();
      }
      render();
      openDetail(c.id);
      toast("پیگیری و نیازهای فعلی به‌روز شد.");
      if (resolved) celebrate("done");
    } catch (err) {
      toast(err.message || "خطا در ثبت به‌روزرسانی.");
    }
  };

  if (!$("#detailDialog").open) openDialog("detailDialog");
}

// Auth form events
$$("#authTabs button").forEach((b) => {
  b.onclick = () => openAuthDialog(b.dataset.authMode);
});

$("#authForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  const msg = $("#authMsg");
  msg.textContent = "";
  msg.classList.remove("ok");
  try {
    if (authMode === "signup") {
      const displayName = $("#authName").value.trim();
      const city = $("#authCity").value;
      await window.PsPsBackend.signUp(email, password, displayName, city);
      msg.classList.add("ok");
      msg.textContent = "حساب ساخته شد! اگر تأیید ایمیل فعال است، صندوق ایمیلت را بررسی کن.";
    } else {
      await window.PsPsBackend.signIn(email, password);
      closeDialog("authDialog");
      toast("خوش آمدی! حالا می‌توانی گزارش و پیگیری ثبت کنی.");
    }
  } catch (err) {
    msg.textContent = err.message || "خطا در احراز هویت.";
  }
};

$("#magicLinkBtn").onclick = async () => {
  const email = $("#authEmail").value.trim();
  const msg = $("#authMsg");
  if (!email) { msg.textContent = "ابتدا ایمیل را وارد کن."; return; }
  try {
    await window.PsPsBackend.signInMagicLink(email);
    msg.classList.add("ok");
    msg.textContent = "لینک ورود بدون رمز به ایمیلت ارسال شد.";
  } catch (err) {
    msg.textContent = err.message || "ارسال لینک ورود ناموفق بود.";
  }
};

$("#signOutBtn").onclick = async () => {
  await window.PsPsBackend.signOut();
  closeDialog("authDialog");
  toast("از حساب کاربری خارج شدی.");
};

// Flag form submit
$("#flagForm").onsubmit = async (e) => {
  e.preventDefault();
  const reportId = $("#flagReportId").value;
  const reason = $("#flagReason").value;
  const details = $("#flagDetails").value.trim();
  try {
    if (window.PsPsBackend.isLive) {
      await window.PsPsBackend.flagReport(reportId, reason, details);
    }
    closeDialog("flagDialog");
    toast("گزارش تخلف ثبت شد؛ تیم نظارت بررسی می‌کند.");
  } catch (err) {
    $("#flagMsg").textContent = err.message || "ثبت گزارش تخلف ناموفق بود.";
  }
};

// City selector initialization
function initCitySelectors() {
  const opts = CITIES.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("");
  const mainSel = $("#citySelect");
  if (mainSel) {
    mainSel.innerHTML = opts;
    mainSel.value = activeCity;
    mainSel.onchange = async () => {
      activeCity = mainSel.value;
      const preset = CITIES.find((c) => c.id === activeCity);
      if (preset) liveMap.setView(preset.lat, preset.lng, preset.zoom);
      await refreshReports();
      if (partnersEnabled()) await refreshPartners();
      render();
    };
  }
  const cityOnlyOpts = CITIES.filter((c) => c.id !== "همه شهرها").map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("");
  if ($("#reportCity")) $("#reportCity").innerHTML = cityOnlyOpts;
  if ($("#authCity")) $("#authCity").innerHTML = cityOnlyOpts;
}

async function refreshReports() {
  if (!window.PsPsBackend.isLive) {
    if (!data.length) loadDemoStorage();
    return;
  }
  try {
    const rows = await window.PsPsBackend.fetchReports({ city: activeCity });
    if (rows) data = rows;
  } catch (err) {
    toast("خطا در دریافت گزارش‌های زنده.");
  }
}

async function refreshModeration() {
  if (!window.PsPsBackend.isLive || !window.PsPsBackend.isModerator) return;
  try {
    moderationData = await window.PsPsBackend.fetchReports({ city: "همه شهرها", includeModeration: true }) || [];
    renderModerationPage();
  } catch (err) {
    toast("خطا در بارگذاری صف نظارت.");
  }
}

async function refreshPartners() {
  if (!partnersEnabled()) { partners = []; return; }
  partners = await window.PsPsBackend.fetchPartners(activeCity);
}

$("#mapViewBtn").onclick = () => setView(false);
$("#listViewBtn").onclick = () => setView(true);
$("#allList").onclick = () => setView(true);
$("#authTopBtn").onclick = () => openAuthDialog("login");
$("#sideProfileBtn").onclick = () => openAuthDialog("login");
let searchT;
$("#search").oninput = () => { clearTimeout(searchT); searchT = setTimeout(render, 140); };
$("#menuBtn").onclick = () => { $("#sidebar").classList.add("open"); $("#navScrim").classList.add("show"); };
$("#navScrim").onclick = () => { $("#sidebar").classList.remove("open"); $("#navScrim").classList.remove("show"); };

document.addEventListener("click", async (e) => {
  const el = e.target.closest("button,a,[data-cat]");
  if (!el) return;
  if (el.dataset.page) { e.preventDefault(); setPage(el.dataset.page); }
  if (el.dataset.action === "report") startReport();
  if (el.dataset.close) closeDialog(el.dataset.close);
  if (el.dataset.filter) {
    activeFilter = el.dataset.filter;
    $$("[data-filter]").forEach((b) => b.classList.toggle("active", b === el));
    animateNext = true;
    render();
  }
  if (el.dataset.cat) openDetail(el.dataset.cat);
  if (el.dataset.nearby) openDetail(el.dataset.nearby);
  if (el.id === "resetFilters") {
    activeFilter = "all";
    activeCity = "همه شهرها";
    if ($("#citySelect")) $("#citySelect").value = "همه شهرها";
    $("#search").value = "";
    $$("[data-filter]").forEach((b) => b.classList.toggle("active", b.dataset.filter === "all"));
    await refreshReports();
    render();
  }
  if (el.dataset.modAction && el.dataset.modId) {
    try {
      await window.PsPsBackend.moderateReport(el.dataset.modId, el.dataset.modAction);
      toast("وضعیت نظارتی گزارش به‌روز شد.");
      await refreshReports();
      await refreshModeration();
      render();
    } catch (err) { toast(err.message || "خطا در تغییر وضعیت."); }
  }
  if (el.dataset.partnerClick) {
    window.PsPsBackend.trackPartnerClick(el.dataset.partnerClick, el.dataset.partnerAction || "view", el.dataset.reportId || null);
  }
  if (el.classList.contains("brand") || el.classList.contains("footer-brand")) {
    e.preventDefault();
    setPage("explore");
  }
});

document.addEventListener("keydown", (e) => {
  const c = e.target.closest("[data-cat]");
  if (c && c.tagName !== "BUTTON" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openDetail(c.dataset.cat); }
  if (e.key === "Escape" && $("#sidebar").classList.contains("open")) { $("#sidebar").classList.remove("open"); $("#navScrim").classList.remove("show"); }
});

const liveMap = new PsPsMap($("#mapCanvas"), { lat: 35.706, lng: 51.399, zoom: 13, onMarker: (m) => openDetail(m.id), onLocate: () => locateMain() });
$("#locateBtn").onclick = () => locateMain();
$("#locateChip").onclick = () => locateMain();

// بوت اولیه
(async function boot() {
  initCitySelectors();
  loadDemoStorage();
  render();

  const res = await window.PsPsBackend.init(async (user, profile) => {
    updateAuthUI(user, profile);
    if (window.PsPsBackend.isLive) {
      await refreshReports();
      if (partnersEnabled()) await refreshPartners();
      render();
    }
  });

  if (res.live) {
    await refreshReports();
    if (partnersEnabled()) await refreshPartners();
    render();
    let rtTimer;
    window.PsPsBackend.subscribeRealtime(() => {
      clearTimeout(rtTimer);
      rtTimer = setTimeout(async () => {
        await refreshReports();
        render();
      }, 400);
    });
  } else {
    if (partnersEnabled()) await refreshPartners();
    render();
  }

  try {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((p) => {
        if (p.state === "granted") locateMain(true);
      }).catch(() => {});
    }
  } catch (e) {}
})();
