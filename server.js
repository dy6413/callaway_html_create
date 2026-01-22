const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // public 폴더를 정적 파일 제공용으로

const dataPath = path.join(__dirname, 'data.json');
const outputPath = path.join(__dirname, 'output');

if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

app.post('/generate', (req, res) => {
  const { style, parts } = req.body;
  if (!style || !parts || !parts.length) return res.send('❌ Style 또는 Parts 입력 필요');

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const styleData = data.filter(d => d.Style === style);

  if (!styleData.length) return res.send('❌ 해당 Style 없음');

  const selectedParts = parts.filter(p => styleData.some(d => d.Part === p));
  if (!selectedParts.length) return res.send('❌ 해당 Part 없음');

  const sizes = [...new Set(styleData.map(d => d['Style Size']))].sort((a,b)=>a-b);

  let html = `<table class='GeneratedTable' border="1" cellpadding="5"><thead><tr><th>사이즈</th>`;
  selectedParts.forEach(p => html += `<th>${p}</th>`);
  html += `</tr></thead><tbody>`;

  sizes.forEach((size, index) => {
    const isGray = index % 2 === 1;
    html += `<tr style="background:${isGray?'#eee':'#fff'}"><td>${size}</td>`;
    selectedParts.forEach(part => {
      const item = styleData.find(d => d.Part === part && d['Style Size'] == size);
      html += `<td>${item ? item['Spec size'] : ''}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;

  const outFile = path.join(outputPath, `${style}_full.html`);
  fs.writeFileSync(outFile, html);

  res.send(html); // 브라우저에 결과 바로 출력
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
