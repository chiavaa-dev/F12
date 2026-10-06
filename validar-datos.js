/* Revisa los datos sin abrir el navegador:  node validar-datos.js
   Falla (código 1) si hay errores; los avisos no frenan nada. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, 'src');
const ctx = vm.createContext({ console });
['datos/nombres.js', 'datos/categorias.js', 'datos/mas-o-menos.js', 'datos/clubes.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f }));
const { CATS, HOL, CLUBS, FULLNAMES, FAME_W } = vm.runInContext('({ CATS, HOL, CLUBS, FULLNAMES, FAME_W })', ctx);
const errores = [], avisos = [];
const nz = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const dup = a => a.filter((x, i) => a.indexOf(x) !== i);

/* Buscaminas */
const textos = new Set();
CATS.forEach(c => {
  if (textos.has(c.txt)) errores.push('Buscaminas: categoría repetida "' + c.txt + '"'); textos.add(c.txt);
  if (c.ok.length < 12) errores.push('Buscaminas "' + c.txt + '": solo ' + c.ok.length + ' jugadores que cumplen (mínimo 12)');
  if (c.no.length < 4) errores.push('Buscaminas "' + c.txt + '": solo ' + c.no.length + ' intrusos (mínimo 4)');
  const solapan = c.ok.filter(n => c.no.includes(n)); if (solapan.length) errores.push('Buscaminas "' + c.txt + '": está en las dos listas: ' + solapan.join(', '));
  const rep = dup(c.ok).concat(dup(c.no)); if (rep.length) errores.push('Buscaminas "' + c.txt + '": nombres repetidos: ' + [...new Set(rep)].join(', '));
});

/* Más o menos */
HOL.forEach(s => {
  const n = Object.keys(s.p).length;
  if (n < 8) errores.push('Más o menos "' + s.id + '": solo ' + n + ' jugadores');
  Object.entries(s.p).forEach(([k, v]) => { if (!Number.isFinite(v)) errores.push('Más o menos "' + s.id + '": valor raro en ' + k); });
  if (!s.q || !(s.t || s.u)) errores.push('Más o menos "' + s.id + '": falta la pregunta o el texto del valor');
});
Object.keys(FAME_W).forEach(n => { if (!HOL.some(s => n in s.p)) avisos.push('FAME: "' + n + '" no está en ninguna estadística'); });

/* Adiviná el club */
const claves = {};
CLUBS.forEach(c => {
  ['n', 'c', 'l', 'col', 's', 'p'].forEach(k => { if (!c[k] || typeof c[k] !== 'string') errores.push('Club "' + c.n + '": falta ' + k); });
  if (!Number.isInteger(c.y) || c.y < 1800 || c.y > 2030) errores.push('Club "' + c.n + '": año raro (' + c.y + ')');
  if (c.p && c.p.split(',').length < 3) errores.push('Club "' + c.n + '": menos de 3 jugadores históricos');
  [c.n].concat(c.a).map(nz).forEach(k => { (claves[k] = claves[k] || new Set()).add(c.n); });
});
Object.entries(claves).forEach(([k, v]) => { if (v.size > 1) errores.push('Club: el nombre/apodo "' + k + '" lo usan varios clubes: ' + [...v].join(' / ')); });
if (new Set(CLUBS.map(c => c.n)).size !== CLUBS.length) errores.push('Club: hay nombres de club repetidos');

/* nombres sin versión completa (solo aviso) */
const todos = new Set(); CATS.forEach(c => c.ok.concat(c.no).forEach(n => todos.add(n))); HOL.forEach(s => Object.keys(s.p).forEach(n => todos.add(n)));
const sinFull = [...todos].filter(n => !FULLNAMES[n] && !/ /.test(n));
if (sinFull.length) avisos.push(sinFull.length + ' jugadores se muestran solo con el apellido (no están en FULLNAMES): ' + sinFull.slice(0, 12).join(', ') + (sinFull.length > 12 ? '…' : ''));

console.log('Revisé ' + CATS.length + ' categorías, ' + HOL.length + ' estadísticas y ' + CLUBS.length + ' clubes.');
avisos.forEach(a => console.log('  aviso: ' + a));
if (errores.length) { errores.forEach(e => console.log('  ERROR: ' + e)); process.exit(1); }
console.log('Todo en orden.');
