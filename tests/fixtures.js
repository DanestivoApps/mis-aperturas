// Repertorios pequeños y fijos para los tests (no cambian aunque cambie la biblioteca).
export const SAMPLES = [
  {
    name: 'Italiana (blancas)',
    color: 'white',
    pgn: `1. e4 {El peón de rey abre líneas para la dama y el alfil.}
e5 (1... c5 2. Nf3 d6 (2... Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3) (2... e6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3)
3. d4 cxd4 4. Nxd4 Nf6 5. Nc3) (1... e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3)
(1... c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2)
2. Nf3 Nc6 (2... d6 3. d4 Nf6 (3... exd4 4. Nxd4 Nf6 5. Nc3) 4. Nc3 Nbd7 5. Bc4)
(2... Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4)
3. Bc4 {El alfil apunta a f7, el punto débil de las negras.}
Bc5 (3... Nf6 4. d3 Be7 (4... Bc5 5. c3) 5. O-O O-O 6. Re1 d6 7. c3)
4. c3 {Prepara d4 y deja una casilla de retirada al alfil en c2.}
Nf6 5. d3 d6 (5... O-O 6. O-O d6 7. Re1) (5... a6 6. O-O d6 7. a4)
6. O-O O-O 7. Re1 *`,
  },
  {
    name: 'Caro-Kann (negras)',
    color: 'black',
    pgn: `1. e4 c6 {Prepara ...d5 sin encerrar el alfil de c8.}
2. d4 (2. Nc3 d5 3. Nf3 Bg4 4. h3 Bxf3 5. Qxf3 e6) (2. c4 d5 3. exd5 cxd5 4. cxd5 Nf6)
2... d5 3. e5 (3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7)
(3. Nd2 dxe4 4. Nxe4 Bf5)
(3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4)
3... Bf5 {El alfil sale antes de jugar ...e6.}
4. Nf3 (4. Nc3 e6 5. g4 Bg6 6. Nge2 c5) (4. h4 h5 5. c4 e6)
4... e6 5. Be2 c5 6. Be3 cxd4 *`,
  },
];
