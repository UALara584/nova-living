import '@fontsource-variable/inter/opsz.css';
import './styles.css';
import {
  createIcons, createElement,
  Lightbulb, Thermometer, ShieldCheck, Blinds, Leaf, Sunrise, Moon, Lock, Clapperboard,
  ChevronLeft, ChevronRight, Mail, Phone, House, X,
} from 'lucide';

const ICONS = { Lightbulb, Thermometer, ShieldCheck, Blinds, Leaf, Sunrise, Moon, Lock, Clapperboard, ChevronLeft, ChevronRight, Mail, Phone, House, X };
const BY_NAME = { lightbulb: Lightbulb, thermometer: Thermometer, 'shield-check': ShieldCheck, blinds: Blinds, lock: Lock };
createIcons({ icons: ICONS, attrs: { 'aria-hidden': 'true' } });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Entrada de la portada (espera a la tipografía, como mucho 900 ms) ---------- */
const ready = () => requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 900))]).then(ready);

/* ---------- Imágenes: fondo de reserva si alguna no carga ---------- */
$$('.media img').forEach((img) => {
  const fail = () => img.closest('.media').classList.add('is-broken');
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
  img.addEventListener('error', fail, { once: true });
});

/* ---------- Cabecera y menú móvil ---------- */
const header = $('#header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const menuBtn = $('#menu-btn');
const menu = $('#menu');
const menuLabel = $('#menu-label');
function setMenu(open, { focusBack = false, animate = true } = {}) {
  menu.hidden = !open;
  menu.classList.toggle('is-open', open && animate);
  header.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Cerrar menú' : 'Abrir menú';
  if (!open && focusBack) menuBtn.focus();
}
// Sin animación si se abre con el teclado (e.detail === 0)
menuBtn.addEventListener('click', (e) => setMenu(menu.hidden, { animate: e.detail !== 0 }));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false, { focusBack: true }); });
document.addEventListener('click', (e) => { if (!menu.hidden && !header.contains(e.target)) setMenu(false); });
window.matchMedia('(min-width: 1080px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

/* ---------- Sección activa en la navegación ---------- */
const navLinks = $$('.nav a');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['inicio', 'soluciones', 'como-funciona', 'proyectos', 'contacto'].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

/* ---------- Apariciones al hacer scroll (una vez) ---------- */
const reveals = $$('.reveal');
if (!reduce.matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((el) => io.observe(el));
} else reveals.forEach((el) => el.classList.add('is-in'));

/* ---------- Escenas: "Un hogar que entiende tu ritmo" (simulación) ---------- */
const modes = JSON.parse($('#modes-data').textContent);
const tabs = $$('.mode-tab');
const scene = $('.mode-scene');
const panel = $('#mode-panel');
const field = (name) => $(`[data-field="${name}"]`, panel);

function swapText(el, text, animate) {
  if (el.textContent === text) return;
  if (!animate || reduce.matches) { el.textContent = text; return; }
  el.classList.add('swap', 'is-out');
  setTimeout(() => { el.textContent = text; el.classList.remove('is-out'); }, 180);
}
function swapIcon(el, name, animate) {
  const icon = BY_NAME[name];
  if (!icon || el.dataset.icon === name) return;
  const put = () => { el.replaceChildren(createElement(icon)); el.dataset.icon = name; };
  if (!animate || reduce.matches) return put();
  el.classList.add('swap', 'is-out');
  setTimeout(() => { put(); el.classList.remove('is-out'); }, 180);
}
function selectMode(key, { focus = false, animate = true } = {}) {
  const m = modes.find((x) => x.key === key);
  if (!m) return;
  tabs.forEach((t) => {
    const on = t.dataset.mode === key;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  panel.setAttribute('aria-labelledby', 'tab-' + key);
  scene.dataset.scene = key;
  swapText(field('time'), m.time, animate);
  swapText(field('name'), m.name, animate);
  swapText(field('text'), m.text, animate);
  m.items.forEach((it, j) => {
    swapIcon(field('icon-' + j), it.icon, animate);
    swapText(field('label-' + j), it.label, animate);
    swapText(field('value-' + j), it.value, animate);
  });
}
modes[0].items.forEach((it, j) => { field('icon-' + j).dataset.icon = it.icon; });
tabs.forEach((t, i) => {
  t.addEventListener('click', (e) => selectMode(t.dataset.mode, { animate: e.detail !== 0 }));
  t.addEventListener('keydown', (e) => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let n = null;
    if (k) n = (i + k + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault();
    selectMode(tabs[n].dataset.mode, { focus: true, animate: false });
  });
});

/* ---------- Carrusel de proyectos ---------- */
const car = $('#car');
const prev = $('#car-prev');
const next = $('#car-next');
const step = () => { const card = $('.project', car); return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(card.parentElement).columnGap || 0) : 400; };
function updateCar() {
  const max = car.scrollWidth - car.clientWidth - 2;
  prev.disabled = car.scrollLeft <= 2;
  next.disabled = car.scrollLeft >= max;
}
prev.addEventListener('click', () => car.scrollBy({ left: -step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
next.addEventListener('click', () => car.scrollBy({ left: step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
car.addEventListener('scroll', updateCar, { passive: true });
window.addEventListener('resize', updateCar);
updateCar();

/* ---------- Diálogos: aviso legal y privacidad ---------- */
let opener = null;
function openDialog(id, btn) {
  const d = document.getElementById(id);
  if (!d) return;
  opener = btn;
  d.showModal();
  document.body.classList.add('is-locked');
}
$$('[data-dialog]').forEach((b) => b.addEventListener('click', () => openDialog(b.dataset.dialog, b)));
$$('.dlg').forEach((d) => {
  $('.dlg-close', d).addEventListener('click', () => d.close());
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => { document.body.classList.remove('is-locked'); if (opener) opener.focus(); });
});

/* ---------- Formulario de contacto ----------
   Sin servicio configurado NO se envía nada: se avisa y se ofrece enviarlo por correo.
   Para recibir mensajes, define VITE_FORM_ENDPOINT (ver README). */
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || '';
const CONTACT_EMAIL = 'hola@novaliving.example';
const form = $('#contact-form');
const submit = $('#f-submit');
const status = $('#f-status');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const rules = {
  'f-name': () => (form.nombre.value.trim().length < 2 ? 'Escribe tu nombre.' : ''),
  'f-email': () => (!EMAIL_RE.test(form.email.value.trim()) ? 'Escribe un correo válido, por ejemplo nombre@dominio.com.' : ''),
  'f-type': () => (!form.querySelector('input[name="tipo"]:checked') ? 'Elige el tipo de proyecto.' : ''),
  'f-msg': () => (form.mensaje.value.trim().length < 10 ? 'Cuéntanos un poco más (al menos 10 caracteres).' : ''),
  'f-privacy': () => (!form.privacidad.checked ? 'Necesitamos que aceptes la política de privacidad para responderte.' : ''),
};
function setError(id, msg) {
  const err = document.getElementById(id + '-err');
  const fieldEl = err.closest('.field');
  fieldEl.classList.toggle('has-error', !!msg);
  err.textContent = msg;
  const input = id === 'f-type' ? null : document.getElementById(id);
  if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
}
function showStatus(kind, html) {
  status.hidden = false;
  status.className = 'form-status field-full' + (kind ? ' is-' + kind : '');
  status.innerHTML = html;
}
form.addEventListener('input', (e) => {
  const id = e.target.name === 'tipo' ? 'f-type' : e.target.id;
  if (rules[id] && document.getElementById(id + '-err').textContent) setError(id, rules[id]());
});
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.hidden = true;
  let first = null;
  Object.entries(rules).forEach(([id, rule]) => {
    const msg = rule();
    setError(id, msg);
    if (msg && !first) first = id === 'f-type' ? form.querySelector('input[name="tipo"]') : document.getElementById(id);
  });
  if (first) { first.focus(); return; }

  const data = {
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    tipo: form.querySelector('input[name="tipo"]:checked').value,
    mensaje: form.mensaje.value.trim(),
  };

  if (!ENDPOINT) {
    const body = `Nombre: ${data.nombre}\nCorreo: ${data.email}\nTipo de proyecto: ${data.tipo}\n\n${data.mensaje}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Proyecto: ' + data.tipo)}&body=${encodeURIComponent(body)}`;
    showStatus('', `<p><strong>Tu mensaje no se ha enviado.</strong> Este formulario todavía no está conectado a un servicio de envío. Puedes mandarlo desde tu aplicación de correo con los datos ya rellenados.</p><a class="btn btn-secondary btn-sm" href="${href}">Abrir en mi correo</a>`);
    return;
  }

  const label = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'Enviando…';
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error(String(res.status));
    form.reset();
    showStatus('ok', '<p><strong>Mensaje enviado.</strong> Te responderemos lo antes posible.</p>');
  } catch (_) {
    showStatus('error', `<p>No se ha podido enviar el mensaje. Comprueba tu conexión e inténtalo de nuevo, o escríbenos a <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`);
  } finally {
    submit.disabled = false;
    submit.textContent = label;
  }
});
