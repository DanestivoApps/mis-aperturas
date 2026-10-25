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
        `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 {Trampa Blackburne-Shilling: invita a 4.Cxe5?, que pierde tras 4...Dg5!} 4. Nxd4 {Lo más sencillo: cambia el caballo.} exd4 5. O-O {Desarrollo y enroque: estás mejor desarrollado.}`,
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
        `1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 b6 9. Ne5 {Caballo en e5: plan Df3 y ataque al enroque.} Bb7 10. Qf3`,
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
        `1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Qb6 {Ataca b2.} 7. Nc3 {Si 7...Dxb2, 8.Cb5 y la dama negra corre peligro.}`,
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
        `1. e4 d5 {Defensa Escandinava.} 2. exd5 Qxd5 3. Nc3 {Desarrolla ganando tiempo sobre la dama.} Qa5 4. d4 Nf6 5. Nf3 Bf5 6. Bc4 e6 7. Bd2 {Prepara ideas con Cd5 o Cb5 contra la dama.} c6 8. Qe2 {Plan: enroque largo y Ce5 o d5.} Bb4 9. O-O-O Nbd7 10. a3 {Pregunta al alfil de b4.}`,
        `1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd6 {Variante moderna.} 4. d4 Nf6 5. Nf3 a6 6. g3 {El alfil en g2 presionará el flanco de dama.} Bg4 7. Bg2 Nc6 8. h3`,
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
    covers: ['Clásica: Mar del Plata (9.Ce1)', 'Bayoneta (9.b4) y 9.Cd2', 'Petrosian (7.d5) y Cambio (7.dxe5)', 'Gligoric (7.Ae3)', 'Sämisch (5.f3) y Cuatro Peones (5.f4)', 'Averbakh y 6.h3', 'Fianchetto (g3)', 'Contra el Londres y la Trompowsky'],
    levels: [
      lines(
        `1. d4 Nf6 {Controla e4 sin comprometer el centro.} 2. c4 g6 {India de Rey: el alfil irá a g7 y atacarás el centro después con ...e5 o ...c5.} 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 {La ruptura clave: lucha por el centro.} 7. O-O Nc6 8. d5 Ne7 {El caballo se recoloca para apoyar ...f5.} 9. Ne1 {Variante Mar del Plata: las blancas atacarán en el flanco de dama.} Nd7 10. Be3 f5 {Tu ataque llega por el flanco de rey.} 11. f3 f4 12. Bf2 g5 {Prepara ...g4: carrera de ataques en flancos opuestos.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 {Ataque Bayoneta.} Nh5 {Prepara ...f5 y vigila f4.} 10. Re1 f5 11. Ng5 Nf6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Nd2 a5 {Frena b4.} 10. a3 Nd7 11. Rb1 f5`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5 {Sistema Petrosian: cierra el centro antes de enrocar.} a5 8. Bg5 h6 9. Bh4 Na6 {El caballo va a c5.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. dxe5 {Variante del Cambio: busca un final cómodo.} dxe5 8. Qxd8 Rxd8 9. Bg5 Re8 {Defiende f7 y deja sitio al rey.}`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 {Variante Sämisch: muy sólida para las blancas.} O-O 6. Be3 e5 7. d5 Nh5 {Prepara ...f5.} 8. Qd2 f5`,
        `1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. g3 {Variante del Fianchetto.} O-O 5. Bg2 d6 6. O-O Nbd7 7. Nc3 e5 8. e4 c6`,
        `1. d4 Nf6 2. Bf4 {Sistema Londres.} g6 3. e3 Bg7 4. Nf3 O-O 5. Be2 d6 6. h3 c5 {Golpea d4 en cuanto puedes.}`,
      ),
      lines(
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 {Sistema Gligoric.} Ng4 {Ataca el alfil.} 8. Bg5 f6 9. Bh4 Nc6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 {Ataque de los Cuatro Peones.} O-O 6. Nf3 c5 {Golpea el centro antes de que avance.} 7. d5 e6 8. Be2 exd5 9. cxd5 Bg4`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 {Variante Averbakh.} O-O 6. Bg5 c5 7. d5 e6 8. Qd2 exd5 9. exd5 Re8`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. h3 e5 7. d5 a5 8. Bg5 Na6`,
        `1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. Nc3 O-O 5. e4 d6 6. Be2 e5`,
        `1. d4 Nf6 2. Nf3 g6 3. g3 Bg7 4. Bg2 O-O 5. O-O d6 6. c4 Nbd7 7. Nc3 e5 8. e4 c6`,
        `1. d4 Nf6 2. Nf3 g6 3. Bf4 Bg7 4. e3 O-O 5. Be2 d6 6. h3 c5`,
        `1. d4 Nf6 2. Bg5 {Ataque Trompowsky.} Ne4 {Ataca el alfil y gana tiempo.} 3. Bf4 c5 4. f3 Qa5+ 5. c3 Nf6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Nd3 f5`,
      ),
      lines(
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3 f5 11. f3 f4 12. Bf2 g5 13. a4 Ng6`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 Nh5 10. g3 f5`,
        `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. Nge2 c6 8. Qd2 Nbd7`,
        `1. d4 Nf6 2. c4 g6 3. g3 Bg7 4. Bg2 O-O 5. Nc3 d6 6. Nf3 Nbd7 7. O-O e5 8. e4 c6`,
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
