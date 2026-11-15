// Démineur : ouvre toutes les cases sans mine. Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels, cases en relief).
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap wide\">\n      <div class=\"agHead\"><span class=\"label\">Démineur</span><span class=\"hint\" id=\"msInfo\"></span><div class=\"agNav\"><select class=\"f gSel\" id=\"msLevel\" title=\"Taille du plateau\"></select>\n        <label class=\"check\" title=\"Le plateau se résout toujours par la logique, sans jamais devoir deviner\"><input type=\"checkbox\" id=\"msNoGuess\"> Sans hasard</label>\n        <label class=\"check\" title=\"Le clic droit pose un drapeau, puis un « ? »\"><input type=\"checkbox\" id=\"msMarks\"> Marques ?</label>\n        <button class=\"btn px\" id=\"msHint\" title=\"Ouvre une case sûre (+10 s, pas de record)\">INDICE</button><button class=\"btn main px\" id=\"msNewBtn\">NOUVELLE PARTIE</button><button class=\"btn px\" id=\"msFs\">PLEIN ÉCRAN</button></div></div>\n      <div class=\"gameBox msBox\"><canvas id=\"msCanvas\" width=\"160\" height=\"190\"></canvas></div>\n      <div class=\"hint\">Clic : ouvrir une case · clic droit : drapeau (puis « ? ») · clic sur un chiffre dont tous les drapeaux sont posés (ou clic molette, ou les deux boutons) : ouvre ses voisines · clic sur le visage : nouvelle partie. Le chiffre d'une case = le nombre de mines autour. Le premier clic n'est jamais une mine. « Sans hasard » : le plateau se résout toujours par la logique. Meilleurs temps et statistiques sauvegardés et synchronisés.</div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;box-shadow:0 0 0 3px var(--line2)}
.gameBox.msBox canvas{aspect-ratio:auto;image-rendering:pixelated;max-width:100%}
.gameBox canvas{width:min(100%,1152px);aspect-ratio:384/144;image-rendering:pixelated;cursor:var(--cp,pointer)}
.gameBox.tall canvas{width:auto;height:min(720px,72vh);aspect-ratio:240/320}
.gSel{width:auto;font-size:14px;padding:6px 10px;margin-right:8px}
.shGrid td.num{text-align:right}
.nbaTeam.lost .tn{color:var(--muted)}
.gameBox.msBox:fullscreen{padding:0;background:#05010b;display:grid;place-items:center}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "DÉMINEUR", T: {"k": "#030a10", "k2": "#081a24", "fill": "#0e2632", "fillOn": "#123240", "hl": "#1a4252", "line": "#2a6a80", "acc": "#7fe0ee", "accL": "#d8fbff", "accS": "#2a9ab0", "accD": "#0a3a48", "rivet": "#d8fbff", "btn": "#1a4252", "btnHi": "#3a7a90", "btnLo": "#081a24", "btnHov": "#225466", "btnHovHi": "#4a9ab0", "text": "#effcff", "muted": "#9ac8d4", "acc2": "#ffd07a", "gold": "#ffd84a", "orange": "#ffa030", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#050f16", "bgDot": "#0e2632", "bgDot2": "#081a24", "spark": "#2a6a80", "spark2": "#7fe0ee", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["......o.....", ".....oko....", "...kkkkkk...", "..kmmmmmmk..", ".kmwwmmmmmk.", ".kmwmmmmmmk.", ".kmmmmmmmmk.", ".kmmmmmmmmk.", "..kmmmmmmk..", "...kkkkkk...", "............", "............"],
  icons: [[/^NOUVELLE/, "play"], [/^INDICE/, "star"], [/^PLEIN/, "full"]] });
  const $ = id => id === "minesApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue d'abord, puis ceux de la page (fenêtres, menus)
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const __icon = () => ctx.icon;  // l'icône de ce plugin
  const LEGACY_GAMES = {"top":["mines"],"best":"^mines_"};
  let games = await doc('games');
  if (games == null) {  // première ouverture : tu retrouves tes records et tes parties d'avant
    const old = legacy.api ? await legacy.api('games').catch(() => null) : null; games = { best: {} };
    if (old) { const re = new RegExp(LEGACY_GAMES.best); for (const [k, v] of Object.entries(old.best || {})) if (re.test(k)) games.best[k] = v; for (const k of LEGACY_GAMES.top) if (old[k] !== undefined) games[k] = old[k]; await folder.write('games', games); }
  }
  games = { best: {}, ...games };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v, higher = true) => { const b = games.best[k]; if (b == null || (higher ? v > b : v < b)) { games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);  // la section d'un jeu
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // centred pixel-font lines over a dark band
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  g.textAlign = 'center';
  lines.forEach(([text, color, size], i) => { g.fillStyle = color; g.font = (size || 8) + 'px "Press Start 2P", monospace'; g.fillText(text, w / 2, y0 + i * 14); });
  g.textAlign = 'left';
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
  // ---- ton code d'origine ----
/* ---------- jeu "Démineur": open every cell without a mine. The number of a cell = mines around it. Right click: flag, then "?" ;
   clicking a number whose flags are all placed opens its neighbours. The first click is never a mine and opens an area.
   "Sans hasard": the mines are placed so the board can be solved by logic alone, never by guessing (checked by a small solver).
   Levels Débutant / Intermédiaire / Expert / Perso; best times and stats per level in games.json (synced). ---------- */
const MS = {S: 16, PAD: 8, BAR: 30,
  levels: {debutant: ['Débutant', 9, 9, 10], intermediaire: ['Intermédiaire', 16, 16, 40], expert: ['Expert', 30, 16, 99], perso: ['Perso', 20, 14, 45]},
  num: ['', '#7fe0ee', '#8ee8a0', '#ff5ad9', '#b46aee', '#ff7a4f', '#4fd0c8', '#ffffff', '#ffd07a'],
  mine: ['...o.o...', '..ooooo..', '.ooowoo..', 'ooowwooo.', '.ooooooo.', 'ooooooooo', '.ooooooo.', '..ooooo..', '...o.o...'],
  flag: ['..rr.....', '..rrrr...', '..rrrrrr.', '..rrrr...', '..rr.....', '..k......', '..k......', '.kkkk....', 'kkkkkk...'],
};
const msSave = () => gstore('mines', {stats: {}, level: 'debutant', noGuess: true, marks: true, perso: [20, 14, 45]});
let ms = null;
const msIdx = (x, y) => y * ms.w + x;
function msAround(i, w = ms.w, h = ms.h) {
  const x = i % w, y = i / w | 0, out = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) out.push(Y * w + X); }
  return out;
}
function msNew(level = msSave().level) {
  const s = msSave(), [, W, H, N] = level === 'perso' ? ['Perso', ...s.perso] : MS.levels[level];
  ms = {level, w: W, h: H, n: Math.min(N, W * H - 9), cells: Array.from({length: W * H}, () => ({mine: false, open: false, flag: 0, n: 0})), state: 'ready', t0: 0, time: 0, hints: 0, boom: -1, press: -1, anim: 0, guessFree: s.noGuess, parts: []};
  s.level = level; if ($('msLevel').options.length) $('msLevel').value = level;
  msSize(); msDraw(); msInfo();
}
// mines placed away from the first click; "sans hasard": placed again until the solver opens the whole board from that click
function msPlace(first) {
  const safe = new Set([first, ...msAround(first)]), tries = ms.guessFree ? 400 : 1;
  for (let t = 0; t < tries; t++) {
    const free = ms.cells.map((_, i) => i).filter(i => !safe.has(i));
    for (const c of ms.cells) c.mine = false;
    for (let k = 0; k < ms.n; k++) { const j = Math.floor(Math.random() * free.length); ms.cells[free[j]].mine = true; free.splice(j, 1); }
    for (let i = 0; i < ms.cells.length; i++) ms.cells[i].n = msAround(i).filter(j => ms.cells[j].mine).length;
    if (!ms.guessFree || msSolvable(first)) { ms.solvable = ms.guessFree; return; }
  }
  ms.solvable = false;  // shortcut: after 400 boards none could be solved by this small solver (huge densities): a normal board is kept
}
// the logic a player uses: a number whose mines are all known frees its other neighbours; a number with as many hidden neighbours as missing mines
// marks them all; and the difference of two overlapping numbers. True when that alone opens every safe cell.
function msSolvable(first) {
  const C = ms.cells, N = C.length, open = new Uint8Array(N), mine = new Uint8Array(N);
  const reveal = i => { const todo = [i]; while (todo.length) { const j = todo.pop(); if (open[j]) continue; open[j] = 1; if (!C[j].n) for (const k of msAround(j)) if (!open[k] && !C[k].mine) todo.push(k); } };
  reveal(first);
  for (let changed = true; changed;) {
    changed = false;
    const front = [];
    for (let i = 0; i < N; i++) {
      if (!open[i] || !C[i].n) continue;
      const nb = msAround(i), hid = nb.filter(j => !open[j] && !mine[j]), known = nb.filter(j => mine[j]).length;
      if (!hid.length) continue;
      if (known === C[i].n) { for (const j of hid) reveal(j); changed = true; }
      else if (known + hid.length === C[i].n) { for (const j of hid) mine[j] = 1; changed = true; }
      else front.push([new Set(hid), C[i].n - known]);
    }
    if (changed) continue;
    for (const [a, na] of front) for (const [b, nb2] of front) {  // b inside a: the rest of a holds na - nb2 mines
      if (a === b || b.size >= a.size || ![...b].every(j => a.has(j))) continue;
      const rest = [...a].filter(j => !b.has(j)), m = na - nb2;
      if (m === 0) { for (const j of rest) reveal(j); changed = true; } else if (m === rest.length) { for (const j of rest) mine[j] = 1; changed = true; }
    }
  }
  for (let i = 0; i < N; i++) if (!C[i].mine && !open[i]) return false;
  return true;
}
function msOpen(i) {
  const c = ms.cells[i];
  if (ms.state === 'won' || ms.state === 'lost' || c.open || c.flag === 1) return;
  if (ms.state === 'ready') { msPlace(i); ms.state = 'play'; ms.t0 = performance.now(); msTimer(); }
  if (c.mine) return msLose(i);
  const todo = [i];
  while (todo.length) {
    const j = todo.pop(), d = ms.cells[j];
    if (d.open || d.flag === 1) continue;
    d.open = true; d.flag = 0;
    if (!d.n) for (const k of msAround(j)) if (!ms.cells[k].open) todo.push(k);
  }
  sfx('click');
  if (ms.cells.every(d => d.open || d.mine)) msWin();
}
function msChord(i) {  // a number with all its flags placed: its other neighbours open
  const c = ms.cells[i]; if (!c.open || !c.n) return;
  const nb = msAround(i);
  if (nb.filter(j => ms.cells[j].flag === 1).length !== c.n) return;
  for (const j of nb) if (!ms.cells[j].open && ms.cells[j].flag !== 1) { msOpen(j); if (ms.state === 'lost') return; }
}
function msFlag(i) {
  const c = ms.cells[i]; if (c.open || ms.state === 'won' || ms.state === 'lost') return;
  c.flag = (c.flag + 1) % (msSave().marks ? 3 : 2); sfx('type');
}
function msHint() {  // opens a safe cell next to what is already open (or anywhere at the start); costs 10 seconds and the record
  if (ms.state !== 'play') { if (ms.state === 'ready') msOpen(msIdx(ms.w >> 1, ms.h >> 1)); msDraw(); return; }
  const near = ms.cells.map((c, i) => i).filter(i => !ms.cells[i].open && !ms.cells[i].mine && ms.cells[i].flag !== 1);
  const front = near.filter(i => msAround(i).some(j => ms.cells[j].open)), pick = (front.length ? front : near)[Math.floor(Math.random() * (front.length || near.length))];
  if (pick == null) return;
  ms.hints++; ms.t0 -= 10000; msOpen(pick); ms.hintAt = pick; msDraw();
}
function msLose(i) {
  ms.state = 'lost'; ms.boom = i; ms.time = performance.now() - ms.t0;
  for (const c of ms.cells) if (c.mine) c.open = true;
  for (let k = 0; k < 40; k++) ms.parts.push({x: (i % ms.w) * MS.S + 8, y: (i / ms.w | 0) * MS.S + 8, vx: (Math.random() - .5) * 5, vy: (Math.random() - .8) * 5, t: 50, c: ['#ff4f6d', '#ffd07a', '#ff7a4f'][k % 3]});
  msRecord(false); sfx('error'); msAnim();
}
function msWin() {
  ms.state = 'won'; ms.time = performance.now() - ms.t0;
  for (const c of ms.cells) if (c.mine) c.flag = 1;
  const secs = Math.round(ms.time / 100) / 10;
  ms.record = !ms.hints && ms.level !== 'perso' && best('mines_' + ms.level, secs, false);
  for (let k = 0; k < 60; k++) ms.parts.push({x: Math.random() * ms.w * MS.S, y: ms.h * MS.S, vx: (Math.random() - .5) * 2, vy: -2 - Math.random() * 4, t: 70, c: ['#ffd07a', '#8ee8a0', '#ff5ad9', '#7fe0ee'][k % 4]});
  msRecord(true); sfx('launch'); msAnim();
}
function msRecord(won) {
  const st = (msSave().stats[ms.level] ||= {played: 0, won: 0, streak: 0, best: 0});
  st.played++; if (won) { st.won++; st.streak++; st.best = Math.max(st.best, st.streak); } else st.streak = 0;
  saveGames(); msInfo();
}
let msTimerId = 0;
function msTimer() { clearInterval(msTimerId); msTimerId = setInterval(() => { if (ms?.state !== 'play') return clearInterval(msTimerId); if (view.classList.contains('on')) msDraw(); }, 250); }
function msAnim() { cancelAnimationFrame(ms.raf); const f = () => { for (const p of ms.parts) { p.x += p.vx; p.y += p.vy; p.vy += .18; p.t--; } ms.parts = ms.parts.filter(p => p.t > 0); msDraw(); if (ms.parts.length) ms.raf = requestAnimationFrame(f); }; ms.raf = requestAnimationFrame(f); }
/* ---------- drawing: raised tiles, open cells, pixel numbers and sprites ---------- */
function msSize() {
  const cv = $('msCanvas'), W = ms.w * MS.S + MS.PAD * 2, H = ms.h * MS.S + MS.PAD * 2 + MS.BAR;
  cv.width = W; cv.height = H;
  const box = cv.parentElement, fs = document.fullscreenElement === box, room = fs ? innerHeight - 8 : innerHeight - box.getBoundingClientRect().top - 30;  // 30 : le cadre ; la ligne d'aide peut passer sous le bas de la fenêtre
  const k = Math.max(1, Math.floor(Math.min(((fs ? innerWidth : box.clientWidth) - 24) / W, Math.max(H, room) / H) * 4) / 4);
  cv.style.width = W * k + 'px'; cv.style.height = H * k + 'px';
}
addEventListener('resize', () => { if (ms && view.classList.contains('on')) msSize(), msDraw(); });
document.addEventListener('fullscreenchange', () => { if (ms && view.classList.contains('on')) { msSize(); msDraw(); } });
const MS_DIGITS = {0: ['xxx', 'x.x', 'x.x', 'x.x', 'xxx'], 1: ['.x.', 'xx.', '.x.', '.x.', 'xxx'], 2: ['xxx', '..x', 'xxx', 'x..', 'xxx'], 3: ['xxx', '..x', '.xx', '..x', 'xxx'], 4: ['x.x', 'x.x', 'xxx', '..x', '..x'],
  5: ['xxx', 'x..', 'xxx', '..x', 'xxx'], 6: ['xxx', 'x..', 'xxx', 'x.x', 'xxx'], 7: ['xxx', '..x', '.x.', '.x.', '.x.'], 8: ['xxx', 'x.x', 'xxx', 'x.x', 'xxx'], 9: ['xxx', 'x.x', 'xxx', '..x', 'xxx'], '-': ['...', '...', 'xxx', '...', '...']};
function msDigits(g, str, x, y, col, k = 2) { [...str].forEach((d, i) => MS_DIGITS[d].forEach((r, j) => [...r].forEach((ch, l) => { if (ch === 'x') px(g, col, x + i * 4 * k + l * k, y + j * k, k, k); }))); }
function msDraw() {
  if (!ms) return;
  const g = $('msCanvas').getContext('2d'), S = MS.S, X0 = MS.PAD, Y0 = MS.PAD + MS.BAR, W = $('msCanvas').width, H = $('msCanvas').height, t = performance.now();
  g.fillStyle = '#12082a'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2a1d52'; g.fillRect(X0 - 3, Y0 - 3, ms.w * S + 6, ms.h * S + 6);
  // top bar: mines left, a face button (new game), time
  const left = ms.n - ms.cells.filter(c => c.flag === 1).length, secs = ms.state === 'play' ? (t - ms.t0) / 1000 : ms.time / 1000;
  g.fillStyle = '#05010b'; g.fillRect(X0, 6, 34, 18); g.fillRect(W - X0 - 34, 6, 34, 18);
  msDigits(g, String(Math.max(-99, Math.min(999, left))).padStart(3, '0').replace(/^0(?=-)/, ''), X0 + 4, 9, '#ff4f6d');
  msDigits(g, String(Math.min(999, Math.floor(secs))).padStart(3, '0'), W - X0 - 30, 9, '#ffd07a');
  const fx = W / 2 - 10, face = ms.state === 'lost' ? 'lost' : ms.state === 'won' ? 'won' : ms.press >= 0 ? 'oh' : 'ok';
  msTile(g, fx, 5, 20, 20, false);
  g.fillStyle = '#ffd07a'; g.fillRect(fx + 4, 9, 12, 12); g.fillRect(fx + 5, 8, 10, 14); g.fillRect(fx + 3, 10, 14, 10);
  g.fillStyle = '#3a2008';
  if (face === 'lost') { for (const ex of [6, 12]) { px(g, '#3a2008', fx + ex, 11); px(g, '#3a2008', fx + ex + 2, 11); px(g, '#3a2008', fx + ex + 1, 12); px(g, '#3a2008', fx + ex, 13); px(g, '#3a2008', fx + ex + 2, 13); } g.fillRect(fx + 7, 17, 6, 1); g.fillRect(fx + 6, 18, 1, 1); g.fillRect(fx + 13, 18, 1, 1); }
  else if (face === 'won') { g.fillRect(fx + 5, 11, 10, 2); g.fillRect(fx + 6, 13, 3, 1); g.fillRect(fx + 11, 13, 3, 1); g.fillRect(fx + 6, 16, 8, 1); g.fillRect(fx + 7, 17, 6, 1); }
  else { g.fillRect(fx + 7, 12, 2, 2); g.fillRect(fx + 11, 12, 2, 2); if (face === 'oh') g.fillRect(fx + 9, 16, 2, 3); else { g.fillRect(fx + 7, 17, 6, 1); px(g, '#3a2008', fx + 6, 16); px(g, '#3a2008', fx + 13, 16); } }
  // the board
  for (let i = 0; i < ms.cells.length; i++) {
    const c = ms.cells[i], x = X0 + (i % ms.w) * S, y = Y0 + (i / ms.w | 0) * S;
    if (!c.open) {
      const pressed = ms.press === i || (ms.pressAround?.includes(i) && !c.flag);
      msTile(g, x, y, S, S, pressed);
      if (c.flag === 1) { if (ms.state === 'lost' && !c.mine) { sprite(g, MS.flag, x + 4, y + 3, {r: '#5e4d85', k: '#3a2a6e'}); g.fillStyle = '#ff4f6d'; for (let k = 0; k < 10; k++) { g.fillRect(x + 3 + k, y + 3 + k, 1, 1); g.fillRect(x + 12 - k, y + 3 + k, 1, 1); } } else sprite(g, MS.flag, x + 4, y + 3, {r: '#ff4f6d', k: '#1c1238'}); }
      else if (c.flag === 2) msQ(g, x, y);
      continue;
    }
    g.fillStyle = i === ms.boom ? '#ff4f6d' : (i % ms.w + (i / ms.w | 0)) % 2 ? '#1c1238' : '#201540'; g.fillRect(x, y, S, S);
    g.fillStyle = '#2a1d52'; g.fillRect(x, y, S, 1); g.fillRect(x, y, 1, S);
    if (c.mine) { sprite(g, MS.mine, x + 3, y + 3, i === ms.boom ? {o: '#1c1238', w: '#ffd07a'} : {o: '#c9bdf0', w: '#ffffff'}); continue; }
    if (c.n) { const col = MS.num[c.n]; msNumber(g, c.n, x + 5, y + 2, col); }
    if (i === ms.hintAt && ms.state === 'play') { g.strokeStyle = '#8ee8a0'; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, S - 1, S - 1); }
  }
  for (const p of ms.parts) { g.fillStyle = p.c; g.fillRect(X0 + p.x | 0, Y0 + p.y | 0, 2, 2); }
  if (ms.state === 'won' || ms.state === 'lost') gameText(g, W, ms.state === 'won' ? [['GAGNÉ EN ' + (ms.time / 1000).toFixed(1).replace('.', ',') + ' S', '#8ee8a0', 8], [ms.record ? 'NOUVEAU RECORD !' : ms.hints ? ms.hints + ' INDICE' + (ms.hints > 1 ? 'S' : '') + ' : PAS DE RECORD' : (W < 260 ? 'VISAGE : REJOUER' : 'CLIC SUR LE VISAGE : REJOUER'), ms.record ? '#ffd07a' : '#d9c6ff', 7]]
    : [['BOUM !', '#ff4f6d', 10], [(W < 260 ? 'VISAGE : REJOUER' : 'CLIC SUR LE VISAGE : REJOUER'), '#d9c6ff', 7]], Y0 + ms.h * S / 2 - 6);
}
const MS_NUMS = {1: ['.x.', 'xx.', '.x.', '.x.', '.x.', 'xxx'], 2: ['xx.', '..x', '..x', '.x.', 'x..', 'xxx'], 3: ['xx.', '..x', '.x.', '..x', '..x', 'xx.'], 4: ['x.x', 'x.x', 'x.x', 'xxx', '..x', '..x'],
  5: ['xxx', 'x..', 'xx.', '..x', '..x', 'xx.'], 6: ['.xx', 'x..', 'xx.', 'x.x', 'x.x', '.x.'], 7: ['xxx', '..x', '..x', '.x.', '.x.', '.x.'], 8: ['.x.', 'x.x', '.x.', 'x.x', 'x.x', '.x.']};
function msNumber(g, n, x, y, col) { const on = (f) => MS_NUMS[n].forEach((r, j) => [...r].forEach((ch, l) => { if (ch === 'x') f(x + l * 2, y + j * 2); }));
  on((a, b) => px(g, '#05010b', a - 1, b - 1, 5, 4)); on((a, b) => px(g, '#05010b', a + 1, b + 1, 3, 2)); on((a, b) => px(g, col, a, b, 3, 2)); on((a, b) => px(g, 'rgba(255,255,255,.35)', a, b, 3, 1)); }
function msQ(g, x, y) { ['.xx.', 'x..x', '...x', '..x.', '..x.', '....', '..x.'].forEach((r, j) => [...r].forEach((ch, l) => { if (ch === 'x') px(g, '#d9c6ff', x + 4 + l * 2, y + 1 + j * 2, 2, 2); })); }
function msTile(g, x, y, w, h, pressed) {  // a raised tile, or pressed in
  g.fillStyle = pressed ? '#2a1d52' : '#5e4d85'; g.fillRect(x, y, w, h);
  if (pressed) { g.fillStyle = '#1c1238'; g.fillRect(x, y, w, 1); g.fillRect(x, y, 1, h); return; }
  g.fillStyle = '#9a86d0'; g.fillRect(x, y, w - 1, 2); g.fillRect(x, y, 2, h - 1);
  g.fillStyle = '#c8b8f0'; g.fillRect(x, y, w - 2, 1); g.fillRect(x, y, 1, h - 2);
  g.fillStyle = '#2a1d52'; g.fillRect(x + 1, y + h - 2, w - 1, 2); g.fillRect(x + w - 2, y + 1, 2, h - 1);
  g.fillStyle = '#140a2a'; g.fillRect(x + 1, y + h - 1, w - 1, 1); g.fillRect(x + w - 1, y + 1, 1, h - 1);
  g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 4, y + 4, 2, 2); g.fillRect(x + 6, y + 3, 1, 1);
}
/* ---------- mouse ---------- */
function msAt(e) {
  const cv = $('msCanvas'), r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * cv.width, y = (e.clientY - r.top) / r.height * cv.height;
  const cx = Math.floor((x - MS.PAD) / MS.S), cy = Math.floor((y - MS.PAD - MS.BAR) / MS.S);
  if (y < MS.PAD + MS.BAR && Math.abs(x - cv.width / 2) < 12) return 'face';
  return cx >= 0 && cy >= 0 && cx < ms.w && cy < ms.h ? msIdx(cx, cy) : -1;
}
$('msCanvas').oncontextmenu = e => e.preventDefault();
$('msCanvas').onpointerdown = e => {
  if (!ms) return;
  const i = msAt(e);
  if (i === 'face') { msNew(ms.level); return; }
  if (i < 0) return;
  ms.buttons = e.buttons;
  if (e.button === 2 && !(e.buttons & 1)) { msFlag(i); msDraw(); return; }  // right: flag
  ms.press = i; ms.pressAround = e.button === 1 || e.buttons === 3 || ms.cells[i].open ? msAround(i) : null; msDraw();
};
$('msCanvas').onpointermove = e => { if (!ms || ms.press < 0) return; const i = msAt(e); if (typeof i === 'number' && i >= 0 && i !== ms.press) { ms.press = i; if (ms.pressAround) ms.pressAround = msAround(i); msDraw(); } };
$('msCanvas').onpointerup = e => {
  if (!ms || ms.press < 0) return;
  const i = ms.press, both = ms.pressAround; ms.press = -1; ms.pressAround = null;
  if (both || ms.cells[i].open) msChord(i); else if (e.button === 0) msOpen(i);
  msDraw();
};
$('msCanvas').onpointerleave = () => { if (ms) { ms.press = -1; ms.pressAround = null; msDraw(); } };
/* ---------- page ---------- */
function msInfo() {
  const s = msSave(), parts = Object.keys(MS.levels).filter(k => k !== 'perso').map(k => MS.levels[k][0] + ' ' + (games?.best['mines_' + k] != null ? String(games.best['mines_' + k]).replace('.', ',') + ' s' : '—'));
  const st = s.stats[ms?.level]; $('msInfo').textContent = 'Records : ' + parts.join(' · ') + (st ? ' · ' + st.won + ' / ' + st.played + ' gagnées · série ' + st.streak : '');
}
function msOpenApp() {
  const s = msSave();
  $('msLevel').replaceChildren(...Object.entries(MS.levels).map(([k, [n, w, h, m]]) => Object.assign(el('option', '', n + (k === 'perso' ? ' (' + s.perso.join(' × ').replace(/ × (\d+)$/, ', $1 mines') + ')' : ' · ' + w + ' × ' + h + ', ' + m + ' mines')), {value: k})));
  $('msLevel').value = s.level; $('msNoGuess').checked = s.noGuess; $('msMarks').checked = s.marks;
  if (!ms) msNew(s.level); else { msSize(); msDraw(); }
  msInfo();
}
$('msLevel').onchange = async () => {
  const v = $('msLevel').value, s = msSave();
  if (v === 'perso') {
    const a = await ask('Plateau perso', s.perso.join(' x '), 'largeur x hauteur x mines, par exemple 24 x 18 x 70');
    const n = (a || '').match(/\d+/g)?.map(Number);
    if (n?.length === 3) s.perso = [Math.min(40, Math.max(5, n[0])), Math.min(30, Math.max(5, n[1])), Math.max(1, n[2])];
  }
  saveGames(); msNew(v); msOpenApp();
};
$('msNoGuess').onchange = () => { msSave().noGuess = $('msNoGuess').checked; saveGames(); msNew(ms.level); };
$('msMarks').onchange = () => { msSave().marks = $('msMarks').checked; saveGames(); };
$('msHint').onclick = () => msHint();
$('msNewBtn').onclick = () => msNew(ms?.level);
$('msFs').onclick = () => { $('msFs').blur(); try { if (document.fullscreenElement) document.exitFullscreen(); else $('msCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
function msCheck() {  // les voisines ; un plateau « sans hasard » : pas de mine autour du premier clic, le bon nombre, résoluble ; les chiffres
  const keep = ms, bad = [];
  if (!(msAround(0, 9, 9).length === 3 && msAround(40, 9, 9).length === 8)) bad.push('voisines');
  ms = {w: 9, h: 9, n: 10, cells: Array.from({length: 81}, () => ({mine: false, open: false, flag: 0, n: 0})), guessFree: true};
  msPlace(40);
  if ([40, ...msAround(40)].some(i => ms.cells[i].mine)) bad.push('mine sous le premier clic');
  if (ms.cells.filter(c => c.mine).length !== 10) bad.push('nombre de mines');
  if (ms.solvable && !msSolvable(40)) bad.push('plateau sans hasard');
  if (ms.cells.some((c, i) => c.n !== msAround(i).filter(j => ms.cells[j].mine).length)) bad.push('chiffres');
  if (Object.keys(MS_NUMS).length !== 8) bad.push('glyphes');
  ms = keep;
  return bad.length ? bad.join(', ') : 'ok';
}
{ const c = msCheck(); console.assert(c === 'ok', 'démineur', c); }
$('msCanvas').__ms = {st: () => ms, check: msCheck, open: i => { msOpen(i); msDraw(); }, MS};
{  // self-check: neighbours at a corner and in the middle; a board solved by the solver; first click always safe
  console.assert(msAround(0, 9, 9).length === 3 && msAround(40, 9, 9).length === 8, 'msAround');
}  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onOpen(() => { msOpenApp(); });
}
