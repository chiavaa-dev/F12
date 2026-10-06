# Juegos futboleros

Tres juegos en una sola página: **Buscaminas futbolero**, **Más o menos** y **Adiviná el club**.
Se trabaja en varios archivos (`src/`) y un comando los junta en **un solo HTML** (`dist/Juegos_futboleros.html`) para publicar o compartir.

## Cómo se usa

| Quiero… | Comando |
|---|---|
| Generar el HTML final | `node build.js` |
| Revisar que los datos estén bien (listas, años, nombres repetidos) | `node validar-datos.js` |
| Probar los tres juegos en un navegador simulado | `npm install` (una sola vez) y `npm test` |
| Ver el juego mientras edito | abrir `src/index.html` con doble clic |

Solo hace falta [Node.js](https://nodejs.org). `npm install` es únicamente para las pruebas (instala `jsdom`).

## Qué hay en cada archivo

```
src/
  index.html              la página (menú, configuración y pantallas de los juegos)
  estilos.css             todos los estilos (colores y medidas arriba, en :root)
  nucleo.js               código compartido: jugadores, turnos, puntajes, menú y configuración
  datos/
    nombres.js            nombres completos que se muestran (FULLNAMES) y fotos opcionales (PHOTOS)
    categorias.js         categorías del Buscaminas
    mas-o-menos.js        estadísticas del Más o menos y fama de los jugadores
    clubes.js             clubes de Adiviná el club
  juegos/
    buscaminas.js         juego 1
    mas-o-menos.js        juego 2
    adivina-el-club.js    juego 3
build.js                  junta todo en dist/Juegos_futboleros.html
validar-datos.js          revisa los datos
pruebas.js                pruebas automáticas
dist/                     el HTML generado (no se edita a mano)
```

El orden de los `<script>` en `src/index.html` importa: primero los datos, después `nucleo.js` y al final los juegos.

## Cosas que se cambian seguido

**Agregar un club** (`src/datos/clubes.js`): una fila más.
`[nombre, otros nombres válidos separados por |, país, liga, colores, año de fundación, estadio, jugadores históricos]`

**Agregar jugadores a una categoría del Buscaminas** (`src/datos/categorias.js`): sumar el nombre a la lista de los que cumplen o a la de intrusos. Cada categoría necesita **al menos 12** que cumplen y **4** intrusos, y ninguno en las dos listas.

**Agregar una categoría nueva**: copiar un `cat(...)` y cambiar el tipo (Clubes, Selecciones, Compañeros, Premios y títulos, Posición, Nacionalidad, Cantera, Entrenadores, Carrera, Curiosidades), el texto y las dos listas.

**Agregar una estadística al Más o menos** (`src/datos/mas-o-menos.js`): una entrada más en `HOL` con `id`, la pregunta `q`, cómo se muestra el valor (`t` o `u`) y los jugadores con su número. Opciones: `lower: true` si gana el número menor (por ejemplo, año de nacimiento) y `gap: N` para no enfrentar valores demasiado parecidos (por ejemplo, altura).

**Que un jugador se vea con nombre completo** (`src/datos/nombres.js`): `'Messi': 'Lionel Messi'`. Si no está, se muestra como figura en la lista.

**Fotos de jugadores**: `PHOTOS['Messi'] = 'data:image/jpeg;base64,...'`. Ojo: cada foto suma entre 10 y 30 KB al HTML final.

Después de cualquier cambio: `node build.js` y, si querés, `node validar-datos.js`.

## Publicar

Subir `dist/Juegos_futboleros.html` donde lo publiques. Es un solo archivo, funciona sin servidor y sin conexión (la tipografía de Google es lo único externo y tiene fuente de respaldo).
