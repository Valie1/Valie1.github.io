import fs from 'node:fs';
import path from 'node:path';

const component = fs.readFileSync('components/RenKotoneSecret.tsx', 'utf8');
const layout = fs.readFileSync('app/layout.tsx', 'utf8');
const footer = fs.readFileSync('components/OnePageFooter.tsx', 'utf8');
const css = fs.readFileSync('app/globals.css', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const assetRoot = 'public/easter-egg';
const allFiles = [];
const walk = (dir) => { for (const name of fs.readdirSync(dir)) { const p = path.join(dir,name); if (fs.statSync(p).isDirectory()) walk(p); else allFiles.push(p.replaceAll('\\','/')); } };
walk(assetRoot);
const renVoice = allFiles.filter(p => p.includes('/voice/ren/') && p.endsWith('.mp3'));
const kotoneVoice = allFiles.filter(p => p.includes('/voice/kotone/') && p.endsWith('.mp3'));
const renSprites = allFiles.filter(p => p.includes('/sprites/ren/') && /\.(png|webp)$/.test(p));
const kotoneSprites = allFiles.filter(p => p.includes('/sprites/kotone/') && /\.(png|webp)$/.test(p));

const checks = [
  ['component mounted once', (layout.match(/<RenKotoneSecret \/>/g) || []).length === 1],
  ['sequence EILAV', component.includes('const SECRET = ["E", "I", "L", "A", "V"]')],
  ['copyright confirmation', footer.includes('data-valie-secret-confirm')],
  ['five footer hit targets', (footer.match(/data-valie-secret-letter=/g) || []).length === 5],
  ['122.50 preserves 122.49 Easter namespace', css.includes('.rk49-secret') && !css.includes('.rk48-secret')],
  ['opening phase', component.includes('phase === "opening"') && css.includes('rk49OpenL')],
  ['closing phase', component.includes('phase === "closing"') && css.includes('rk49CloseL')],
  ['opening title unmounts after intro', component.includes('phase === "opening" ? (') && component.includes('rk49-intro')],
  ['outro mounts only on close', component.includes('phase === "closing" ? (') && component.includes('rk49-outro')],
  ['per-sprite framing metadata', component.includes('mobileScale?: number') && component.includes('poseStyle(pose: Pose)')],
  ['pose crossfade state', component.includes('previousPose') && css.includes('rk49PoseIn') && css.includes('rk49PoseOut')],
  ['direct look dots', component.includes('rk49-look__film') && component.includes('choosePose')],
  ['selected guest focus', css.includes('.rk49-actor.is-selected') && css.includes('.rk49-actor.is-muted')],
  ['pointer parallax', component.includes('moveParallax') && css.includes('var(--mx)') && css.includes('var(--my)')],
  ['distinct action motion', css.includes('rk49ActionPunch') && css.includes('rk49FinishPunch') && css.includes('rk49VictoryPose') && css.includes('rk49OuttakePose')],
  ['FX layer remounts every take', component.includes('key={fxToken} className="rk49-fx"')],
  ['foreground and background FX', component.includes('rk49-fx__backwash') && component.includes('rk49-fx__front')],
  ['Kotone attack voice only in action pool', component.includes('action: ["/easter-egg/voice/kotone/ATTACK1FEMC.mp3"]')],
  ['Kotone visible blue shot effect', css.includes('[data-selected="kotone"][data-action="action"] .rk49-fx__shot')],
  ['Ren separate action effect', css.includes('[data-selected="ren"][data-action="action"] .rk49-fx__cards')],
  ['action-specific synth cues', component.includes('uiTone(action)') && component.includes('finisher: [230, 460, 920]')],
  ['voice overlap prevented', component.includes('stopVoice();') && component.includes('audioRef.current = audio')],
  ['all 17 Ren voice files present', renVoice.length === 17],
  ['all 7 Kotone voice files present', kotoneVoice.length === 7],
  ['eight Ren sprites present', renSprites.length === 8],
  ['eight Kotone sprites present', kotoneSprites.length === 8],
  ['Joker old action-right removed', !allFiles.some(p => p.endsWith('/sprites/ren/action-right.png'))],
  ['Kotone old action-left removed', !allFiles.some(p => p.endsWith('/sprites/kotone/action-left.png'))],
  ['all four new Ren sprites wired', ['new-spotlight','new-poster','new-slide','new-arsene'].every(x => component.includes(x))],
  ['all four new Kotone sprites wired', ['new-portrait','new-naginata','new-chibi','new-visor'].every(x => component.includes(x))],
  ['all voice categories wired', ['ATTACK4REN','FINISHER2REN','VICTORY4REN','DEFEAT7REN','VICTORY3FEMC','DEFEAT2FEMC'].every(x => component.includes(x))],
  ['Escape close', component.includes('event.key === "Escape"')],
  ['focus trap', component.includes('trapTabKey') && component.includes('isolateDialog')],
  ['localhost preview', component.includes('afterHoursPreview')],
  ['localhost build badge removed and stable dev command retained', !component.includes('rk49-build-stamp') && !component.includes('PASS 122.') && pkg.scripts?.['dev:portfolio'] === 'next dev -p 3000'],
  ['no Full Moon game', !component.includes('Full Moon') && !component.includes('RHYTHM CORE') && !component.includes('Chart Studio')],
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failed++; }
if (failed) process.exit(1);
console.log(`
AFTER HOURS Easter egg audit passed: ${checks.length}/${checks.length}`);
