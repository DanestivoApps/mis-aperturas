// Biblioteca de cursos: repertorios listos para añadir, con explicaciones y niveles.
// Cada nivel es una lista de líneas en PGN que se suman a las del nivel anterior.
// Los comentarios usan notación española (C, A, T, D, R); las jugadas, SAN en inglés.

export const LEVELS = [
  { name: 'Esencial', hint: 'Lo imprescindible para empezar a jugarlo' },
  { name: 'Avanzado', hint: 'Más respuestas del rival (para 1400+)' },
  { name: 'Completo', hint: 'Todo el curso (para 1800+)' },
];

const lines = (...list) => list.map((l) => `${l.trim()} *`).join('\n\n');

export const COURSES = [
  // ───────────────────────────── BLANCAS ─────────────────────────────
  {
    id: 'italiana',
    name: 'Partida Italiana',
    color: 'white',
    against: '1...e5',
    tagline: 'Clásica y sólida: desarrollo rápido, presión sobre f7 y un plan claro.',
    intro:
      'Con 1.e4 e5 2.Cf3 Cc6 3.Ac4 desarrollas rápido y apuntas a f7. Contra 3...Ac5 y 3...Cf6 juegas el Giuoco Pianissimo (c3 y d3): centro sólido, enroque, Te1 y la maniobra Cbd2-f1-g3 antes de romper con d4. También aprendes a castigar la Philidor, la Petrov y trampas como la de Blackburne-Shilling.',
    covers: ['3...Ac5: Giuoco Pianissimo', '3...Cf6: Dos Caballos con 4.d3', '3...Ae7 (Húngara), 3...d6 y 3...Cd4', '2...d6: Defensa Philidor', '2...Cf6: Defensa Petrov y la trampa 3...Cxe4?', '2...f5: Gambito Letón'],
    levels: [
      lines(
        `1. e4 {Ocupa el centro y abre paso a la dama y al alfil de f1.} e5 2. Nf3 {Desarrolla atacando el peón de e5.} Nc6 {Lo más habitual: defiende e5 desarrollando una pieza.} 3. Bc4 {La Partida Italiana: el alfil apunta a f7, el punto más débil de las negras.} Bc5 {Giuoco Piano: las negras también apuntan a f2.} 4. c3 {Prepara d4 y deja c2 como refugio para el alfil.} Nf6 {Ataca el peón de e4.} 5. d3 {Giuoco Pianissimo: defiende e4 y deja la ruptura d4 para cuando estés bien desarrollado.} d6 6. O-O {Pon el rey a salvo antes de abrir el juego.} O-O 7. Re1 {La torre apoya e4 y deja f1 libre para el caballo (Cbd2-f1-g3).} a6 {Prepara ...Aa7 para que el alfil no pueda ser atacado con d4 o b4.} 8. a4 {Gana espacio en el flanco de dama y frena ...b5.} Ba7 9. h3 {Impide ...Ag4 y prepara la maniobra Cbd2-f1-g3 con calma.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 O-O 6. O-O d6 {Otro orden de jugadas: llegamos a la línea principal.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 a6 {Las negras preparan ...Aa7 antes de enrocar.} 6. O-O d6 7. a4 {La misma idea: espacio y freno a ...b5.} Ba7 8. Re1 O-O 9. h3`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 {Defensa de los Dos Caballos: ataca e4 de inmediato.} 4. d3 {Defiende e4 con calma y evita las complicaciones de 4.Cg5.} Bc5 5. c3 {Volvemos a la estructura del Giuoco Pianissimo.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 Be7 {Más reservado: prepara el enroque.} 5. O-O O-O 6. Re1 d6 7. c3 {El mismo plan: Cbd2-f1-g3 y, cuando convenga, d4.}`,
        `1. e4 e5 2. Nf3 d6 {Defensa Philidor: sólida pero algo pasiva.} 3. d4 {Contra la Philidor, ocupa el centro de inmediato.} Nf6 4. Nc3 {Defiende e4 desarrollando.} Nbd7 {Sistema Hanham: las negras mantienen el peón de e5.} 5. Bc4 {Presión sobre f7.} Be7 6. O-O O-O 7. Re1 {Refuerza e4.} c6 8. a4 {Frena ...b5 y gana espacio.}`,
        `1. e4 e5 2. Nf3 d6 3. d4 exd4 {Las negras ceden el centro.} 4. Nxd4 {Recupera el peón con un centro dominante.} Nf6 5. Nc3 Be7 6. Be2 {Desarrollo sencillo: enroque y luego f4 o Ae3.} O-O 7. O-O`,
        `1. e4 e5 2. Nf3 Nf6 {Defensa Petrov: las negras contraatacan e4.} 3. Nxe5 {Toma el peón; ahora las negras deben andar con cuidado.} d6 {Lo correcto: si 3...Cxe4? 4.De2 y las negras sufren.} 4. Nf3 Nxe4 5. d4 {Línea principal: centro y desarrollo rápido.} d5 6. Bd3 {Desarrolla y presiona el caballo de e4.} Nc6 7. O-O Be7 8. c4 {Ataca d5 para quitarle apoyo al caballo de e4.}`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Bd6 7. O-O O-O 8. c4 {Misma idea: atacar la base del caballo de e4.}`,
      ),
      lines(
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a5 {Gana espacio en el flanco de dama.} 8. h3 {Quita la casilla g4 al caballo y al alfil.} h6 9. Nbd2 {Rumbo a f1 y g3.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 Ng4 {Amenaza ...Cxf2.} 8. Re2 {Defiende f2 con la torre; el caballo de g4 queda mal situado.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 Be6 {Ofrece cambiar los alfiles de casillas blancas.} 8. Bxe6 {Cambia: el peón doblado de e6 será un objetivo.} fxe6 9. Qb3 {Ataca e6 y b7 a la vez.} Qc8 10. Ng5 {Más presión sobre e6.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 Bg4 {Clava el caballo de f3.} 8. h3 {Pregunta al alfil.} Bh5 9. Nbd2 {Sigue el plan; si ...Axf3, recaptura con el caballo.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 h6 {Evita Cg5 y Ag5.} 5. O-O d6 6. c3 {La estructura de siempre.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Be7 {Defensa Húngara: muy sólida pero pasiva.} 4. d4 {Contra la Húngara, ocupa el centro.} d6 5. Nc3 Nf6 6. h3 {Impide ...Ag4, que presionaría d4.} O-O 7. O-O`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Be7 4. d4 exd4 5. Nxd4 Nf6 6. Nc3 O-O 7. O-O {Desarrollo completo y más espacio en el centro.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 d6 {Muy pasivo: encierra el alfil de f8.} 4. c3 {El plan de siempre: c3, d3 y enroque.} Nf6 5. d3 {Fiel al plan. Más agudo es 5.Cg5, que ataca f7 de inmediato.} Be7 6. O-O O-O 7. Re1`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 {Trampa Blackburne-Shilling: invita a 4.Cxe5?, al que sigue 4...Dg5! con ventaja negra (amenaza Dxg2).} 4. Nxd4 {Lo más sencillo: cambia el caballo.} exd4 5. O-O {Desarrollo y enroque: estás mejor desarrollado.}`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 {Error típico: copia la jugada.} 4. Qe2 {¡Clave! Ataca el caballo en la columna e.} Qe7 {Obligada: si 4...Cf6?? 5.Cc6+ gana la dama.} 5. Qxe4 d6 6. d4 dxe5 7. dxe5 {Has ganado un peón limpio.}`,
        `1. e4 e5 2. Nf3 d6 3. d4 Nd7 {Otra forma de mantener e5.} 4. Bc4 {Presión inmediata sobre f7.} c6 5. O-O {Atento a la idea dxe5 y Cg5 si las negras se descuidan.}`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Be7 7. O-O Nc6 {Llegamos a la línea de 6...Cc6.}`,
      ),
      lines(
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. a4 Ba7 9. h3 h6 10. Nbd2 {El caballo inicia el viaje a f1 y g3.} Re8 11. Nf1 {Desde g3 el caballo vigilará f5 y h5.} Be6 12. Bxe6 Rxe6 13. Ng3 {Posición típica: plan d4 o Ch4-f5.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 h6 {Evita Cg5 y Ag5.} 8. Nbd2 {El plan de siempre: Cf1-g3.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 d6 {Otro orden de jugadas.} 5. d3 Nf6`,
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 d5 {Ruptura prematura en el centro.} 5. exd5 Nxd5 6. O-O {Desarrolla y prepara Te1 contra el peón de e5.}`,
        `1. e4 e5 2. Nf3 f5 {Gambito Letón: muy arriesgado para las negras.} 3. Nxe5 {La refutación: el caballo es muy fuerte en e5.} Qf6 4. d4 d6 5. Nc4 fxe4 6. Nc3 {Desarrollo con ventaja: el peón de e4 será débil.}`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Nc6 7. O-O Be7 8. c4 Nb4 {Ataca el alfil de d3.} 9. Be2 {Conserva el alfil; el caballo de b4 puede quedar expuesto.} O-O 10. Nc3`,
        `1. e4 e5 2. Nf3 d6 3. d4 Nf6 4. Nc3 exd4 5. Nxd4`,
      ),
    ],
  },

  {
    id: 'londres',
    name: 'Sistema Londres',
    color: 'white',
    against: '1.d4',
    tagline: 'Una estructura contra todo: fácil de aprender y con planes de ataque.',
    intro:
      'Juegas 1.d4 y 2.Af4 y construyes casi siempre la misma estructura: e3, c3, Cf3, Cbd2 y Ad3. Es un sistema: aprendes planes en lugar de memorizar teoría. Contra ...c5 y ...Db6 respondes con Db3; contra ...Ad6 conservas el alfil con Ag3; y con Ce5, Df3 o la columna h puedes atacar el enroque.',
    covers: ['1...d5 con ...e6 y ...c5', '...c5 y ...Db6: la respuesta Db3', '...Ad6: Ag3 y la columna h', '...Af5: cambio de alfiles con Ad3', '1...Cf6 con ...g6 (India de Rey)', '1...Cf6 con ...e6 o ...b6', '1...f5 (Holandesa) y 1...g6'],
    levels: [
      lines(
        `1. d4 {Peón de dama al centro.} d5 2. Bf4 {El Sistema Londres: el alfil sale antes de jugar e3.} Nf6 3. e3 {Abre la diagonal del alfil de f1 y refuerza d4.} e6 4. Nf3 c5 {Las negras presionan d4.} 5. c3 {La pirámide c3-d4-e3: tu centro queda muy sólido.} Nc6 6. Nbd2 {Apoya la ruptura e4 sin tapar el peón de c.} Bd6 {Ofrece cambiar los alfiles.} 7. Bg3 {Conserva el alfil: si 7...Axg3 8.hxg3, la columna h se abre para tu torre.} O-O 8. Bd3 {El alfil apunta a h7: ideas de Ce5, Df3 o De2 y e4.}`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 {Mantén la estructura.} Nc6 5. Nd2 {Con el caballo en d2 podrás responder a ...Db6 con Db3.} Qb6 {Ataca b2.} 6. Qb3 {Defiende b2; si cambian damas, la columna a se abre para tu torre.}`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 e6 6. Ngf3 {Llegamos a la estructura de la línea principal.} Bd6 7. Bg3 O-O 8. Bd3`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 Bf5 {Las negras también sacan su alfil.} 4. Bd3 {Ofrece cambiar alfiles para neutralizar el de f5.} Bxd3 5. Qxd3 e6 6. Nf3 c5 7. c3 Nc6 8. Nbd2 {Desarrollo completo; luego Ce5 o e4.}`,
        `1. d4 d5 2. Bf4 c5 {Ataca d4 desde el principio.} 3. e3 Nc6 4. c3 Qb6 5. Qb3 {La respuesta de siempre a ...Db6.} c4 {Gana espacio echando a la dama.} 6. Qc2 {Si 6...Af5, 7.Dc1 y b2 sigue defendido.}`,
        `1. d4 Nf6 2. Bf4 {También contra 1...Cf6 juegas el Londres.} g6 {Las negras buscan una India de Rey.} 3. e3 Bg7 4. Nf3 O-O 5. Be2 {Desarrollo modesto pero sólido.} d6 6. h3 {Da casilla h2 al alfil y evita ...Cg4 y ...Ch5 con tempo.}`,
        `1. d4 Nf6 2. Bf4 e6 3. e3 c5 4. c3 Nc6 5. Nd2 d5 6. Ngf3 Bd6 7. Bg3 O-O 8. Bd3`,
        `1. d4 Nf6 2. Bf4 d5 3. e3`,
        `1. d4 Nf6 2. Bf4 c5 3. c3 {Sólido: mantén d4.} Qb6 4. Qb3 {El mismo antídoto contra ...Db6.}`,
      ),
      lines(
        `1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 Bxg3 8. hxg3 {La columna h semiabierta será útil para atacar.} O-O 9. Bd3 {Alfil y torre apuntan a h7.}`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 b6 9. Qe2 {Prepara e4 para abrir el centro con tus piezas mejor colocadas.}`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 Qe7 9. Ne5`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 Bd6 5. Bg3 {Igual que antes: conserva el alfil.} O-O 6. Bd3 c5 7. c3 Nc6 8. Nbd2`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 Be7 {Más reservado.} 5. Bd3 c5 6. c3 Nc6 7. Nbd2 O-O 8. O-O {Planes típicos: Ce5, De2 y e4.}`,
        `1. d4 d5 2. Bf4 e6 3. e3 Nf6 4. Nf3`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 Bf5 4. Bd3 e6 {Deja que cambies en f5.} 5. Bxf5 exf5 6. Qd3 {Ataca el peón de f5.} g6 7. Qb5+ {¡Jaque! Después de cubrirse, la dama ataca b7 y presiona d5.} Nbd7 8. Nc3 {Más presión sobre d5: el peón acabará cayendo.}`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 Bf5 4. Bd3 e6 5. Bxf5 exf5 6. Qd3 g6 7. Qb5+ c6 8. Qxb7 {Te llevas el peón de b7.}`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 Bf5 4. Bd3 e6 5. Bxf5 exf5 6. Qd3 Qd7 {Defiende f5 y b7 a la vez.} 7. Ne2 {Desarrollo tranquilo: luego Cbc3 o Cd2 y h3.}`,
        `1. d4 d5 2. Bf4 Bf5 3. e3 e6 4. Bd3 Bxd3 5. Qxd3 Nf6 6. Nf3`,
        `1. d4 Nf6 2. Bf4 e6 3. e3 b6 {Fianchetto de dama.} 4. Nf3 Bb7 5. h3 {Da casilla al alfil y evita ...Ch5.} c5 6. c3 Be7 7. Nbd2 O-O 8. Bd3`,
        `1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. Nf3 d6 5. Be2 O-O 6. h3`,
        `1. d4 g6 2. Nf3 {Contra 1...g6, primero el caballo; el alfil saldrá a f4 en la próxima jugada.} Bg7 3. Bf4 d6 4. e3 Nf6 5. Be2 O-O 6. h3`,
        `1. d4 e6 2. Bf4 d5 3. e3 Nf6 4. Nf3`,
        `1. d4 Nf6 2. Bf4 c5 3. c3 Nc6 4. d5 {Gana espacio y echa al caballo.} e5 5. Bg3 {Conserva el alfil; el peón de d5 corta en dos la posición negra.}`,
        `1. d4 Nf6 2. Bf4 c5 3. c3 Nc6 4. d5 Ne5 {¡Error! Nada defiende el caballo de e5.} 5. Bxe5 {Ganas una pieza.}`,
        `1. d4 Nf6 2. Bf4 c5 3. c3 Nc6 4. d5 Qb6 {¡Error! Olvida que el caballo está atacado.} 5. dxc6 {Ganas una pieza: si 5...Dxb2, 6.Cd2 y la dama negra no tiene suficiente.}`,
        `1. d4 Nf6 2. Bf4 c5 3. c3 cxd4 4. cxd4 Qb6 5. Qc1 {Defiende b2 sin complicaciones; luego e3, Cc3 y Cf3.}`,
      ),
      lines(
        `1. d4 f5 {Defensa Holandesa.} 2. Bf4 Nf6 3. e3 e6 4. Nf3 Be7 5. Bd3 {El alfil frena ...f4 y apunta al enroque.} O-O 6. O-O`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Qb6 5. Qb3 Nc6 6. Nd2`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 g6 {Estructura de Grünfeld.} 4. Nf3 Bg7 5. Be2 O-O 6. O-O c5 7. c3`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 cxd4 6. exd4 {Recaptura con el peón de e: la columna e se abre y el centro sigue firme.} Bf5 7. Ngf3 e6 8. Qb3 {Ataca b7.}`,
      ),
    ],
  },

  {
    id: 'alapin',
    name: 'Contra la Siciliana: Alapin',
    color: 'white',
    against: '1...c5',
    tagline: 'Evita la teoría de la Siciliana con 2.c3 y un centro de peones.',
    intro:
      'Contra 1...c5 juegas 2.c3 para apoyar d4 y quedarte con un centro de peones completo. Así evitas la enorme teoría de la Siciliana abierta. Contra 2...d5 y 2...Cf6, las dos respuestas principales, tendrás posiciones claras con desarrollo rápido; contra ...e6 llegarás a estructuras de la Francesa del Avance.',
    covers: ['2...d5 3.exd5 Dxd5', '2...Cf6 3.e5 Cd5', '2...e6, 2...d6, 2...Cc6 y 2...g6', '2...e5 y 2...Da5'],
    levels: [
      lines(
        `1. e4 c5 {Defensa Siciliana.} 2. c3 {Variante Alapin: prepara d4 para formar un centro de peones.} d5 {La respuesta más directa.} 3. exd5 Qxd5 4. d4 Nf6 5. Nf3 Bg4 {Clava el caballo y presiona d4.} 6. Be2 e6 7. O-O Nc6 8. h3 {Pregunta al alfil.} Bh5 9. Be3 cxd4 10. cxd4 Be7 11. Nc3 {Desarrolla atacando la dama.}`,
        `1. e4 c5 2. c3 d5 3. exd5 Qxd5 4. d4 Nf6 5. Nf3 e6 6. Be3 {Defiende d4 y prepara Cbd2 o c4.} cxd4 7. cxd4 Nc6 8. Nc3 Qd6 9. a3 {Evita ...Cb4 y ...Ab4.}`,
        `1. e4 c5 2. c3 d5 3. exd5 Qxd5 4. d4 Nc6 5. Nf3 Bg4 6. Be2 cxd4 7. cxd4 e6 8. Nc3 {Gana tiempo sobre la dama.}`,
        `1. e4 c5 2. c3 Nf6 {Ataca e4.} 3. e5 Nd5 4. d4 cxd4 5. Nf3 {Desarrolla primero: el peón de d4 no se escapa.} Nc6 6. Bc4 Nb6 7. Bb3 d5 8. exd6 Qxd6 9. O-O {Ventaja de desarrollo a cambio del peón.}`,
        `1. e4 c5 2. c3 e6 3. d4 d5 4. e5 {Llegamos a la estructura de la Francesa del Avance.} Nc6 5. Nf3 Qb6 6. a3 {Prepara b4 y gana espacio.}`,
        `1. e4 c5 2. c3 d6 3. d4 cxd4 4. cxd4 Nf6 5. Nc3 g6 6. Nf3 Bg7 7. Be2 O-O 8. O-O {Centro clásico de peones: muy cómodo para las blancas.}`,
        `1. e4 c5 2. c3 Nc6 3. d4 d5 4. exd5 Qxd5 5. Nf3`,
        `1. e4 c5 2. c3 g6 3. d4 cxd4 4. cxd4 d5 5. e5 {Gana espacio y corta la diagonal del alfil de g7.} Nc6 6. Nc3 Bg7 7. Bb5 {Clava el caballo de c6, que presionaba d4 y e5. Con 7.Cf3 las negras clavarían tu caballo con ...Ag4.}`,
      ),
      lines(
        `1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 e6 6. cxd4 d6 7. Bc4 {Ataca el caballo de d5.}`,
        `1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. Bc4 Nb6 7. Bb3 d6 8. exd6 Qxd6 9. O-O`,
        `1. e4 c5 2. c3 e6 3. d4 d5 4. e5 Nc6 5. Nf3 Bd7 6. Be2 {Como en la Francesa del Avance.}`,
        `1. e4 c5 2. c3 d6 3. d4 Nf6 4. Bd3 {Defiende e4 y mantiene la tensión.}`,
        `1. e4 c5 2. c3 e5 {Bloquea el centro.} 3. Nf3 Nc6 4. Bc4 {Desarrollo cómodo: la casilla d5 será tuya.}`,
        `1. e4 c5 2. c3 Qa5 {Intenta impedir d4.} 3. Nf3 Nf6 4. e5 {Echa al caballo y gana espacio.} Nd5 5. d4 cxd4 6. Nxd4 {Ventaja clara de desarrollo y de espacio.}`,
      ),
    ],
  },

  {
    id: 'francesa-avance',
    name: 'Contra la Francesa: Avance',
    color: 'white',
    against: '1...e6',
    tagline: 'Gana espacio con 3.e5 y encierra el alfil malo de las negras.',
    intro:
      'Contra la Francesa juegas 3.e5: ganas espacio en el flanco de rey y el alfil de c8 de las negras queda encerrado detrás de e6. Tu cadena de peones c3-d4-e5 aguanta la presión de ...c5, ...Cc6 y ...Db6; con a3 y b4 ganas espacio en el flanco de dama.',
    covers: ['3...c5 4.c3 Cc6 5.Cf3 Db6 6.a3', '5...Ad7 y 3...Ce7', '3...b6: cambio del alfil malo', '4...cxd4 con ...Ab4+'],
    levels: [
      lines(
        `1. e4 e6 {Defensa Francesa.} 2. d4 d5 3. e5 {Variante del Avance: gana espacio y encierra el alfil de c8.} c5 {Las negras atacan la base de la cadena de peones.} 4. c3 {Refuerza d4.} Nc6 5. Nf3 Qb6 {Máxima presión sobre d4.} 6. a3 {Prepara b4 para ganar espacio en el flanco de dama.} c4 {Cierra el centro.} 7. Nbd2 Na5 8. Rb1 {Prepara b4 con fuerza.}`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 Bd7 7. b4 {Gana espacio y alivia la presión sobre d4.} cxd4 8. cxd4 Rc8 9. Bb2 {Defiende d4.}`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 Nh6 {El caballo va a f5 para atacar d4.} 7. b4 cxd4 8. cxd4 Nf5 9. Bb2`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Bd7 6. Be2 Nge7 7. Na3 {El caballo irá a c2 para defender d4.} cxd4 8. cxd4 Nf5 9. Nc2`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Qb6 5. Nf3 Nc6`,
        `1. e4 e6 2. d4 d5 3. e5 b6 {Prepara ...Aa6 para cambiar su alfil malo.} 4. c3 Qd7 5. Nf3 a5 6. Bd3 Ba6 7. Bxa6 Nxa6 8. O-O {Mejor desarrollo; el caballo de a6 está lejos del centro.}`,
      ),
      lines(
        `1. e4 e6 2. d4 d5 3. e5 Ne7 {El caballo irá a f5.} 4. Nf3 c5 5. c3 Nbc6 6. Na3 cxd4 7. cxd4 Nf5 8. Nc2`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 cxd4 5. cxd4 Bb4+ 6. Nc3 Nc6 7. Nf3 Nge7 8. Bd3`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 a5 7. Bd3 {Desarrollo con la idea de enrocar.}`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 Nge7 7. b4 cxd4 8. cxd4 Nf5 9. Bb2`,
      ),
    ],
  },

  {
    id: 'caro-avance',
    name: 'Contra la Caro-Kann: Avance',
    color: 'white',
    against: '1...c6',
    tagline: 'El sistema Short: 3.e5 y 4.Cf3, sencillo y con espacio.',
    intro:
      'Contra la Caro-Kann juegas 3.e5 y el sistema de Short (4.Cf3 y 5.Ae2): desarrollo tranquilo, enroque y un pequeño pero duradero dominio del espacio. Si las negras golpean con ...c5, respondes con Ae3 o tomando en c5.',
    covers: ['3...Af5 4.Cf3 e6 5.Ae2', '5...c5 6.Ae3', '5...Cd7 y 5...Ce7', '3...c5 4.dxc5'],
    levels: [
      lines(
        `1. e4 c6 {Defensa Caro-Kann.} 2. d4 d5 3. e5 {Variante del Avance: gana espacio en el flanco de rey.} Bf5 4. Nf3 {Sistema Short: desarrollo tranquilo y sólido.} e6 5. Be2 c5 {Golpea la base de la cadena.} 6. Be3 {Defiende d4 y presiona c5.} cxd4 7. Nxd4 Ne7 8. O-O {Enroca; luego c4 o Cd2 según convenga.}`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Qb6 {Ataca b2.} 7. Nc3 {Defiende indirectamente b2: si 7...Dxb2, 8.Db1! te deja ventaja.}`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Qb6 7. Nc3 Qxb2 {Toma el peón envenenado.} 8. Qb1 {¡Ofrece cambiar damas!} Qb4 9. a3 Qxb1+ 10. Rxb1 {La torre llega a b7 con ventaja clara.}`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 Nd7 6. O-O Ne7 7. Nbd2 {El caballo va a b3 para controlar c5.} h6 8. Nb3`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 Ne7 6. O-O Nd7`,
        `1. e4 c6 2. d4 d5 3. e5 c5 {Golpe inmediato al centro.} 4. dxc5 {Toma el peón: a las negras les costará recuperarlo con comodidad.} e6 5. Nf3 Bxc5 6. Bd3 {Desarrollo rápido; el peón de e5 te da espacio.}`,
        `1. e4 c6 2. d4 d5 3. e5 c5 4. dxc5 Nc6 5. Nf3 Bg4 6. Bb5 {Clava el caballo y protege c5 indirectamente.}`,
      ),
      lines(
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Nd7 7. O-O Ne7 8. c4 {Abre el juego mientras el rey negro sigue en el centro.}`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 Nd7 6. O-O h6 7. Nbd2 Ne7 8. Nb3`,
      ),
    ],
  },

  {
    id: 'escandinava-contra',
    name: 'Contra la Escandinava',
    color: 'white',
    against: '1...d5',
    tagline: 'Desarrolla con tempo sobre la dama y castiga los retrasos.',
    intro:
      'Tras 1...d5 2.exd5 la dama negra sale pronto y tú la atacas con 3.Cc3. Contra 3...Da5 colocas los alfiles en c4 y d2 y preparas el enroque largo; contra 3...Dd6 y 3...Dd8 te desarrollas con naturalidad. Contra 2...Cf6 juegas d4 y c4 para ganar espacio.',
    covers: ['3...Da5', '3...Dd6', '3...Dd8', '2...Cf6 3.d4 Cxd5', '2...Cf6 3.d4 Ag4 (Portugués)'],
    levels: [
      lines(
        `1. e4 d5 {Defensa Escandinava.} 2. exd5 Qxd5 3. Nc3 {Desarrolla ganando tiempo sobre la dama.} Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Bc4 e6 7. Bd2 {Prepara ideas con Cd5 o Cb5 contra la dama.} c6 8. Nd5 {¡Truco! El caballo descubre el ataque del alfil de d2 sobre la dama negra.} Qd8 9. Nxf6+ Qxf6 10. Qe2 {Pareja de alfiles y ventaja de desarrollo.}`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Bc4 e6 7. Bd2 Bb4 {Lo más preciso: clava el caballo.} 8. a3 Bxc3 9. Bxc3 Qb6 10. Qe2 {Plan: enroque largo y Ce5 o d5.}`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd6 {Variante moderna.} 4. d4 Nf6 5. Nf3 a6 6. g3 {El alfil en g2 presionará el flanco de dama.} Bg4 7. Bg2 Nc6 8. O-O {Enroca: tu ventaja de desarrollo es clara.}`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd8 {Retirada clásica.} 4. d4 Nf6 5. Nf3 Bg4 6. h3 Bxf3 7. Qxf3 c6 8. Be3 {Pareja de alfiles y buen desarrollo.}`,
        `1. e4 d5 2. exd5 Nf6 {Recuperará el peón con el caballo.} 3. d4 Nxd5 4. Nf3 g6 5. Be2 Bg7 6. O-O O-O 7. c4 {Echa al caballo y gana espacio.} Nb6 8. Nc3`,
        `1. e4 d5 2. exd5 Nf6 3. d4 Bg4 {Gambito Portugués.} 4. Be2 {Lo más sencillo: cambia el alfil activo.} Bxe2 5. Qxe2 Qxd5 6. Nf3`,
      ),
      lines(
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 c6 5. Nf3 Bf5 6. Bc4 e6 7. Bd2`,
        `1. e4 d5 2. exd5 Nf6 3. d4 Nxd5 4. Nf3 Bg4 5. Be2 e6 6. O-O Nc6 7. c4 Nb6 8. Nc3`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 c6 6. Bc4 Bf5 7. Bd2 e6`,
      ),
    ],
  },

  {
    id: 'pirc-alekhine',
    name: 'Contra Pirc, Moderna y Alekhine',
    color: 'white',
    against: '1...d6 / 1...g6 / 1...Cf6',
    tagline: 'El Ataque 150 contra los fianchettos y desarrollo sólido contra la Alekhine.',
    intro:
      'Contra la Pirc y la Moderna usas el Ataque 150: Ae3, Dd2, f3 y, a menudo, Ah6 y enroque largo para atacar al rey negro. Contra la Alekhine juegas la variante moderna con Cf3: sin sobreextender tus peones, mantienes una ventaja de espacio cómoda.',
    covers: ['Pirc: Ataque 150', 'Moderna: 1...g6 con ...a6 y ...b5', 'Alekhine: variante moderna 4.Cf3', 'Nimzowitsch: 1...Cc6'],
    levels: [
      lines(
        `1. e4 d6 {Defensa Pirc.} 2. d4 Nf6 3. Nc3 g6 4. Be3 {Ataque 150: Dd2, f3, Ah6 y enroque largo.} Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 {El caballo apoya d4; el peón de f3 sujeta e4.} Nbd7 8. Bh6 {Cambia el alfil más importante de las negras.}`,
        `1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 c6 5. Qd2 Bg7 6. f3`,
        `1. e4 g6 {Defensa Moderna.} 2. d4 Bg7 3. Nc3 d6 4. Be3 {El mismo esquema del Ataque 150.} a6 5. Qd2 b5 6. f3 Nd7 7. Nge2`,
        `1. e4 Nf6 {Defensa Alekhine: invita a perseguir al caballo.} 2. e5 Nd5 3. d4 d6 4. Nf3 {Variante moderna: desarrollo sencillo y sólido.} Bg4 5. Be2 e6 6. O-O Be7 7. c4 Nb6 8. Nc3 O-O 9. Be3`,
        `1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. Nf3 dxe5 5. Nxe5 {El caballo en e5 es muy activo.} g6 6. Bc4 {Presiona d5 y f7.} c6 7. O-O Bg7 8. Re1`,
        `1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. Nf3 g6 5. Bc4 Nb6 6. Bb3 Bg7 7. Qe2 {Mantén e5 y prepara h4 o Cg5.}`,
      ),
      lines(
        `1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 O-O 6. O-O-O {Enroque largo y ataque con Ah6 y h4.}`,
        `1. e4 d6 2. d4 Nf6 3. Nc3 e5 {Pasa a una Philidor.} 4. Nf3 Nbd7 5. Bc4 Be7 6. O-O O-O 7. Re1 c6 8. a4`,
        `1. e4 Nc6 {Defensa Nimzowitsch.} 2. Nf3 d6 3. d4 Nf6 4. Nc3 Bg4 5. Be2 {Desarrollo y enroque.} e6 6. O-O`,
      ),
    ],
  },

  // ───────────────────────────── NEGRAS ─────────────────────────────
  {
    id: 'caro-kann',
    name: 'Defensa Caro-Kann',
    color: 'black',
    against: '1.e4',
    tagline: 'Sólida como un muro, con planes claros y menos teoría que la Siciliana.',
    intro:
      'Contra 1.e4 juegas 1...c6 y 2...d5: un centro sólido sin encerrar el alfil de c8, que suele salir a f5. Es una defensa muy segura, con estructuras claras. El curso cubre el Avance (3.e5 Af5), la Clásica (3.Cc3 o 3.Cd2 dxe4 4.Cxe4 Af5), el Cambio, el Ataque Panov, la Fantasía y los sistemas sin d4.',
    covers: ['3.e5: Avance (sistema Short, Bayoneta, 4.h4)', '3.Cc3 o 3.Cd2: Clásica 4...Af5', '3.exd5: Cambio', '4.c4: Ataque Panov', '3.f3: Fantasía', '2.Cc3 y Cf3: Dos Caballos', '2.d3 y 2.c4'],
    levels: [
      lines(
        `1. e4 c6 {Prepara ...d5 sin encerrar el alfil de c8.} 2. d4 d5 {Ataca e4: el centro negro queda bien apoyado.} 3. e5 {Variante del Avance: las blancas ganan espacio.} Bf5 {El alfil sale antes de cerrar la diagonal con ...e6.} 4. Nf3 e6 5. Be2 c5 {Golpea la base de la cadena de peones.} 6. Be3 cxd4 7. Nxd4 Ne7 {El caballo irá a c6 o f5 y libera el alfil de f8.}`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nc3 e6 5. g4 {Ataque Bayoneta: va a por el alfil.} Bg6 6. Nge2 c5 {Contraataca el centro de inmediato.}`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. h4 {Amenaza g4 para atrapar el alfil.} h5 {Da al alfil la casilla h7 y frena g4.} 5. c4 e6`,
        `1. e4 c6 2. d4 d5 3. Nc3 {Variante Clásica.} dxe4 4. Nxe4 Bf5 {El alfil sale ganando tiempo sobre el caballo.} 5. Ng3 Bg6 6. h4 {Amenaza h5 para atrapar el alfil.} h6 7. Nf3 Nd7 {Prepara ...Cgf6 y vigila e5.} 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6 {Estructura muy sólida: luego ...Cgf6, ...Ae7 o ...Dc7 y enroque.}`,
        `1. e4 c6 2. d4 d5 3. Nd2 dxe4 {El mismo plan que contra 3.Cc3.} 4. Nxe4 Bf5`,
        `1. e4 c6 2. d4 d5 3. exd5 {Variante del Cambio.} cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 {Activa el alfil antes de jugar ...e6.}`,
        `1. e4 c6 2. d4 d5 3. exd5 cxd5 4. c4 {Ataque Panov: busca juego activo con el peón aislado.} Nf6 5. Nc3 e6 6. Nf3 Be7 {Desarrollo sencillo: el peón de d4 será tu objetivo.}`,
        `1. e4 c6 2. Nc3 {Variante de los Dos Caballos.} d5 3. Nf3 Bg4 {Clava el caballo.} 4. h3 Bxf3 5. Qxf3 e6 {Estructura sólida; luego ...Cf6 y ...Ae7 o ...Ab4.}`,
      ),
      lines(
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. O-O Nc6 7. c3 cxd4 8. cxd4 Nge7 {El caballo irá a f5 para presionar d4.}`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. c3 e6 5. Be2 c5 6. Nf3 Nc6 7. O-O cxd4 8. cxd4 Nge7`,
        `1. e4 c6 2. d4 d5 3. f3 {Variante Fantasía.} e6 {Sólido: prepara ...Ab4 o ...c5.} 4. Nc3 Bb4`,
        `1. e4 c6 2. d3 {Sistema sin d4.} d5 3. Nd2 e5 {Ocupa el centro con los dos peones.} 4. Ngf3 Bd6 5. g3 Nf6 6. Bg2 O-O`,
        `1. e4 c6 2. c4 d5 3. exd5 cxd5 4. cxd5 Nf6 {Recupera el peón con el caballo.} 5. Nc3 Nxd5`,
        `1. e4 c6 2. Nc3 d5 3. d4 dxe4 4. Nxe4 Bf5`,
        `1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 7. Qb3 {Ataca b7.} Na5 {Echa a la dama.} 8. Qa4+ Bd7 9. Qc2 e6`,
        `1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. Nf3 Nd7 7. h4 h6`,
        `1. e4 c6 2. Nc3 d5 3. Nf3 Bg4 4. h3 Bxf3 5. Qxf3 e6 6. d4 Nf6`,
        `1. e4 c6 2. Nc3 d5 3. Nf3 Bg4 4. h3 Bxf3 5. Qxf3 e6 6. d3 Nf6`,
        `1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6 11. Bd2 Ngf6 12. O-O-O Be7 13. Kb1 O-O`,
      ),
      lines(
        `1. e4 c6 2. d4 d5 3. exd5 cxd5 4. c4 Nf6 5. Nc3 e6 6. Nf3 Be7 7. cxd5 Nxd5 8. Bd3 Nc6 9. O-O O-O 10. Re1 Nf6`,
        `1. e4 c6 2. Nf3 d5 3. Nc3 Bg4`,
        `1. e4 c6 2. Nf3 d5 3. e5 Bf5 {Como en el Avance.} 4. d4 e6`,
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Bd3 {Ofrece cambiar alfiles.} Bxd3 6. Qxd3 c5 7. O-O Nc6`,
        `1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. N1e2 Nf6 7. h4 h6 8. Nf4 Bh7`,
      ),
    ],
  },

  {
    id: 'dragon-acelerado',
    name: 'Siciliana: Dragón Acelerado',
    color: 'black',
    against: '1.e4',
    tagline: 'Siciliana dinámica con el alfil en g7 y la ruptura ...d5 en un solo paso.',
    intro:
      'Contra 1.e4 juegas la Siciliana con 2...Cc6 y ...g6. El alfil en g7 presiona la gran diagonal y, a diferencia del Dragón normal, puedes romper con ...d5 en un solo paso. Contra el Maroczy (5.c4) juegas ...Cxd4 y ...Ae6 para una partida sólida. Incluye las anti-sicilianas: Alapin, Rossolimo, Smith-Morra, Gran Premio y Cerrada.',
    covers: ['Principal: 5.Cc3 Ag7 6.Ae3 Cf6 7.Ac4', 'Maroczy: 5.c4', '5.Cxc6 bxc6', 'Alapin: 2.c3', 'Rossolimo: 3.Ab5', 'Gran Premio, Cerrada y 2.f4', 'Smith-Morra: 2.d4'],
    levels: [
      lines(
        `1. e4 c5 {Defensa Siciliana: lucha por d4 desde el flanco.} 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 {Dragón Acelerado: el alfil irá a g7 sin gastar tiempo en ...d6.} 5. Nc3 Bg7 6. Be3 Nf6 7. Bc4 {Las blancas apuntan a f7.} O-O 8. Bb3 d6 {Ahora sí, ...d6.} 9. f3 Bd7 10. Qd2 Nxd4 {Cambia caballos para activar el juego en el flanco de dama.} 11. Bxd4 b5 {Avanza en el flanco de dama con ...a5 y ...a4.}`,
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. c4 {Bind de Maroczy: las blancas impiden ...d5.} Nf6 6. Nc3 d6 7. Be2 Nxd4 {Cambia para aliviar la falta de espacio.} 8. Qxd4 Bg7 9. Be3 O-O 10. Qd2 Be6 {Ataca c4 y prepara ...Da5 y ...Tfc8.} 11. O-O Qa5`,
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. Nxc6 {Las blancas cambian para doblar tus peones.} bxc6 6. Qd4 Nf6 {Desarrolla atacando e4.} 7. e5 Nd5 8. e6 {Intenta abrir el juego.} f6 9. exd7+ Bxd7`,
        `1. e4 c5 2. c3 {Variante Alapin.} Nf6 {Ataca e4 de inmediato.} 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6 {Golpea el centro de peones.}`,
        `1. e4 c5 2. Nc3 Nc6 3. Nf3 g6 {Con ...g6: si juegan d4, llegamos al Dragón Acelerado.} 4. d4 cxd4 5. Nxd4 Bg7`,
        `1. e4 c5 2. Nf3 Nc6 3. Bb5 {Variante Rossolimo.} g6 {Fianchetto: el alfil de g7 será muy fuerte.} 4. O-O Bg7 5. Re1 Nf6 6. c3 O-O 7. d4 cxd4 8. cxd4 d5 {Golpea el centro.} 9. e5 Ne4`,
        `1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 {Cambia para doblar tus peones.} dxc6 {Recaptura hacia fuera: abre la columna d y libera el alfil de c8.} 5. d3 Bg7 6. h3 Nf6 7. Nc3 O-O`,
        `1. e4 c5 2. d4 {Si sigue 3.c3, es el Gambito Smith-Morra.} cxd4 3. c3 Nf6 {Declina el gambito con seguridad.} 4. e5 Nd5 5. Nf3 Nc6 6. cxd4 d6`,
      ),
      lines(
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. Nc3 Bg7 6. Be3 Nf6 7. Bc4 O-O 8. Bb3 d6 9. h3 Bd7 10. O-O Nxd4 11. Bxd4 Bc6`,
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. Nc3 Bg7 6. Be3 Nf6 7. Be2 O-O 8. O-O d5 {La ruptura típica del Dragón Acelerado, en un solo paso.} 9. exd5 Nxd5 10. Nxd5 Qxd5`,
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. c4 Nf6 6. Nc3 d6 7. f3 Nxd4 8. Qxd4 Bg7 9. Be3 O-O 10. Qd2 Be6`,
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. c4 Nf6 6. Nc3 d6 7. Nc2 {Evita el cambio de caballos.} Bg7 8. Be2 O-O 9. O-O Nd7 {El caballo va a c5 para presionar e4.}`,
        `1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. Nf3 Nc6 5. d4 cxd4 6. cxd4 d6`,
        `1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. Bc4 Nb6 5. Bb3 c4 6. Bc2 Qc7 {Presiona el peón de e5.}`,
        `1. e4 c5 2. Nc3 Nc6 3. f4 {Ataque Gran Premio.} g6 4. Nf3 Bg7 5. Bc4 e6 {Corta la diagonal del alfil de c4.}`,
        `1. e4 c5 2. Nc3 Nc6 3. f4 g6 4. Nf3 Bg7 5. Bb5 Nd4 {Evita que te doblen los peones.}`,
        `1. e4 c5 2. Nc3 Nc6 3. g3 {Siciliana Cerrada.} g6 4. Bg2 Bg7 5. d3 d6`,
        `1. e4 c5 2. f4 {Gran Premio sin Cc3.} d5 {Golpea el centro de inmediato.} 3. exd5 Nf6 4. Bb5+ Bd7 5. Bxd7+ Qxd7 6. c4 e6`,
        `1. e4 c5 2. Nf3 Nc6 3. c3 Nf6 4. e5 Nd5 5. d4 cxd4 6. cxd4 d6`,
        `1. e4 c5 2. d4 cxd4 3. Nf3 Nc6 4. Nxd4 g6`,
        `1. e4 c5 2. Nf3 Nc6 3. Nc3 g6 4. d4 cxd4 5. Nxd4 Bg7`,
      ),
      lines(
        `1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. O-O Bg7 5. c3 Nf6 6. Re1 O-O`,
        `1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. O-O Bg7 5. c3 Nf6 6. e5 Nd5 7. d4 cxd4 8. cxd4 O-O 9. Nc3 Nxc3 10. bxc3 d6`,
        `1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 dxc6 5. d3 Bg7 6. h3 Nf6 7. Nc3 O-O 8. Be3 b6 9. Qd2 e5`,
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. Nc3 Bg7 6. Nb3 Nf6 7. Be2 O-O 8. O-O d6`,
        `1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. c4 Nf6 6. Nc3 d6 7. Be2 Nxd4 8. Qxd4 Bg7 9. Bg5 O-O 10. Qd2 Be6`,
      ),
    ],
  },

  {
    id: 'eslava',
    name: 'Defensa Eslava',
    color: 'black',
    against: '1.d4',
    tagline: 'La defensa más sólida contra 1.d4, con el alfil de c8 libre.',
    intro:
      'Contra 1.d4 juegas 1...d5 y 2...c6: defiendes d5 sin encerrar el alfil de c8, que saldrá a f5 o g4. Es una de las defensas más sólidas que existen. El curso cubre la Eslava principal con 5.a4 Af5, los sistemas con e3, el Cambio y las respuestas contra el Londres y otros sistemas sin c4.',
    covers: ['Principal: 4.Cc3 dxc4 5.a4 Af5', '5.e3 y 5.e4 con ...b5', '4.e3 Af5', 'Cambio: 3.cxd5', '3.Cc3, 3.e3 y 4.Dc2', 'Contra el Londres (2.Af4)', 'Contra 2.Cf3 sin c4'],
    levels: [
      lines(
        `1. d4 d5 2. c4 {Gambito de Dama.} c6 {Defensa Eslava: defiende d5 y deja libre el alfil de c8.} 3. Nf3 Nf6 4. Nc3 dxc4 {Toma el peón: a las blancas les costará recuperarlo sin conceder algo.} 5. a4 {Impide ...b5.} Bf5 {El alfil sale antes de jugar ...e6.} 6. e3 e6 7. Bxc4 Bb4 {Clava el caballo y prepara el enroque.} 8. O-O Nbd7 9. Qe2 O-O 10. e4 Bg6 {Posición clásica y muy sólida para las negras.}`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. e3 {Sistema tranquilo: protege c4.} Bf5 {Igual que siempre: el alfil sale antes de ...e6.} 5. Nc3 e6 6. Nh4 {Va a por el alfil.} Bg6 7. Nxg6 hxg6 {La columna h semiabierta compensa la pareja de alfiles.}`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. e3 Bf5 5. Bd3 {Ofrece cambiar alfiles.} Bxd3 6. Qxd3 e6 7. Nc3 Nbd7 8. O-O Bd6`,
        `1. d4 d5 2. c4 c6 3. cxd5 {Variante del Cambio: estructura simétrica.} cxd5 4. Nc3 Nf6 5. Bf4 Nc6 6. e3 Bf5 {Copia la colocación: posición muy sólida.} 7. Nf3 e6 8. Qb3 Bb4 {Desarrolla con tempo y prepara el enroque.}`,
        `1. d4 d5 2. c4 c6 3. Nc3 Nf6 4. e3 Bf5 {Siempre la misma idea con el alfil.} 5. Nf3 e6`,
        `1. d4 d5 2. Bf4 {Sistema Londres.} Nf6 3. e3 c5 {Contra el Londres, ...c5 es lo más activo.} 4. c3 Nc6 5. Nd2 Qb6 {Presiona b2 y obliga a las blancas a reaccionar.}`,
        `1. d4 d5 2. Nf3 Nf6 3. c4 c6`,
        `1. d4 d5 2. Nf3 Nf6 3. Bf4 c5 4. e3 Nc6 5. c3 Qb6`,
        `1. d4 d5 2. Nf3 Nf6 3. e3 Bf5 {Antes de que las blancas jueguen Ad3.} 4. c4 c6`,
      ),
      lines(
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. Ne5 {Ataca c4 con el caballo.} Nbd7 7. Nxc4 Qc7 {Prepara ...e5.} 8. g3 e5 9. dxe5 Nxe5`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e3 b5 {Defiende el peón de c4.} 6. a4 b4 7. Na2 e6 8. Bxc4 Be7`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4 b5 6. e5 Nd5 7. a4 e6`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O Nbd7 9. Nh4 Bg6 10. Nxg6 hxg6`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. e3 Bf5 5. cxd5 cxd5 6. Qb3 {Ataca b7.} Qc8 {Defiende b7 con calma.}`,
        `1. d4 d5 2. c4 c6 3. e3 Nf6 4. Nf3 Bf5`,
        `1. d4 d5 2. c4 c6 3. e3 Nf6 4. Nc3 Bf5`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Qc2 dxc4 5. Qxc4 Bf5 6. g3 e6 7. Bg2 Nbd7`,
        `1. d4 d5 2. Nf3 Nf6 3. g3 Bf5 4. Bg2 e6 5. O-O Be7 6. c4 c6`,
        `1. d4 d5 2. Bf4 Nf6 3. Nf3 c5 4. e3 Nc6 5. c3 Qb6`,
        `1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. Nf3 Nc6 5. c3 Qb6`,
      ),
      lines(
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O Nbd7 9. Qe2 O-O 10. e4 Bg6 11. Bd3 Bh5 12. e5 Nd5`,
        `1. d4 d5 2. c4 c6 3. cxd5 cxd5 4. Nf3 Nf6 5. Nc3 Nc6 6. Bf4 Bf5 7. e3 e6`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. g3 Bf5 5. Bg2 e6 6. O-O Nbd7`,
        `1. d4 d5 2. c4 c6 3. Nc3 Nf6 4. Nf3 dxc4`,
      ),
    ],
  },

  {
    id: 'india-de-rey',
    name: 'India de Rey',
    color: 'black',
    against: '1.d4',
    tagline: 'Defensa de ataque: cedes el centro para contraatacar en el flanco de rey.',
    intro:
      'Contra 1.d4 juegas 1...Cf6, ...g6, ...Ag7, ...d6 y el enroque, y después golpeas el centro con ...e5 o ...c5. En las líneas principales las blancas atacan en el flanco de dama y tú en el de rey con ...f5, ...f4 y ...g5: posiciones desequilibradas y con muchas oportunidades de ganar.',
    covers: ['Clásica: Mar del Plata (9.Ce1)', 'Bayoneta (9.b4) y 9.Cd2', 'Petrosian (7.d5) y Cambio (7.dxe5)', 'Gligoric (7.Ae3)', 'Sämisch (5.f3) con 6...c5 y Cuatro Peones (5.f4)', 'Averbakh y 6.h3', 'Fianchetto (g3)', 'Contra el Londres y la Trompowsky'],
    levels: [
      lines(
        `1. d4 Nf6 {Controla e4 sin comprometer el centro.} 2. c4 g6 {India de Rey: el alfil irá a g7 y atacarás el centro después con ...e5 o ...c5.} 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 {La ruptura clave: lucha por el centro.} 7. O-O Nc6 8. d5 Ne7 {El caballo se recoloca para apoyar ...f5.} 9. Ne1 {Variante Mar del Plata: las blancas atacarán en el flanco de dama.} Nd7 10. Be3 f5 {Tu ataque llega por el flanco de rey.} 11. f3 f4 12. Bf2 g5 {Prepara ...g4: carrera de ataques en flancos opuestos.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 {Ataque Bayoneta.} Nh5 {Prepara ...f5 y vigila f4.} 10. Re1 f5 11. Ng5 Nf6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Nd2 a5 {Frena b4.} 10. a3 Nd7 11. Rb1 f5`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5 {Sistema Petrosian: cierra el centro antes de enrocar.} a5 8. Bg5 h6 9. Bh4 Na6 {El caballo va a c5.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. dxe5 {Variante del Cambio: busca un final cómodo.} dxe5 8. Qxd8 Rxd8 9. Bg5 Re8 {Defiende f7 y deja sitio al rey.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 {Variante Sämisch: muy sólida para las blancas.} O-O 6. Be3 c5 {Golpea el centro de inmediato, al estilo Benoni.} 7. d5 e6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 c5 7. Nge2 Nc6 8. d5 Ne5 {El caballo en e5 es muy fuerte.} 9. Ng3 e6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 c5 7. dxc5 dxc5 8. Qxd8 Rxd8 9. Bxc5 Nc6 {El peón está bien entregado: ventaja de desarrollo y presión en la columna d.}`,
        `1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. g3 {Variante del Fianchetto.} O-O 5. Bg2 d6 6. O-O Nbd7 7. Nc3 e5 8. e4 c6`,
        `1. d4 Nf6 2. Bf4 {Sistema Londres.} g6 3. e3 Bg7 4. Nf3 O-O 5. Be2 d6 6. h3 c5 {Golpea d4 en cuanto puedes.}`,
      ),
      lines(
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 {Sistema Gligoric.} Ng4 {Ataca el alfil.} 8. Bg5 f6 9. Bh4 Nc6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 {Ataque de los Cuatro Peones.} O-O 6. Nf3 c5 {Golpea el centro antes de que avance.} 7. d5 e6 8. Be2 exd5 9. cxd5 Bg4`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 {Variante Averbakh.} O-O 6. Bg5 c5 7. d5 e6 8. Qd2 exd5 9. exd5 Qb6 {Presiona b2 y prepara ...Af5.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. h3 e5 7. d5 a5 8. Bg5 Na6`,
        `1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. Nc3 O-O 5. e4 d6 6. Be2 e5`,
        `1. d4 Nf6 2. Nf3 g6 3. g3 Bg7 4. Bg2 O-O 5. O-O d6 6. c4 Nbd7 7. Nc3 e5 8. e4 c6`,
        `1. d4 Nf6 2. Nf3 g6 3. Bf4 Bg7 4. e3 O-O 5. Be2 d6 6. h3 c5`,
        `1. d4 Nf6 2. Bg5 {Ataque Trompowsky.} Ne4 {Ataca el alfil y gana tiempo.} 3. Bf4 c5 4. f3 Qa5+ 5. c3 Nf6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Nd3 f5`,
      ),
      lines(
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3 f5 11. f3 f4 12. Bf2 g5 13. a4 a5 {Frena el avance de las blancas en el flanco de dama.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 Nh5 10. g3 f5`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 c5 7. Nge2 Nc6 8. d5 Ne5 9. Ng3 e6 10. Be2 exd5 11. cxd5 h5 {Amenaza ...h4 contra el caballo de g3.}`,
        `1. d4 Nf6 2. c4 g6 3. g3 Bg7 4. Bg2 O-O 5. Nc3 d6 6. Nf3 Nbd7 7. O-O e5 8. e4 c6`,
      ),
    ],
  },

  // ───────────────────────────── MÁS CURSOS ─────────────────────────────
  {
    id: 'espanola',
    name: 'Apertura Española',
    color: 'white',
    against: '1...e5',
    tagline: 'La reina de las aperturas abiertas: presión duradera y planes profundos.',
    intro:
      'Con 3.Ab5 presionas el caballo que defiende e5. Contra la Defensa Morphy (3...a6) juegas la Española cerrada clásica (Te1, c3, h3 y d4); contra el peligroso Gambito Marshall usas el sistema anti-Marshall con 8.h3; contra la Berlinesa, la anti-Berlinesa con 4.d3. Incluye la Abierta, la Steinitz, la Clásica, la Schliemann, la Bird y la Smyslov, además de la Philidor y la Petrov.',
    covers: ['Cerrada: Chigorin, Breyer y Zaitsev', 'Anti-Marshall: 8.h3', 'Berlinesa: 4.d3', 'Abierta: 5...Cxe4', 'Steinitz, Clásica (3...Ac5), Schliemann (3...f5), Bird y Smyslov', 'Philidor y Petrov'],
    levels: [
      lines(
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 {Apertura Española: presiona el caballo que defiende e5.} a6 {Defensa Morphy: pregunta al alfil.} 4. Ba4 {Mantén el alfil en la diagonal.} Nf6 5. O-O {Enroca primero: el peón de e4 está defendido indirectamente.} Be7 6. Re1 {Defiende e4 y prepara c3 y d4.} b5 7. Bb3 d6 8. c3 {Prepara d4 y deja c2 como refugio para el alfil.} O-O 9. h3 {Evita ...Ag4 antes de jugar d4.} Na5 {Echa al alfil de b3.} 10. Bc2 c5 11. d4 {Variante Chigorin: la Española cerrada clásica.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O {Amenaza el Gambito Marshall (8.c3 d5).} 8. h3 {Anti-Marshall: si 8...d6 9.c3, llegas a la línea principal.} Bb7 9. d3 {Sólido: defiende e4 y no permite ...d5 con ataque.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. h3 d6 9. c3`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 {Defensa Berlinesa: ataca e4.} 4. d3 {Anti-Berlinesa: defiende e4 y evita el famoso final berlinés.} Bc5 5. c3 O-O 6. O-O d6 7. h3 {Prepara d4 sin permitir ...Ag4.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 {Variante Abierta: las negras toman el peón.} 6. d4 {Abre el centro con las piezas mejor desarrolladas.} b5 7. Bb3 d5 8. dxe5 Be6 9. c3 {Línea principal: Cbd2 y Ac2 contra el caballo de e4.}`,
        `1. e4 e5 2. Nf3 d6 {Defensa Philidor.} 3. d4 {Ocupa el centro de inmediato.} Nf6 4. Nc3 Nbd7 5. Bc4 Be7 6. O-O O-O 7. Re1 c6 8. a4`,
        `1. e4 e5 2. Nf3 d6 3. d4 exd4 4. Nxd4 Nf6 5. Nc3 Be7 6. Be2 O-O 7. O-O`,
        `1. e4 e5 2. Nf3 Nf6 {Defensa Petrov.} 3. Nxe5 d6 {Si 3...Cxe4?, 4.De2 gana material.} 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Nc6 7. O-O Be7 8. c4`,
      ),
      lines(
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 {Defensa Steinitz diferida.} 5. c3 Bd7 6. d4 Nf6 7. O-O Be7 8. Re1 O-O 9. Nbd2`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 d6 {Defensa Steinitz.} 4. d4 Bd7 5. Nc3 Nf6 6. O-O Be7 7. Re1`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 Bc5 {Defensa Clásica.} 4. c3 Nf6 5. O-O O-O 6. d4 Bb6 7. Bg5 {Clava el caballo y presiona e5.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 f5 {Gambito Schliemann: muy agresivo.} 4. d3 {Respuesta sólida: no hace falta complicarse.} fxe4 5. dxe4 Nf6 6. O-O Bc5 7. Qd3 {Evita ...Cg4 y prepara Ac4.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 Nd4 {Defensa Bird.} 4. Nxd4 exd4 5. O-O c6 6. Bc4 Nf6 7. Re1 d6 8. c3`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 {Defensa Smyslov.} 4. c3 a6 5. Ba4 d6 6. d4 Bd7 7. O-O`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 d6 5. c3 g6 6. O-O Bg7 7. Re1 O-O 8. Nbd2`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 6. d4 b5 7. Bb3 d5 8. dxe5 Be6 9. c3 Bc5 10. Nbd2 O-O 11. Bc2`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 {Variante Zaitsev.} 10. d4 Re8 11. Nbd2 Bf8 12. a4`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 {Variante Breyer: el caballo va a d7.} 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 {Error típico: copia la jugada.} 4. Qe2 {¡Clave! Ataca el caballo en la columna e.} Qe7 {Obligada: si 4...Cf6?? 5.Cc6+ gana la dama.} 5. Qxe4 d6 6. d4 dxe5 7. dxe5 {Has ganado un peón.}`,
      ),
      lines(
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 cxd4 13. cxd4 Nc6 14. Nb3 {Plan típico: d5 o Ae3 y Tc1.}`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 h6 {Variante Smyslov.} 10. d4 Re8 11. Nbd2 Bf8 12. Nf1`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Be6 10. d4 Bxb3 11. axb3`,
        `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bc5 {Variante Arkhangelsk.} 7. a4 Rb8 8. c3 d6 9. d4 Bb6 10. Na3`,
      ),
    ],
  },

  {
    id: 'gambito-dama',
    name: 'Gambito de Dama',
    color: 'white',
    against: '1...d5',
    tagline: 'El clásico de 1.d4: presión en el centro y planes estratégicos claros.',
    intro:
      'Tras 1.d4 d5 juegas 2.c4 para discutir el centro. Contra el Gambito de Dama Rehusado eliges la Variante del Cambio, con un plan muy claro (Dc2, Ad3 y el ataque de minorías b4-b5). Contra la Eslava y la Semieslava juegas las líneas principales sólidas, y contra el Aceptado recuperas el peón con desarrollo natural. También cubre la Tarrasch, la Albin, la Chigorin, la Báltica y la Marshall.',
    covers: ['Rehusado: Variante del Cambio y ataque de minorías', 'Tarrasch (3...c5)', 'Eslava (5.a4) y Semieslava (6.Dc2)', 'Aceptado: 3.Cf3', 'Albin, Chigorin, Báltica y Marshall'],
    levels: [
      lines(
        `1. d4 d5 2. c4 {Gambito de Dama: ofreces un peón para dominar el centro.} e6 {Gambito de Dama Rehusado: sólido.} 3. Nc3 Nf6 4. cxd5 {Variante del Cambio: estructura clara con un plan definido.} exd5 5. Bg5 {Clava el caballo de f6.} c6 6. e3 Be7 7. Bd3 Nbd7 8. Qc2 {Dama y alfil apuntan a h7; además evitas ...Ce4 y ...Af5.} O-O 9. Nf3 Re8 10. O-O Nf8 11. Rab1 {Ataque de minorías: b4-b5 para crear debilidades en el flanco de dama.}`,
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 Be7 6. e3 c6 7. Bd3 Nbd7 8. Qc2`,
        `1. d4 d5 2. c4 e6 3. Nc3 c5 {Defensa Tarrasch: juego activo con peón aislado.} 4. cxd5 exd5 5. Nf3 Nc6 6. g3 {El alfil en g2 presionará el peón de d5.} Nf6 7. Bg2 Be7 8. O-O O-O 9. dxc5 Bxc5 10. Bg5`,
        `1. d4 d5 2. c4 c6 {Defensa Eslava.} 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 {Impide ...b5.} Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O Nbd7 9. Qe2 O-O 10. e4 Bg6 11. Bd3`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 {Semieslava.} 5. e3 Nbd7 6. Qc2 {Sistema anti-Merano: tranquilo y sólido.} Bd6 7. Bd3 O-O 8. O-O dxc4 9. Bxc4`,
        `1. d4 d5 2. c4 dxc4 {Gambito de Dama Aceptado.} 3. Nf3 {Desarrolla primero: el peón se recupera fácilmente.} Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. a4 {Frena ...b5.}`,
        `1. d4 d5 2. c4 e5 {Contragambito Albin.} 3. dxe5 d4 4. Nf3 Nc6 5. g3 {El alfil en g2 y luego Cbd2: el peón de d4 será débil.} Be6 6. Nbd2 Qd7 7. Bg2 O-O-O 8. O-O`,
        `1. d4 d5 2. c4 Nc6 {Defensa Chigorin.} 3. Nf3 Bg4 4. cxd5 Bxf3 5. gxf3 Qxd5 6. e3 e5 7. Nc3 Bb4 8. Bd2`,
      ),
      lines(
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Bf5 {Activa el alfil antes de jugar ...Cbd7.} 7. Qf3 {Ataca f5 y b7.} Bg6 8. Bxf6 Qxf6 9. Qxf6 gxf6 10. Nf3 {Final cómodo: los peones doblados de f6 serán un objetivo.}`,
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 Be7 6. e3 O-O 7. Bd3 Nbd7 8. Qc2 c6`,
        `1. d4 d5 2. c4 e6 3. Nc3 c6 4. Nf3 Nf6 5. e3 Nbd7 6. Qc2`,
        `1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 a6 {Variante Chebanenko.} 5. e3 b5 6. b3 Bg4 7. h3 Bxf3 8. Qxf3`,
        `1. d4 d5 2. c4 c6 3. Nf3 dxc4 4. e3 b5 5. a4 e6 6. axb5 cxb5 7. b3 {Recupera el peón deshaciendo la cadena negra.}`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 a6 4. e3 Bg4 5. Bxc4 e6 6. h3 Bh5 7. Nc3`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 e6 4. e3 c5 5. Bxc4 a6 6. O-O Nf6`,
        `1. d4 d5 2. c4 Bf5 {Defensa Báltica.} 3. cxd5 Bxb1 4. Qa4+ c6 5. Rxb1 Qxd5 6. Nf3 {Pareja de alfiles y buen desarrollo.}`,
        `1. d4 d5 2. c4 Nf6 {Defensa Marshall.} 3. cxd5 Nxd5 4. Nf3 Bf5 5. Qb3 {Ataca b7.}`,
      ),
    ],
  },

  {
    id: 'petrov',
    name: 'Defensa Petrov',
    color: 'black',
    against: '1.e4',
    tagline: 'Sólida y fiable contra 1.e4 e5: contraataque en vez de defensa pasiva.',
    intro:
      'Tras 1.e4 e5 2.Cf3 juegas 2...Cf6: en lugar de defender e5 contraatacas e4. Es una de las defensas más sólidas del ajedrez de élite. Lo importante es recordar 3.Cxe5 d6, primero echando al caballo. El curso también te prepara contra todo lo demás tras 1...e5: Vienesa, Alfil, Partida del Centro, Gambito Danés, Gambito de Rey y el ataque prematuro 2.Dh5.',
    covers: ['Principal: 3.Cxe5 d6 5.d4', '5.Cc3 y 5.De2', '3.d4 (Steinitz)', '3.Cc3 (Cuatro Caballos) y 3.Ac4', 'Vienesa y Gambito Vienés', 'Apertura de Alfil, Partida del Centro y Gambito Danés', 'Gambito de Rey y 2.Dh5'],
    levels: [
      lines(
        `1. e4 e5 {Respuesta clásica: lucha por el centro.} 2. Nf3 Nf6 {Defensa Petrov: en vez de defender e5, contraataca e4.} 3. Nxe5 d6 {¡Primero echa al caballo! Si 3...Cxe4?, 4.De2 y pierdes material.} 4. Nf3 Nxe4 5. d4 d5 {El caballo de e4 queda bien apoyado.} 6. Bd3 Nc6 7. O-O Be7 8. c4 Nb4 {Ataca el alfil de d3.} 9. Be2 O-O 10. Nc3 Bf5 11. a3 Nxc3 12. bxc3 Nc6`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. Nc3 {Las blancas buscan enroque largo.} Nxc3 6. dxc3 Be7 7. Be3 Nc6 8. Qd2 Be6 9. O-O-O Qd7`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. Qe2 {Busca un final tranquilo.} Qe7 6. d3 Nf6 7. Bg5 Qxe2+ 8. Bxe2 Be7 9. Nc3 c6`,
        `1. e4 e5 2. Nf3 Nf6 3. d4 {Variante Steinitz.} Nxe4 4. Bd3 d5 5. Nxe5 Nd7 6. Nxd7 Bxd7 7. O-O Bd6 8. c4 c6`,
        `1. e4 e5 2. Nf3 Nf6 3. Nc3 Nc6 {Cuatro Caballos.} 4. d4 exd4 5. Nxd4 Bb4 6. Nxc6 bxc6 7. Bd3 d5 8. exd5 cxd5 9. O-O O-O 10. Bg5 c6`,
        `1. e4 e5 2. Nf3 Nf6 3. Nc3 Nc6 4. Bb5 Bb4 {Copia la colocación.} 5. O-O O-O 6. d3 d6 7. Bg5 Bxc3 8. bxc3 Qe7`,
        `1. e4 e5 2. Nf3 Nf6 3. Bc4 Nxe4 4. Nc3 Nxc3 5. dxc3 f6 {Defiende e5 y cierra la diagonal del alfil.} 6. Nh4 g6 7. f4 Qe7`,
        `1. e4 e5 2. Nc3 {Partida Vienesa.} Nf6 3. f4 {Gambito Vienés.} d5 {Golpea el centro: la mejor respuesta.} 4. fxe5 Nxe4 5. Nf3 Be7 6. d4 O-O 7. Bd3 f5`,
        `1. e4 e5 2. Bc4 {Apertura de Alfil.} Nf6 3. d3 c6 {Prepara ...d5.} 4. Nf3 d5 5. Bb3 Bd6`,
        `1. e4 e5 2. Qh5 {Ataque prematuro de la dama, típico entre principiantes.} Nc6 {Defiende e5.} 3. Bc4 g6 {Cierra la diagonal de la dama: f7 queda a salvo.} 4. Qf3 Nf6 5. Ne2 Bg7 {Desarrollo cómodo: la dama blanca acabará perdiendo tiempo.}`,
      ),
      lines(
        `1. e4 e5 2. Nc3 Nf6 3. Bc4 Nc6 4. d3 Bb4 5. Bg5 h6 6. Bxf6 Bxc3+ 7. bxc3 Qxf6`,
        `1. e4 e5 2. Nc3 Nf6 3. g3 d5 4. exd5 Nxd5 5. Bg2 Nxc3 6. bxc3 Bd6`,
        `1. e4 e5 2. d4 {Partida del Centro.} exd4 3. Qxd4 Nc6 {Desarrolla con ganancia de tiempo.} 4. Qe3 Nf6 5. Nc3 Bb4 6. Bd2 O-O 7. O-O-O Re8`,
        `1. e4 e5 2. d4 exd4 3. c3 {Gambito Danés.} d5 {Devuelve el peón para desarrollarte rápido.} 4. exd5 Qxd5 5. cxd4 Nc6 6. Nf3 Bg4 7. Be2 Bb4+ 8. Nc3 Bxf3 9. Bxf3 Qc4`,
        `1. e4 e5 2. f4 {Gambito de Rey.} d5 {Contragolpe en el centro.} 3. exd5 exf4 4. Nf3 Nf6 5. Bb5+ c6 6. dxc6 Nxc6 7. d4 Bd6`,
        `1. e4 e5 2. Bc4 Nf6 3. d4 exd4 4. Nf3 Nxe4 5. Qxd4 Nf6`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. c4 Be7 6. Nc3 Nxc3 7. dxc3 O-O`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nc4 Nxe4 5. Qe2 Qe7 6. Ne3 Nf6`,
        `1. e4 e5 2. Nf3 Nf6 3. Nc3 Nc6 4. Bc4 Nxe4 {El truco de la horquilla: recuperas la pieza con ...d5.} 5. Nxe4 d5 6. Bd3 dxe4 7. Bxe4 Bd6`,
        `1. e4 e5 2. Nf3 Nf6 3. Nc3 Nc6 4. g3 d5 5. exd5 Nxd5 6. Bg2 Nxc3 7. bxc3 Bd6`,
        `1. e4 e5 2. Qh5 Nc6 3. Bc4 g6 4. Qf3 Nf6 5. Ne2 Bg7 6. Nbc3 d6 7. d3 Bg4 {¡Con tempo sobre la dama!}`,
      ),
    ],
  },

  {
    id: 'escandinava',
    name: 'Defensa Escandinava',
    color: 'black',
    against: '1.e4',
    tagline: 'Fácil de aprender: decides tú el tipo de posición desde la primera jugada.',
    intro:
      'Contra 1.e4 juegas 1...d5 y, tras 2.exd5 Dxd5 3.Cc3, colocas la dama en a5. Después sacas el alfil a f5 y juegas ...c6 y ...e6: una estructura sólida que se repite casi siempre, así que hay poca teoría que memorizar. También cubre los intentos de evitarla (2.Cc3, 2.e5) y el Gambito Blackmar-Diemer.',
    covers: ['Principal: 3.Cc3 Da5 con ...Af5, ...e6 y ...Ab4', 'Cómo evitar el truco Cd5 contra la dama', '3.Cf3 y 3.d4', '2.Cc3 y 2.e5', 'Gambito Blackmar-Diemer'],
    levels: [
      lines(
        `1. e4 d5 {Defensa Escandinava: discute e4 desde la primera jugada.} 2. exd5 Qxd5 3. Nc3 Qa5 {La dama se sitúa a salvo en a5 y clava el caballo.} 4. d4 Nf6 5. Nf3 Bf5 {El alfil sale antes de jugar ...e6.} 6. Bc4 e6 7. Bd2 Bb4 {Clava el caballo antes de jugar ...c6: así evitas el truco Cd5, que descubriría el ataque del alfil de d2 sobre tu dama.} 8. a3 Bxc3 9. Bxc3 Qb6 {La dama se retira atacando b2.} 10. Qe2 Nbd7 11. O-O-O O-O-O`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Bc4 e6 7. Bd2 Bb4 8. Qe2 c6 9. O-O-O Nbd7 10. a3 Bxc3 11. Bxc3 Qc7`,
                `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Nf3 Nf6 5. d4 Bf5`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Bc4 Nf6 5. d3 c6 6. Nf3 Bg4`,
        `1. e4 d5 2. exd5 Qxd5 3. Nf3 Nf6 4. d4 Bf5 5. Be2 e6 6. O-O c6`,
        `1. e4 d5 2. exd5 Qxd5 3. d4 Nf6 4. Nf3 Bf5`,
        `1. e4 d5 2. Nc3 {Evita el cambio.} d4 {Gana espacio y echa al caballo.} 3. Nce2 e5 4. Ng3 Be6 5. Nf3 f6 {Refuerza e5: tu centro queda muy sólido.}`,
        `1. e4 d5 2. e5 {Cierra el centro.} Bf5 {Como en la Caro-Kann del Avance.} 3. d4 e6 4. Nf3 c5`,
      ),
      lines(
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Bd2 e6 7. Bc4 Bb4`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Ne5 c6 7. g4 {Va a por el alfil.} Be6 {¡No a e4! En e6 el alfil está seguro y el ataque blanco pierde fuerza.} 8. Bc4 Nbd7`,
        `1. e4 d5 2. d4 {Gambito Blackmar-Diemer.} dxe4 3. Nc3 Nf6 4. f3 exf3 5. Nxf3 e6 {Sólido: devuelve el peón si hace falta.} 6. Bg5 Be7`,
      ),
    ],
  },

  {
    id: 'gda',
    name: 'Gambito de Dama Aceptado',
    color: 'black',
    against: '1.d4',
    tagline: 'Simple y fiable contra 1.d4: igualas rápido con ideas claras.',
    intro:
      'Contra 1.d4 d5 2.c4 tomas el peón con 2...dxc4, no para quedártelo, sino para desarrollarte con libertad y golpear el centro con ...c5 o ...e5. Las ideas son pocas y claras. También tienes respuestas a 3.e4, 3.e3, 3.Cc3 y a los sistemas sin c4 como el Londres.',
    covers: ['Principal: 3.Cf3 Cf6 4.e3 e6 5.Axc4 c5', '3.e4 con 3...Cf6', '3.e3 e5', '3.Cc3, 4.Da4+ y g3', 'Contra el Londres y 2.Cf3'],
    levels: [
      lines(
        `1. d4 d5 2. c4 dxc4 {Gambito de Dama Aceptado: tomas el peón para jugar con piezas activas, no para quedártelo.} 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 {Ataca el centro de las blancas.} 6. O-O a6 {Prepara ...b5 para ganar espacio.} 7. dxc5 Qxd1 8. Rxd1 Bxc5 {Final cómodo: tu estructura es sana.}`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. a4 {Impide ...b5.} Nc6 8. Qe2 cxd4 9. Rd1 Be7 10. exd4 O-O`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. Qe2 b5 8. Bb3 Bb7 9. Rd1 Nbd7`,
        `1. d4 d5 2. c4 dxc4 3. e4 {Ocupa el centro.} Nf6 {Ataca e4.} 4. e5 Nd5 5. Bxc4 Nb6 6. Bb3 Nc6 7. Ne2 Bf5 8. Nbc3 e6`,
        `1. d4 d5 2. c4 dxc4 3. e4 Nf6 4. Nc3 e5 {Golpea d4 de inmediato.} 5. Nf3 exd4 6. Qxd4 Qxd4 7. Nxd4 Bc5`,
        `1. d4 d5 2. c4 dxc4 3. e3 e5 {Contraataque inmediato en el centro.} 4. Bxc4 exd4 5. exd4 Nf6 6. Nf3 Bd6 7. O-O O-O`,
        `1. d4 d5 2. Bf4 {Sistema Londres.} Nf6 3. e3 c5 {Lo más activo contra el Londres.} 4. c3 Nc6 5. Nd2 Qb6`,
        `1. d4 d5 2. Nf3 Nf6 3. c4 dxc4`,
      ),
      lines(
        `1. d4 d5 2. c4 dxc4 3. Nc3 e5 {Igual que contra 3.e3: golpe en el centro.} 4. d5 Nf6 5. e4 b5 {Defiende el peón de c4: aquí sí puedes quedártelo.} 6. Nf3 a6`,
        `1. d4 d5 2. c4 dxc4 3. Nc3 e5 4. d5 Nf6 5. e3 e4 {Gana espacio y quita la casilla f3 al caballo.} 6. Bxc4 Bd6`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. Qa4+ c6 5. Qxc4 Bf5 6. Nc3 e6`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. Qe2 a6 7. dxc5 Bxc5 8. O-O b5`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. g3 e6 5. Bg2 c5 6. O-O Nc6`,
        `1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. Nc3 a6 5. a4 Nc6 6. e4 Bg4`,
        `1. d4 d5 2. Nf3 Nf6 3. Bf4 c5 4. e3 Nc6 5. c3 Qb6`,
        `1. d4 d5 2. Bf4 Nf6 3. Nf3 c5 4. e3 Nc6 5. c3 Qb6`,
      ),
    ],
  },

  {
    id: 'contra-inglesa-reti',
    name: 'Contra la Inglesa y la Réti',
    color: 'black',
    against: '1.c4 / 1.Cf3 / otras',
    tagline: 'Con ...c6 y ...d5: encaja con la Caro-Kann y la Eslava.',
    intro:
      'Contra 1.c4, 1.Cf3 y las aperturas de flanco juegas ...c6 y ...d5. Si las blancas juegan d4 o e4 llegas a la Eslava o a la Caro-Kann; si no, montas el sistema Nueva York (...Cf6, ...Af5, ...e6) o la estructura ...Ag4 contra el Ataque Indio de Rey. También cubre la Larsen (1.b3), la Bird (1.f4), la Polaca (1.b4) y la Grob (1.g4).',
    covers: ['1.c4 c6: Réti, transposiciones a la Eslava y a la Caro-Kann', '1.Cf3 d5', 'Ataque Indio de Rey (g3, Ag2, d3)', 'Larsen, Bird, Polaca y Grob'],
    levels: [
      lines(
        `1. c4 {Apertura Inglesa.} c6 {Encaja con la Caro-Kann y la Eslava: si las blancas juegan d4 o e4, llegas a posiciones conocidas.} 2. Nf3 d5 3. b3 {Sistema Réti.} Nf6 4. g3 Bf5 {Sistema Nueva York: el alfil sale antes de ...e6.} 5. Bg2 e6 6. O-O Nbd7 7. Bb2 Be7`,
        `1. c4 c6 2. d4 d5 {Transpones a la Eslava.}`,
        `1. c4 c6 2. e4 d5 {Transpones a la Caro-Kann con c4.} 3. exd5 cxd5 4. cxd5 Nf6`,
        `1. c4 c6 2. Nc3 d5 3. cxd5 cxd5 4. d4 Nf6 {Variante del Cambio de la Eslava.}`,
        `1. c4 c6 2. g3 d5 3. Bg2 Nf6 4. Nf3 Bf5`,
        `1. Nf3 {Apertura Réti.} d5 2. d4 Nf6 3. c4 c6 {Transpones a la Eslava.}`,
        `1. Nf3 d5 2. c4 c6 3. b3 Nf6 4. g3 Bf5`,
        `1. Nf3 d5 2. g3 Nf6 3. Bg2 c6 4. O-O Bg4 {Contra el Ataque Indio de Rey: alfil activo y luego ...Cbd7 y ...e5.} 5. d3 Nbd7 6. Nbd2 e5`,
        `1. b3 {Apertura Larsen.} e5 {Ocupa el centro.} 2. Bb2 Nc6 3. e3 d5 4. Bb5 Bd6`,
        `1. f4 {Apertura Bird.} d5 2. Nf3 Nf6 3. e3 g6 {Fianchetto: el alfil de g7 vigila la gran diagonal.} 4. Be2 Bg7 5. O-O O-O`,
        `1. g3 d5 2. Bg2 Nf6 3. Nf3 c6`,
      ),
      lines(
        `1. c4 c6 2. Nf3 d5 3. e3 Nf6 4. Nc3 e6 5. b3 Nbd7 6. Bb2 Bd6`,
        `1. c4 c6 2. Nf3 d5 3. cxd5 cxd5 4. d4 Nf6`,
        `1. c4 c6 2. Nf3 d5 3. g3 Nf6 4. Bg2 Bf5`,
        `1. b4 {Apertura Polaca.} e5 2. Bb2 Bxb4 {Toma el peón: e5 está defendido indirectamente.} 3. Bxe5 Nf6`,
        `1. g4 {Apertura Grob.} d5 2. Bg2 Bxg4 {Toma el peón: el ataque a d5 no es peligroso.} 3. c4 c6`,
      ),
    ],
  },

  // ───────────────────────────── AÚN MÁS CURSOS ─────────────────────────────
  {
    id: 'vienesa',
    name: 'Gambito Vienés',
    color: 'white',
    against: '1...e5',
    tagline: 'Agresivo y directo: f4 pronto y ataque por la columna f.',
    intro:
      'Tras 1.e4 e5 juegas 2.Cc3 y, contra 2...Cf6, el Gambito Vienés 3.f4: abres la columna f y buscas la iniciativa desde el principio. Contra 2...Cc6 y 2...Ac5 tienes planes concretos para conservar la ventaja de desarrollo. Ideal si te gustan las posiciones de ataque.',
    covers: ['2...Cf6 3.f4 d5: la línea principal', '3...exf4 y 3...d6', '2...Cc6: Ac4, d3 y f4', '2...Ac5: Ca4 contra el alfil'],
    levels: [
      lines(
        `1. e4 e5 2. Nc3 {Partida Vienesa: desarrolla y prepara f4.} Nf6 3. f4 {Gambito Vienés: ataca e5 para abrir la columna f.} d5 {La respuesta más fuerte: golpe en el centro.} 4. fxe5 Nxe4 5. Nf3 {Desarrolla y defiende e5.} Be7 6. d4 O-O 7. Bd3 f5 8. exf6 Bxf6 9. O-O {Desarrollo completo y presión en la columna f.}`,
        `1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3 Bg4 {Clava el caballo.} 6. Qe2 {Ataca el caballo de e4 y desclava.} Nxc3 7. dxc3 c6 8. Bf4`,
        `1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3 Nc6 6. Bb5 {Presiona el caballo que defiende e5.}`,
        `1. e4 e5 2. Nc3 Nf6 3. f4 exf4 {Acepta el gambito.} 4. e5 {Echa al caballo con tempo.} Ng8 5. Nf3 d6 6. d4 dxe5 7. Qe2 {Recupera el peón con ventaja de desarrollo.}`,
        `1. e4 e5 2. Nc3 Nf6 3. f4 d6 {Defensa pasiva.} 4. Nf3 Nc6 5. d4 {Ocupa el centro: las negras quedan apretadas.}`,
        `1. e4 e5 2. Nc3 Nc6 3. Bc4 {Desarrolla apuntando a f7.} Nf6 4. d3 Bc5 5. f4 {La idea vienesa: abrir la columna f.} d6 6. Nf3`,
        `1. e4 e5 2. Nc3 Bc5 3. Nf3 d6 4. Na4 {Va a por el alfil de c5.} Bb6 5. Nxb6 axb6 6. d4 {Pareja de alfiles y centro fuerte.}`,
      ),
      lines(
        `1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3 Bc5 6. d4 Bb4 7. Bd2`,
        `1. e4 e5 2. Nc3 Nf6 3. f4 Nc6 {Imprecisión: tras 4.fxe5 el caballo de f6 tendrá que retroceder.} 4. fxe5 Nxe5 5. d4 Ng6 6. e5 Ng8 7. Nf3 {Gran ventaja de espacio.}`,
        `1. e4 e5 2. Nc3 Nc6 3. Bc4 Nf6 4. d3 Bb4 5. Nge2 {Evita la clavada molesta y prepara el enroque.}`,
        `1. e4 e5 2. Nc3 Nc6 3. Bc4 Nf6 4. d3 Na5 {Va a por el alfil.} 5. Nge2 Nxc4 6. dxc4 Bc5 7. O-O d6 8. Qd3 {Desarrolla y prepara Ae3 y Tad1.}`,
        `1. e4 e5 2. Nc3 d6 3. d4 {Contra la pasiva 2...d6, ocupa el centro de inmediato.}`,
      ),
    ],
  },

  {
    id: 'escocesa',
    name: 'Partida Escocesa',
    color: 'white',
    against: '1...e5',
    tagline: 'Abre el centro con 3.d4: juego directo y menos teoría que la Española.',
    intro:
      'Con 1.e4 e5 2.Cf3 Cc6 3.d4 abres el centro de inmediato y eliminas el peón de e5. Las posiciones son abiertas, con juego de piezas, y hay bastante menos teoría que en la Española. Contra 4...Ac5 y 4...Cf6, las dos defensas principales, tienes planes claros; contra 4...Dh4 sabrás qué hacer sin sustos. Incluye también la Philidor y la Petrov.',
    covers: ['4...Ac5: 5.Cxc6 Df6 6.Dd2', '4...Cf6: Variante Mieses (5.Cxc6 bxc6 6.e5)', '4...Dh4 y 4...Cxd4', '3...d6 y 3...Cxd4', 'Philidor y Petrov'],
    levels: [
      lines(
        `1. e4 e5 2. Nf3 Nc6 3. d4 {Partida Escocesa: abre el centro de inmediato.} exd4 4. Nxd4 {El caballo ocupa el centro.} Bc5 {Ataca el caballo de d4.} 5. Nxc6 {Cambia antes de que las negras ganen tiempo.} Qf6 {Amenaza mate en f2.} 6. Qd2 {Defiende f2 y prepara Cc3.} dxc6 7. Nc3 {Desarrollo; luego Dg2 o Ad3 y enroque.}`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 {Ataca e4.} 5. Nxc6 {Variante Mieses.} bxc6 6. e5 {Echa al caballo.} Qe7 {Clava el peón de e5.} 7. Qe2 Nd5 8. c4 {Gana espacio y echa al caballo otra vez.}`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Qh4 {Ataca e4 y f2: parece peligroso pero no lo es.} 5. Nb5 {Contraataque sobre c7.} Bb4+ 6. Bd2 Qxe4+ 7. Be2 {Desarrollo con tempo: tienes mucha compensación por el peón.}`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nxd4 5. Qxd4 {Tu dama queda muy activa en el centro.}`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 d6 {Mantiene e5.} 4. Bb5 {Presiona el caballo de c6.} Bd7 5. Nc3`,
        `1. e4 e5 2. Nf3 d6 {Defensa Philidor.} 3. d4 Nf6 4. Nc3 Nbd7 5. Bc4 Be7 6. O-O O-O 7. Re1 c6 8. a4`,
        `1. e4 e5 2. Nf3 Nf6 {Defensa Petrov.} 3. Nxe5 d6 {Si 3...Cxe4?, 4.De2 gana material.} 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Nc6 7. O-O Be7 8. c4`,
      ),
      lines(
        `1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 5. Nxc6 Qf6 6. Qd2 bxc6 7. Bd3 {Desarrollo y enroque.}`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3 {Defiende c4.}`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Nb6 9. Nd2`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 Nxd4 4. Nxd4 exd4 5. Qxd4`,
        `1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bb4+ 5. c3 Bc5 6. Be3`,
        `1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 4. Qe2 Qe7 5. Qxe4 d6 6. d4 dxe5 7. dxe5 {Has ganado un peón.}`,
      ),
    ],
  },

  {
    id: 'francesa',
    name: 'Defensa Francesa',
    color: 'black',
    against: '1.e4',
    tagline: 'Sólida y con contragolpe: la Rubinstein evita la teoría más afilada.',
    intro:
      'Contra 1.e4 juegas 1...e6 y 2...d5. Contra 3.Cc3 y 3.Cd2 eliges la Variante Rubinstein (3...dxe4): cambias en el centro, desarrollas con ...Cd7 y ...Cgf6 y obtienes una posición muy sólida con poca teoría. Contra el Avance golpeas la cadena con ...c5, ...Cc6 y ...Db6, y contra el Cambio juegas con piezas activas.',
    covers: ['3.Cc3 o 3.Cd2: Rubinstein (3...dxe4)', '3.e5: Avance con ...c5, ...Cc6 y ...Db6', '3.exd5: Cambio', '2.d3 (Ataque Indio de Rey) y 2.Cf3'],
    levels: [
      lines(
        `1. e4 e6 {Defensa Francesa: prepara ...d5 con el centro bien apoyado.} 2. d4 d5 3. Nc3 dxe4 {Variante Rubinstein: cambia en el centro y evita la teoría más afilada.} 4. Nxe4 Nd7 {Prepara ...Cgf6 sin permitir que te doblen los peones.} 5. Nf3 Ngf6 6. Nxf6+ Nxf6 7. Bd3 c5 {Golpea el centro: tus piezas salen con facilidad.} 8. dxc5 Bxc5`,
        `1. e4 e6 2. d4 d5 3. Nd2 dxe4 {El mismo plan contra 3.Cd2.} 4. Nxe4 Nd7`,
        `1. e4 e6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Nf3 Ngf6 6. Bd3 Nxe4 7. Bxe4 Nf6 8. Bd3 c5`,
        `1. e4 e6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Nf3 Ngf6 6. Bg5 Be7 7. Nxf6+ Bxf6 8. Bxf6 Nxf6`,
        `1. e4 e6 2. d4 d5 3. e5 {Variante del Avance.} c5 {Ataca la base de la cadena de peones.} 4. c3 Nc6 5. Nf3 Qb6 {Máxima presión sobre d4.} 6. a3 c4 {Cierra el flanco de dama y gana espacio.} 7. Nbd2 Na5`,
        `1. e4 e6 2. d4 d5 3. exd5 {Variante del Cambio.} exd5 4. Nf3 Nf6 5. Bd3 Bd6 6. O-O O-O 7. Bg5 Bg4`,
        `1. e4 e6 2. d3 {Ataque Indio de Rey.} d5 3. Nd2 Nf6 4. Ngf3 c5 5. g3 Nc6 6. Bg2 Be7 7. O-O O-O`,
      ),
      lines(
        `1. e4 e6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Nf3 Ngf6 6. Nxf6+ Nxf6 7. c3 c5 8. Be3 cxd4 9. Nxd4 Bd7 {Desarrollo tranquilo; luego ...Ac5 o ...Ae7 y enroque.}`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. Bd3 cxd4 7. cxd4 Bd7 {No caigas en 7...Cxd4? 8.Cxd4 Dxd4?? 9.Ab5+.}`,
        `1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. Be2 cxd4 7. cxd4 Nh6 {El caballo va a f5 a presionar d4.}`,
        `1. e4 e6 2. d4 d5 3. exd5 exd5 4. Bd3 Nc6 5. c3 Bd6 6. Nf3 Nge7`,
        `1. e4 e6 2. d4 d5 3. exd5 exd5 4. c4 Nf6 5. Nc3 Bb4`,
        `1. e4 e6 2. Nf3 d5 3. Nc3 Nf6 4. e5 Nfd7 5. d4 c5`,
      ),
    ],
  },

  {
    id: 'gdr',
    name: 'Gambito de Dama Rehusado',
    color: 'black',
    against: '1.d4',
    tagline: 'La defensa clásica de los campeones: sólida y con planes claros.',
    intro:
      'Contra 1.d4 d5 2.c4 juegas 2...e6, defendiendo d5 con el peón. Es la defensa más clásica: tu alfil de c8 sale más tarde, pero tu posición es muy firme. Contra la línea principal con 4.Ag5 juegas la Variante Tartakower (...h6 y ...b6), contra el Cambio sabes cómo responder al ataque de minorías, y también tienes respuestas contra la Catalana y el Londres.',
    covers: ['4.Ag5: Tartakower (...h6 y ...b6)', '4.cxd5: Variante del Cambio', '5.Af4', 'Catalana (g3)', 'Contra el Londres y 2.Cf3'],
    levels: [
      lines(
        `1. d4 d5 2. c4 e6 {Gambito de Dama Rehusado: defiende d5 con el peón.} 3. Nc3 Nf6 4. Bg5 Be7 {Deshace la clavada.} 5. e3 O-O 6. Nf3 h6 {Pregunta al alfil.} 7. Bh4 b6 {Variante Tartakower: el alfil de c8 sale a b7.} 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 {Posición sólida: el alfil de b7 apoyará ...c5.}`,
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 {Variante del Cambio.} exd5 5. Bg5 c6 {Apoya d5 y deja c7 libre para la dama.} 6. Qc2 Be7 7. e3 Nbd7 8. Bd3 O-O`,
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Be7 5. Bf4 O-O 6. e3 c5 {Golpea el centro de inmediato.} 7. dxc5 Bxc5`,
        `1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. g3 {Apertura Catalana.} Be7 5. Bg2 O-O 6. O-O dxc4 {Toma el peón: las blancas tendrán que trabajar para recuperarlo.} 7. Qc2 a6`,
        `1. d4 d5 2. Bf4 {Sistema Londres.} Nf6 3. e3 c5 {Lo más activo contra el Londres.} 4. c3 Nc6 5. Nd2 Qb6`,
        `1. d4 d5 2. Nf3 Nf6 3. c4 e6`,
      ),
      lines(
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bxf6 Bxf6 8. Rc1 c6`,
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. Nf3 O-O 6. e3 h6 7. Bh4 b6`,
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Bf5 7. Qf3 Bg6`,
        `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6`,
        `1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. g3 Be7 5. Bg2 O-O 6. O-O dxc4 7. Ne5 c5`,
        `1. d4 d5 2. Nf3 Nf6 3. Bf4 c5 4. e3 Nc6 5. c3 Qb6`,
        `1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Bd3 c5 5. b3 Nc6`,
      ),
    ],
  },

  {
    id: 'kan',
    name: 'Siciliana: Variante Kan',
    color: 'black',
    against: '1.e4',
    tagline: 'Siciliana flexible y de contraataque, con estructuras fáciles de entender.',
    intro:
      'Contra 1.e4 juegas 1...c5, 2...e6 y, tras 3.d4 cxd4 4.Cxd4, la flexible 4...a6. No te comprometes pronto: según lo que hagan las blancas eliges entre ...Dc7, ...Cf6, ...Ab4 o ...Ac5, con estructuras tipo erizo que dan mucho juego. Incluye las anti-sicilianas más frecuentes.',
    covers: ['5.Ad3: Cf6 y Dc7', '5.c4: Bind de Maroczy', '5.Cc3: Dc7', 'Alapin, 2.Cc3 y Smith-Morra', '3.c3 y 3.Cc3'],
    levels: [
      lines(
        `1. e4 c5 {Defensa Siciliana.} 2. Nf3 e6 {Flexible: prepara ...d5 o ...a6.} 3. d4 cxd4 4. Nxd4 a6 {Variante Kan: controla b5 y espera.} 5. Bd3 {La línea principal.} Nf6 6. O-O Qc7 7. Qe2 d6 8. c4 g6 {Estructura erizo: alfil a g7 y presión en la gran diagonal.} 9. Nc3 Bg7`,
        `1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. c4 {Bind de Maroczy.} Nf6 6. Nc3 Bb4 {Presiona e4.} 7. Bd3 Nc6 8. Nxc6 dxc6`,
        `1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. Nc3 Qc7 {Controla e5 y prepara ...b5.} 6. Bd3 Nc6`,
        `1. e4 c5 2. c3 {Variante Alapin.} Nf6 3. e5 Nd5 4. d4 cxd4 5. cxd4 d6`,
        `1. e4 c5 2. Nc3 e6 3. g3 {Siciliana Cerrada.} d5 {Golpe central en el momento justo.}`,
        `1. e4 c5 2. d4 cxd4 3. c3 Nf6 {Declina el Smith-Morra.} 4. e5 Nd5 5. cxd4 d6`,
        `1. e4 c5 2. Nf3 e6 3. c3 d5 4. e5 {Estructura de la Francesa del Avance.} Nc6 5. d4 Qb6`,
      ),
      lines(
        `1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. Nc3 Qc7 6. g3 Bb4 7. Bd2 Nf6`,
        `1. e4 c5 2. Nf3 e6 3. Nc3 a6 4. d4 cxd4 5. Nxd4 Qc7`,
        `1. e4 c5 2. Nf3 e6 3. d3 Nc6 4. g3 d5 5. Nbd2 Nf6 6. Bg2 Be7`,
      ),
    ],
  },
];

export function getCourse(id) {
  return COURSES.find((c) => c.id === id);
}

// PGN de un nivel concreto (0 = Esencial).
export function levelPgn(course, level) {
  return course.levels[level] ?? '';
}

// PGN acumulado hasta un nivel (incluido).
export function coursePgn(course, upToLevel = course.levels.length - 1) {
  return course.levels.slice(0, upToLevel + 1).join('\n\n');
}
