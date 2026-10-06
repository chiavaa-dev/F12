/* Arma UN solo archivo HTML (dist/Juegos_futboleros.html) juntando src/index.html + estilos.css + todos los scripts.
   Uso:  node build.js          (hace falta Node.js, nada más) */
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'src'), DIST = path.join(__dirname, 'dist');
const leer = rel => fs.readFileSync(path.join(SRC, rel), 'utf8');

let html = leer('index.html');

/* 1) estilos */
if (!html.includes('<link rel="stylesheet" href="estilos.css">')) throw new Error('Falta <link rel="stylesheet" href="estilos.css"> en src/index.html');
html = html.replace('<link rel="stylesheet" href="estilos.css">', () => '<style>\n' + leer('estilos.css').replace(/\s+$/, '') + '\n</style>');

/* 2) scripts, en el mismo orden en que aparecen en src/index.html */
const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>\n?/g)];
if (!tags.length) throw new Error('No hay <script src="..."> en src/index.html');
const codigo = tags.map(t => {
  const txt = leer(t[1]).replace(/^'use strict';\n/, '').replace(/\s+$/, '');
  return '/* ===== ' + t[1] + ' ===== */\n' + txt + '\n';
}).join('\n');
let primero = true;
html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, () => { if (!primero) return ''; primero = false; return "<script>\n'use strict';\n" + codigo + '</script>\n'; });

/* 3) aviso para no editar el archivo generado */
html = html.replace(/(<html[^>]*>)/, (m) => m + '\n<!-- ARCHIVO GENERADO por build.js: no lo edites acá, editá los archivos de src/ y volvé a correr "node build.js". -->');

fs.mkdirSync(DIST, { recursive: true });
const salida = path.join(DIST, 'Juegos_futboleros.html');
fs.writeFileSync(salida, html);
console.log('Listo: ' + path.relative(__dirname, salida) + ' (' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB, ' + tags.length + ' scripts + estilos)');
