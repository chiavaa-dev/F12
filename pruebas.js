/* Pruebas de los tres juegos en un navegador simulado (jsdom):  npm install  y después  npm test
   Prueban el archivo generado dist/Juegos_futboleros.html, así que primero corre el build. */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, 'dist', 'Juegos_futboleros.html'), 'utf8').replace(/<link[^>]*>/g, '');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
const w = dom.window, d = w.document, $ = id => d.getElementById(id);
w.HTMLElement.prototype.scrollIntoView = () => {}; w.scrollTo = () => {};
const errores = []; w.addEventListener('error', e => errores.push(e.message));
let ok = 0, mal = 0;
const t = (cond, msg) => { if (cond) ok++; else { mal++; console.log('  FALLÓ: ' + msg); } };
const ev = s => w.eval(s);
const menu = () => d.querySelectorAll('[data-nav="menu"]')[0].click();
const abrir = juego => { menu(); d.querySelector('.card[data-game="' + juego + '"]').click(); };
const jugar = n => { ev('S.n = ' + n + '; renderSetup()'); $('setup-go').click(); };
const escribir = v => { $('c-in').value = v; $('c-in').dispatchEvent(new w.Event('input')); };

console.log('Menú y configuración');
t(d.querySelectorAll('.card[data-game]').length === 3, 'el menú tiene 3 juegos');
['mine', 'hol', 'club'].forEach(g => { abrir(g); t(!$('v-setup').hidden, 'abre la configuración de ' + g); t(!d.getElementById('seg-lvl'), 'sin selector de nivel en ' + g); });

console.log('Buscaminas');
abrir('mine'); jugar(1);
t(!$('v-mine').hidden, 'abre el juego');
const total = ev('CATS.length'), vistas = new Set([ev('M.cat.txt')]);
for (let i = 1; i < total; i++) { $('m-other').click(); const tx = ev('M.cat.txt'); t(!vistas.has(tx), 'categoría repetida antes de agotarlas: ' + tx); vistas.add(tx); t(ev('M.cells.length') === 16, 'tablero de 16'); }
t(vistas.size === total, 'salen las ' + total + ' categorías');
abrir('mine'); jugar(1);
d.querySelectorAll('#m-grid .tile')[ev('M.cells.findIndex(c => c.ok)')].click(); t(ev('M.found') === 1, 'un acierto suma');
d.querySelectorAll('#m-grid .tile')[ev('M.cells.findIndex(c => !c.ok)')].click(); t(ev('M.over') === true, 'un intruso termina la partida de 1 jugador');

console.log('Más o menos');
abrir('hol'); jugar(1); ev('startHol(true)');
const rondas = []; let seguidas = 0;
for (let i = 0; i < 300; i++) { ev('holNext()'); rondas.push(JSON.parse(ev('JSON.stringify({s: H.stat.id, a: H.a, b: H.b, va: H.stat.p[H.a], vb: H.stat.p[H.b], g: H.stat.gap || 1})'))); }
rondas.forEach((r, i) => { if (!(r.a !== r.b && Math.abs(r.va - r.vb) >= r.g)) t(false, 'ronda inválida ' + JSON.stringify(r)); if (i && r.s === rondas[i - 1].s) seguidas++; });
t(seguidas === 0, 'nunca la misma estadística dos veces seguidas');
t(new Set(rondas.slice(0, 60).map(r => [r.a, r.b].sort().join('|'))).size === 60, 'sin pares repetidos en las primeras 60 rondas');
t(new Set(rondas.map(r => r.s)).size === ev('HOL.length'), 'salen todas las estadísticas');
abrir('hol'); jugar(1);
for (let i = 0; i < 10; i++) { const bien = ev('H.stat.lower ? (H.stat.p[H.a] < H.stat.p[H.b]) : (H.stat.p[H.a] > H.stat.p[H.b])'); (bien ? $('h-a') : $('h-b')).click(); const nx = $('h-next'); if (nx && !nx.hidden) nx.click(); }
t(ev('H.streak') >= 8, 'racha jugando por la interfaz: ' + ev('H.streak'));
abrir('hol'); jugar(3); t(!$('v-hol').hidden, 'abre con 3 jugadores');

console.log('Adiviná el club');
abrir('club'); jugar(1);
t(!$('v-club').hidden && d.querySelectorAll('#c-clues li').length === 5 && d.querySelectorAll('#c-clues li.on').length === 1, 'arranca con 1 de 5 pistas');
t(ev('CLUE_LBL.join("|")') === 'Año de fundación|Colores de la camiseta|Liga|Estadio|Jugadores históricos', 'orden de pistas');
for (let r = 0; r < 10; r++) {   // acertar siempre con la primera pista = 5 puntos por club
  escribir(ev('C.club.n').toUpperCase()); $('c-go').click();
  t(ev('C.phase') === 'reveal', 'acierta el club ' + (r + 1)); $('c-next').click();
}
t(!$('c-final').hidden && ev('S.players[0].pts') === 50, 'partida perfecta = 50 puntos (' + ev('S.players[0].pts') + ')');
const primera = ev('C.order.slice()'); $('c-again').click(); t(!ev('C.order').some(i => primera.includes(i)), 'la 2ª partida no repite clubes');
for (let k = 1; k <= 4; k++) { escribir(ev('CLUBS.find(c => c !== C.club && !C.tried.some(t => CLUBS[t.i] === c)).n')); $('c-go').click(); t(ev('C.revealed') === k + 1, 'un error muestra la pista ' + (k + 1)); }
escribir(ev('CLUBS.find(c => c !== C.club && !C.tried.some(t => CLUBS[t.i] === c)).n')); $('c-go').click();
t(ev('C.phase') === 'reveal' && $('c-result').className.includes('lose'), 'fallar con las 5 pistas pierde el club');
$('c-next').click(); escribir('zzzxx'); $('c-go').click(); t(ev('C.revealed') === 1, 'un nombre que no existe no gasta intento');
escribir('man u'); t(ev('CLUBS[C.sug[0]].n') === 'Manchester United', 'busca "man u"');
abrir('club'); jugar(2);   // un intento por pista y por jugador
const p0 = ev('C.cur'); escribir(ev('CLUBS.find(c => c !== C.club).n')); $('c-go').click();
t(ev('C.revealed') === 1 && ev('C.cur') !== p0, '2 jugadores: tras el 1er error sigue la misma pista y pasa el turno');
escribir(ev('CLUBS.find(c => c !== C.club && !C.tried.some(t => CLUBS[t.i] === c)).n')); $('c-go').click();
t(ev('C.revealed') === 2, '2 jugadores: cuando los dos usaron su intento sale la pista 2');

/* Modo desarrollo: src/index.html con los archivos sueltos tiene que funcionar igual que el generado */
(async () => {
  console.log('Modo desarrollo (src/index.html con archivos sueltos)');
  const dev = await JSDOM.fromFile(path.join(__dirname, 'src', 'index.html'), { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true });
  const errDev = []; dev.window.addEventListener('error', e => errDev.push(e.message));
  await new Promise(r => dev.window.addEventListener('load', r));
  const e2 = s => dev.window.eval(s);
  t(e2('CATS.length') === ev('CATS.length') && e2('CLUBS.length') === ev('CLUBS.length') && e2('HOL.length') === ev('HOL.length'), 'mismos datos que el archivo generado');
  dev.window.document.querySelector('.card[data-game=\"club\"]').click(); dev.window.document.getElementById('setup-go').click();
  t(!dev.window.document.getElementById('v-club').hidden, 'el juego abre con los archivos sueltos');
  t(!errDev.length, 'sin errores de JavaScript en modo desarrollo ' + errDev.join(' | '));
  console.log(errores.length ? 'Errores de JavaScript: ' + errores.join(' | ') : 'Sin errores de JavaScript');
  console.log(mal ? mal + ' pruebas fallaron (' + ok + ' bien)' : 'Todo bien: ' + ok + ' pruebas');
  process.exit(mal || errores.length ? 1 : 0);
})();
