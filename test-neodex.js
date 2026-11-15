// lancé par le test « local » de NeoDex : la vérification interne, une partie au clic (ouvrir, drapeau), une partie gagnée et une perdue,
// le plein écran, et la grille qui tient dans la fenêtre en Débutant comme en Expert (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('msCanvas').__ms, ms = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('msCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'demineur-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  // un appui puis un relâché sur une case, bouton 0 (gauche) ou 2 (droit)
  const press = (i, button = 0) => pj(`(() => { const T = document.getElementById('msCanvas').__ms, ms = T.st(), c = document.getElementById('msCanvas'), r = c.getBoundingClientRect(), S = T.MS.S;
    const x = r.left + (T.MS.PAD + (${i} % ms.w) * S + S / 2) / c.width * r.width, y = r.top + (T.MS.PAD + T.MS.BAR + Math.floor(${i} / ms.w) * S + S / 2) / c.height * r.height;
    c.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: x, clientY: y, button: ${button}, buttons: ${button === 2 ? 2 : 1}}));
    c.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, clientX: x, clientY: y, button: ${button}, buttons: 0})); return 0; })()`);
  const level = v => pj(`(() => { const s = document.getElementById('msLevel'); s.value = '${v}'; s.dispatchEvent(new Event('change')); return 0; })()`);
  const fit = () => pj(`(() => { const r = document.getElementById('msCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('msCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), right: Math.round(r.right), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  const keep = await C('return ms.level;');
  await level('debutant'); await sleep(200);
  // le premier clic ouvre une zone, le clic droit pose un drapeau
  await press(40); await sleep(150);
  const o = await C('return ms.state + "|" + ms.cells.filter(c => c.open).length;'); if (!/^play\|([9]|[1-9]\d+)$/.test(o)) throw new Error('le premier clic devait ouvrir une zone : ' + o);
  const shut = await C('return ms.cells.findIndex(c => !c.open);'); await press(shut, 2); await sleep(100);
  if (await C(`return ms.cells[${shut}].flag;`) !== 1) throw new Error('le clic droit devait poser un drapeau');
  await press(shut, 2); await press(shut, 2); await sleep(100); await shot('0-partie');
  // gagner : ouvrir toutes les cases sans mine
  await C('ms.cells.forEach((c, i) => { if (!c.mine && !c.open) T.open(i); }); return 0;'); await sleep(400);
  if (await C('return ms.state;') !== 'won') throw new Error('la partie devait être gagnée'); await shot('1-gagne');
  // perdre : une mine
  await pj(`document.getElementById('msNewBtn').click(), 0`); await press(40); await sleep(100);
  await C('T.open(ms.cells.findIndex(c => c.mine)); return 0;'); await sleep(300);
  if (await C('return ms.state;') !== 'lost') throw new Error('la partie devait être perdue'); await shot('2-perdu');
  // plein écran
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(200);
  const h0 = (await fit()).h;
  await pj(`document.getElementById('msFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('msCanvas'), r = c.getBoundingClientRect(); return JSON.stringify({on: document.fullscreenElement === c.parentElement, h: Math.round(r.height), b: Math.round(r.bottom), ih: innerHeight}); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(400);
  const F = JSON.parse(fs); if (!F.on || F.h <= h0 || F.b > F.ih) throw new Error('plein écran : ' + fs + ' (avant ' + h0 + ')');
  // la place prise : Débutant puis Expert
  const L1 = await fit();
  await level('expert'); await sleep(250); await press(240); await sleep(150); await shot('3-expert');
  const L2 = await fit();
  await level(keep); await sleep(150);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L1), JSON.stringify(L2));
  for (const L of [L1, L2]) if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.right > L.ww) throw new Error('la grille dépasse la fenêtre : ' + JSON.stringify(L));
  if (L1.h < L1.wh * .5) throw new Error('la grille Débutant reste petite : ' + JSON.stringify(L1));
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  return 'vérification ok · ouvrir · drapeau · gagné · perdu · plein écran ' + F.h + ' px · Débutant ' + L1.h + ' px, Expert ' + L2.h + ' px dans ' + L1.ww + '×' + L1.wh;
};
