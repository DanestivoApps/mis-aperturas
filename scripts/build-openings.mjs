// Regenera src/data/openings.json a partir de https://github.com/lichess-org/chess-openings (CC0).
// Uso: descarga a.tsv … e.tsv en una carpeta y ejecuta: node scripts/build-openings.mjs <carpeta>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Chess } from 'chess.js';

const [dir, out = 'src/data/openings.json'] = process.argv.slice(2);

const FAMILIES = {
  'Sicilian Defense': 'Defensa Siciliana',
  'Ruy Lopez': 'Apertura Española',
  "Queen's Gambit Declined": 'Gambito de Dama Rehusado',
  "Queen's Gambit Accepted": 'Gambito de Dama Aceptado',
  "Queen's Gambit": 'Gambito de Dama',
  'French Defense': 'Defensa Francesa',
  'Italian Game': 'Partida Italiana',
  'English Opening': 'Apertura Inglesa',
  "King's Gambit Accepted": 'Gambito de Rey Aceptado',
  "King's Gambit Declined": 'Gambito de Rey Rehusado',
  "King's Gambit": 'Gambito de Rey',
  "King's Indian Defense": 'Defensa India de Rey',
  "King's Indian Attack": 'Ataque Indio de Rey',
  'Caro-Kann Defense': 'Defensa Caro-Kann',
  'Nimzo-Indian Defense': 'Defensa Nimzoindia',
  "Queen's Pawn Game": 'Juego de Peón de Dama',
  "King's Pawn Game": 'Juego de Peón de Rey',
  'Semi-Slav Defense': 'Defensa Semieslava',
  'Slav Defense': 'Defensa Eslava',
  'Dutch Defense': 'Defensa Holandesa',
  'Benoni Defense': 'Defensa Benoni',
  'Grünfeld Defense': 'Defensa Grünfeld',
  'Neo-Grünfeld Defense': 'Defensa Neo-Grünfeld',
  "Queen's Indian Defense": 'Defensa India de Dama',
  'Bogo-Indian Defense': 'Defensa Bogoindia',
  'Old Indian Defense': 'Defensa India Antigua',
  'Indian Defense': 'Defensa India',
  'Alekhine Defense': 'Defensa Alekhine',
  'Scotch Game': 'Partida Escocesa',
  "Petrov's Defense": 'Defensa Petrov',
  'Russian Game': 'Defensa Petrov',
  'Four Knights Game': 'Partida de los Cuatro Caballos',
  'Three Knights Opening': 'Apertura de los Tres Caballos',
  'Zukertort Opening': 'Apertura Zukertort',
  'Scandinavian Defense': 'Defensa Escandinava',
  'Philidor Defense': 'Defensa Philidor',
  'Réti Opening': 'Apertura Réti',
  'Nimzowitsch Defense': 'Defensa Nimzowitsch',
  'Vienna Game': 'Partida Vienesa',
  "Bishop's Opening": 'Apertura de Alfil',
  'Modern Defense': 'Defensa Moderna',
  'Catalan Opening': 'Apertura Catalana',
  'Pirc Defense': 'Defensa Pirc',
  'Bird Opening': 'Apertura Bird',
  'Tarrasch Defense': 'Defensa Tarrasch',
  'Polish Opening': 'Apertura Polaca',
  'Hungarian Opening': 'Apertura Húngara',
  'Center Game': 'Partida del Centro',
  'Latvian Gambit Accepted': 'Gambito Letón Aceptado',
  'Latvian Gambit': 'Gambito Letón',
  'Ponziani Opening': 'Apertura Ponziani',
  'Trompowsky Attack': 'Ataque Trompowsky',
  'Benko Gambit Accepted': 'Gambito Benko Aceptado',
  'Benko Gambit Declined': 'Gambito Benko Rehusado',
  'Benko Gambit': 'Gambito Benko',
  'Englund Gambit': 'Gambito Englund',
  'Englund Gambit Declined': 'Gambito Englund Rehusado',
  'Owen Defense': 'Defensa Owen',
  'English Defense': 'Defensa Inglesa',
  'Torre Attack': 'Ataque Torre',
  'Danish Gambit Accepted': 'Gambito Danés Aceptado',
  'Danish Gambit': 'Gambito Danés',
  'London System': 'Sistema Londres',
  'Elephant Gambit': 'Gambito Elefante',
  'Budapest Defense': 'Defensa Budapest',
  'Blackmar-Diemer Gambit': 'Gambito Blackmar-Diemer',
  'Blackmar-Diemer Gambit Accepted': 'Gambito Blackmar-Diemer Aceptado',
  'Blackmar-Diemer Gambit Declined': 'Gambito Blackmar-Diemer Rehusado',
  'Two Knights Defense': 'Defensa de los Dos Caballos',
  'Evans Gambit': 'Gambito Evans',
  'Larsen Opening': 'Apertura Larsen',
  'Nimzo-Larsen Attack': 'Ataque Nimzo-Larsen',
  'Rat Defense': 'Defensa Rata',
  'Rubinstein Opening': 'Apertura Rubinstein',
  'Richter-Veresov Attack': 'Ataque Richter-Veresov',
  'Saragossa Opening': 'Apertura Zaragoza',
  'Grob Opening': 'Apertura Grob',
  'Van Geet Opening': 'Apertura Van Geet',
  'Robatsch Defense': 'Defensa Robatsch',
  'Czech Defense': 'Defensa Checa',
  'Horwitz Defense': 'Defensa Horwitz',
  'Mieses Opening': 'Apertura Mieses',
  'Lion Defense': 'Defensa León',
  'Kádas Opening': 'Apertura Kádas',
  'Ware Opening': 'Apertura Ware',
  'Barnes Opening': 'Apertura Barnes',
  'Amar Opening': 'Apertura Amar',
  'Pterodactyl Defense': 'Defensa Pterodáctilo',
  "King's Knight Opening": 'Apertura del Caballo de Rey',
  "King's Pawn Opening": 'Apertura de Peón de Rey',
  'Center Game Accepted': 'Partida del Centro Aceptada',
  'Polish Defense': 'Defensa Polaca',
  'Portuguese Opening': 'Apertura Portuguesa',
  'Mexican Defense': 'Defensa Mexicana',
  'Hippopotamus Defense': 'Defensa Hipopótamo',
  'Kangaroo Defense': 'Defensa Canguro',
  'East Indian Defense': 'Defensa India del Este',
  'Australian Defense': 'Defensa Australiana',
  'Basque Opening': 'Apertura Vasca',
  "Anderssen's Opening": 'Apertura Anderssen',
  'Duras Gambit': 'Gambito Duras',
  'Bongcloud Attack': 'Ataque Bongcloud',
  'Semi-Slav Defense Accepted': 'Defensa Semieslava Aceptada',
  'Slav Indian': 'India Eslava',
  'Tennison Gambit': 'Gambito Tennison',
  'Vienna Gambit, with Max Lange Defense': 'Gambito Vienés, con la Defensa Max Lange',
  'Wing Gambit': 'Gambito del Flanco',
  'St. George Defense': 'Defensa San Jorge',
  'Sodium Attack': 'Ataque Sodio',
  'Valencia Opening': 'Apertura Valencia',
  'Ware Defense': 'Defensa Ware',
};

const posKey = (fen) => fen.split(' ').slice(0, 4).join(' ');
const result = {};
let count = 0;
for (const letter of 'abcde') {
  const lines = readFileSync(join(dir, `${letter}.tsv`), 'utf8').trim().split('\n').slice(1);
  for (const line of lines) {
    const [eco, name, pgn] = line.split('\t');
    const chess = new Chess();
    for (const token of pgn.split(/\s+/)) {
      if (/^\d+\.+$/.test(token)) continue;
      chess.move(token);
    }
    const key = posKey(chess.fen());
    if (result[key]) continue;
    const [family, ...rest] = name.split(':');
    const translated = (FAMILIES[family] ?? family) + (rest.length ? ':' + rest.join(':') : '');
    result[key] = [eco, translated];
    count++;
  }
}
writeFileSync(out, JSON.stringify(result));
console.log(`${count} posiciones con nombre -> ${out}`);
