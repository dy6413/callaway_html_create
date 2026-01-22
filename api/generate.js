import fs from 'fs';
import path from 'path';

const partRenameMap = {
  '총장(뒤)': '총길이',
  // 필요한 치환 추가 가능
};

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { style, parts } = req.body;
  if (!style || !parts || !parts.length) return res.status(400).send('Style 또는 Part 필요');

  const dataPath = path.join(process.cwd(), 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const styleData = data.filter(d => d.Style === style);
  if (!styleData.length) return res.status(400).send('해당 Style 없음');

  const selectedParts = parts.map(p => partRenameMap[p] || p);
  const sizes = [...new Set(styleData.map(d => d['Style Size']))].sort((a,b)=>a-b);

  let html = `<table border="1"><thead><tr><th>사이즈</th>${selectedParts.map(p => `<th>${p}</th>`).join('')}</tr></thead><tbody>`;
  sizes.forEach((size, idx) => {
    const isGray = idx % 2 === 1;
    html += `<tr style="background:${isGray?'#eee':'#fff'}"><td>${size}</td>`;
    selectedParts.forEach(part => {
      const item = styleData.find(d => (partRenameMap[d.Part] || d.Part) === part && d['Style Size']==size);
      html += `<td>${item ? item['Spec size'] : ''}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table>`;

  res.status(200).send(html);
}
