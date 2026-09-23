import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = path.join(root, 'index.html');
const outputPath = path.join(root, 'barcode-label-tool-offline.html');

const readFirst = (candidates) => {
  for (const candidate of candidates) {
    const p = path.join(root, candidate);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  throw new Error('Dependency file not found. Tried: ' + candidates.join(', '));
};

const inlineSafe = (code) =>
  code
    .replace(/\/\/# sourceMappingURL=.*$/gm, '')
    .replace(/<\/script/gi, '<\\/script');

const qrcode = inlineSafe(readFirst([
  'node_modules/qrcode-generator/qrcode.js',
  'node_modules/qrcode-generator/dist/qrcode.js'
]));

const html2canvas = inlineSafe(readFirst([
  'node_modules/html2canvas/dist/html2canvas.min.js',
  'node_modules/html2canvas/dist/html2canvas.js'
]));

let html = fs.readFileSync(inputPath, 'utf8');

// Remove the two CDN tags regardless of minor formatting changes, then inject
// the pinned library source immediately before the app's own script.
html = html
  .replace(/\s*<script[^>]+src=["'][^"']*qrcode-generator@1\.4\.4[^"']*["'][^>]*><\/script>/gi, '')
  .replace(/\s*<script[^>]+src=["'][^"']*html2canvas@1\.4\.1[^"']*["'][^>]*><\/script>/gi, '');

const appScriptMarker = '<script>\n    const CODE128_PATTERNS';
if (!html.includes(appScriptMarker)) {
  throw new Error('App script marker not found.');
}

const embeddedDependencies =
  '<script>\n/* qrcode-generator 1.4.4 — embedded for offline use */\n' + qrcode + '\n</script>\n' +
  '<script>\n/* html2canvas 1.4.1 — embedded for offline use */\n' + html2canvas + '\n</script>\n  ';

html = html.replace(appScriptMarker, () => embeddedDependencies + appScriptMarker);

html = html.replace(
  '<title>物料标签与条码打印工具</title>',
  '<title>物料标签与条码打印工具（离线版）</title>\n  <!-- Offline build: all runtime JS dependencies are embedded in this file. -->'
);

// Guard against accidentally shipping runtime network dependencies.
const externalRuntimeTags = [
  ...html.matchAll(/<(?:script|img|iframe)[^>]+(?:src)=["']https?:\/\/[^"']+["'][^>]*>/gi),
  ...html.matchAll(/<link[^>]+href=["']https?:\/\/[^"']+["'][^>]*>/gi)
];
if (externalRuntimeTags.length) {
  throw new Error('External runtime dependency remains: ' + externalRuntimeTags[0][0]);
}

fs.writeFileSync(outputPath, html, 'utf8');
console.log('Built:', outputPath);
console.log('Size:', Buffer.byteLength(html), 'bytes');
