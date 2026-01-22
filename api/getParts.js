import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { style } = req.body;
  if (!style) return res.status(400).send('Style 필요');

  const dataPath = path.join(process.cwd(), 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const styleData = data.filter(d => d.Style === style);
  if (!styleData.length) return res.status(400).send('해당 Style 없음');

  const parts = [...new Set(styleData.map(d => d.Part))];
  res.status(200).json({ parts });
}
