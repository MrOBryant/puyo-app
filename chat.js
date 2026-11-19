/* PUYO Group – prototype chatbot WhatsApp PUYO Member
   Tugas Strategic Management · Kelompok 1 Branding 7C
   Bot berbasis aturan (tanpa server). Data tersimpan di browser perangkat ini (localStorage). */
(() => {
'use strict';

/* ================= util ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const BLN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const hhmm = t => { const d = new Date(t); return pad(d.getHours()) + '.' + pad(d.getMinutes()); };
const dLong = t => { const d = new Date(t); return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const dMid = t => { const d = new Date(t); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const dShort = t => { const d = new Date(t); return `${d.getDate()} ${BLN[d.getMonth()]} ${d.getFullYear()}`; };
const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const monthKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; };
const endOfMonth = (t = Date.now()) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth()+1, 0, 23, 59, 59).getTime(); };
const endOfDayPlus = (days, t = Date.now()) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()+days, 23, 59, 59).getTime(); };
const rnd = n => Array.from({length:n}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const titleCase = s => s.toLowerCase().replace(/(^|[\s'’\-.])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
const md = s => esc(s)
  .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
  .replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?]|$)/g, '$1<i>$2</i>')
  .replace(/~([^~\n]+)~/g, '<s>$1</s>');

/* ================= data ================= */
const SILKY = [
  ['milk','Silky Milk Pudding','Best Seller','Puding susu yang lembut, rasa klasik yang disukai semua umur.'],
  ['chocolate','Silky Chocolate','Best Seller','Cokelat yang creamy dan pas manisnya, lumer di mulut.'],
  ['mango','Silky Mango','','Segar rasa mangga, cocok untuk siang yang panas.'],
  ['cookies','Silky Cookies & Cream','','Vanilla lembut dengan rasa cookies yang khas.'],
  ['strawberry','Silky Strawberry','','Strawberry manis-asam yang ringan.'],
  ['matcha','Silky Matcha','','Matcha dengan sedikit pahit yang seimbang.'],
  ['taro','Silky Taro','','Taro yang lembut dengan aroma khas.'],
  ['lychee','Silky Lychee','','Rasa leci yang wangi dan segar.'],
  ['bubblegum','Silky Bubblegum','','Rasa permen karet yang ceria, favorit anak-anak.'],
  ['vanilla','Silky Classic Vanilla','','Vanilla klasik yang lembut dan wangi.'],
  ['peach','Silky Peach','Baru','Rasa peach yang manis dan harum.'],
].map(([id, name, tag, desc]) => ({id, name, tag, desc, price:15000, cat:'silky', img:`img/${id}.png`}));
const PROTEIN = [
  {id:'puyotein-bulk', name:'PUYOTEIN BULK', tag:'Baru', price:28000, cat:'protein', img:'img/puyotein-bulk.png',
   desc:'Puding protein untuk fase bulking. ±15 g protein, ±196 kkal, 0 g gula tambahan. Rasa Chocolate, Peanut Butter, dan Banana.'},
  {id:'puyotein-cut', name:'PUYOTEIN CUT', tag:'Baru', price:28000, cat:'protein', img:'img/puyotein-cut.png',
   desc:'Puding protein untuk fase cutting/diet. ±15 g protein, ±127 kkal, 0 g gula tambahan. Rasa Strawberry, Matcha, dan Vanilla.'},
];
const PRODUCTS = [...SILKY, ...PROTEIN];
const P = id => PRODUCTS.find(p => p.id === id);
const FLAVOR_WORDS = {
  milk:['milk','susu','original'], chocolate:['chocolate','coklat','cokelat','choco','chocolatte'], mango:['mango','mangga'],
  cookies:['cookies','cookie','oreo','cookies cream'], strawberry:['strawberry','stroberi','strawbery','strawberi'],
  matcha:['matcha','green tea','greentea','teh hijau'], taro:['taro','talas'], lychee:['lychee','leci','lechee','litchi'],
  bubblegum:['bubblegum','bubble gum','permen karet'], vanilla:['vanilla','vanila','vanilli'], peach:['peach','persik'],
  'puyotein-bulk':['bulk'], 'puyotein-cut':['cut'],
};
const HAMPERS = [
  {id:'h1', name:'Hampers Sweet Six', price:90000, items:['matcha','vanilla','chocolate','strawberry','taro','milk'],
   desc:'6 Silky Desserts: Matcha, Classic Vanilla, Chocolate, Strawberry, Taro, dan Milk Pudding. Dikemas dalam boks hampers + kartu ucapan.'},
  {id:'h2', name:'Hampers Fruity Fresh', price:90000, items:['mango','strawberry','lychee','peach','mango','lychee'],
   desc:'6 Silky Desserts rasa buah: 2 Mango, 2 Lychee, Strawberry, dan Peach. Segar untuk hantaran dan arisan.'},
  {id:'h3', name:'Hampers Party Twelve', price:180000, items:['milk','chocolate','mango','cookies','strawberry','matcha','taro','lychee','bubblegum','vanilla','peach','milk'],
   desc:'12 Silky Desserts, semua 11 varian + 1 Milk Pudding tambahan. Pas untuk acara kantor, ulang tahun, dan keluarga besar.'},
  {id:'h4', name:'Hampers PUYOTEIN Fit', price:112000, items:['puyotein-bulk','puyotein-bulk','puyotein-cut','puyotein-cut'],
   desc:'2 PUYOTEIN BULK + 2 PUYOTEIN CUT. ±15 g protein per cup, tanpa gula tambahan. Hadiah pas untuk teman yang rajin ke gym.'},
];
const PROMOS = [
  {t:'Promo Tahun Baru', d:'Bundling 8 cup Silky Desserts hanya Rp88.000', p:'1–15 Januari'},
  {t:'Promo Valentine', d:'Setiap pembelian Hampers Sweet Six gratis kartu ucapan & pita spesial', p:'7–14 Februari'},
  {t:'Promo Ramadan', d:'Paket berbuka: bundling 8 cup Silky Desserts Rp88.000', p:'selama bulan Ramadan'},
  {t:'Peluncuran PUYO Member', d:'Daftar PUYO Member lewat WhatsApp dan langsung dapat voucher diskon 10%', p:'sepanjang April'},
  {t:'Pilot PUYOTEIN', d:'Cicipi gratis PUYOTEIN BULK & CUT (sampling) di gerai pilot', p:'Mei–Juni'},
  {t:'Promo Libur Sekolah', d:'Paket Bertiga (3 cup bebas pilih) Rp42.000', p:'15–30 Juni'},
  {t:'Hari Anak Nasional', d:'Beli 2 Silky Bubblegum, gratis stiker PUYO edisi spesial', p:'20–26 Juli'},
  {t:'Promo HUT RI', d:'Bundling 8 cup Silky Desserts Rp88.000', p:'15–17 Agustus'},
  {t:'Back to Campus', d:'Paket Bertiga Rp42.000 dengan menunjukkan kartu pelajar/mahasiswa', p:'sepanjang September'},
  {t:'Taro Week', d:'Paket Bertiga Rp42.000 untuk varian Taro, Chocolate, dan Cookies & Cream', p:'24–31 Oktober'},
  {t:'Promo 11.11', d:'Bundling 8 cup Silky Desserts hanya Rp88.000', p:'11–13 November'},
  {t:'Hampers Akhir Tahun', d:'Gratis kartu ucapan & pita untuk semua hampers', p:'15–31 Desember'},
];
const OUTLETS = (window.OUTLETS || []).map((o, i) => ({i, n:o[0].trim(), f:(o[1]||'').trim(), c:(o[2]||'').trim(), u:(o[3]||'').trim()}));
const KEEPUP = new Set(['JGC','PIK','BSD','MOI','RS','PIM','TSM','FX','ITC','BXC','GI','PTC','CBD','AMB','LTC','DP','MOX','ICE','QBIG','BTC','SMS','IPM','CSB','BCP','TP','PGC','KKO','SCBD','JPM','BG','AMG','MKG','GOR','TIM','RSCM','DM']);
const oName = n => n.split(/\s+/).map(w => KEEPUP.has(w.replace(/[^A-Z]/g,'')) ? w : titleCase(w)).join(' ');
const CITY_XY = {
  'Tangerang':[-6.24,106.63],'Jakarta Selatan':[-6.26,106.81],'Jakarta Barat':[-6.17,106.76],'Jakarta Timur':[-6.23,106.90],
  'Jakarta Utara':[-6.14,106.88],'Jakarta Pusat':[-6.18,106.83],'Surabaya':[-7.27,112.75],'Bekasi':[-6.24,107.00],
  'Semarang':[-6.99,110.42],'Bandung':[-6.91,107.61],'Bali':[-8.67,115.21],'Depok':[-6.40,106.82],'Bogor':[-6.60,106.80],
  'Yogyakarta':[-7.80,110.37],'Malang':[-7.98,112.63],'Cibubur':[-6.37,106.89],'Cilegon / Serang / Merak':[-6.05,106.05],
  'Cirebon':[-6.73,108.55],'Karawang / Cikarang':[-6.31,107.20],'Pekalongan':[-6.89,109.67],'Gresik':[-7.16,112.65],
  'Solo':[-7.57,110.82],'Sidoarjo':[-7.45,112.72],
};
const CITY_ALIAS = {
  'Tangerang':['tangerang','bsd','serpong','alam sutera','gading serpong','tangsel','tangerang selatan','karawaci','bintaro','ciputat','pamulang','cikokol','gading','sutera'],
  'Jakarta Selatan':['jakarta selatan','jaksel','kemang','blok m','senayan','kuningan','pondok indah','kebayoran','cilandak','tebet','fatmawati','gandaria','pasar minggu','kalibata'],
  'Jakarta Barat':['jakarta barat','jakbar','puri','grogol','central park','taman anggrek','kembangan','cengkareng','slipi'],
  'Jakarta Timur':['jakarta timur','jaktim','cakung','cawang','jatinegara','cililitan','kramat jati','rawamangun','pulogadung'],
  'Jakarta Utara':['jakarta utara','jakut','kelapa gading','pluit','pik','sunter','ancol'],
  'Jakarta Pusat':['jakarta pusat','jakpus','thamrin','menteng','senen','gambir','grand indonesia','tanah abang'],
  'Surabaya':['surabaya','sby','suroboyo'],'Bekasi':['bekasi'],'Semarang':['semarang'],'Bandung':['bandung','bdg'],
  'Bali':['bali','denpasar','kuta','seminyak','canggu','badung','ubud','nusa dua','jimbaran'],'Depok':['depok','margonda'],
  'Bogor':['bogor'],'Yogyakarta':['jogja','yogya','yogyakarta','jogjakarta','diy'],'Malang':['malang'],'Cibubur':['cibubur'],
  'Cilegon / Serang / Merak':['cilegon','serang','merak','banten'],'Cirebon':['cirebon'],'Karawang / Cikarang':['karawang','cikarang'],
  'Pekalongan':['pekalongan'],'Gresik':['gresik'],'Solo':['solo','surakarta'],'Sidoarjo':['sidoarjo'],
};
const JAKARTA = ['Jakarta Selatan','Jakarta Barat','Jakarta Timur','Jakarta Utara','Jakarta Pusat'];
const CITIES_BY_COUNT = Object.entries(OUTLETS.reduce((a, o) => (a[o.c] = (a[o.c]||0) + 1, a), {})).sort((a, b) => b[1] - a[1]).map(x => x[0]);

/* ================= state ================= */
const KEY = 'puyo_wa_chat_v3';
const fresh = () => ({v:3, created:Date.now(), msgs:[], member:null, flow:null, txs:[], vouchers:[], stamps:[], cardsDone:[],
  lastOutlet:null, nearCity:null, bdayYears:[], menuOn:false, optOut:false, promoSent:{}, cart:{}, orders:[]});
let S;
function load(){ try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.v === 3) return Object.assign(fresh(), j); } catch(e){} return null; }
function save(){ try { if (S.msgs.length > 400) S.msgs = S.msgs.slice(-400); localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
S = load() || fresh();

/* ================= DOM refs ================= */
const feed = $('#feed'), box = $('#msgs'), inp = $('#inp'), sendBtn = $('#send'), sub = $('#sub'), sdown = $('#sdown');
let typingRow = null, unseen = 0;

/* ================= rendering ================= */
const TICK = '<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M11.07.65l-6.4 7.9-2.5-2.37-.83.87 3.43 3.25L12 1.4zM15.07.65l-6.4 7.9-.62-.59-.8.92 1.5 1.42L16 1.4z"/></svg>';
const VBADGE = '<svg width="17" height="17" viewBox="0 0 24 24"><path fill="#25d366" d="M12 1.6l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1-2.6 1.9-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z"/><path d="M8 12.3l2.7 2.7 5.3-5.6" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$$('.vbadge').forEach(e => e.innerHTML = VBADGE);
const IC = {
  list:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
  reply:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v5"/></svg>',
  pin:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  link:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  gift:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd58a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3.5 8 4.5 9 8 12 8zm0 0s1.5-4.5 4-3.5S15 8 12 8z"/></svg>',
  store:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/></svg>',
};

function renderAll(){
  feed.innerHTML = '';
  feed.insertAdjacentHTML('beforeend', `<div class="notice"><svg width="12" height="12" viewBox="0 0 24 24" fill="#54656f"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9zM9 7a3 3 0 0 1 6 0v2H9z"/></svg>Prototype tugas Strategic Management (Kelompok 1 Branding 7C). Bukan akun resmi PUYO. Pesan dan data hanya tersimpan di perangkat ini.</div>`);
  let lastDay = null, prev = null;
  S.msgs.forEach((m, idx) => {
    const dk = dayKey(m.at);
    if (dk !== lastDay){ feed.insertAdjacentHTML('beforeend', `<div class="chip">${chipLabel(m.at)}</div>`); lastDay = dk; prev = null; }
    feed.appendChild(buildRow(m, !prev || prev.from !== m.from, false));
    prev = m;
  });
  renderQR();
  scrollBottom(true);
  updateSide();
}
function chipLabel(t){
  const today = dayKey(Date.now()), yest = dayKey(Date.now() - 864e5), k = dayKey(t);
  if (k === today) return 'Hari ini'; if (k === yest) return 'Kemarin';
  return dMid(t);
}
function appendMsg(m){
  const last = S.msgs[S.msgs.length - 2];
  if (!last || dayKey(last.at) !== dayKey(m.at)) feed.insertAdjacentHTML('beforeend', `<div class="chip">${chipLabel(m.at)}</div>`);
  const first = !last || last.from !== m.from || dayKey(last.at) !== dayKey(m.at);
  removeQR();
  const near = nearBottom();
  feed.appendChild(buildRow(m, first, true));
  renderQR();
  if (near || m.from === 'me') scrollBottom(); else { unseen++; showSdown(); }
  updateSide();
}
function buildRow(m, first, anim){
  const row = document.createElement('div');
  row.className = 'row' + (m.from === 'me' ? ' me' : '') + (first ? ' first' : '');
  row.dataset.id = m.id;
  row.innerHTML = bubble(m, anim);
  return row;
}
function meta(m){
  return `<span class="meta">${hhmm(m.at)}${m.from === 'me' ? `<span class="tk${m.read ? ' read' : ''}">${TICK}</span>` : ''}</span>`;
}
function btnsHTML(m){
  let h = '';
  if (m.list) h += `<button class="list-btn" data-list="${m.id}">${IC.list}${esc(m.list.btn || 'Lihat menu')}</button>`;
  if (m.btns && m.btns.length) h += `<div class="btns">${m.btns.map(b => b.url
    ? `<a href="${esc(b.url)}" target="_blank" rel="noopener"><button>${IC.link}${esc(b.l)}</button></a>`
    : `<button data-act="${esc(b.a)}" data-label="${esc(b.l)}">${b.ic ? IC[b.ic] : IC.reply}${esc(b.l)}</button>`).join('')}</div>`;
  return h;
}
function bubble(m, anim){
  const A = anim ? ' anim' : '';
  switch (m.type){
    case 'text':
      return `<div class="b${A}"><div class="tx">${md(m.text)}</div>${meta(m)}${btnsHTML(m)}</div>`;
    case 'loc':
      return `<div class="b media${A}"><div class="locmsg"><div class="map"><svg width="34" height="34" viewBox="0 0 24 24" fill="#ea4335"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></div><div class="lc"><b>Lokasi saya</b><br><span style="color:var(--mut);font-size:12px">${esc(m.label || '')}</span>${meta(m)}</div></div></div>`;
    case 'products': {
      const secs = m.sections.map(s => `<div class="secttl">${esc(s.t)}</div><div class="car">${s.ids.map(id => { const p = P(id); return `<div class="pc" data-prod="${p.id}">${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}<div class="im"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></div><div class="pt">${esc(p.name)}</div><div class="pp">${rp(p.price)}</div><button class="padd" data-add="${p.id}" aria-label="Tambah ke keranjang">+</button></div>`; }).join('')}</div>`).join('');
      return `<div class="b wide${A}" style="width:min(92%,640px)">${m.text ? `<div class="tx">${md(m.text)}</div>` : ''}${secs}${meta(m)}${btnsHTML(m)}</div>`;
    }
    case 'product': {
      const p = P(m.pid);
      const extra = p.cat === 'silky' ? '±120 kkal per cup · tanpa lemak trans & pengawet · halal' : 'Pemanis: aspartam + asesulfam kalium · halal';
      return `<div class="b media${A}" style="width:min(78%,320px)"><div class="pd-img" data-zoom="${p.id}"><img src="${p.img}" alt="${esc(p.name)}"></div><div class="cap"><div class="tx"><b>${esc(p.name)}</b> · ${rp(p.price)}\n${esc(p.desc)}\n<span style="color:var(--mut);font-size:12.5px">${extra}</span></div>${meta(m)}</div>${btnsHTML(m)}</div>`;
    }
    case 'card':
      return `<div class="b media${A}" style="width:min(86%,340px)">${memberCardHTML(m.snap, anim)}<div class="cap">${m.text ? `<div class="tx">${md(m.text)}</div>` : ''}${meta(m)}</div>${btnsHTML(m)}</div>`;
    case 'voucher': {
      const v = S.vouchers.find(x => x.id === m.vid);
      return `<div class="b media${A}" style="width:min(86%,340px)">${v ? voucherHTML(v) : '<div class="empty">Voucher tidak ditemukan</div>'}<div class="cap">${m.text ? `<div class="tx">${md(m.text)}</div>` : ''}${meta(m)}</div>${btnsHTML(m)}</div>`;
    }
    case 'receipt': {
      const t = S.txs.find(x => x.id === m.txid);
      return `<div class="b media${A}" style="width:min(86%,340px)">${t ? receiptHTML(t) : ''}<div class="cap">${meta(m)}</div>${btnsHTML(m)}</div>`;
    }
    case 'outlets': {
      const list = m.ids.map(i => OUTLETS[i]).filter(Boolean);
      return `<div class="b wide${A}" style="width:min(86%,400px)"><div class="tx">${md(m.text)}</div><div class="olist" style="margin-top:6px">${list.map(o => `<div class="ol"><div class="pin">${IC.pin}</div><div style="flex:1;min-width:0"><div class="on">PUYO ${esc(oName(o.n))}</div><div class="of">${esc(o.f)}${o.f ? ' · ' : ''}${esc(o.c)}</div><div class="olinks">${o.u ? `<a href="${esc(o.u)}" target="_blank" rel="noopener">Google Maps ↗</a>` : ''}<a href="#" data-pick="${o.i}">🛒 Pickup di sini</a></div></div></div>`).join('')}</div>${meta(m)}${btnsHTML(m)}</div>`;
    }
    case 'order': {
      const od = (S.orders || []).find(x => x.id === m.oid);
      return `<div class="b media${A}" style="width:min(90%,370px)">${od ? orderHTML(od) : ''}<div class="cap">${m.text ? `<div class="tx">${md(m.text)}</div>` : ''}${meta(m)}</div></div>`;
    }
    case 'hampers':
      return `<div class="b wide${A}" style="width:min(88%,400px)">${m.text ? `<div class="tx">${md(m.text)}</div>` : ''}${m.ids.map(id => hamperHTML(HAMPERS.find(h => h.id === id))).join('')}${meta(m)}${btnsHTML(m)}</div>`;
    default:
      return `<div class="b${A}"><div class="tx">${md(m.text || '')}</div>${meta(m)}</div>`;
  }
}
function hamperHTML(h){
  const four = h.items.length === 4;
  const imgs = (h.items.length > 6 ? h.items.slice(0, 6) : h.items).map(id => `<img src="${P(id).img}" alt="">`).join('');
  return `<div class="hcard" data-hamper="${h.id}"><div class="hg${four ? ' four' : ''}">${imgs}</div><div class="hb"><div class="hn"><span>${esc(h.name)}</span><span class="hp">${rp(h.price)}</span></div><div class="hd">${esc(h.desc)}</div><button class="hadd" data-add="${h.id}">🛒 Tambah ke keranjang</button></div></div>`;
}
function memberCardHTML(s, anim){
  const slots = [];
  for (let i = 0; i < 5; i++){
    const on = i < s.n;
    slots.push(`<div class="slot${on ? ' on' : ''}${anim && s.newIdx === i ? ' new' : ''}" ${s.dates && s.dates[i] ? `title="${esc(s.dates[i])}"` : ''}>${on ? '<img src="img/wa-avatar.png" alt="">' : (i === 4 ? IC.gift : '')}</div>`);
  }
  const left = 5 - s.n;
  return `<div class="card"><div class="mcard"><div class="mt"><div><div class="k">PUYO Member</div><div class="nm">${esc(s.name)}</div><div class="id">${esc(s.mid)}</div></div><img class="lg" src="img/logo.png" alt=""></div><div class="slots">${slots.join('')}</div><div class="ms">${s.n >= 5 ? 'Kartu penuh! 1 PUYO gratis sudah dikirim 🎉' : `${s.n}/5 stamp · ${left} lagi untuk 1 PUYO gratis`}</div></div></div>`;
}
function voucherHTML(v){
  const now = Date.now(), used = !!v.usedAt, exp = !used && v.exp < now;
  const kind = v.type === 'bday' ? ' bday' : v.type === 'free' ? ' free' : '';
  const left = v.type === 'member10' ? `10%<small>DISKON</small>` : `1<small>PUYO GRATIS</small>`;
  const st = used ? `Sudah dipakai ${dShort(v.usedAt)}${v.usedOutlet ? ' di PUYO ' + oName(v.usedOutlet) : ''}` : exp ? 'Sudah kedaluwarsa' : `Berlaku s.d. ${dShort(v.exp)}`;
  return `<div class="vch${kind}${used || exp ? ' used' : ''}" data-voucher="${v.id}"><div class="vl">${left}</div><div class="vr"><div class="vt">${esc(v.title)}</div><div class="vd">${esc(v.desc)}</div><div class="vd" style="font-weight:600">${esc(st)}</div><span class="vc">${esc(v.code)}</span></div></div>`;
}
function receiptHTML(t){
  return `<div class="rcpt"><div class="rh"><span>PUYO ${esc(oName(t.outlet.n))}</span><span>${hhmm(t.at)}</span></div><div style="font-size:12px;color:var(--mut)">${esc(t.outlet.c)} · ${dShort(t.at)} · ${esc(t.id)}</div><hr>${t.items.map(it => `<div class="rl"><span>${it.qty}× ${esc(it.name)}</span><span>${rp(it.qty * it.price)}</span></div>`).join('')}<hr><div class="rl"><span>Subtotal</span><span>${rp(t.subtotal)}</span></div>${t.disc ? `<div class="rl disc"><span>${esc(t.discLabel)}</span><span>−${rp(t.disc)}</span></div>` : ''}<div class="rl tot"><span>Total</span><span>${rp(t.total)}</span></div>${t.stampNo ? `<div class="rl" style="color:var(--puyo-d);font-weight:600;margin-top:6px"><span>⭐ Stamp ke-${t.stampNo}</span><span>kartu ke-${t.cardNo}</span></div>` : ''}</div>`;
}

/* quick replies under the latest bot message */
function removeQR(){ $$('.qr', feed).forEach(e => e.remove()); }
function renderQR(){
  removeQR();
  const m = S.msgs[S.msgs.length - 1];
  if (!m || m.from !== 'bot' || !m.qr || !m.qr.length || typingRow) return;
  const d = document.createElement('div');
  d.className = 'qr';
  d.innerHTML = m.qr.map((q, i) => `<button data-act="${esc(q.a)}" data-label="${esc(q.l)}" style="animation-delay:${i * 40}ms">${esc(q.l)}</button>`).join('');
  feed.appendChild(d);
}

/* scroll helpers */
function nearBottom(){ return box.scrollHeight - box.scrollTop - box.clientHeight < 140; }
function scrollBottom(instant){
  requestAnimationFrame(() => { box.scrollTo({top: box.scrollHeight, behavior: instant ? 'auto' : 'smooth'}); });
  unseen = 0; showSdown();
}
function showSdown(){
  const hide = nearBottom() && !unseen;
  sdown.classList.toggle('hide', hide);
  const c = $('.cnt', sdown); c.hidden = !unseen; c.textContent = unseen;
}
box.addEventListener('scroll', () => { if (nearBottom()) unseen = 0; showSdown(); }, {passive:true});
sdown.onclick = () => scrollBottom();

/* sidebar (laptop) */
function updateSide(){
  const m = S.msgs[S.msgs.length - 1];
  $('#ciTime').textContent = m ? (dayKey(m.at) === dayKey(Date.now()) ? hhmm(m.at) : dShort(m.at)) : '';
  let pv = 'Ketik "Halo" untuk mulai';
  if (m){
    pv = m.type === 'text' ? m.text.replace(/[*_~]/g, '').split('\n')[0] : {products:'🍮 Katalog produk',product:'📷 Foto produk',card:'⭐ Kartu member',voucher:'🎟️ Voucher',receipt:'🧾 Struk pembelian',order:'🧾 Pesanan',outlets:'📍 Lokasi gerai',hampers:'🎁 Hampers',loc:'📍 Lokasi'}[m.type] || '';
    if (m.from === 'me') pv = '✓✓ ' + pv;
  }
  $('#ciPrev').textContent = pv;
  const av = $('#meAv');
  if (S.member){ av.classList.add('has'); av.textContent = S.member.name.trim()[0].toUpperCase(); }
}

/* ================= message pushing & bot queue ================= */
function push(m){
  m.id = m.id || uid(); m.at = m.at || Date.now();
  S.msgs.push(m); save(); appendMsg(m);
  return m;
}
function me(text, extra = {}){ return push(Object.assign({from:'me', type:'text', text, read:false}, extra)); }
const Q = []; let busy = false;
function bot(...items){ items.flat().forEach(i => i && Q.push(i)); if (!busy) runQ(); }
function setSub(t, typing){ sub.textContent = t; sub.classList.toggle('typing', !!typing); }
function markRead(){
  let ch = false;
  S.msgs.forEach(m => { if (m.from === 'me' && !m.read){ m.read = true; ch = true; } });
  if (ch){ save(); $$('.row.me .tk', feed).forEach(e => e.classList.add('read')); }
}
function showTyping(){
  if (typingRow) return;
  removeQR();
  typingRow = document.createElement('div');
  const last = S.msgs[S.msgs.length - 1];
  typingRow.className = 'row typing' + (!last || last.from !== 'bot' ? ' first' : '');
  typingRow.innerHTML = '<div class="b anim"><div class="dotsw"><i></i><i></i><i></i></div></div>';
  const near = nearBottom();
  feed.appendChild(typingRow);
  if (near) scrollBottom();
}
function hideTyping(){ if (typingRow){ typingRow.remove(); typingRow = null; } }
async function runQ(){
  busy = true;
  await sleep(350); markRead();
  while (Q.length){
    const it = Q.shift();
    if (typeof it === 'function'){ it(); continue; }
    if (it.wait){ await sleep(it.wait); continue; }
    setSub('mengetik...', true); showTyping();
    const len = (it.text || '').length;
    await sleep(it.type === 'text' || !it.type ? Math.min(1500, 420 + len * 9) : 700);
    hideTyping();
    push(Object.assign({from:'bot', type:'text'}, it));
    if (it.after) it.after();
    await sleep(140);
  }
  setSub('online'); busy = false;
  clearTimeout(runQ.t); runQ.t = setTimeout(() => setSub('Akun bisnis'), 9000);
}

/* ================= vouchers, stamps ================= */
function issueVoucher(type, extra = {}){
  const now = Date.now();
  const base = {
    member10:{title:`Diskon Member 10% · ${BULAN[new Date().getMonth()]}`, desc:'Diskon 10% untuk Silky Desserts, 1x pakai bulan ini di gerai PUYO. Tidak bisa digabung promo lain.', code:'PUYO10-' + rnd(5), exp:endOfMonth(now), month:monthKey(now)},
    bday:{title:'Hadiah Ulang Tahun 🎂', desc:'1 Silky Desserts gratis, klaim di gerai PUYO terdekat.', code:'PUYO-BDAY-' + rnd(4), exp:endOfDayPlus(7, now)},
    free:{title:'1 PUYO Gratis (5 stamp)', desc:'1 Silky Desserts gratis dari kartu stamp yang sudah penuh.', code:'PUYO-FREE-' + rnd(4), exp:endOfDayPlus(30, now)},
  }[type];
  const v = Object.assign({id:uid(), type, issuedAt:now, usedAt:null}, base, extra);
  S.vouchers.push(v); save();
  return v;
}
const activeMember10 = () => S.vouchers.find(v => v.type === 'member10' && v.month === monthKey());
const freeVouchers = () => S.vouchers.filter(v => (v.type === 'free' || v.type === 'bday') && !v.usedAt && v.exp >= Date.now());
function snap(newIdx = -1, nOverride){
  const n = nOverride != null ? nOverride : S.stamps.length;
  const ids = nOverride != null && S.cardsDone.length ? S.cardsDone[S.cardsDone.length - 1].txIds : S.stamps;
  return {name:S.member.name, mid:S.member.mid, n, newIdx, dates:ids.map(id => { const t = S.txs.find(x => x.id === id); return t ? dShort(t.at) : ''; })};
}
function birthdayToday(dob, now = new Date()){
  const [y, m, d] = dob.split('-').map(Number);
  if (m !== now.getMonth() + 1) return false;
  if (d === now.getDate()) return true;
  return m === 2 && d === 29 && !isLeap(now.getFullYear()) && now.getDate() === 28;
}
function nextBirthday(dob){
  const [y, m, d] = dob.split('-').map(Number);
  const now = new Date(); const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let yr = now.getFullYear();
  const mk = Y => new Date(Y, m - 1, (m === 2 && d === 29 && !isLeap(Y)) ? 28 : d);
  let nb = mk(yr); if (nb < t0) nb = mk(++yr);
  return {date:nb, days:Math.round((nb - t0) / 864e5), age:yr - y};
}

/* ================= NLU (multibahasa, berbasis aturan) ================= */
const norm = s => ' ' + s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/(\p{L})\1{2,}/gu, '$1').trim() + ' ';
function lev(a, b){ if (Math.abs(a.length - b.length) > 1) return 2; const dp = Array.from({length:a.length + 1}, (_, i) => [i]); for (let j = 1; j <= b.length; j++) dp[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return dp[a.length][b.length]; }
const CJK = /[぀-ヿ㐀-鿿가-힯؀-ۿ฀-๿Ѐ-ӿ]/;
function hit(n, words, fuzzy = true){
  const toks = n.trim().split(' ');
  let c = 0;
  for (const w of words){
    if (CJK.test(w)){ if (n.includes(w)) c++; continue; }
    if (w.includes(' ')){ if (n.includes(' ' + w + ' ')) c++; continue; }
    if (toks.includes(w)) { c++; continue; }
    if (fuzzy && w.length >= 5 && toks.some(t => t.length >= 4 && lev(t, w) <= 1)) c++;
  }
  return c;
}
const GREET = ['halo','haloo','hallo','helloo','hallow','hai','hi','hii','hello','helo','hellow','hey','heyy','hy','hola','bonjour','salut','ciao','ola','oi','hei','hej','merhaba','namaste','shalom','yo','sup','howdy','greetings','pagi','siang','sore','malam','selamat pagi','selamat siang','selamat sore','selamat malam','good morning','good afternoon','good evening','assalamualaikum','assalamu alaikum','asalamualaikum','salam','permisi','misi','punten','sampurasun','annyeong','annyeonghaseyo','konnichiwa','ohayo','nihao','ni hao','privet','xin chao','sawasdee','kumusta','guten tag','buongiorno','buenos dias','buenas','apa kabar','how are you','whats up','tes','test','ping','안녕','안녕하세요','こんにちは','おはよう','你好','您好','привет','مرحبا','السلام عليكم','สวัสดี'];
const INTENTS = {
  thanks:['makasih','terima kasih','terimakasih','trims','thx','thanks','thank you','thankyou','tq','ty','gracias','merci','arigato','arigatou','danke','obrigado','grazie','kamsahamnida','matur nuwun','hatur nuhun','suwun','xie xie','xiexie','谢谢','감사합니다','ありがとう','شكرا','spasibo','mantap','mantul','sip','oke makasih'],
  bye:['bye','dadah','dah','goodbye','good bye','see you','sampai jumpa','sampai ketemu','selamat tinggal','adios','sayonara','au revoir','pamit'],
  puyotein:['puyotein','protein','gym','fitness','fitnes','diet','workout','olahraga','whey','bulking','cutting','fit','atlet','otot','muscle'],
  products:['menu','varian','variant','variants','rasa','flavor','flavour','flavors','produk','product','products','puding','pudding','pudding','dessert','desserts','jual','sell','katalog','catalog','catalogue','pilihan','apa aja','apa saja','silky','what do you sell','list menu','sajian'],
  price:['harga','harganya','price','prices','pricelist','price list','berapa','brp','berapaan','how much','cost','biaya','mahal','murah','tarif','precio','prix','preis','值段','价格','가격','値段'],
  stores:['lokasi','location','locations','store','stores','gerai','outlet','outlets','toko','cabang','branch','dimana','di mana','where','alamat','address','terdekat','nearest','near','nearby','map','maps','mall','mal','shop','shops','tempat','donde','ou','where is'],
  hampers:['hampers','hamper','parcel','parsel','gift','gifts','kado','hadiah','bingkisan','giftbox','gift box','souvenir','oleh oleh','arisan','hantaran','box'],
  promo:['promo','promos','promosi','diskon','discount','discounts','sale','voucher','vouchers','deal','deals','potongan','cashback','offer','offers','bundling','bundle','murah','descuento','remise','할인','割引','优惠'],
  stamp:['stamp','stamps','stempel','kartu','card','poin','point','points','member','membership','loyalty','reward','rewards','kartu stamp','kartu member','cek stamp'],
  register:['daftar','register','registrasi','join','gabung','sign up','signup','bergabung','jadi member','mau member'],
  birthday:['ultah','ulang tahun','birthday','bday','hbd','lahir','b day'],
  history:['riwayat','history','transaksi','transaction','transactions','pembelian','struk','receipt','nota','belanja'],
  hours:['jam','buka','tutup','open','opening','close','closing','hours','operasional'],
  halal:['halal','babi','pork','gelatin','haram'],
  delivery:['delivery','antar','pesan antar','gofood','grabfood','shopeefood','ojol','kirim','ongkir','online','order online','go food','grab food'],
  nutrition:['kalori','calorie','calories','kkal','kcal','gula','sugar','sehat','healthy','gizi','nutrisi','nutrition','lemak','fat','diabetes'],
  human:['admin','cs','customer service','manusia','human','agent','operator','komplain','complain','complaint','keluhan','telepon','telpon','call'],
  stop:['stop','berhenti','unsubscribe','jangan kirim'],
  orders:['pesanan saya','status pesanan','lacak','lacak pesanan','tracking','track','my order','pesananku','order saya','cek pesanan'],
  order:['pesan','beli','order','keranjang','cart','checkout','pickup','pick up','ambil','take away','takeaway','buy','purchase','mau beli','mau pesan','bayar','qris','cash','tunai'],
};
const NUM_MENU = {1:'order',2:'products',3:'prices',4:'stores',5:'hampers',6:'promo',7:'stamp',8:'orders',9:'bday'};
function detect(text){
  const n = norm(text);
  const sc = {};
  for (const [k, w] of Object.entries(INTENTS)) sc[k] = hit(n, w);
  const greet = hit(n, GREET, false) > 0 || /^\s*p\s*$/.test(n);
  // product / flavor mention
  let prod = null;
  for (const [id, ws] of Object.entries(FLAVOR_WORDS)) if (hit(n, ws)){ prod = id; break; }
  // city mention
  let city = null;
  for (const [c, ws] of Object.entries(CITY_ALIAS)) if (hit(n, ws, false)){ city = c; break; }
  if (!city && hit(n, ['jakarta','jkt'], false)) city = 'Jakarta';
  return {n, sc, greet, prod, city};
}
function greetEcho(text){
  const n = norm(text);
  const h = new Date().getHours();
  const waktu = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
  if (/assalamu|asalamu|السلام/.test(n) || /^\s*salam\s*$/.test(n)) return 'Wa’alaikumsalam warahmatullahi wabarakatuh, Kak 🙏';
  if (/\b(pagi|siang|sore|malam)\b/.test(n)) return `Selamat ${waktu} juga, Kak! ${waktu === 'malam' ? '🌙' : '☀️'}`;
  if (/\b(good morning|good afternoon|good evening)\b/.test(n)) return `Good ${h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'}, Kak! 👋`;
  if (/\b(hello|helo|hellow|hey|hi|hii|hy|howdy|sup|whats up|greetings)\b/.test(n)) return 'Hello juga, Kak! 👋';
  const map = [[/\bhola|buenos|buenas\b/, '¡Hola! 👋'],[/\bbonjour|salut\b/, 'Bonjour! 👋'],[/\bciao|buongiorno\b/, 'Ciao! 👋'],[/\bola\b|\boi\b/, 'Olá! 👋'],
    [/\bguten tag|hallo\b/, 'Hallo! 👋'],[/annyeong|안녕/, '안녕하세요! 👋'],[/konnichiwa|ohayo|こんにちは|おはよう/, 'こんにちは! 👋'],[/nihao|ni hao|你好|您好/, '你好! 👋'],
    [/privet|привет/, 'Привет! 👋'],[/مرحبا/, 'مرحبا! 👋'],[/sawasdee|สวัสดี/, 'สวัสดี! 👋'],[/xin chao/, 'Xin chào! 👋'],[/namaste/, 'Namaste 🙏'],[/merhaba/, 'Merhaba! 👋'],
    [/kumusta/, 'Kumusta! 👋'],[/punten|sampurasun/, 'Mangga, Kak! 🙏'],[/apa kabar|how are you/, 'Kabar kami baik, terima kasih sudah bertanya 😊']];
  for (const [re, out] of map) if (re.test(n)) return out;
  return 'Halo, Kak! 👋';
}

/* ================= bot replies ================= */
const nm = () => S.member ? S.member.name.split(' ')[0] : 'Kak';
const kak = () => S.member ? `Kak ${S.member.name.split(' ')[0]}` : 'Kak';
function menuMsg(intro){
  S.menuOn = true; save();
  const m6 = S.member ? '⭐ Kartu stamp & voucher saya' : '⭐ Daftar PUYO Member (gratis)';
  return {text:(intro ? intro + '\n\n' : '') + `Silakan ketik *angka* atau pilih dari menu di bawah ini, atau langsung tulis pertanyaan Kakak 😊\n\n1️⃣ Pesan & ambil di gerai (pickup) 🛒\n2️⃣ Varian produk & PUYOTEIN\n3️⃣ Daftar harga\n4️⃣ Lokasi gerai PUYO\n5️⃣ Hampers\n6️⃣ Promo bulan ini\n7️⃣ ${m6.slice(2)}\n8️⃣ Pesanan saya\n9️⃣ Hadiah ulang tahun`,
    list:{btn:'Lihat menu', title:'Menu PUYO', secs:[
      {t:'Pesan', o:[['order','🛒','Pesan & ambil di gerai','Bayar QRIS atau tunai, ambil di gerai pilihan'],['orders','🧾','Pesanan saya','Status & riwayat pickup']]},
      {t:'Produk', o:[['products','🍮','Varian produk','11 rasa Silky Desserts + PUYOTEIN'],['prices','💰','Daftar harga','Harga per cup & harga member'],['puyotein','💪','PUYOTEIN','Puding protein, 0 g gula tambahan'],['hampers','🎁','Hampers','Paket hadiah 4–12 cup']]},
      {t:'Gerai & promo', o:[['stores','📍','Lokasi gerai','Cari gerai PUYO terdekat'],['promo','🏷️','Promo bulan ini',`Promo ${BULAN[new Date().getMonth()]} + diskon member`]]},
      {t:'PUYO Member', o:[[S.member ? 'stamp' : 'reg','⭐',S.member ? 'Kartu stamp & voucher' : 'Daftar PUYO Member', S.member ? 'Cek stamp & riwayat transaksi' : 'Diskon 10%/bulan, stamp, hadiah ultah'],['bday','🎂','Hadiah ulang tahun','1 PUYO gratis di hari ulang tahun']]},
    ]}};
}
function replyGreeting(text){
  const echo = greetEcho(text);
  if (S.member) return [{text:`${echo}\nSenang bisa ngobrol lagi dengan Kakak, ${S.member.name} 😊`}, menuMsg('Ada yang bisa kami bantu hari ini?')];
  return [{text:`${echo}\nTerima kasih sudah menghubungi *PUYO Group* 🍮 Kami siap membantu.`}, menuMsg('Ada yang bisa kami bantu hari ini?')];
}
function replyProducts(){
  return [{text:'Berikut varian puding PUYO 🍮\nGeser untuk melihat semua varian, lalu ketuk produk untuk melihat detailnya.'},
    {type:'products', sections:[{t:'Silky Desserts · Rp15.000/cup', ids:SILKY.map(p => p.id)}, {t:'PUYOTEIN · Rp28.000/cup', ids:PROTEIN.map(p => p.id)}],
     qr:[{l:'🛒 Buka katalog & pesan', a:'catalog'},{l:'💰 Daftar harga', a:'prices'},{l:'🎁 Hampers', a:'hampers'}]}];
}
function replyProduct(id){
  const p = P(id);
  return [{type:'product', pid:id, btns:[{l:'Tambah ke keranjang', a:'addcart:' + id, ic:'store'},{l:'Lihat varian lain', a:'products', ic:'list'}]}];
}
function replyPrices(){
  return [{text:`*Daftar harga PUYO* 💰 (harga di gerai, per cup)\n\n🍮 Silky Desserts (11 varian) — *Rp15.000*\n💪 PUYOTEIN BULK / CUT — *Rp28.000*\n🎁 Hampers — mulai *Rp90.000*\n\n*Benefit PUYO Member*\n• Diskon member 10%, 1x per bulan: Silky Desserts jadi *Rp13.500*\n• Kumpulkan 5 stamp → *1 Silky Desserts gratis*\n• Hadiah 1 PUYO gratis di hari ulang tahun\n\n⭐ Stamp didapat dari pembelian di gerai *dan* pesanan lewat chat WhatsApp ini (pesan & ambil di gerai).\n_Harga di GoFood/GrabFood dapat berbeda, dan pembelian lewat GoFood/GrabFood tidak mendapat stamp._`,
    qr:[{l:'🛒 Pesan sekarang', a:'order'},{l:'🏷️ Promo bulan ini', a:'promo'},{l:S.member ? '⭐ Kartu stamp' : '⭐ Daftar member', a:S.member ? 'stamp' : 'reg'}]}];
}
function replyPuyotein(){
  return [{text:'*PUYOTEIN* 💪 — puding protein dari PUYO\n_Enjoy Your Dessert, Fuel Your Goals._\n\n• ±15 g protein per cup (120 g)\n• *0 g gula tambahan* (pemanis aspartam + asesulfam kalium)\n• *BULK* ±196 kkal — Chocolate, Peanut Butter, Banana\n• *CUT* ±127 kkal — Strawberry, Matcha, Vanilla\n• Harga Rp28.000/cup'},
    {type:'products', sections:[{t:'PUYOTEIN', ids:PROTEIN.map(p => p.id)}], btns:[{l:'Hampers PUYOTEIN Fit', a:'hamper:h4', ic:'gift'},{l:'Cari gerai terdekat', a:'stores', ic:'pin'}]}];
}
function replyHampers(){
  return [{text:'Tentu, Kak! Ini pilihan *hampers PUYO* 🎁 yang cocok untuk hadiah, arisan, maupun acara kantor:'},
    {type:'hampers', ids:HAMPERS.map(h => h.id)},
    {text:'*Cara pesan:* ketuk *Tambah ke keranjang* pada hampers pilihan, lalu checkout dan pilih gerai pengambilan. Bayar dengan QRIS atau tunai di gerai.\n\n_Isi hampers dapat menyesuaikan stok gerai._',
     btns:[{l:'Buka katalog hampers', a:'catalog:hampers', ic:'list'}], qr:[{l:'📍 Lokasi gerai', a:'stores'},{l:'🏷️ Promo bulan ini', a:'promo'}]}];
}
function replyHamper(id){
  const h = HAMPERS.find(x => x.id === id);
  return [{type:'hampers', ids:[id], text:`Berikut detail *${h.name}*:`, btns:[{l:'Lihat hampers lain', a:'hampers', ic:'gift'},{l:'Cari gerai terdekat', a:'stores', ic:'pin'}]}];
}
function member10Status(){
  const v = activeMember10();
  if (!v) return 'belum aktif';
  if (v.usedAt) return `❌ sudah dipakai pada ${dShort(v.usedAt)}${v.usedOutlet ? ' di PUYO ' + oName(v.usedOutlet) : ''}. Kuota bulan depan aktif lagi tanggal 1.`;
  return `✅ *belum dipakai*, berlaku sampai ${dShort(v.exp)}.`;
}
function replyPromo(){
  const d = new Date(), pr = PROMOS[d.getMonth()];
  const base = `*Promo ${BULAN[d.getMonth()]} ${d.getFullYear()}* 🏷️\n\n*${pr.t}*\n${pr.d}\nPeriode: ${pr.p}`;
  if (S.member) return [{text:`${base}\n\n━━━━━━━━━━\n*Diskon member 10%* (1x per bulan, khusus Silky Desserts)\nStatus bulan ini: ${member10Status()}\n\n_Diskon member tidak bisa digabung dengan promo lain. Promo di prototype ini bersifat ilustrasi._`,
    btns:[{l:'Lihat voucher saya', a:'stamp'},{l:'Cari gerai terdekat', a:'stores', ic:'pin'}]}];
  return [{text:`${base}\n\n━━━━━━━━━━\nSelain promo di atas, *PUYO Member* mendapat *diskon 10%* yang bisa dipakai 1x setiap bulan. Daftarnya gratis, cukup lewat chat ini 😊\n\n_Promo di prototype ini bersifat ilustrasi._`,
    btns:[{l:'Daftar PUYO Member', a:'reg'},{l:'Lihat menu', a:'menu', ic:'list'}]}];
}
function replyStores(city){
  if (city){
    const cs = city === 'Jakarta' ? JAKARTA : [city];
    const list = OUTLETS.filter(o => cs.includes(o.c));
    if (!list.length) return [{text:`Mohon maaf, Kak, belum ada gerai PUYO di ${city} 🙏`}];
    const show = list.slice(0, 8);
    S.nearCity = cs[0]; save();
    return [{type:'outlets', ids:show.map(o => o.i), text:`Ada *${list.length} gerai PUYO* di ${city}${list.length > show.length ? `, berikut ${show.length} di antaranya` : ''} 📍`,
      qr:list.length > show.length ? [{l:`Lihat semua di ${city}`, a:'allcity:' + city},{l:'📍 Kirim lokasi saya', a:'loc'}] : [{l:'📍 Kirim lokasi saya', a:'loc'},{l:'Lihat menu', a:'menu'}]}];
  }
  return [{text:`Gerai PUYO tersebar di Jawa dan Bali 📍 (${OUTLETS.length} gerai tercantum di website PUYO).\n\nAgar kami bisa mencarikan gerai *terdekat*, silakan kirim lokasi Kakak, atau ketik nama kota/mal (contoh: _BSD_, _Surabaya_, _Kelapa Gading_).`,
    btns:[{l:'Kirim lokasi saya', a:'loc', ic:'pin'}],
    qr:['Tangerang','Jakarta Selatan','Jakarta Barat','Surabaya','Bekasi','Bandung','Bali','Semarang'].map(c => ({l:c, a:'city:' + c}))}];
}
function replyAllCity(city){
  const cs = city === 'Jakarta' ? JAKARTA : [city];
  const list = OUTLETS.filter(o => cs.includes(o.c));
  return [{type:'outlets', ids:list.map(o => o.i), text:`Semua gerai PUYO di ${city} (${list.length} gerai):`, qr:[{l:'Lihat menu', a:'menu'}]}];
}
function haversine(a, b){ const R = 6371, t = x => x * Math.PI / 180; const dl = t(b[0] - a[0]), dn = t(b[1] - a[1]); const h = Math.sin(dl/2)**2 + Math.cos(t(a[0])) * Math.cos(t(b[0])) * Math.sin(dn/2)**2; return 2 * R * Math.asin(Math.sqrt(h)); }
function askLocation(){
  if (!navigator.geolocation){ bot({text:'Mohon maaf, perangkat Kakak tidak mendukung berbagi lokasi. Silakan ketik nama kota atau mal ya 🙏'}); return; }
  toast('Meminta izin lokasi…');
  navigator.geolocation.getCurrentPosition(pos => {
    const here = [pos.coords.latitude, pos.coords.longitude];
    const ranked = Object.entries(CITY_XY).map(([c, xy]) => [c, haversine(here, xy)]).sort((a, b) => a[1] - b[1]);
    const [c0, km] = ranked[0];
    S.nearCity = c0; save();
    me('📍 Lokasi saya', {type:'loc', label:`${here[0].toFixed(4)}, ${here[1].toFixed(4)}`});
    const list = OUTLETS.filter(o => o.c === c0).slice(0, 6);
    const txt = km <= 60
      ? `Terima kasih, Kak! Gerai PUYO terdekat dari lokasi Kakak ada di area *${c0}* (perkiraan ±${Math.max(1, Math.round(km))} km dari pusat kota) 📍`
      : `Sepertinya belum ada gerai PUYO di dekat lokasi Kakak 🙏 Gerai terdekat ada di *${c0}* (±${Math.round(km)} km).`;
    bot({type:'outlets', ids:list.map(o => o.i), text:txt, qr:[{l:`Lihat semua di ${c0}`, a:'allcity:' + c0},{l:'Lihat menu', a:'menu'}]});
  }, err => {
    bot({text:'Izin lokasi belum diberikan, Kak 🙏 Tidak apa-apa, silakan pilih atau ketik nama kota/mal terdekat:',
      qr:['Tangerang','Jakarta Selatan','Jakarta Barat','Surabaya','Bekasi','Bandung','Bali','Semarang'].map(c => ({l:c, a:'city:' + c}))});
  }, {enableHighAccuracy:false, timeout:12000, maximumAge:600000});
}
function replyStamp(){
  if (!S.member) return replyNotMember('Kartu stamp hanya untuk *PUYO Member*.');
  const v = activeMember10();
  return [{type:'card', snap:snap(), text:`Kartu stamp Kakak saat ini: *${S.stamps.length}/5 stamp* ⭐\nKartu yang sudah penuh: ${S.cardsDone.length}\nDiskon member 10% bulan ini: ${v && !v.usedAt ? 'belum dipakai ✅' : 'sudah dipakai'}`,
    btns:[{l:'Lihat detail stamp & riwayat', a:'stamppop', ic:'list'},{l:'Pesan & ambil di gerai', a:'order', ic:'store'}]}];
}
function replyNotMember(lead){
  return [{text:`${lead} Daftarnya gratis dan cukup lewat chat ini, Kak 😊\n\nBenefit PUYO Member:\n• Diskon 10% setiap bulan\n• 1 stamp tiap pembelian di gerai atau lewat chat ini, 5 stamp = 1 PUYO gratis\n• 1 PUYO gratis di hari ulang tahun`, btns:[{l:'Daftar sekarang', a:'reg'},{l:'Nanti saja', a:'later'}]}];
}
function replyBday(){
  if (!S.member) return replyNotMember('Hadiah ulang tahun diberikan untuk *PUYO Member* tepat di hari ulang tahunnya 🎂');
  const nb = nextBirthday(S.member.dob);
  const v = S.vouchers.filter(x => x.type === 'bday').slice(-1)[0];
  if (birthdayToday(S.member.dob)){
    return [{text:`Hari ini adalah hari ulang tahun Kakak 🎉 Selamat ulang tahun, ${S.member.name}!`}, v ? {type:'voucher', vid:v.id, text:'Voucher hadiah ulang tahun Kakak:', btns:[{l:'Cari gerai terdekat', a:'stores', ic:'pin'}]} : null];
  }
  return [{text:`Ulang tahun Kakak tercatat *${new Date(S.member.dob + 'T00:00').getDate()} ${BULAN[Number(S.member.dob.slice(5,7)) - 1]}* 🎂\nMasih *${nb.days} hari lagi* (${dLong(nb.date)}).\n\nTepat di hari itu, kami akan mengirimkan voucher *1 PUYO gratis* yang bisa diklaim di gerai PUYO terdekat.`}];
}
function replyHistory(){ if (!S.member) return replyNotMember('Riwayat transaksi tersimpan untuk *PUYO Member*.'); openStampPopup(); return []; }

/* ================= registration flow ================= */
function startReg(){
  if (S.member) return bot({text:`Kakak sudah terdaftar sebagai PUYO Member sejak ${dShort(S.member.joinedAt)} 😊`}, replyStamp());
  S.flow = {step:'consent'}; save();
  bot({text:'Baik, Kak! Sebelum mendaftar, mohon persetujuannya 🙏\n\nKami akan menyimpan *nama* dan *tanggal lahir* Kakak untuk program PUYO Member (stamp, voucher, dan hadiah ulang tahun), sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi. Kakak dapat berhenti kapan saja dengan membalas *STOP*.\n\nApakah Kakak setuju?',
    btns:[{l:'Setuju', a:'consent_yes'},{l:'Tidak', a:'consent_no'}]});
}
const YES = ['ya','iya','iyaa','y','yes','yup','yep','ok','oke','okay','okey','setuju','boleh','agree','sure','sip','siap','lanjut','benar','betul','bener','correct','si','oui','hai','はい','네','是','对'];
const NO = ['tidak','tdk','gak','ga','nggak','engga','enggak','no','nope','jangan','batal','cancel','nanti','later','tidak setuju','salah','ubah','ganti','edit','non','いいえ','아니요','不'];
function isYes(t){ const n = norm(t); return hit(n, YES) > 0 && hit(n, ['tidak','gak','ga','nggak','no','jangan','salah']) === 0; }
function isNo(t){ return hit(norm(t), NO) > 0; }
const NOT_NAMES = new Set([...GREET, 'menu','batal','cancel','promo','harga','lokasi','hampers','stamp','daftar','help','tolong','ya','iya','tidak','ok','oke','test','tes']);
function validName(raw){
  const t = raw.replace(/\s+/g, ' ').trim();
  if (!t) return {err:'Nama belum diisi, Kak. Silakan ketik nama Kakak ya 😊'};
  if (/\p{N}/u.test(t)) return {err:'Mohon maaf, nama hanya boleh berisi *huruf* (tanpa angka), Kak 🙏 Contoh: _Marsha_'};
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u.test(t)) return {err:'Mohon maaf, nama hanya boleh berisi *huruf* (boleh spasi, titik, atau tanda petik), tanpa emoji atau simbol 🙏 Contoh: _Marsha_'};
  const letters = (t.match(/\p{L}/gu) || []).length;
  if (letters < 2) return {err:'Nama minimal 2 huruf ya, Kak 🙏'};
  if (t.length > 40) return {err:'Nama terlalu panjang, maksimal 40 karakter ya, Kak 🙏'};
  if (NOT_NAMES.has(t.toLowerCase())) return {err:`Sepertinya "${t}" bukan nama, Kak 😊 Silakan ketik *nama* Kakak (contoh: _Marsha_), atau ketik *batal* untuk membatalkan pendaftaran.`};
  const hasCase = /\p{Lu}/u.test(t) && /\p{Ll}/u.test(t);
  return {name: hasCase && t !== t.toUpperCase() ? t : titleCase(t)};
}
const MONTHS = {jan:1,januari:1,january:1,feb:2,februari:2,february:2,peb:2,mar:3,maret:3,march:3,apr:4,april:4,mei:5,may:5,jun:6,juni:6,june:6,jul:7,juli:7,july:7,agu:8,agt:8,ags:8,agustus:8,aug:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,oct:10,october:10,nov:11,nop:11,november:11,nopember:11,des:12,desember:12,dec:12,december:12};
function parseDate(raw){
  const s = raw.toLowerCase().replace(/(\d+)(st|nd|rd|th)\b/g, '$1').replace(/[,]/g, ' ').trim();
  let d, m, y, mt;
  if ((mt = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/))) [, y, m, d] = mt;
  else if ((mt = s.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{2,4})$/))) [, d, m, y] = mt;
  else if ((mt = s.match(/^(\d{2})(\d{2})(\d{4})$/))) [, d, m, y] = mt;
  else if ((mt = s.match(/^(\d{1,2})\s*[-/. ]?\s*([a-z]+)\s*[-/. ]?\s*(\d{2,4})$/))){ d = mt[1]; m = MONTHS[mt[2]] || MONTHS[mt[2].slice(0,3)]; y = mt[3]; }
  else if ((mt = s.match(/^([a-z]+)\s+(\d{1,2})\s+(\d{2,4})$/))){ m = MONTHS[mt[1]] || MONTHS[mt[1].slice(0,3)]; d = mt[2]; y = mt[3]; }
  else if (/^(\d{1,2})\s*[-/. ]?\s*([a-z]+)$/.test(s) || /^(\d{1,2})[-/.](\d{1,2})$/.test(s)) return {err:'Mohon lengkapi dengan *tahun* lahirnya ya, Kak 🙏 Contoh: _19/11/2001_'};
  else return {err:'Mohon maaf, format tanggalnya belum kami kenali 🙏 Silakan ketik seperti _19/11/2001_ atau _19 November 2001_, atau ketuk tombol *Pilih tanggal*.'};
  d = Number(d); m = Number(m); y = Number(y);
  if (!m) return {err:'Nama bulannya belum kami kenali, Kak 🙏 Contoh: _19 November 2001_'};
  const now = new Date();
  if (y < 100) y += (y > now.getFullYear() % 100 ? 1900 : 2000);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return {err:`Tanggal ${d}/${m}/${y} tidak ada di kalender, Kak 🙏 Mohon periksa kembali.`};
  if (dt > now) return {err:'Tanggal lahir tidak boleh di masa depan, Kak 😅 Mohon periksa kembali.'};
  if (y < 1900) return {err:'Mohon periksa kembali tahun lahirnya, Kak 🙏'};
  return {iso:`${y}-${pad(m)}-${pad(d)}`, dt};
}
function handleFlow(text){
  const f = S.flow;
  const n = norm(text);
  if (f.step !== 'consent' && hit(n, ['batal','cancel','stop','berhenti']) && n.trim().split(' ').length <= 2){
    S.flow = null; save();
    return bot({text:'Baik, pendaftaran dibatalkan, Kak. Kakak bisa daftar kapan saja dengan mengetik *daftar* 😊'}, menuMsg());
  }
  if (f.step === 'consent'){
    if (isYes(text)) return consentYes();
    if (isNo(text)) return consentNo();
    return bot({text:'Mohon balas *Setuju* atau *Tidak* ya, Kak 🙏', btns:[{l:'Setuju', a:'consent_yes'},{l:'Tidak', a:'consent_no'}]});
  }
  if (f.step === 'name'){
    const r = validName(text);
    if (r.err) return bot({text:r.err});
    f.name = r.name; f.step = 'dob'; save();
    return askDob(`Salam kenal, *${r.name}*! 😊`);
  }
  if (f.step === 'dob'){
    const r = parseDate(text);
    if (r.err) return bot({text:r.err, btns:[{l:'Pilih tanggal', a:'pickdate', ic:'list'}]});
    return confirmDob(r.iso);
  }
  if (f.step === 'dob_confirm'){
    if (isYes(text)) return finishReg();
    if (isNo(text)){ f.step = 'dob'; save(); return askDob('Baik, silakan masukkan tanggal lahir yang benar.'); }
    const r = parseDate(text);
    if (!r.err) return confirmDob(r.iso);
    return bot({text:'Apakah tanggal lahirnya sudah benar, Kak?', btns:[{l:'Ya, benar', a:'dob_ok'},{l:'Ubah tanggal', a:'dob_edit'}]});
  }
}
function consentYes(){ S.flow = {step:'name'}; save(); bot({text:'Terima kasih atas persetujuannya, Kak 🙏\n\nBoleh kami tahu *nama* Kakak?\n_(hanya huruf, contoh: Marsha)_'}); }
function consentNo(){ S.flow = null; save(); bot({text:'Baik, tidak apa-apa, Kak 😊 Kakak tetap bisa bertanya seputar produk, harga, gerai, dan promo PUYO melalui chat ini.'}, menuMsg()); }
function askDob(lead){
  bot({text:`${lead}\n\nKapan *tanggal lahir* Kakak? 🎂\nKetik seperti _19/11/2001_ atau _19 November 2001_, atau ketuk *Pilih tanggal*.`, btns:[{l:'Pilih tanggal', a:'pickdate', ic:'list'}]});
}
function confirmDob(iso){
  S.flow.dob = iso; S.flow.step = 'dob_confirm'; save();
  bot({text:`Tanggal lahir Kakak: *${dLong(new Date(iso + 'T00:00'))}*\nApakah sudah benar?`, btns:[{l:'Ya, benar', a:'dob_ok'},{l:'Ubah tanggal', a:'dob_edit'}]});
}
function finishReg(){
  const f = S.flow;
  S.member = {name:f.name, dob:f.dob, mid:'PM-' + String(Math.floor(100000 + Math.random() * 900000)), joinedAt:Date.now()};
  S.flow = null;
  const v10 = issueVoucher('member10');
  const isBday = birthdayToday(f.dob);
  let vb = null;
  if (isBday){ vb = issueVoucher('bday'); S.bdayYears.push(new Date().getFullYear()); }
  save(); updateSide();
  const nb = nextBirthday(f.dob);
  const seq = [
    {text:`Selamat, *${S.member.name}*! 🎉\nKakak resmi menjadi *PUYO Member*. Berikut kartu member Kakak:`},
    {type:'card', snap:snap(), text:'Setiap pembelian di gerai PUYO *atau pesanan lewat chat ini* = 1 stamp. Kumpulkan 5 stamp untuk 1 PUYO gratis!'},
    {type:'voucher', vid:v10.id, text:'Sebagai sambutan, ini voucher *diskon member 10%* untuk bulan ini. Tunjukkan kode ke kasir ya 😊'},
  ];
  if (isBday){
    seq.push({wait:500});
    seq.push(() => confetti());
    seq.push({text:`Eh, tunggu sebentar… 👀\nHari ini, *${dLong(Date.now())}*, ternyata tepat hari ulang tahun Kakak! 🎂🎉\n\n*Selamat ulang tahun yang ke-${nb.age}, ${S.member.name}!* Semoga sehat dan bahagia selalu 🥳\n\nSebagai hadiah, kami berikan *1 PUYO Silky Desserts GRATIS* yang bisa diklaim di gerai PUYO terdekat:`});
    seq.push({type:'voucher', vid:vb.id, text:'Tunjukkan kode ini ke kasir PUYO terdekat. Berlaku 7 hari.', btns:[{l:'Cari gerai terdekat', a:'loc', ic:'pin'},{l:'Pilih kota', a:'stores', ic:'store'}]});
  } else {
    seq.push({text:`Ulang tahun Kakak sudah kami catat: *${new Date(f.dob + 'T00:00').getDate()} ${BULAN[Number(f.dob.slice(5,7)) - 1]}* 🎂\nMasih ${nb.days} hari lagi. Tepat di hari itu, kami akan mengirimkan voucher *1 PUYO gratis* untuk Kakak 🎁`});
  }
  seq.push(menuMsg('Ada lagi yang bisa kami bantu?'));
  bot(seq);
}

/* ================= router ================= */
function act(a, label){
  if (label && !/^(loc|stamppop|pickdate|catalog|cart|orders|qris|pickup|cancel|addcart)/.test(a)) me(label);
  const [k, arg] = a.split(':');
  switch (k){
    case 'menu': return bot(menuMsg());
    case 'products': return bot(replyProducts());
    case 'prod': return bot(replyProduct(arg));
    case 'prices': return bot(replyPrices());
    case 'stores': return bot(replyStores());
    case 'city': return bot(replyStores(arg));
    case 'allcity': return bot(replyAllCity(arg));
    case 'loc': return askLocation();
    case 'hampers': return bot(replyHampers());
    case 'hamper': return bot(replyHamper(arg));
    case 'promo': return bot(replyPromo());
    case 'puyotein': return bot(replyPuyotein());
    case 'stamp': return bot(replyStamp());
    case 'stamppop': return openStampPopup();
    case 'order': return bot(replyOrderStart());
    case 'catalog': return openCatalog(arg);
    case 'cart': return openCart();
    case 'orders': return openOrders();
    case 'qris': return openQris(arg);
    case 'pickup': return pickupOrder(arg);
    case 'cancel': return cancelOrder(arg);
    case 'addcart': { addCart(arg); return bot({text:`*${ITEM(arg).name}* sudah masuk keranjang 🛒 (total ${cartCount()} item · ${rp(cartTotal())})`, btns:[{l:'Lihat keranjang & checkout', a:'cart', ic:'store'},{l:'Tambah menu lain', a:'catalog', ic:'list'}]}); }
    case 'bday': return bot(replyBday());
    case 'reg': return startReg();
    case 'later': return bot({text:'Baik, Kak 😊 Kakak bisa daftar kapan saja dengan mengetik *daftar*.'}, menuMsg());
    case 'consent_yes': return S.flow && S.flow.step === 'consent' ? consentYes() : null;
    case 'consent_no': return S.flow && S.flow.step === 'consent' ? consentNo() : null;
    case 'pickdate': return openDatePicker();
    case 'dob_ok': return S.flow && S.flow.step === 'dob_confirm' ? finishReg() : null;
    case 'dob_edit': if (S.flow){ S.flow.step = 'dob'; save(); return askDob('Baik, silakan masukkan tanggal lahir yang benar.'); } return;
  }
}
function onUserText(text){
  me(text);
  if (S.flow) return handleFlow(text);
  const t = text.trim();
  const num = t.match(/^(\d)\s*[.)]?$/);
  if (num && NUM_MENU[num[1]]){
    const k = NUM_MENU[num[1]];
    if (k === 'stamp' && !S.member) return startReg();
    if (k === 'orders') return bot(replyOrdersList());
    return act(k);
  }
  const r = detect(t), sc = r.sc;
  S.menuOn = false; save();
  if (/^ (menu|main menu|lihat menu|menu utama|help|bantuan|tolong|start|mulai chat|info) $/.test(r.n)) return bot(menuMsg());
  if (sc.stop && r.n.trim().split(' ').length <= 3){ S.optOut = true; save(); return bot({text:'Baik, Kak. Kami tidak akan mengirimkan pesan promo lagi 🙏 Kakak tetap bisa bertanya dan memakai benefit member melalui chat ini. Ketik *mulai* untuk menerima promo kembali.'}); }
  if (/^\s*mulai\s*$/.test(r.n) && S.optOut){ S.optOut = false; save(); return bot({text:'Siap, Kak! Kakak akan kembali menerima info promo (maksimal 2 pesan per bulan) 😊'}); }
  const order = ['orders','register','birthday','history','delivery','order','hampers','puyotein','promo','stamp','price','stores','nutrition','halal','hours','human','products','thanks','bye'];
  const best = order.filter(k => sc[k] > 0).sort((a, b) => sc[b] - sc[a])[0];
  const pre = r.greet ? [{text:greetEcho(t)}] : [];
  if (sc.orders) return bot(pre, replyOrdersList());
  if (sc.order && !sc.delivery && best === 'order' || (sc.order && (r.prod || sc.hampers) && !sc.delivery)){
    if (r.prod){ addCart(r.prod, 1, true); return bot(pre, {text:`Baik, Kak! *${P(r.prod).name}* sudah kami masukkan ke keranjang 🛒 (total ${cartCount()} item · ${rp(cartTotal())})`, btns:[{l:'Lihat keranjang & checkout', a:'cart', ic:'store'},{l:'Tambah menu lain', a:'catalog', ic:'list'}]}); }
    if (sc.hampers) return bot(pre, {text:'Siap, Kak! Silakan pilih hampers di katalog, lalu checkout untuk diambil di gerai terdekat 🎁', btns:[{l:'Buka katalog hampers', a:'catalog:hampers', ic:'list'}]});
    return bot(pre, replyOrderStart());
  }
  // Specific product/flavor asked
  if (r.prod && (!best || best === 'products' || best === 'price' || (best === 'puyotein' && r.prod.startsWith('puyotein')))){
    if (best === 'price') return bot(pre, {text:`Harga *${P(r.prod).name}* adalah *${rp(P(r.prod).price)}* per cup 😊`}, replyProduct(r.prod));
    return bot(pre, replyProduct(r.prod));
  }
  if (r.city && (!best || best === 'stores' || best === 'products')) return bot(pre, replyStores(r.city));
  if (sc.puyotein && sc.price && !r.prod) return bot(pre, {text:'Harga *PUYOTEIN* BULK maupun CUT adalah *Rp28.000* per cup 💪'}, replyPuyotein());
  switch (best){
    case 'register': return S.member ? bot(pre, {text:`Kakak sudah terdaftar sebagai PUYO Member sejak ${dShort(S.member.joinedAt)} 😊`}, replyStamp()) : (pre.length && bot(pre), startReg());
    case 'birthday': return bot(pre, replyBday());
    case 'history': return bot(pre), replyHistory();
    case 'hampers': return bot(pre, replyHampers());
    case 'puyotein': return bot(pre, replyPuyotein());
    case 'promo': return bot(pre, replyPromo());
    case 'stamp': return bot(pre, replyStamp());
    case 'price': return bot(pre, replyPrices());
    case 'stores': return bot(pre, replyStores());
    case 'nutrition': return bot(pre, {text:'Silky Desserts sekitar *±120 kkal per cup*, tanpa lemak trans dan tanpa pengawet 🍮\n\nIngin pilihan yang lebih tinggi protein? Coba *PUYOTEIN*: ±15 g protein dan *0 g gula tambahan* (BULK ±196 kkal, CUT ±127 kkal).', qr:[{l:'💪 PUYOTEIN', a:'puyotein'},{l:'🍮 Varian produk', a:'products'}]});
    case 'halal': return bot(pre, {text:'Semua produk PUYO sudah *bersertifikat halal* ✅ Kakak bisa menikmatinya dengan tenang 😊'});
    case 'delivery': return bot(pre, {text:'PUYO juga bisa dipesan melalui *GoFood* dan *GrabFood* 🛵\n\nCatatan: stamp dan diskon member *tidak berlaku* untuk GoFood/GrabFood, ya Kak. Supaya tetap dapat stamp, Kakak bisa *pesan lewat chat ini* lalu ambil di gerai terdekat 🛒', qr:[{l:'📍 Lokasi gerai', a:'stores'}]});
    case 'hours': return bot(pre, {text:'Gerai PUYO buka mengikuti jam operasional mal atau lokasi masing-masing, umumnya pukul *10.00–22.00* 🕙', qr:[{l:'📍 Lokasi gerai', a:'stores'}]});
    case 'human': return bot(pre, {text:'Mohon maaf, Kak 🙏 Chat ini adalah *prototype* untuk tugas kuliah, sehingga belum terhubung dengan admin PUYO. Untuk keperluan resmi, silakan menghubungi kanal resmi PUYO di puyodesserts.com.'});
    case 'products': return bot(pre, replyProducts());
    case 'thanks': return bot({text:`Sama-sama, ${kak()}! 😊 Senang bisa membantu. Selamat menikmati PUYO 🍮`, qr:[{l:'Lihat menu', a:'menu'}]});
    case 'bye': return bot({text:`Terima kasih sudah menghubungi PUYO, ${kak()} 🙏 Sampai jumpa di gerai! 👋`});
  }
  if (r.greet) return bot(replyGreeting(t));
  if (r.city) return bot(replyStores(r.city));
  return bot({text:'Mohon maaf, Kak, kami belum memahami pesan tersebut 🙏'}, menuMsg());
}

/* ================= sheets / modals ================= */
function sheet(title, body, foot, opts = {}){
  const ov = document.createElement('div');
  ov.className = 'ov';
  ov.innerHTML = `<div class="sheet${opts.cls ? ' ' + opts.cls : ''}" role="dialog" aria-label="${esc(title)}"><div class="grab"></div><div class="sh-h"><h3>${esc(title)}</h3><button class="x" aria-label="Tutup"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="sh-b">${body}</div>${foot ? `<div class="sh-f">${foot}</div>` : ''}</div>`;
  const close = () => { ov.classList.add('out'); setTimeout(() => ov.remove(), 220); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  $('.x', ov).onclick = close;
  document.addEventListener('keydown', onKey);
  document.body.appendChild(ov);
  ov.close = close;
  return ov;
}
function openList(m){
  const L = m.list;
  const body = L.secs.map(s => `<div class="lsec">${esc(s.t)}</div>${s.o.map(([a, ic, t, d]) => `<button class="lopt" data-a="${esc(a)}" data-t="${esc(t)}"><div class="lic">${ic}</div><div><div class="lt">${esc(t)}</div><div class="ld">${esc(d)}</div></div></button>`).join('')}`).join('');
  const ov = sheet(L.title || 'Menu', body);
  $$('.lopt', ov).forEach(b => b.onclick = () => { ov.close(); act(b.dataset.a, b.dataset.t); });
}
function openDatePicker(){
  if (!S.flow || !['dob','dob_confirm'].includes(S.flow.step)) return;
  const max = dayKey(Date.now());
  const ov = sheet('Pilih tanggal lahir', `<div class="datebox"><label for="dobIn" style="font-size:13.5px;color:var(--mut)">Tanggal lahir</label><input type="date" id="dobIn" max="${max}" min="1900-01-01" value="${S.flow.dob || '2001-01-01'}"><div style="font-size:12.5px;color:var(--mut)">Hari ini: ${dLong(Date.now())}</div></div>`, '<button class="pbtn" id="dobGo">Kirim</button>');
  $('#dobGo', ov).onclick = () => {
    const v = $('#dobIn', ov).value; if (!v) return toast('Pilih tanggal terlebih dahulu');
    const [y, m, d] = v.split('-').map(Number);
    ov.close();
    onUserText(`${d} ${BULAN[m - 1]} ${y}`);
  };
}
function voucherSheet(v){
  const used = !!v.usedAt, exp = !used && v.exp < Date.now();
  const ov = sheet(v.title, `<div class="codebig">${voucherHTML(v)}<canvas id="qrc" width="168" height="168"></canvas><div class="cv">${esc(v.code)}</div><div style="color:var(--mut);font-size:13px">${used ? 'Voucher ini sudah dipakai.' : exp ? 'Voucher ini sudah kedaluwarsa.' : 'Tunjukkan kode ini ke kasir PUYO.'}</div></div>`,
    !used && !exp && S.member ? '<button class="pbtn" id="useV">Pakai saat pesan (checkout)</button>' : '');
  drawCode($('#qrc', ov), v.code);
  const u = $('#useV', ov); if (u) u.onclick = () => { ov.close(); setTimeout(() => cartCount() ? openCart() : openCatalog(), 230); };
}
function drawCode(cv, code){
  const ctx = cv.getContext('2d'), N = 25, s = cv.width / N;
  let h = 2166136261; const rand = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  for (const c of code) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.fillStyle = '#111b21';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
    const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    if (inF) continue; if (rand() > .52) ctx.fillRect(x * s, y * s, s, s);
  }
  const finder = (X, Y) => { ctx.fillRect(X * s, Y * s, 7 * s, 7 * s); ctx.fillStyle = '#fff'; ctx.fillRect((X + 1) * s, (Y + 1) * s, 5 * s, 5 * s); ctx.fillStyle = '#111b21'; ctx.fillRect((X + 2) * s, (Y + 2) * s, 3 * s, 3 * s); };
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
}
function openStampPopup(focusTx){
  if (!S.member) return bot(replyNotMember('Kartu stamp hanya untuk *PUYO Member*.'));
  const cur = S.stamps.map(id => S.txs.find(t => t.id === id)).filter(Boolean);
  const slots = [];
  for (let i = 0; i < 5; i++){
    const t = cur[i];
    slots.push(`<div class="slot${t ? ' on' : ''}${t ? '' : ''}" ${t ? `data-tx="${t.id}"` : ''} style="animation-delay:${i * 90}ms">${t ? `<img src="img/wa-avatar.png" alt=""><span class="sd">${dShort(t.at).replace(/ \d{4}$/, '')}</span>` : (i === 4 ? IC.gift : '')}</div>`);
  }
  const card = `<div class="card big"><div class="mcard"><div class="mt"><div><div class="k">PUYO Member</div><div class="nm">${esc(S.member.name)}</div><div class="id">${esc(S.member.mid)} · bergabung ${dShort(S.member.joinedAt)}</div></div><img class="lg" src="img/logo.png" alt=""></div><div class="slots">${slots.join('')}</div><div class="ms">${cur.length}/5 stamp · ${5 - cur.length} lagi untuk 1 PUYO gratis · kartu ke-${S.cardsDone.length + 1}</div></div></div>`;
  const txRow = (t, label, gray) => `<div class="trx" data-txrow="${t.id}"><div class="th"><div class="tn${gray ? ' gray' : ''}">${label}</div><div class="ti"><div class="t1">PUYO ${esc(oName(t.outlet.n))}</div><div class="t2">${dLong(t.at)} · ${hhmm(t.at)} · ${esc(t.outlet.c)}</div></div><div class="ta">${rp(t.total)}</div></div><div class="td">${t.items.map(it => `${it.qty}× ${esc(it.name)} — ${rp(it.qty * it.price)}`).join('<br>')}${t.disc ? `<br><span style="color:#1c8f72">${esc(t.discLabel)}: −${rp(t.disc)}</span>` : ''}<br>${esc(t.outlet.f)}${t.outlet.f ? ' · ' : ''}${esc(t.id)}${t.outlet.u ? ` · <a href="${esc(t.outlet.u)}" target="_blank" rel="noopener">Maps ↗</a>` : ''}</div></div>`;
  const curList = cur.length ? cur.map((t, i) => txRow(t, '⭐' + (i + 1))).join('') : '<div class="empty">Belum ada stamp di kartu ini. Setiap pembelian di gerai atau pesanan lewat chat ini = 1 stamp.</div>';
  const older = S.txs.filter(t => !S.stamps.includes(t.id)).slice().reverse();
  const olderList = older.length ? older.map(t => txRow(t, t.stampNo ? '⭐' + t.stampNo : '–', true)).join('') : '';
  const vs = S.vouchers.slice().reverse();
  const body = `${card}
    <div class="txl"><h4>Stamp di kartu ini (${cur.length}/5)</h4>${curList}</div>
    ${older.length ? `<div class="txl"><h4>Transaksi sebelumnya</h4>${olderList}</div>` : ''}
    <div class="txl"><h4>Voucher saya</h4>${vs.length ? `<div class="vlist">${vs.map(voucherHTML).join('')}</div>` : '<div class="empty">Belum ada voucher.</div>'}</div>`;
  const ov = sheet('Kartu Stamp PUYO Member', body, '<button class="pbtn" id="toKasir">🛒 Pesan & ambil di gerai (+1 stamp)</button>');
  $$('.slot.on', ov).forEach(sl => { sl.classList.add('new'); sl.onclick = () => focusRow(sl.dataset.tx); });
  $$('.trx .th', ov).forEach(h => h.onclick = () => h.parentElement.classList.toggle('open'));
  $$('[data-voucher]', ov).forEach(e => e.onclick = () => voucherSheet(S.vouchers.find(v => v.id === e.dataset.voucher)));
  $('#toKasir', ov).onclick = () => { ov.close(); setTimeout(() => openCatalog(), 230); };
  function focusRow(id){
    const r = $(`[data-txrow="${id}"]`, ov); if (!r) return;
    $$('.trx', ov).forEach(x => x.classList.remove('hl'));
    r.classList.add('hl', 'open'); r.scrollIntoView({behavior:'smooth', block:'center'});
  }
  if (focusTx) setTimeout(() => focusRow(focusTx), 300);
}

/* ---------- Pesan & ambil di gerai (pickup) ---------- */
const ITEM = id => { const p = P(id); if (p) return p; const h = HAMPERS.find(x => x.id === id); return h ? {id:h.id, name:h.name, price:h.price, cat:'hampers', img:P(h.items[0]).img, desc:h.desc, items:h.items} : null; };
const cartCount = () => Object.values(S.cart || {}).reduce((a, q) => a + q, 0);
const cartItems = () => Object.entries(S.cart || {}).filter(([id, q]) => q > 0 && ITEM(id)).map(([id, q]) => { const it = ITEM(id); return {id, name:it.name, qty:q, price:it.price, cat:it.cat}; });
const cartTotal = () => cartItems().reduce((a, i) => a + i.qty * i.price, 0);
function setCart(id, q){ S.cart = S.cart || {}; if (q > 0) S.cart[id] = q; else delete S.cart[id]; save(); updCartBadge(); document.dispatchEvent(new Event('cartchange')); }
function addCart(id, n = 1, silent){ setCart(id, ((S.cart || {})[id] || 0) + n); if (!silent) toast(`${ITEM(id).name} ditambahkan ke keranjang 🛒`); }
function updCartBadge(){ const b = $('#cartBadge'); if (!b) return; const n = cartCount(); b.hidden = !n; b.textContent = n; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
const ST_LABEL = {unpaid:'Menunggu pembayaran', new:'Pesanan diterima', preparing:'Sedang disiapkan', ready:'Siap diambil', done:'Selesai', cancelled:'Dibatalkan'};
const T_PREP = 4000, T_READY = 15000;

function pickupSlots(){
  const now = new Date(); const out = [];
  let d = new Date(now.getTime() + 30 * 60000);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  let day = 'Hari ini';
  const open = 10, close = 22;
  if (d.getHours() >= close || (d.getHours() === close - 1 && d.getMinutes() > 30) || now.getHours() >= close - 1){ d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, open, 0); day = 'Besok'; }
  if (d.getHours() < open) d.setHours(open, 0, 0, 0);
  while (out.length < 10 && (d.getHours() < close - 1 || (d.getHours() === close - 1 && d.getMinutes() <= 30))){
    out.push({t:d.getTime(), l:`${day}, ${hhmm(d)}`}); d = new Date(d.getTime() + 30 * 60000);
  }
  return out;
}
const canAsap = () => { const h = new Date().getHours(); return h >= 10 && h < 21; };

/* katalog (seperti katalog WhatsApp Business) */
function openCatalog(tab){
  let T = tab || 'silky';
  const ov = sheet('Katalog PUYO', '<div id="catTabs" class="ctabs"></div><div id="catList"></div>', '<button class="pbtn cartbar" id="toCart"></button>', {cls:'tall', onClose:() => document.removeEventListener('cartchange', foot)});
  const tabs = $('#catTabs', ov), list = $('#catList', ov), go = $('#toCart', ov);
  const groups = {silky:['🍮 Silky Desserts', SILKY], protein:['💪 PUYOTEIN', PROTEIN], hampers:['🎁 Hampers', HAMPERS.map(h => ITEM(h.id))]};
  function draw(){
    tabs.innerHTML = Object.entries(groups).map(([k, [l]]) => `<button data-t="${k}" class="${k === T ? 'on' : ''}">${l}</button>`).join('');
    list.innerHTML = groups[T][1].map(p => { const q = (S.cart || {})[p.id] || 0; return `<div class="crow" data-id="${p.id}"><div class="cimg${p.cat === 'hampers' ? ' hm' : ''}">${p.cat === 'hampers' ? p.items.slice(0, 4).map(i => `<img src="${P(i).img}" alt="">`).join('') : `<img src="${p.img}" alt="">`}</div><div class="cinfo"><div class="cn">${esc(p.name)}${p.tag ? ` <span class="ctag">${esc(p.tag)}</span>` : ''}</div><div class="cd">${esc(p.desc)}</div><div class="cp">${rp(p.price)}</div></div><div class="cq">${q ? `<div class="qty"><button class="minus" aria-label="Kurangi">−</button><span>${q}</span><button class="plus" aria-label="Tambah">+</button></div>` : `<button class="addb">Tambah</button>`}</div></div>`; }).join('');
    $$('[data-t]', tabs).forEach(b => b.onclick = () => { T = b.dataset.t; draw(); list.scrollTop = 0; });
    $$('.crow', list).forEach(r => {
      const id = r.dataset.id;
      const a = $('.addb', r); if (a) a.onclick = () => { addCart(id, 1, true); draw(); };
      const pl = $('.plus', r); if (pl) pl.onclick = () => { setCart(id, (S.cart[id] || 0) + 1); draw(); };
      const mi = $('.minus', r); if (mi) mi.onclick = () => { setCart(id, (S.cart[id] || 0) - 1); draw(); };
    });
    foot();
  }
  function foot(){ const n = cartCount(); go.disabled = !n; go.innerHTML = n ? `🛒 Lihat keranjang · ${n} item · ${rp(cartTotal())}` : 'Keranjang masih kosong'; }
  document.addEventListener('cartchange', foot);
  go.onclick = () => { ov.close(); setTimeout(openCart, 230); };
  draw();
}

/* keranjang */
function openCart(){
  const ov = sheet('Keranjang', '<div id="cartB"></div>', '<div style="display:flex;gap:8px"><button class="gbtn" id="cAdd" style="margin:0;flex:1">+ Tambah menu</button><button class="pbtn" id="cGo" style="flex:2">Checkout</button></div>');
  const B = $('#cartB', ov), go = $('#cGo', ov);
  function draw(){
    const items = cartItems();
    if (!items.length){ B.innerHTML = '<div class="empty" style="padding:30px 6px">🛒<br>Keranjang Kakak masih kosong.</div>'; go.disabled = true; go.textContent = 'Checkout'; return; }
    B.innerHTML = items.map(i => `<div class="crow" data-id="${i.id}"><div class="cimg sm"><img src="${ITEM(i.id).img}" alt=""></div><div class="cinfo"><div class="cn">${esc(i.name)}</div><div class="cp">${rp(i.price)}</div></div><div class="cq"><div class="qty"><button class="minus" aria-label="Kurangi">${i.qty === 1 ? '🗑' : '−'}</button><span>${i.qty}</span><button class="plus" aria-label="Tambah">+</button></div></div></div>`).join('') +
      `<div class="sumbox"><div class="sl tot" style="border:0;margin:0;padding:0"><span>Subtotal (${cartCount()} item)</span><span>${rp(cartTotal())}</span></div><div style="font-size:12px;color:var(--mut);margin-top:4px">Diambil sendiri di gerai PUYO pilihan Kakak. Diskon member & voucher dipilih saat checkout.</div></div>`;
    $$('.crow', B).forEach(r => { const id = r.dataset.id; $('.plus', r).onclick = () => { setCart(id, S.cart[id] + 1); draw(); }; $('.minus', r).onclick = () => { setCart(id, S.cart[id] - 1); draw(); }; });
    go.disabled = false; go.textContent = `Checkout · ${rp(cartTotal())}`;
  }
  $('#cAdd', ov).onclick = () => { ov.close(); setTimeout(() => openCatalog(), 230); };
  go.onclick = () => {
    if (!S.member){ ov.close(); bot(replyNotMember('Untuk memesan dan mengumpulkan stamp, Kakak perlu menjadi *PUYO Member* terlebih dahulu.')); return; }
    ov.close(); setTimeout(openCheckout, 230);
  };
  draw();
}

/* checkout: gerai → waktu ambil → benefit → pembayaran */
function openCheckout(){
  if (!cartItems().length) return toast('Keranjang masih kosong');
  const K = {step:0, outlet:S.lastOutlet, city:S.nearCity || 'Semua', q:'', slot:canAsap() ? 'asap' : null, ben:'none', pay:null, sort:null};
  const ov = sheet('Checkout · Ambil di gerai', '<div id="kb"></div>', '<div style="display:flex;gap:8px"><button class="gbtn" id="kBack" style="margin:0;flex:1">Kembali</button><button class="pbtn" id="kNext" style="flex:2">Lanjut</button></div>', {cls:'tall'});
  const kb = $('#kb', ov), nextB = $('#kNext', ov), backB = $('#kBack', ov);
  const silkyQty = () => cartItems().filter(i => i.cat === 'silky').reduce((a, i) => a + i.qty, 0);
  const calc = () => {
    const items = cartItems(); const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
    const silkySub = items.filter(i => i.cat === 'silky').reduce((a, i) => a + i.qty * i.price, 0);
    let disc = 0, discLabel = '';
    if (K.ben === 'm10'){ disc = Math.round(silkySub * .1); discLabel = 'Diskon member 10% (Silky Desserts)'; }
    else if (K.ben.startsWith('v:') && silkyQty()){ disc = 15000; const v = S.vouchers.find(x => x.id === K.ben.slice(2)); discLabel = v ? v.title : 'Voucher 1 PUYO gratis'; }
    return {items, subtotal, disc, discLabel, total:Math.max(0, subtotal - disc)};
  };
  const steps = () => `<div class="steps">${[0,1,2,3].map(i => `<span class="${i <= K.step ? 'on' : ''}"></span>`).join('')}</div>`;
  function outletList(){
    const q = K.q.trim().toLowerCase();
    let list;
    if (q){
      const words = q.split(/\s+/).filter(Boolean);
      list = OUTLETS.filter(o => { const t = (o.n + ' ' + o.f + ' ' + o.c).toLowerCase(); return words.every(w => t.includes(w)); });
      const extra = OUTLETS.filter(o => !list.includes(o) && ((CITY_ALIAS[o.c] || []).some(a => a === q || (q.length >= 3 && a.startsWith(q))) || (q === 'jakarta' && JAKARTA.includes(o.c))));
      list = list.concat(extra);
    } else list = OUTLETS.filter(o => K.city === 'Semua' || o.c === K.city);
    if (K.sort) list = list.slice().sort((a, b) => (K.sort[a.c] || 9e9) - (K.sort[b.c] || 9e9) || a.n.localeCompare(b.n));
    return list;
  }
  function draw(){
    backB.style.visibility = K.step ? 'visible' : 'hidden';
    if (K.step === 0){
      const list = outletList();
      const cities = ['Semua', ...CITIES_BY_COUNT];
      kb.innerHTML = `${steps()}<div class="sttl">1. Pilih gerai untuk pickup</div><div class="srch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667781" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="kq" placeholder="Cari mal, area, atau kota (mis. BSD, Kelapa Gading)…" value="${esc(K.q)}"></div>
        <button class="nearb" id="nearB">${IC.pin} Urutkan dari lokasi saya</button>
        ${K.q ? '' : `<div class="cities">${cities.map(c => `<button data-c="${esc(c)}" class="${c === K.city ? 'on' : ''}">${esc(c)}</button>`).join('')}</div>`}
        <div class="ocount">${list.length} gerai${K.q ? ` untuk "${esc(K.q)}"` : K.city === 'Semua' ? ' PUYO' : ' di ' + esc(K.city)}</div>
        <div>${list.map(o => `<button class="oo${o.i === K.outlet ? ' on' : ''}" data-o="${o.i}"><span class="rd"></span><span style="flex:1;min-width:0"><div class="on1">PUYO ${esc(oName(o.n))}</div><div class="on2">${esc(o.f)}${o.f ? ' · ' : ''}${esc(o.c)}${K.sort && K.sort[o.c] != null ? ` · ±${Math.round(K.sort[o.c])} km` : ''}</div></span></button>`).join('') || '<div class="empty">Gerai tidak ditemukan. Coba kata lain, mis. nama mal atau kota.</div>'}</div>`;
      const qi = $('#kq', kb);
      qi.oninput = () => { K.q = qi.value; const pos = qi.selectionStart; draw(); const n = $('#kq', kb); n.focus(); n.setSelectionRange(pos, pos); };
      $$('[data-c]', kb).forEach(b => b.onclick = () => { K.city = b.dataset.c; draw(); });
      $$('[data-o]', kb).forEach(b => b.onclick = () => { K.outlet = Number(b.dataset.o); $$('.oo', kb).forEach(x => x.classList.toggle('on', x === b)); foot(); });
      $('#nearB', kb).onclick = () => {
        if (!navigator.geolocation) return toast('Perangkat tidak mendukung lokasi');
        toast('Mencari lokasi Kakak…');
        navigator.geolocation.getCurrentPosition(pos => {
          const here = [pos.coords.latitude, pos.coords.longitude];
          K.sort = Object.fromEntries(Object.entries(CITY_XY).map(([c, xy]) => [c, haversine(here, xy)]));
          const near = Object.entries(K.sort).sort((a, b) => a[1] - b[1])[0][0];
          K.city = 'Semua'; K.q = ''; S.nearCity = near; save();
          if (K.outlet == null){ const o = OUTLETS.find(o => o.c === near); if (o) K.outlet = o.i; }
          draw(); toast(`Gerai terdekat: area ${near}`);
        }, () => toast('Izin lokasi ditolak. Silakan cari gerai secara manual.'), {timeout:12000, maximumAge:600000});
      };
      foot();
    } else if (K.step === 1){
      const o = OUTLETS[K.outlet]; const slots = pickupSlots();
      if (K.slot !== 'asap' && !slots.find(s => s.t === K.slot)) K.slot = canAsap() ? 'asap' : (slots[0] && slots[0].t);
      kb.innerHTML = `${steps()}<div class="sttl">2. Waktu pengambilan</div><div class="osel">${IC.store}<div><b>PUYO ${esc(oName(o.n))}</b><br><span>${esc(o.f)}${o.f ? ' · ' : ''}${esc(o.c)}</span></div></div>
        ${canAsap() ? `<button class="ben${K.slot === 'asap' ? ' on' : ''}" data-s="asap"><span class="rd"></span><span><div class="b1">Secepatnya</div><div class="b2">Siap ±15 menit setelah pesanan diterima</div></span></button>` : `<div class="hint">Gerai sudah/hampir tutup (buka 10.00–22.00). Silakan pilih jadwal pengambilan.</div>`}
        <div class="slotg">${slots.map(s => `<button data-s="${s.t}" class="${K.slot === s.t ? 'on' : ''}">${esc(s.l)}</button>`).join('')}</div>`;
      $$('[data-s]', kb).forEach(b => b.onclick = () => { K.slot = b.dataset.s === 'asap' ? 'asap' : Number(b.dataset.s); draw(); });
      foot();
    } else if (K.step === 2){
      const m10 = activeMember10(); const m10ok = m10 && !m10.usedAt && silkyQty() > 0; const fv = freeVouchers();
      if (K.ben === 'm10' && !m10ok) K.ben = 'none';
      if (K.ben.startsWith('v:') && (!fv.find(v => v.id === K.ben.slice(2)) || !silkyQty())) K.ben = 'none';
      const c = calc();
      const ben = (k, t, d, dis) => `<button class="ben${K.ben === k ? ' on' : ''}" data-b="${k}" ${dis ? 'disabled' : ''}><span class="rd"></span><span><div class="b1">${t}</div><div class="b2">${d}</div></span></button>`;
      kb.innerHTML = `${steps()}<div class="sttl">3. Benefit member <span style="font-weight:400;color:var(--mut)">(pilih satu, tidak bisa digabung)</span></div>
        ${ben('none', 'Tanpa benefit', 'Bayar harga normal', false)}
        ${ben('m10', 'Diskon member 10%', m10 ? (m10.usedAt ? `Kuota ${BULAN[new Date().getMonth()]} sudah dipakai (${dShort(m10.usedAt)})` : silkyQty() ? `Kuota ${BULAN[new Date().getMonth()]}: 1x · khusus Silky Desserts · hemat ${rp(Math.round(c.items.filter(i => i.cat === 'silky').reduce((a, i) => a + i.qty * i.price, 0) * .1))}` : 'Hanya untuk Silky Desserts (tidak termasuk hampers & PUYOTEIN)') : 'Belum aktif', !m10ok)}
        ${fv.map(v => ben('v:' + v.id, v.title, silkyQty() ? `1 Silky Desserts gratis (−Rp15.000) · ${v.code}` : 'Tambahkan minimal 1 Silky Desserts', !silkyQty())).join('')}
        <div class="sumbox">${c.items.map(it => `<div class="sl"><span>${it.qty}× ${esc(it.name)}</span><span>${rp(it.qty * it.price)}</span></div>`).join('')}<div class="sl" style="border-top:1px solid #e3e8ea;padding-top:6px;margin-top:6px"><span>Subtotal</span><span>${rp(c.subtotal)}</span></div>${c.disc ? `<div class="sl" style="color:#1c8f72"><span>${esc(c.discLabel)}</span><span>−${rp(c.disc)}</span></div>` : ''}<div class="sl tot"><span>Total</span><span>${rp(c.total)}</span></div></div>`;
      $$('.ben', kb).forEach(b => b.onclick = () => { if (b.disabled) return; K.ben = b.dataset.b; draw(); });
      foot();
    } else {
      const c = calc(); const o = OUTLETS[K.outlet];
      const pm = (k, ic, t, d) => `<button class="ben pay${K.pay === k ? ' on' : ''}" data-p="${k}"><span class="rd"></span><span class="pic">${ic}</span><span><div class="b1">${t}</div><div class="b2">${d}</div></span></button>`;
      kb.innerHTML = `${steps()}<div class="sttl">4. Metode pembayaran</div>
        ${pm('qris', '<b class="qris">QRIS</b>', 'QRIS', 'Bayar sekarang lewat e-wallet / m-banking, pesanan langsung diproses')}
        ${pm('cash', '💵', 'Tunai di gerai', 'Bayar di kasir saat mengambil pesanan')}
        <div class="sumbox"><div class="sl"><span>Ambil di</span><span style="text-align:right">PUYO ${esc(oName(o.n))}</span></div><div class="sl"><span>Waktu</span><span>${K.slot === 'asap' ? 'Secepatnya (±15 menit)' : esc(pickupSlots().find(s => s.t === K.slot)?.l || '')}</span></div><div class="sl"><span>${c.items.reduce((a, i) => a + i.qty, 0)} item</span><span>${rp(c.subtotal)}</span></div>${c.disc ? `<div class="sl" style="color:#1c8f72"><span>${esc(c.discLabel)}</span><span>−${rp(c.disc)}</span></div>` : ''}<div class="sl tot"><span>Total bayar</span><span>${rp(c.total)}</span></div></div>
        <div class="hint">Pesanan lewat chat WhatsApp ini mendapat <b>1 stamp</b>, tercatat begitu pesanan diambil di gerai.</div>`;
      $$('[data-p]', kb).forEach(b => b.onclick = () => { K.pay = b.dataset.p; draw(); });
      foot();
    }
  }
  function foot(){
    if (K.step === 0){ nextB.disabled = K.outlet == null; nextB.textContent = K.outlet == null ? 'Pilih gerai dulu' : 'Lanjut'; }
    else if (K.step === 1){ nextB.disabled = !K.slot; nextB.textContent = 'Lanjut'; }
    else if (K.step === 2){ nextB.disabled = false; nextB.textContent = `Lanjut · ${rp(calc().total)}`; }
    else { nextB.disabled = !K.pay; nextB.textContent = !K.pay ? 'Pilih metode pembayaran' : K.pay === 'qris' ? `Bayar dengan QRIS · ${rp(calc().total)}` : `Buat pesanan · ${rp(calc().total)}`; }
  }
  nextB.onclick = () => { if (K.step < 3){ K.step++; K.q = ''; draw(); $('.sh-b', ov).scrollTop = 0; } else placeOrder(); };
  backB.onclick = () => { if (K.step > 0){ K.step--; draw(); } };
  function placeOrder(){
    const c = calc(); const o = OUTLETS[K.outlet];
    const od = {id:'PY-' + rnd(5), code:String(Math.floor(1000 + Math.random() * 9000)), at:Date.now(), outlet:{i:o.i, n:o.n, f:o.f, c:o.c, u:o.u},
      items:c.items.map(i => ({id:i.id, name:i.name, qty:i.qty, price:i.price, cat:i.cat})), subtotal:c.subtotal, disc:c.disc, discLabel:c.discLabel, total:c.total,
      ben:K.ben, pay:K.pay, slot:K.slot, paid:false, status:K.pay === 'qris' && c.total > 0 ? 'unpaid' : 'new', confirmedAt:null, notified:{}};
    if (od.status === 'new') od.confirmedAt = od.at;
    if (K.pay === 'qris' && c.total === 0){ od.paid = true; }
    if (K.ben === 'm10'){ const v = activeMember10(); v.usedAt = od.at; v.usedOutlet = o.n; v.usedOrder = od.id; }
    if (K.ben.startsWith('v:')){ const v = S.vouchers.find(x => x.id === K.ben.slice(2)); if (v){ v.usedAt = od.at; v.usedOutlet = o.n; v.usedOrder = od.id; } }
    S.orders = S.orders || []; S.orders.push(od);
    S.cart = {}; S.lastOutlet = o.i; S.nearCity = o.c; save(); updCartBadge();
    ov.close();
    if (od.status === 'unpaid'){ setTimeout(() => openQris(od.id), 240); }
    else bot({text:`Pesanan *${od.id}* sudah kami terima 🙏\nSilakan bayar *tunai di kasir* saat mengambil pesanan di *PUYO ${oName(o.n)}*.`}, {type:'order', oid:od.id});
  }
  draw();
}

/* layar pembayaran QRIS (simulasi, bukan QRIS asli) */
function openQris(oid){
  const od = (S.orders || []).find(x => x.id === oid); if (!od || od.status !== 'unpaid') return;
  const exp = od.at + 10 * 60000;
  const ov = sheet('Pembayaran QRIS', `<div class="qrisbox"><div class="qh"><b class="qris">QRIS</b><span>PUYO ${esc(oName(od.outlet.n))}</span></div><canvas id="qrc" width="200" height="200"></canvas><div class="qamt">${rp(od.total)}</div><div class="qid">${esc(od.id)} · NMID simulasi</div><div class="qcd" id="qcd"></div><div class="qwarn">SIMULASI PROTOTYPE — bukan QRIS asli. Jangan dipindai atau dibayar.</div></div>`,
    '<button class="pbtn" id="qPaid">Saya sudah bayar</button><button class="gbtn" id="qLater">Bayar nanti</button>');
  drawCode($('#qrc', ov), od.id + od.total);
  const cd = $('#qcd', ov);
  const tick = setInterval(() => { const s = Math.max(0, Math.round((exp - Date.now()) / 1000)); cd.textContent = `Bayar dalam ${pad(Math.floor(s / 60))}:${pad(s % 60)}`; if (!s){ clearInterval(tick); } }, 500);
  const close0 = ov.close; ov.close = () => { clearInterval(tick); close0(); };
  $('#qLater', ov).onclick = () => { ov.close(); bot({text:`Pesanan *${od.id}* menunggu pembayaran QRIS ⏳ Selesaikan dalam 10 menit, ya Kak.`}, {type:'order', oid:od.id}); };
  $('#qPaid', ov).onclick = async () => {
    const b = $('#qPaid', ov); b.disabled = true; b.innerHTML = '<span class="spin"></span> Memeriksa pembayaran…';
    await sleep(1500);
    $('.qrisbox', ov).innerHTML = `<div class="paidok"><svg width="74" height="74" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="#25d366"/><path d="M15 27l7 7 15-16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="qamt">${rp(od.total)}</div><div>Pembayaran berhasil</div></div>`;
    b.innerHTML = 'Selesai'; b.disabled = false; b.onclick = () => ov.close();
    $('#qLater', ov).remove();
    od.paid = true; od.paidAt = Date.now(); od.status = 'new'; od.confirmedAt = Date.now(); save();
    refreshOrder(od.id);
    bot({text:`Pembayaran QRIS untuk pesanan *${od.id}* berhasil ✅\nPesanan sedang kami teruskan ke *PUYO ${oName(od.outlet.n)}*.`}, {type:'order', oid:od.id});
  };
}

/* kartu pesanan di chat (status ikut berubah real-time) */
function orderHTML(od){
  const flow = ['new','preparing','ready','done'];
  const idx = od.status === 'unpaid' ? -1 : flow.indexOf(od.status);
  const slotTxt = od.slot === 'asap' ? 'Secepatnya' : (typeof od.slot === 'number' ? `${dayKey(od.slot) === dayKey(Date.now()) ? 'Hari ini' : dShort(od.slot)}, ${hhmm(od.slot)}` : '');
  const payTxt = od.pay === 'qris' ? (od.paid ? 'QRIS · Lunas' : 'QRIS · Belum dibayar') : (od.paid ? 'Tunai · Lunas' : 'Tunai · Bayar di kasir');
  const act = [];
  if (od.status === 'unpaid') act.push(`<button data-act="qris:${od.id}">Bayar QRIS sekarang</button>`);
  if (od.status === 'ready') act.push(`<button data-act="pickup:${od.id}" class="primary">✅ Konfirmasi sudah diambil</button>`);
  if (['unpaid','new','preparing'].includes(od.status)) act.push(`<button data-act="cancel:${od.id}" class="danger">Batalkan pesanan</button>`);
  if (od.outlet.u && !['done','cancelled'].includes(od.status)) act.push(`<a href="${esc(od.outlet.u)}" target="_blank" rel="noopener"><button>📍 Rute ke gerai</button></a>`);
  return `<div class="ocard" data-oid="${od.id}">
    <div class="oh"><span>Pesanan ${esc(od.id)}</span><span class="opill s-${od.status}">${ST_LABEL[od.status]}</span></div>
    ${od.status === 'cancelled' ? '' : `<div class="otl">${['Diterima','Disiapkan','Siap diambil','Selesai'].map((l, i) => `<div class="${i <= idx ? 'on' : ''}${i === idx && od.status !== 'done' ? ' cur' : ''}"><i></i><span>${l}</span></div>`).join('')}</div>`}
    <div class="oo2">${IC.store}<div><b>PUYO ${esc(oName(od.outlet.n))}</b><br><span>${esc(od.outlet.f)}${od.outlet.f ? ' · ' : ''}${esc(od.outlet.c)} · ${esc(slotTxt)}</span></div></div>
    <div class="oit">${od.items.map(i => `<div><span>${i.qty}× ${esc(i.name)}</span><span>${rp(i.qty * i.price)}</span></div>`).join('')}${od.disc ? `<div class="disc"><span>${esc(od.discLabel)}</span><span>−${rp(od.disc)}</span></div>` : ''}<div class="tot"><span>Total · ${payTxt}</span><span>${rp(od.total)}</span></div></div>
    ${['new','preparing','ready'].includes(od.status) ? `<div class="ocode">Kode ambil <b>${od.code}</b></div>` : ''}
    ${od.status === 'done' ? `<div class="odone">Diambil ${dShort(od.doneAt)}, ${hhmm(od.doneAt)} · ⭐ stamp ke-${od.stampNo}</div>` : ''}
    ${act.length ? `<div class="btns oact">${act.join('')}</div>` : ''}
  </div>`;
}
function refreshOrder(oid){
  const od = (S.orders || []).find(x => x.id === oid); if (!od) return;
  $$(`.ocard[data-oid="${oid}"]`, feed).forEach(el => { const w = document.createElement('div'); w.innerHTML = orderHTML(od); const n = w.firstElementChild; n.classList.add('flash'); el.replaceWith(n); });
}
function orderTick(){
  const now = Date.now(); let ch = false;
  (S.orders || []).forEach(od => {
    if (od.status === 'unpaid' && now - od.at > 10 * 60000){ od.status = 'cancelled'; od.cancelReason = 'Batas waktu pembayaran QRIS habis'; releaseVoucher(od); ch = true; refreshOrder(od.id); bot({text:`Pesanan *${od.id}* dibatalkan karena pembayaran QRIS tidak diselesaikan dalam 10 menit 🙏`}); return; }
    if (!od.confirmedAt) return;
    if (od.status === 'new' && now - od.confirmedAt >= T_PREP){ od.status = 'preparing'; ch = true; refreshOrder(od.id); if (!od.notified.prep){ od.notified.prep = 1; bot({text:`Pesanan *${od.id}* sedang disiapkan oleh tim PUYO ${oName(od.outlet.n)} 👩‍🍳`}); } }
    if (od.status === 'preparing' && now - od.confirmedAt >= T_READY){
      od.status = 'ready'; ch = true; refreshOrder(od.id);
      if (!od.notified.ready){ od.notified.ready = 1;
        const when = typeof od.slot === 'number' ? `\nJadwal ambil Kakak: *${dayKey(od.slot) === dayKey(Date.now()) ? 'Hari ini' : dLong(od.slot)}, ${hhmm(od.slot)}*.` : '';
        bot({text:`Pesanan *${od.id}* sudah *siap diambil* di *PUYO ${oName(od.outlet.n)}* 🎉${when}\n\nTunjukkan *kode ambil ${od.code}* ke kasir${od.pay === 'cash' && !od.paid ? ` dan bayar tunai *${rp(od.total)}*` : ''}.\n_(Pada prototype ini waktu persiapan disingkat untuk demo.)_`}, {type:'order', oid:od.id});
      }
    }
  });
  if (ch) save();
}
function releaseVoucher(od){
  S.vouchers.forEach(v => { if (v.usedOrder === od.id){ v.usedAt = null; v.usedOutlet = null; v.usedOrder = null; } });
}
function cancelOrder(oid){
  const od = (S.orders || []).find(x => x.id === oid); if (!od || !['unpaid','new','preparing'].includes(od.status)) return toast('Pesanan ini sudah tidak bisa dibatalkan');
  const ov = sheet('Batalkan pesanan?', `<p style="margin:0;line-height:1.5">Pesanan <b>${esc(od.id)}</b> di PUYO ${esc(oName(od.outlet.n))} akan dibatalkan.${od.paid ? ' Pembayaran QRIS akan dikembalikan (simulasi).' : ''} Voucher/diskon yang dipakai akan dikembalikan.</p>`, '<button class="pbtn" id="cY" style="background:var(--red)">Ya, batalkan</button>');
  $('#cY', ov).onclick = () => {
    ov.close(); od.status = 'cancelled'; od.cancelledAt = Date.now(); releaseVoucher(od); save(); refreshOrder(od.id);
    me('Batalkan pesanan ' + od.id);
    bot({text:`Pesanan *${od.id}* sudah dibatalkan, Kak 🙏${od.paid ? ' Dana QRIS dikembalikan ke sumber pembayaran (simulasi).' : ''} Voucher/diskon yang dipakai sudah kembali aktif.`});
  };
}
function pickupOrder(oid){
  const od = (S.orders || []).find(x => x.id === oid); if (!od) return;
  if (od.status !== 'ready') return toast(od.status === 'done' ? 'Pesanan ini sudah diambil' : 'Pesanan belum siap diambil');
  me('Pesanan ' + od.id + ' sudah saya ambil ✅');
  od.status = 'done'; od.doneAt = Date.now(); od.paid = true; od.paidAt = od.paidAt || od.doneAt;
  const tx = {id:'TRX-' + rnd(6), orderId:od.id, at:od.doneAt, outlet:od.outlet, items:od.items, subtotal:od.subtotal, disc:od.disc, discLabel:od.discLabel, total:od.total, pay:od.pay};
  S.txs.push(tx); S.stamps.push(tx.id);
  tx.stampNo = od.stampNo = S.stamps.length; tx.cardNo = S.cardsDone.length + 1;
  let full = false, fvch = null;
  if (S.stamps.length >= 5){ full = true; S.cardsDone.push({at:tx.at, txIds:S.stamps.slice()}); S.stamps = []; fvch = issueVoucher('free'); }
  save(); refreshOrder(od.id);
  const seq = [{text:`Terima kasih, Kak ${S.member.name.split(' ')[0]}! 🙏 Pesanan *${od.id}* sudah diambil di *PUYO ${oName(od.outlet.n)}*. Selamat menikmati 🍮`}];
  if (full){
    seq.push({type:'card', snap:snap(4, 5), text:'Stamp ke-5 berhasil ditambahkan ⭐'}, () => confetti(),
      {text:'Yeay! 🎉 Kartu stamp Kakak sudah *penuh*. Ini hadiah *1 PUYO gratis* untuk Kakak:'},
      {type:'voucher', vid:fvch.id, text:'Bisa dipakai saat checkout pesanan berikutnya atau di kasir gerai. Kartu stamp baru otomatis dimulai 😊', btns:[{l:'Lihat kartu stamp', a:'stamppop', ic:'list'},{l:'Pesan lagi', a:'order', ic:'store'}]});
  } else {
    const n = S.stamps.length;
    seq.push({type:'card', snap:snap(n - 1), text:`Stamp ke-${n} berhasil ditambahkan ⭐ ${5 - n} lagi untuk 1 PUYO gratis!`, btns:[{l:'Lihat detail stamp', a:'stamppop', ic:'list'},{l:'Pesan lagi', a:'order', ic:'store'}]});
  }
  bot(seq);
}
function openOrders(){
  const os = (S.orders || []).slice().reverse();
  const ov = sheet('Pesanan saya', os.length ? os.map(orderHTML).join('') : '<div class="empty" style="padding:30px 6px">Belum ada pesanan.<br>Pesan puding PUYO dan ambil di gerai terdekat 🍮</div>', '<button class="pbtn" id="oNew">🛒 Pesan sekarang</button>');
  $('#oNew', ov).onclick = () => { ov.close(); setTimeout(() => openCatalog(), 230); };
  ov.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b){ ov.close(); act(b.dataset.act); } });
}
function replyOrderStart(){
  const n = cartCount();
  return [{text:`Siap, Kak! 🛒 Kakak bisa *pesan dulu lewat chat ini lalu ambil sendiri* di gerai PUYO pilihan Kakak.\n\n1. Pilih menu di katalog & masukkan ke keranjang\n2. Checkout: pilih gerai pickup (semua ${OUTLETS.length} gerai bisa dicari) & waktu ambil\n3. Bayar dengan *QRIS* atau *tunai di gerai*\n4. Ambil pesanan dengan menunjukkan kode ambil → dapat *1 stamp* ⭐${n ? `\n\nDi keranjang Kakak sudah ada ${n} item (${rp(cartTotal())}).` : ''}`,
    btns:[{l:'Buka katalog', a:'catalog', ic:'list'}].concat(n ? [{l:`Lihat keranjang (${n})`, a:'cart', ic:'store'}] : [])}];
}
function replyOrdersList(){
  const act0 = (S.orders || []).filter(o => !['done','cancelled'].includes(o.status));
  if (!(S.orders || []).length) return [{text:'Kakak belum punya pesanan 🙏 Yuk pesan puding PUYO dan ambil di gerai terdekat!', btns:[{l:'Buka katalog', a:'catalog', ic:'list'}]}];
  if (!act0.length) return [{text:'Tidak ada pesanan yang sedang berjalan. Riwayat pesanan bisa dilihat di menu *Pesanan saya*.', btns:[{l:'Pesanan saya', a:'orders', ic:'list'},{l:'Pesan lagi', a:'catalog', ic:'store'}]}];
  return [{text:`Kakak punya ${act0.length} pesanan yang sedang berjalan:`}, ...act0.map(o => ({type:'order', oid:o.id}))];
}

const WEB = 'https://www.puyodesserts.com';
function openInfo(){
  if ($('.prof')) return;
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60, isOpen = h >= 10 && h < 22;
  const cities = CITIES_BY_COUNT.slice(0, 6).join(', ');
  const m = S.member;
  const p = document.createElement('div');
  p.className = 'prof';
  p.innerHTML = `<div class="ph"><button class="pback" aria-label="Kembali"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><span>Info bisnis</span></div>
  <div class="pbody">
    <div class="pcard ptop">
      <img class="pav" src="img/wa-avatar.png" alt="Foto profil PUYO Group">
      <h2>PUYO Group ${VBADGE}</h2>
      <div class="pcat">Akun bisnis · Toko makanan penutup</div>
      <div class="pacts">
        <button data-pa="chat"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 18.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8z"/></svg>Chat</button>
        <button data-pa="catalog"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/></svg>Katalog</button>
        <a href="${WEB}" target="_blank" rel="noopener"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>Website</a>
        <button data-pa="share"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>Bagikan</button>
      </div>
    </div>
    <div class="pcard">
      <div class="pdesc">Pionir <b>silky pudding</b> di Indonesia sejak 2013 🍮 Berawal dari dapur rumah Adrian Agus & Eugenie Patricia Agus, kini PUYO hadir dengan <b>Silky Desserts</b> dan <b>Silky Drinks</b> di lebih dari 220 gerai di Jawa & Bali.<br><i>"Delivering happiness, one customer at a time."</i></div>
      <div class="prow"><span class="pi">🏷️</span><div>Toko makanan penutup<small>Kategori</small></div></div>
      <div class="prow"><span class="pi">🕙</span><div><b class="${isOpen ? 'po' : 'pc'}">${isOpen ? 'Buka sekarang' : 'Tutup sekarang'}</b> · 10.00–22.00<small>Jam buka (mengikuti jam operasional mal)</small></div></div>
      <a class="prow" href="#" data-pa="stores"><span class="pi">📍</span><div>${OUTLETS.length} gerai tercantum di website · ${esc(cities)}, dll.<small>Lokasi gerai · cari gerai terdekat ›</small></div></a>
      <a class="prow" href="${WEB}" target="_blank" rel="noopener"><span class="pi">🌐</span><div class="plink">www.puyodesserts.com<small>Situs web resmi PUYO ↗</small></div></a>
      <div class="prow"><span class="pi">✅</span><div>Bersertifikat halal<small>Produk</small></div></div>
    </div>
    <div class="pcard">
      <div class="psec"><span>Katalog</span><button data-pa="catalog">Lihat semua ›</button></div>
      <div class="pcat-row">${[...SILKY.slice(0, 5), ...PROTEIN].map(x => `<button class="pci" data-pa="prod:${x.id}"><img src="${x.img}" alt=""><span>${esc(x.name.replace('Silky ', ''))}</span><b>${rp(x.price)}</b></button>`).join('')}</div>
    </div>
    ${m ? `<div class="pcard"><div class="psec"><span>PUYO Member</span><button data-pa="stamp">Kartu stamp ›</button></div><div class="pmem"><div class="pmav">${esc(m.name.trim()[0].toUpperCase())}</div><div><b>${esc(m.name)}</b> · ${esc(m.mid)}<small>${S.stamps.length}/5 stamp · bergabung ${dShort(m.joinedAt)}</small></div></div></div>` : `<div class="pcard"><div class="psec"><span>PUYO Member</span></div><div class="pdesc" style="margin:0">Diskon 10% setiap bulan, 1 stamp tiap pembelian di gerai atau pesanan lewat chat ini (5 stamp = 1 PUYO gratis), dan hadiah di hari ulang tahun.</div><button class="pbtn" data-pa="reg" style="margin-top:10px">Daftar PUYO Member</button></div>`}
    <div class="pcard">
      <div class="prow"><span class="pi">🔒</span><div>Pesan dan data hanya tersimpan di perangkat ini.<small>Privasi</small></div></div>
      <button class="prow pdanger" data-pa="reset"><span class="pi">🗑️</span><div>Hapus chat & mulai ulang</div></button>
    </div>
    <div class="pfoot">Prototype chatbot PUYO Member untuk tugas Strategic Management, Kelompok 1 Branding 7C, Universitas Prasetiya Mulya. Bukan akun resmi PUYO.</div>
  </div>`;
  $('#chat').appendChild(p);
  const close = () => { p.classList.add('out'); setTimeout(() => p.remove(), 260); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  $('.pback', p).onclick = close;
  $('.pav', p).onclick = () => { const v = document.createElement('div'); v.className = 'viewer'; v.innerHTML = `<div class="vh"><img src="img/wa-avatar.png" alt=""><div style="flex:1"><b>PUYO Group</b></div></div><div class="vb"><img src="img/wa-avatar.png" alt="" style="border-radius:50%;max-width:min(80vw,420px)"></div>`; v.onclick = () => v.remove(); document.body.appendChild(v); };
  $$('[data-pa]', p).forEach(b => b.onclick = async ev => {
    if (ev) ev.preventDefault();
    const a = b.dataset.pa;
    if (a === 'chat') return close();
    if (a === 'share'){
      const url = location.href.split('#')[0];
      try { if (navigator.share){ await navigator.share({title:'PUYO Group', text:'Chat PUYO Group (prototype)', url}); return; } await navigator.clipboard.writeText(url); toast('Link chat disalin ✓'); } catch(e){ toast('Link: ' + url); }
      return;
    }
    if (a === 'reset') return menuAct('reset');
    close();
    setTimeout(() => { if (a === 'catalog') openCatalog(); else if (a === 'stamp') openStampPopup(); else if (a === 'reg') act('reg', 'Daftar PUYO Member'); else if (a === 'stores') act('stores', '📍 Lokasi gerai'); else if (a.startsWith('prod:')) act(a, P(a.slice(5)).name); }, 270);
  });
}
function openAttach(){
  const ov = sheet('Kirim', `<button class="lopt" data-a="catalog"><div class="lic">🍮</div><div><div class="lt">Katalog</div><div class="ld">Pilih menu & masukkan ke keranjang</div></div></button>
  <button class="lopt" data-a="cart"><div class="lic">🛒</div><div><div class="lt">Keranjang</div><div class="ld">${cartCount() ? cartCount() + ' item · ' + rp(cartTotal()) : 'Masih kosong'}</div></div></button>
  <button class="lopt" data-a="orders"><div class="lic">🧾</div><div><div class="lt">Pesanan saya</div><div class="ld">Status & riwayat pickup</div></div></button>
  <button class="lopt" data-a="loc"><div class="lic">📍</div><div><div class="lt">Lokasi</div><div class="ld">Cari gerai PUYO terdekat</div></div></button>
  <button class="lopt" data-a="stamppop"><div class="lic">⭐</div><div><div class="lt">Kartu member</div><div class="ld">Stamp, voucher, riwayat</div></div></button>`);
  $$('.lopt', ov).forEach(b => b.onclick = () => { ov.close(); setTimeout(() => act(b.dataset.a), 230); });
}
function openMenu(){
  if ($('.dd')) return closeDD();
  const d = document.createElement('div');
  d.className = 'dd';
  d.innerHTML = `<button data-m="info">Info bisnis</button><button data-m="orders">Pesanan saya</button><button data-m="cart">Keranjang</button><button data-m="stamp">Kartu stamp & voucher</button><button data-m="promo">Simulasi: kirim pesan promo bulan ini</button><hr><button data-m="reset" class="danger">Hapus chat & mulai ulang</button>`;
  $('#chat').appendChild(d);
  setTimeout(() => document.addEventListener('click', closeDD, {once:true}), 0);
  $$('button', d).forEach(b => b.onclick = e => { e.stopPropagation(); closeDD(); menuAct(b.dataset.m); });
}
function closeDD(){ const d = $('.dd'); if (d) d.remove(); }
function menuAct(m){
  if (m === 'info') return openInfo();
  if (m === 'stamp') return openStampPopup();
  if (m === 'orders') return openOrders();
  if (m === 'cart') return openCart();
  if (m === 'promo'){
    if (S.optOut) return toast('Member sudah membalas STOP, promo tidak dikirim');
    const mk = monthKey(); const n = S.promoSent[mk] || 0;
    if (n >= 2) return toast('Batas 2 pesan promo per bulan sudah tercapai');
    S.promoSent[mk] = n + 1; save();
    const pr = PROMOS[new Date().getMonth()];
    return bot({text:`Halo ${kak()}! 👋 Ada kabar manis bulan ini 🍮\n\n*${pr.t}*\n${pr.d}\nPeriode: ${pr.p}\n\n_Pesan promo ${n + 1}/2 bulan ini. Balas STOP jika tidak ingin menerima promo._`, qr:[{l:'📍 Lokasi gerai', a:'stores'},{l:'Lihat menu', a:'menu'}]});
  }
  if (m === 'reset'){
    const ov = sheet('Mulai ulang?', '<p style="margin:0 0 6px;line-height:1.5">Semua chat, data member, stamp, dan voucher di <b>perangkat ini</b> akan dihapus. Gunakan ini untuk mencoba pendaftaran sebagai orang lain.</p>', '<button class="pbtn" id="rsY" style="background:var(--red)">Hapus & mulai ulang</button>');
    $('#rsY', ov).onclick = () => { try { localStorage.removeItem(KEY); } catch(e){} location.reload(); };
  }
}

/* ---------- image viewer ---------- */
function viewProduct(id){
  const p = P(id);
  const v = document.createElement('div');
  v.className = 'viewer';
  v.innerHTML = `<div class="vh"><img src="img/wa-avatar.png" alt=""><div style="flex:1"><b>PUYO Group</b><div style="font-size:12.5px;opacity:.8">Katalog</div></div><button aria-label="Tutup" style="color:#fff"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="vb"><img src="${p.img}" alt="${esc(p.name)}"></div><div class="vc"><b>${esc(p.name)}</b> · ${rp(p.price)}<br>${esc(p.desc)}</div>`;
  const close = () => v.remove();
  v.onclick = e => { if (e.target === v || e.target.closest('button') || e.target.classList.contains('vb')) close(); };
  document.body.appendChild(v);
}

/* ---------- toast & confetti ---------- */
function toast(t){ $$('.toast').forEach(e => e.remove()); const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
function confetti(){
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  const W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio;
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  const cols = ['#4f9aa6','#f2b552','#ff8fb1','#25d366','#a28bd4','#ffd58a'];
  const ps = Array.from({length:150}, () => ({x:W/2 + (Math.random() - .5) * W * .3, y:H * .55, vx:(Math.random() - .5) * 26 * devicePixelRatio, vy:(-Math.random() * 22 - 10) * devicePixelRatio, r:(4 + Math.random() * 5) * devicePixelRatio, c:cols[Math.floor(Math.random() * cols.length)], a:Math.random() * 6, va:(Math.random() - .5) * .3}));
  let f = 0;
  (function frame(){
    ctx.clearRect(0, 0, W, H);
    ps.forEach(p => { p.vy += .7 * devicePixelRatio; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
    if (++f < 150) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
  })();
}

/* ================= composer ================= */
function autosize(){ inp.style.height = 'auto'; inp.style.height = Math.min(120, inp.scrollHeight) + 'px'; }
function updSend(){ const has = inp.value.trim().length > 0; $('#icMic').hidden = has; $('#icSend').hidden = !has; sendBtn.classList.toggle('has', has); }
inp.addEventListener('input', () => { autosize(); updSend(); });
inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); doSend(); } });
sendBtn.addEventListener('click', () => { if (inp.value.trim()) doSend(); else toast('Pesan suara tidak tersedia di prototype'); });
function doSend(){
  const t = inp.value.trim(); if (!t) return;
  inp.value = ''; autosize(); updSend(); closeEmoji();
  onUserText(t.slice(0, 1000));
  if (matchMedia('(min-width:900px)').matches) inp.focus();
}
const EMO = ['😀','😂','🥰','😍','😋','🤤','😊','🙏','👍','👋','🎉','🎂','❤️','🍮','🍓','🥭','🍫','🍵','💪','⭐','🎁','📍','🔥','✨'];
function closeEmoji(){ const e = $('.emojis'); if (e) e.remove(); }
$('#emo').onclick = e => {
  e.stopPropagation();
  if ($('.emojis')) return closeEmoji();
  const d = document.createElement('div'); d.className = 'emojis';
  d.innerHTML = EMO.map(x => `<button>${x}</button>`).join('');
  $('#chat').appendChild(d);
  $$('button', d).forEach(b => b.onclick = ev => { ev.stopPropagation(); const s = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, s) + b.textContent + inp.value.slice(inp.selectionEnd ?? s); inp.focus(); autosize(); updSend(); });
  setTimeout(() => document.addEventListener('click', ev => { if (!ev.target.closest('.emojis')) closeEmoji(); }, {once:true}), 0);
};
$('#att').onclick = openAttach;
$('#dots').onclick = e => { e.stopPropagation(); openMenu(); };
$('#who').onclick = openInfo;
$('#cartBtn').onclick = () => cartCount() ? openCart() : openCatalog();
updCartBadge(); $('#hAv').onclick = openInfo;
$('#back').onclick = () => toast('Ini prototype satu ruang chat 🙂');
$$('[data-toast]').forEach(b => b.addEventListener('click', () => toast(b.dataset.toast)));

/* delegated clicks inside the chat */
feed.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (b){ act(b.dataset.act, b.dataset.label); return; }
  const l = e.target.closest('[data-list]');
  if (l){ const m = S.msgs.find(x => x.id === l.dataset.list); if (m) openList(m); return; }
  const ad = e.target.closest('[data-add]');
  if (ad){ e.preventDefault(); addCart(ad.dataset.add); ad.classList.add('ok'); setTimeout(() => ad.classList.remove('ok'), 600); return; }
  const pk = e.target.closest('[data-pick]');
  if (pk){ e.preventDefault(); S.lastOutlet = Number(pk.dataset.pick); save(); toast(`Gerai pickup: PUYO ${oName(OUTLETS[S.lastOutlet].n)}`); if (cartCount() && S.member) openCheckout(); else openCatalog(); return; }
  const pc = e.target.closest('[data-prod]');
  if (pc){ act('prod:' + pc.dataset.prod, P(pc.dataset.prod).name); return; }
  const z = e.target.closest('[data-zoom]');
  if (z){ viewProduct(z.dataset.zoom); return; }
  const v = e.target.closest('[data-voucher]');
  if (v){ const vv = S.vouchers.find(x => x.id === v.dataset.voucher); if (vv) voucherSheet(vv); return; }
  const h = e.target.closest('[data-hamper]');
  if (h && !e.target.closest('.btns')){ return; }
  const mc = e.target.closest('.mcard');
  if (mc && S.member){ openStampPopup(); }
});

/* ================= real-time checks (tanggal & bulan) ================= */
let lastDayKey = dayKey(Date.now());
function realtimeCheck(){
  const now = new Date();
  if (dayKey(now) !== lastDayKey){ lastDayKey = dayKey(now); renderAll(); }
  if (!S.member || S.flow) return;
  // voucher diskon member 10% untuk bulan berjalan
  if (!activeMember10()){
    const v = issueVoucher('member10');
    bot({text:`Halo ${kak()}! 👋 Voucher *diskon member 10%* untuk bulan *${BULAN[now.getMonth()]}* sudah aktif 🎟️`}, {type:'voucher', vid:v.id});
  }
  // hadiah ulang tahun tepat di hari ulang tahun (sekali per tahun)
  if (birthdayToday(S.member.dob, now) && !S.bdayYears.includes(now.getFullYear())){
    S.bdayYears.push(now.getFullYear()); const v = issueVoucher('bday'); save();
    const age = nextBirthday(S.member.dob).age;
    bot(() => confetti(), {text:`🎉🎂 *Selamat ulang tahun yang ke-${age}, ${S.member.name}!* 🎂🎉\nSemoga sehat, bahagia, dan sukses selalu.\n\nSebagai hadiah, kami berikan *1 PUYO Silky Desserts GRATIS* yang bisa diklaim di gerai PUYO terdekat:`},
      {type:'voucher', vid:v.id, text:'Tunjukkan kode ini ke kasir PUYO. Berlaku 7 hari.', btns:[{l:'Cari gerai terdekat', a:'loc', ic:'pin'},{l:'Pilih kota', a:'stores', ic:'store'}]});
  }
}
setInterval(realtimeCheck, 20000);
setInterval(orderTick, 1500);
document.addEventListener('visibilitychange', () => { if (!document.hidden) realtimeCheck(); });

/* sinkron antar tab di perangkat yang sama */
window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  const n = load(); if (!n) { S = fresh(); renderAll(); return; }
  S = n; if (!busy) renderAll();
});

/* keyboard HP: tetap di pesan terbaru */
if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (document.activeElement === inp) scrollBottom(true); });

/* ================= start ================= */
renderAll();
if (!S.msgs.length){
  bot({wait:300},
    {text:'Halo! 👋 Selamat datang di WhatsApp *PUYO Group* 🍮\nKami siap membantu info varian puding, harga, lokasi gerai, hampers, dan promo. Kakak juga bisa *pesan lewat chat dan ambil di gerai terdekat* 🛒 Ketik *Halo* kapan saja untuk melihat menu.'},
    {text:'Belum jadi member? Gabung *PUYO Member* gratis dan nikmati:\n• Diskon 10% setiap bulan\n• 1 stamp tiap pembelian di gerai atau pesanan lewat chat ini, 5 stamp = 1 PUYO gratis\n• 1 PUYO gratis tepat di hari ulang tahun 🎂', btns:[{l:'Daftar sekarang', a:'reg'},{l:'Lihat menu', a:'menu', ic:'list'}]});
} else {
  orderTick();
  setTimeout(realtimeCheck, 1200);
}
updSend();
})();
