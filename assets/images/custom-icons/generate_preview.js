const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const sets = ['real-estate', 'expert', 'inheritance'];

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Icons Preview</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #fff; padding: 30px; }
    h2 { border-bottom: 2px solid #334155; padding-bottom: 10px; margin-top: 40px; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; margin-top: 15px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; }
    .card:hover { transform: translateY(-3px); border-color: #38bdf8; }
    .img-box { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: #ffffff; border-radius: 8px; padding: 8px; margin-bottom: 10px; }
    .img-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .name { font-size: 13px; color: #94a3b8; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Maison Benali - Icon Library Preview</h1>
`;

for (const s of sets) {
  html += `<h2>${s} (${s === 'real-estate' ? 'Real Estate' : s === 'expert' ? 'Expertise & Conseil' : 'Inheritance / Succession / Patrimoine'})</h2>\n<div class="grid">\n`;
  const blackDir = path.join(baseDir, s, 'Black');
  if (fs.existsSync(blackDir)) {
    const files = fs.readdirSync(blackDir)
      .filter(f => f.endsWith('.png'))
      .sort((a, b) => parseInt(a) - parseInt(b));
    for (const f of files) {
      html += `  <div class="card">
    <div class="img-box">
      <img src="${s}/Black/${f}" alt="${f}" />
    </div>
    <div class="name">${f}</div>
  </div>\n`;
    }
  }
  html += `</div>\n`;
}

html += `</body></html>`;
fs.writeFileSync(path.join(baseDir, 'preview.html'), html);
console.log('Preview successfully generated at ' + path.join(baseDir, 'preview.html'));
