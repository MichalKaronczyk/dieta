'use strict';

/* ============ storage ============ */
const K = { plan: 'dieta.plan.v1', log: 'dieta.log.v1', shop: 'dieta.shop.v1', weight: 'dieta.weight.v1' };
const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('Brak miejsca w pamięci'); } };

let plan   = load(K.plan, null) || structuredClone(DEFAULT_PLAN);
let log    = load(K.log, {});      // { "2026-07-20": { done:{mealId:1}, swap:{mealId:"..."} } }
let shop   = load(K.shop, {});     // { itemId: 1 }
let weight = load(K.weight, []);   // [{ d:"2026-07-20", kg:82.4 }]

const savePlan = () => save(K.plan, plan);

/* ============ helpers ============ */
const DAY_IDS = ['sun','mon','tue','wed','thu','fri','sat'];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const uid = () => 'x' + Math.random().toString(36).slice(2, 9);
const dayById = id => plan.days.find(d => d.id === id);
const dayForDate = d => dayById(DAY_IDS[d.getDay()]) || plan.days[0];

let cursor = new Date();           // aktualnie oglądany dzień w zakładce "Dziś"
let tab = 'today';

function entry(dateStr) {
  if (!log[dateStr]) log[dateStr] = { done: {}, swap: {} };
  const e = log[dateStr];
  e.done ||= {}; e.swap ||= {};
  return e;
}
function eatenKcal(dateStr, day) {
  const e = log[dateStr];
  if (!e) return 0;
  return day.meals.reduce((s, m) => s + (e.done[m.id] ? (m.kcal || 0) : 0), 0);
}
const planKcal = day => day.meals.reduce((s, m) => s + (m.kcal || 0), 0);

let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 1900);
}
function haptic() { if (navigator.vibrate) navigator.vibrate(8); }

function dateLabel(d) {
  const t = new Date(); t.setHours(0,0,0,0);
  const x = new Date(d); x.setHours(0,0,0,0);
  const diff = Math.round((x - t) / 86400000);
  if (diff === 0) return 'Dzisiaj';
  if (diff === -1) return 'Wczoraj';
  if (diff === 1) return 'Jutro';
  return x.toLocaleDateString('pl-PL', { weekday:'long', day:'numeric', month:'long' });
}

/* ============ widok: DZIŚ ============ */
function viewToday() {
  const ds = iso(cursor);
  const day = dayForDate(cursor);
  const e = entry(ds);
  const goal = planKcal(day) || plan.target;
  const eaten = eatenKcal(ds, day);
  const pct = goal ? Math.min(eaten / goal, 1) : 0;
  const R = 44, C = 2 * Math.PI * R;
  const doneCount = day.meals.filter(m => e.done[m.id]).length;

  $('#topTitle').textContent = dateLabel(cursor);
  $('#topSub').textContent = `${day.name} · ${day.activity || 'brak treningu'}`;

  const meals = day.meals.map(m => {
    const done = !!e.done[m.id], swap = e.swap[m.id];
    return `
    <div class="meal ${done ? 'done' : ''}">
      <button class="check" data-toggle="${m.id}" aria-label="Odhacz">✓</button>
      <div class="meal-body">
        <div class="meal-top">
          <span class="meal-slot">${esc(m.slot)}</span>
          <span class="meal-kcal">${m.kcal ? '~' + m.kcal + ' kcal' : ''}</span>
        </div>
        <div class="meal-name">${esc(m.name)}</div>
        <div class="meal-items">${esc(m.items)}</div>
        ${m.note ? `<span class="meal-note">💡 ${esc(m.note)}</span>` : ''}
        ${swap ? `<div class="meal-swap"><span>🔁</span><span>${esc(swap)}</span></div>` : ''}
        <div class="meal-actions">
          <button class="mini" data-swap="${m.id}">🔁 Zamiennik</button>
          <button class="mini" data-edit="${m.id}">✏️ Edytuj</button>
        </div>
      </div>
    </div>`;
  }).join('');

  $('#view').innerHTML = `
    <div class="hero">
      <div class="ring">
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle class="ring-c" cx="52" cy="52" r="${R}" fill="none" stroke-width="9"/>
          <circle class="ring-v" cx="52" cy="52" r="${R}" fill="none" stroke-width="9"
                  stroke-dasharray="${(C*pct).toFixed(1)} ${C.toFixed(1)}"/>
        </svg>
        <div class="ring-txt">
          <div class="ring-num">${eaten}</div>
          <div class="ring-lbl">z ${goal} kcal</div>
        </div>
      </div>
      <div class="hero-info">
        <div class="hero-line"><span>Posiłki</span><b>${doneCount} / ${day.meals.length}</b></div>
        <div class="hero-line"><span>Pozostało</span><b>${Math.max(goal - eaten, 0)} kcal</b></div>
        <div class="hero-act">${day.activityIcon || '🏃'} ${esc(day.activity || '—')}</div>
      </div>
    </div>

    <div class="row2" style="margin-top:12px">
      <button class="mini" data-nav="-1" style="padding:10px">← Poprzedni</button>
      <button class="mini" data-nav="0" style="padding:10px">Dzisiaj</button>
      <button class="mini" data-nav="1" style="padding:10px">Następny →</button>
    </div>

    <div class="sec">Plan dnia</div>
    ${meals || '<div class="empty">Brak posiłków w tym dniu.</div>'}
    <button class="fab" data-add="${day.id}">+ Dodaj posiłek do dnia „${esc(day.name)}”</button>
  `;
}

/* ============ widok: TYDZIEŃ ============ */
function viewWeek() {
  $('#topTitle').textContent = 'Tydzień';
  $('#topSub').textContent = `${plan.title} · cel ${plan.target} kcal`;
  const todayId = DAY_IDS[new Date().getDay()];

  $('#view').innerHTML = plan.days.map(d => `
    <div class="daycard ${d.id === todayId ? 'today open' : ''}" data-day="${d.id}">
      <div class="dayhead" data-open="${d.id}">
        <span style="font-size:19px">${d.activityIcon || '🍽'}</span>
        <h3>${esc(d.name)}</h3>
        ${d.id === todayId ? '<span class="badge">DZIŚ</span>' : ''}
        <span class="daymeta">${planKcal(d)} kcal</span>
        <span class="chev">›</span>
      </div>
      <div class="daybody">
        <div class="hero-act" style="margin:12px 0">${d.activityIcon || '🏃'} ${esc(d.activity || '—')}</div>
        ${d.meals.map(m => `
          <div class="wmeal">
            <div class="wmeal-slot">${esc(m.slot)}</div>
            <div style="flex:1">
              <div class="wmeal-name">${esc(m.name)} <span style="color:var(--dim);font-weight:400;font-size:12.5px">· ${m.kcal} kcal</span></div>
              <div class="wmeal-items">${esc(m.items)}</div>
              ${m.note ? `<span class="meal-note">💡 ${esc(m.note)}</span>` : ''}
              <div class="meal-actions"><button class="mini" data-edit="${m.id}">✏️ Edytuj</button></div>
            </div>
          </div>`).join('')}
        <button class="fab" style="margin:10px 0 14px" data-add="${d.id}">+ Dodaj posiłek</button>
      </div>
    </div>`).join('');
}

/* ============ widok: ZAKUPY ============ */
function viewShop() {
  const all = plan.shopping.flatMap(c => c.items);
  const got = all.filter(i => shop[i.id]).length;
  $('#topTitle').textContent = 'Zakupy';
  $('#topSub').textContent = `${got} z ${all.length} skompletowane`;

  $('#view').innerHTML = `
    <div class="progressbar"><i style="width:${all.length ? got / all.length * 100 : 0}%"></i></div>
    ${plan.shopping.map(c => `
      <div class="shopcat">${c.icon || '🛍'} ${esc(c.cat)}</div>
      ${c.items.map(i => `
        <div class="shopitem ${shop[i.id] ? 'done' : ''}" data-shop="${i.id}">
          <button class="check" style="pointer-events:none">✓</button>
          <div style="flex:1">
            <div class="shop-name">${esc(i.name)}</div>
            <div class="shop-qty">${esc(i.qty)}</div>
          </div>
        </div>`).join('')}
    `).join('')}
    <button class="btn sec" data-shopreset style="margin-top:22px">Odznacz wszystko</button>
  `;
  // stan „done” pokazuje ptaszka
  document.querySelectorAll('.shopitem.done .check').forEach(c => {
    c.style.background = 'var(--acc)'; c.style.borderColor = 'var(--acc)'; c.style.color = '#06240f';
  });
}

/* ============ widok: POSTĘP ============ */
function viewStats() {
  $('#topTitle').textContent = 'Postęp';
  $('#topSub').textContent = 'Ostatnie 7 dni';

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = iso(d), day = dayForDate(d);
    days.push({ d, ds, day, eaten: eatenKcal(ds, day), goal: planKcal(day) || plan.target });
  }
  const max = Math.max(...days.map(x => Math.max(x.eaten, x.goal)), 1);
  const withData = days.filter(x => x.eaten > 0);
  const avg = withData.length ? Math.round(withData.reduce((s, x) => s + x.eaten, 0) / withData.length) : 0;
  const full = days.filter(x => x.day.meals.length && x.day.meals.every(m => log[x.ds]?.done?.[m.id])).length;

  // seria: kolejne pełne dni wstecz; dzisiaj jeszcze niedokończone nie przerywa serii
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = iso(d), day = dayForDate(d);
    const done = day.meals.length && day.meals.every(m => log[ds]?.done?.[m.id]);
    if (done) streak++;
    else if (i > 0) break;
  }

  const last = weight[weight.length - 1], first = weight[0];
  const delta = last && first ? (last.kg - first.kg) : 0;

  $('#view').innerHTML = `
    <div class="tiles">
      <div class="tile"><div class="tile-num">${avg || '—'}</div><div class="tile-lbl">Śr. kcal / dzień</div></div>
      <div class="tile"><div class="tile-num">${full}/7</div><div class="tile-lbl">Pełne dni</div></div>
      <div class="tile"><div class="tile-num">${streak}🔥</div><div class="tile-lbl">Seria dni z rzędu</div></div>
      <div class="tile"><div class="tile-num">${last ? last.kg.toFixed(1) : '—'}</div><div class="tile-lbl">Waga (kg)${delta ? ` · ${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : ''}</div></div>
    </div>

    <div class="sec">Spożyte kalorie</div>
    <div class="chart">
      <div class="bars">
        ${days.map(x => `
          <div class="bar ${x.eaten ? '' : 'miss'}">
            <i style="height:${Math.max(x.eaten / max * 100, 2)}%"></i>
            <span>${x.d.toLocaleDateString('pl-PL', { weekday:'short' }).slice(0,2)}</span>
          </div>`).join('')}
      </div>
      <p>Cel dzienny: ${plan.target} kcal</p>
    </div>

    <div class="sec">Waga</div>
    <div class="chart">
      <h4>Zapisz dzisiejszą wagę</h4>
      <p>Najlepiej rano, na czczo.</p>
      <div class="row2" style="margin-top:12px">
        <input type="number" inputmode="decimal" step="0.1" id="wIn" placeholder="np. 82.4">
        <button class="btn" style="margin:0;flex:0 0 96px" data-weight>Zapisz</button>
      </div>
      ${weight.length ? `<div style="margin-top:14px">${weight.slice(-8).reverse().map(w => `
        <div class="hero-line"><span>${new Date(w.d + 'T00:00').toLocaleDateString('pl-PL', { day:'numeric', month:'short' })}</span><b>${w.kg.toFixed(1)} kg</b></div>`).join('')}</div>` : ''}
    </div>
  `;
}

/* ============ arkusze (modale) ============ */
function openSheet(html) {
  $('#sheet').innerHTML = `<div class="grab"></div>${html}`;
  $('#sheetWrap').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  $('#sheetWrap').hidden = true;
  document.body.style.overflow = '';
}

function findMeal(id) {
  for (const d of plan.days) {
    const m = d.meals.find(x => x.id === id);
    if (m) return { day: d, meal: m };
  }
  return null;
}

function sheetEditMeal(id, dayId) {
  const found = id ? findMeal(id) : null;
  const m = found ? found.meal : { id: uid(), slot: 'Przekąska', name: '', items: '', kcal: 300, note: '' };
  const targetDay = found ? found.day.id : dayId;

  openSheet(`
    <h2>${id ? 'Edytuj posiłek' : 'Nowy posiłek'}</h2>
    <label>Pora</label>
    <select id="fSlot">${['Śniadanie','Przekąska','Obiad','Podwieczorek','Kolacja']
      .map(s => `<option ${s === m.slot ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <label>Nazwa dania</label>
    <input id="fName" value="${esc(m.name)}" placeholder="np. Kurczak z Air Fryer">
    <label>Składniki i gramatura</label>
    <textarea id="fItems" placeholder="250g piersi z kurczaka, 400g ziemniaków…">${esc(m.items)}</textarea>
    <div class="row2">
      <div><label>Kalorie</label><input id="fKcal" type="number" inputmode="numeric" value="${m.kcal || ''}"></div>
      <div><label>Notatka</label><input id="fNote" value="${esc(m.note || '')}" placeholder="np. Gotuj x2"></div>
    </div>
    <button class="btn" data-savemeal="${m.id}" data-dayid="${targetDay}">Zapisz</button>
    ${id ? `<button class="btn danger" data-delmeal="${m.id}">Usuń posiłek</button>` : ''}
    <button class="btn sec" data-close>Anuluj</button>
  `);
  setTimeout(() => { if (!id) $('#fName').focus(); }, 320);
}

function sheetSwap(id) {
  const ds = iso(cursor), cur = entry(ds).swap[id] || '';
  openSheet(`
    <h2>Co zjadłeś zamiast?</h2>
    <label>Zamiennik</label>
    <textarea id="fSwap" placeholder="np. 2 kanapki z serem i kawa, ~500 kcal">${esc(cur)}</textarea>
    <button class="btn" data-saveswap="${id}">Zapisz</button>
    ${cur ? `<button class="btn danger" data-delswap="${id}">Usuń zamiennik</button>` : ''}
    <button class="btn sec" data-close>Anuluj</button>
  `);
  setTimeout(() => $('#fSwap').focus(), 320);
}

function sheetSettings() {
  openSheet(`
    <h2>Ustawienia</h2>
    <label>Nazwa planu</label>
    <input id="sTitle" value="${esc(plan.title)}">
    <label>Cel kaloryczny (kcal / dzień)</label>
    <input id="sTarget" type="number" inputmode="numeric" value="${plan.target}">
    <button class="btn" data-savesettings>Zapisz</button>
    <button class="btn sec" data-export>⬇︎ Eksportuj dane (kopia zapasowa)</button>
    <button class="btn sec" data-import>⬆︎ Importuj dane z pliku</button>
    <button class="btn danger" data-resetplan>Przywróć oryginalny plan</button>
    <button class="btn danger" data-resetall>Wyczyść wszystko</button>
    <button class="btn sec" data-close>Zamknij</button>
    <p style="text-align:center;color:var(--dim2);font-size:12px;margin-top:18px">
      Dane trzymane lokalnie na tym telefonie.<br>Dodaj do ekranu głównego: Udostępnij → Do ekranu początkowego.
    </p>
  `);
}

/* ============ import / eksport ============ */
function exportData() {
  const blob = new Blob([JSON.stringify({ plan, log, shop, weight }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dieta-${iso(new Date())}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importData() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (d.plan) { plan = d.plan; savePlan(); }
        if (d.log) { log = d.log; save(K.log, log); }
        if (d.shop) { shop = d.shop; save(K.shop, shop); }
        if (d.weight) { weight = d.weight; save(K.weight, weight); }
        closeSheet(); render(); toast('Dane wczytane');
      } catch { toast('Nieprawidłowy plik'); }
    };
    r.readAsText(f);
  };
  inp.click();
}

/* ============ router ============ */
function render() {
  ({ today: viewToday, week: viewWeek, shop: viewShop, stats: viewStats })[tab]();
  window.scrollTo(0, 0);
}

/* ============ zdarzenia ============ */
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-toggle],[data-swap],[data-edit],[data-add],[data-nav],[data-open],[data-shop],[data-shopreset],[data-savemeal],[data-delmeal],[data-saveswap],[data-delswap],[data-savesettings],[data-export],[data-import],[data-resetplan],[data-resetall],[data-weight],[data-close],.tab');
  if (!t) return;
  const d = t.dataset;

  if (t.classList.contains('tab')) {
    tab = d.tab;
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('is-active', x === t));
    return render();
  }
  if ('close' in d) return closeSheet();

  /* dziś */
  if (d.toggle) {
    const e = entry(iso(cursor));
    e.done[d.toggle] ? delete e.done[d.toggle] : e.done[d.toggle] = 1;
    save(K.log, log); haptic(); return viewToday();
  }
  if (d.nav !== undefined) {
    if (d.nav === '0') cursor = new Date();
    else cursor.setDate(cursor.getDate() + Number(d.nav));
    return viewToday();
  }
  if (d.swap) return sheetSwap(d.swap);
  if (d.edit) return sheetEditMeal(d.edit);
  if (d.add) return sheetEditMeal(null, d.add);

  /* tydzień */
  if (d.open) return t.closest('.daycard').classList.toggle('open');

  /* zakupy */
  if (d.shop) { shop[d.shop] ? delete shop[d.shop] : shop[d.shop] = 1; save(K.shop, shop); haptic(); return viewShop(); }
  if ('shopreset' in d) { shop = {}; save(K.shop, shop); return viewShop(); }

  /* zapisy z arkuszy */
  if (d.savemeal) {
    const name = $('#fName').value.trim();
    if (!name) return toast('Podaj nazwę dania');
    const found = findMeal(d.savemeal);
    const data = {
      slot: $('#fSlot').value,
      name,
      items: $('#fItems').value.trim(),
      kcal: Number($('#fKcal').value) || 0,
      note: $('#fNote').value.trim(),
    };
    if (found) Object.assign(found.meal, data);
    else dayById(d.dayid).meals.push({ id: d.savemeal, ...data });
    savePlan(); closeSheet(); render(); return toast('Zapisano');
  }
  if (d.delmeal) {
    if (!confirm('Usunąć ten posiłek z planu?')) return;
    for (const day of plan.days) {
      const i = day.meals.findIndex(m => m.id === d.delmeal);
      if (i > -1) day.meals.splice(i, 1);
    }
    savePlan(); closeSheet(); render(); return toast('Usunięto');
  }
  if (d.saveswap) {
    const v = $('#fSwap').value.trim();
    const e = entry(iso(cursor));
    v ? (e.swap[d.saveswap] = v, e.done[d.saveswap] = 1) : delete e.swap[d.saveswap];
    save(K.log, log); closeSheet(); viewToday(); return toast('Zapisano zamiennik');
  }
  if (d.delswap) {
    delete entry(iso(cursor)).swap[d.delswap];
    save(K.log, log); closeSheet(); return viewToday();
  }
  if ('savesettings' in d) {
    plan.title = $('#sTitle').value.trim() || plan.title;
    plan.target = Number($('#sTarget').value) || plan.target;
    savePlan(); closeSheet(); render(); return toast('Zapisano');
  }
  if ('weight' in d) {
    const kg = parseFloat($('#wIn').value.replace(',', '.'));
    if (!kg || kg < 20 || kg > 400) return toast('Podaj poprawną wagę');
    const ds = iso(new Date());
    const ex = weight.find(w => w.d === ds);
    ex ? ex.kg = kg : weight.push({ d: ds, kg });
    weight.sort((a, b) => a.d.localeCompare(b.d));
    save(K.weight, weight); viewStats(); return toast('Zapisano wagę');
  }
  if ('export' in d) return exportData();
  if ('import' in d) return importData();
  if ('resetplan' in d) {
    if (!confirm('Przywrócić oryginalny plan? Twoje zmiany w daniach przepadną (odhaczenia zostaną).')) return;
    plan = structuredClone(DEFAULT_PLAN); savePlan(); closeSheet(); render(); return toast('Plan przywrócony');
  }
  if ('resetall' in d) {
    if (!confirm('Usunąć WSZYSTKIE dane — plan, historię, zakupy i wagę?')) return;
    Object.values(K).forEach(k => localStorage.removeItem(k));
    location.reload();
  }
});

$('#btnSettings').addEventListener('click', sheetSettings);

/* przesuwanie dni gestem w zakładce „Dziś” */
let sx = 0, sy = 0;
document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (tab !== 'today' || !$('#sheetWrap').hidden) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2) {
    cursor.setDate(cursor.getDate() + (dx < 0 ? 1 : -1));
    viewToday();
  }
}, { passive: true });

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
