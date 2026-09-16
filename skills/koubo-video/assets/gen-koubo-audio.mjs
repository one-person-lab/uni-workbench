// 口播配音生成器（通用版）
// 逐句 TTS → 量真实时长 → 拼接成一条配音 + 生成字幕时间轴
//
// 用法：node gen-koubo-audio.mjs [lines.json] [--out-audio <dir>] [--out-src <dir>]
//   lines.json 默认 ./koubo-lines.json
//   默认输出 public/koubo/narration.wav + src/koubo/koubo-timing.json（相对 cwd）
//
// 依赖：macOS `say`、`ffmpeg`、`ffprobe`
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {dirname, join, resolve, basename} from 'node:path';

/* ---------- 参数 ---------- */
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const linesArg = argv.find((a) => !a.startsWith('--') && a.endsWith('.json')) || 'koubo-lines.json';
const OUT_AUDIO = resolve(flag('--out-audio', 'public/koubo'));
const OUT_SRC = resolve(flag('--out-src', 'src/koubo'));
const TMP = resolve('.koubo-tmp');
for (const d of [OUT_AUDIO, OUT_SRC, TMP]) mkdirSync(d, {recursive: true});

if (!existsSync(linesArg)) throw new Error(`缺少文案文件：${linesArg}`);
const {voice = 'Tingting', rate = 180, gap = 0.34, lead = 0.55, tail = 0.9, lines} =
  JSON.parse(readFileSync(linesArg, 'utf8'));
if (!Array.isArray(lines) || !lines.length) throw new Error('lines 必须是非空数组');
const FPS = 30;

/* ---------- 1. 逐句合成 ---------- */
const dur = (f) =>
  +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f])
    .toString()
    .trim();

const clips = [];
lines.forEach((text, i) => {
  const f = join(TMP, `l${String(i).padStart(3, '0')}.wav`);
  execFileSync('say', ['-v', voice, '-r', String(rate), '-o', f, '--data-format=LEI16@44100', text]);
  const d = dur(f);
  clips.push({i, text, file: f, dur: d});
  console.log(`${String(i + 1).padStart(2)}. ${d.toFixed(2)}s  ${text}`);
});

const speech = clips.reduce((a, c) => a + c.dur, 0);
console.log(`\n纯语音 ${speech.toFixed(2)}s · ${clips.length} 句 · 平均 ${(speech / clips.length).toFixed(2)}s/句`);

/* ---------- 2. 排时间轴 ---------- */
let t = lead;
const timing = clips.map((c, i) => {
  const start = t;
  t += c.dur + (i === clips.length - 1 ? tail : gap);
  return {i, text: c.text, start: +start.toFixed(3), dur: +c.dur.toFixed(3)};
});
const total = t;
const totalFrames = Math.ceil(total * FPS);

/* ---------- 3. 拼接音频 ---------- */
const inputs = [];
const filters = [];
clips.forEach((c, i) => {
  inputs.push('-i', c.file);
  const at = Math.round(timing[i].start * 1000);
  filters.push(`[${i}:a]adelay=${at}|${at}[a${i}]`);
});
filters.push(
  `${clips.map((_, i) => `[a${i}]`).join('')}amix=inputs=${clips.length}:normalize=0:dropout_transition=0[mix]`,
);
filters.push(`[mix]apad=whole_dur=${total.toFixed(3)},volume=2.4,alimiter=limit=0.92[out]`);
const narration = join(OUT_AUDIO, 'narration.wav');
mkdirSync(dirname(narration), {recursive: true});
execFileSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  ...inputs,
  '-filter_complex', filters.join(';'),
  '-map', '[out]', '-ar', '44100', '-ac', '2',
  narration,
]);
console.log(`\n${basename(narration)}  ${dur(narration).toFixed(2)}s`);

/* ---------- 4. 写字幕时间轴 ---------- */
const json = {
  fps: FPS,
  totalFrames,
  totalSeconds: +total.toFixed(3),
  voice,
  rate,
  lines: timing.map((l) => ({
    text: l.text,
    from: Math.round(l.start * FPS),
    dur: Math.max(1, Math.round(l.dur * FPS)),
  })),
};
const timingPath = join(OUT_SRC, 'koubo-timing.json');
mkdirSync(dirname(timingPath), {recursive: true});
writeFileSync(timingPath, JSON.stringify(json, null, 2) + '\n');
console.log(`${totalFrames} 帧 = ${total.toFixed(2)}s → ${timingPath}`);

rmSync(TMP, {recursive: true, force: true});
