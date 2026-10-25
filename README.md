# Mis Aperturas

Entrenador de aperturas al estilo de Chessreps: construyes tu repertorio y la app
te lo pregunta con repetición espaciada.

**Úsala aquí: https://danestivoapps.github.io/mis-aperturas/**

En el móvil puedes instalarla: en Android (Chrome), menú ⋮ → «Instalar app»; en iPhone
(Safari), Compartir → «Añadir a pantalla de inicio». Cada dispositivo guarda sus propios
repertorios: para pasarlos de uno a otro usa «Descargar copia de seguridad» y «Restaurar copia».

## Publicación

Cada vez que se suben cambios a la rama `main`, GitHub Actions pasa los tests, genera la web
y la publica en GitHub Pages (ver `.github/workflows/deploy.yml`).

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

Para generar la versión publicable (carpeta `dist/`, sirve en cualquier hosting estático):

```bash
npm run build
```

Tests automáticos (lógica del repertorio, PGN, repaso, partidas, revisión con motor…):

```bash
npm test
```

La versión publicada se puede **instalar** en el móvil o el ordenador ("Añadir a pantalla
de inicio") y funciona **sin conexión** después de la primera visita (las consultas a
Lichess y Chess.com sí necesitan internet).

## Qué hace

### Biblioteca de aperturas
Cursos listos para añadir, al estilo de Chessreps, con la idea de cada jugada explicada y
las respuestas habituales del rival. Cada curso tiene niveles (**Esencial**, **Avanzado**,
**Completo**) y puedes ampliarlo cuando quieras sin perder tus cambios.

| Con blancas | Con negras |
| --- | --- |
| Partida Italiana (contra 1...e5) | Defensa Caro-Kann (contra 1.e4) |
| Sistema Londres (1.d4) | Siciliana: Dragón Acelerado (contra 1.e4) |
| Contra la Siciliana: Alapin | Defensa Eslava (contra 1.d4) |
| Contra la Francesa: Avance | India de Rey (contra 1.d4) |
| Contra la Caro-Kann: Avance | |
| Contra la Escandinava | |
| Contra Pirc, Moderna y Alekhine | |

Calidad: los tests comprueban que todas las jugadas son legales, que no hay posiciones sin
respuesta ni dos jugadas tuyas en la misma posición. Además, todas tus jugadas (unas 670
posiciones) se revisaron con la nube de Lichess y con Stockfish 19 (profundidad 16, y 22 en
los casos dudosos), y se corrigieron las que perdían ventaja. Solo quedan dos decisiones de
sistema a menos de medio peón de la mejor jugada: 5.d3 contra 3...d6 en la Italiana (el
comentario menciona la alternativa 5.Cg5) y 3.Af4 contra 1...g6 en el Londres.

Al aprender una jugada nueva, la app te enseña su explicación antes de que la juegues.

### Construir el repertorio (Editor)
- Repertorios de blancas o negras. Añades jugadas **jugándolas en el tablero**,
  **pegando PGN** (con variantes y comentarios) o **trayendo un estudio de Lichess** por su enlace.
- **Nombre de la apertura** de cada posición (base de datos de Lichess, con las familias en español).
- **Evaluación** de la nube de Lichess y su mejor jugada (sin necesidad de cuenta).
- **Explorador de Lichess**: jugadas más populares entre maestros o aficionados, con % de
  victorias/tablas/derrotas. Un clic añade la jugada. Requiere un token personal gratuito
  (ver Ajustes).
- **Transposiciones**: el repertorio es un grafo de posiciones; si dos órdenes de jugadas
  llegan a la misma posición, comparten lo preparado (y el editor te lo indica).
- **Posiciones sin respuesta**: avisa de dónde te toca mover y no tienes nada preparado.
- **Revisar con el motor**: compara cada jugada tuya con la evaluación de la nube de Lichess
  y señala las dudosas (pierden ≥0,6 peones) y los errores (≥1,5).
- **Deshacer** tras borrar una rama o importar un PGN, y **hacer principal** una jugada.
- Lista de **líneas desde aquí**, comentarios por jugada, copiar FEN/línea, exportar PGN.

### Mis partidas
Descarga tus partidas de **Chess.com** (sin cuenta), **Lichess** (puede pedir tu token) o
pega un **PGN**, y las compara con tus repertorios:
- **Tus desviaciones**: dónde jugaste algo distinto a lo preparado (con un botón para mandarlo al repaso).
- **Sorpresas del rival**: jugadas que te hacen y no tienes preparadas (con "Preparar respuesta").
- Posiciones sin respuesta y cuántas jugadas aguantas de media dentro de tu repertorio.

### Entrenar
- **Repaso**: el rival juega las jugadas de tu repertorio y tú respondes.
  Jugada nueva → se enseña con flecha y luego se repite sin ayuda.
  Acierto → el intervalo crece (1 día, 3 días, luego ×2,5 aprox.). Fallo o pista → vuelve en la misma sesión.
- **Repasar todo**: encadena todos los repertorios con algo pendiente.
- **Práctica libre**: todas las líneas (o las que salen de una posición) en orden aleatorio,
  sin tocar el calendario. Las falladas se repiten al final.
- **Errores**: solo las líneas con las posiciones que más fallas, hasta que las consolides.
- Sonidos, animación de acierto/fallo y nombre de la apertura mientras entrenas.

### Estadísticas
Racha de días, precisión, respuestas por día (30 días), previsión de repasos (14 días),
progreso por repertorio (nuevas / aprendiendo / consolidadas) y las posiciones que más fallas.

### Ajustes
Jugadas nuevas por sesión, velocidad del rival, saltar las jugadas que ya sabes, sonidos,
colores del tablero, coordenadas, evaluación y token de Lichess.

### Datos
Todo vive en el `localStorage` del navegador. Desde el inicio puedes descargar o restaurar
una copia de seguridad en JSON (la copia no incluye tu token de Lichess).

Atajos: `←` `→` `Inicio` `Fin` `F` (girar) en el editor; `H` (pista) y `Enter` (siguiente línea) al entrenar.

## Token de Lichess (para el explorador)

Lichess exige un token para su explorador de aperturas. Créalo en
https://lichess.org/account/oauth/token/create sin marcar ningún permiso y pégalo en **Ajustes**.
La evaluación y la importación de estudios públicos funcionan sin token.

## Estructura

| Archivo | Para qué |
| --- | --- |
| `src/repertoire.js` | Modelo del repertorio, líneas, huecos, importar/exportar PGN |
| `src/library.js` | Cursos de la biblioteca (PGN con comentarios, por niveles) |
| `src/courses.js` | Añadir un curso a tu colección y ampliarlo de nivel |
| `src/notation.js` | Notación española (C, A, T, D, R) o inglesa |
| `src/srs.js` | Repetición espaciada (variante de SM-2) |
| `src/session.js` | Qué línea toca repasar y qué posiciones son débiles |
| `src/games.js` | Comparar partidas con el repertorio |
| `src/review.js` | Revisión del repertorio con la evaluación de Lichess |
| `src/chesscom.js` | Descarga de partidas de Chess.com |
| `src/chess-utils.js` | Utilidades de chess.js (UCI, enroques, destinos) |
| `src/store.js` | Guardado, ajustes, historial de respuestas y copias de seguridad |
| `src/board.js` | Tablero (chessground de Lichess), temas de color y utilidades de chess.js |
| `src/lichess.js` | Evaluación en la nube, explorador y estudios de Lichess |
| `src/openings.js` | Nombres de aperturas (`src/data/openings.json`, se carga bajo demanda) |
| `src/sound.js` | Sonidos sintetizados |
| `src/chart.js` | Gráfico de columnas de las estadísticas |
| `src/views/*.js` | Pantallas: inicio, editor, entrenamiento, estadísticas, ajustes |
| `scripts/build-openings.mjs` | Regenera `openings.json` desde los TSV de lichess-org/chess-openings |
| `public/` | Manifiesto, iconos y service worker (app instalable y sin conexión) |
| `tests/` | Tests con Vitest |

Librerías: [chess.js](https://github.com/jhlywa/chess.js) para las reglas y
[chessground](https://github.com/lichess-org/chessground) (el tablero de Lichess, licencia GPL-3.0).
Nombres de aperturas: [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings) (CC0).

## Licencia

GPL-3.0 (ver `LICENSE`), la misma que el tablero de Lichess (chessground) que usa la app.
