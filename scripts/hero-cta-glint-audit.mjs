import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const page = fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
const css = fs.readFileSync(path.join(root,'app/globals.css'),'utf8');

const checks = [
  ['VIEW WORK glint class', page.includes('valie-hero-glint--work')],
  ['CONTACT glint class', page.includes('valie-hero-glint--contact')],
  ['two stroke layers', (page.match(/valie-glint-stroke/g) || []).length === 2],
  ['two gloss layers', (page.match(/valie-glint-gloss/g) || []).length === 2],
  ['masked perimeter stroke', css.includes('-webkit-mask-composite:xor') && css.includes('mask-composite:exclude')],
  ['animated conic perimeter', css.includes('@keyframes valieHeroGlintSpin') && css.includes('conic-gradient(')],
  ['VIEW WORK white-black palette', css.includes('.valie-hero-glint--work{') && css.includes('background:#f2f2ee!important') && css.includes('color:#070707!important') && css.includes('border:2.6px solid #070707!important')],
  ['CONTACT black-white palette', css.includes('.valie-hero-glint--contact{') && css.includes('background:#050505!important') && css.includes('color:#f5f5f0!important') && css.includes('border:2.2px solid rgba(255,255,255,.88)!important')],
  ['mobile pair hardening', css.includes('@media(max-width:760px)') && css.includes('.valie-hero-cta-pair')],
  ['reduced-motion fallback', css.includes('@media(prefers-reduced-motion:reduce)') && css.includes('.valie-glint-stroke{animation:none!important')],
];

let failures = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}`);
  if (!ok) failures++;
}
console.log(`\nHero CTA glint audit: ${checks.length - failures}/${checks.length}`);
if (failures) process.exit(1);
