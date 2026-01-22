const fs = require('fs');
const path = require('path');
const readline = require('readline');

// data.json 로드
const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

// Part 이름 치환 규칙 (필요시 추가)
const partRenameMap = {
  '총장(뒤)': '총길이',
  // 필요한 치환 추가 가능
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nStyle(아티클 번호)를 입력하세요: ', (selectedStyle) => {
  const styleData = data.filter(d => d.Style === selectedStyle);

  if (styleData.length === 0) {
    console.log('❌ 해당 Style 없음');
    rl.close();
    return;
  }

  const parts = [...new Set(styleData.map(d => d.Part))];

  console.log('\nPart 목록 (중복 선택 가능)');
  parts.forEach((p, i) => console.log(`${i + 1}. ${p}`));
  console.log('예: 1,2,4 (비워두면 전체 선택)');

  rl.question('\nPart 번호를 선택하세요: ', (input) => {
    let selectedParts = [];
    if (input.trim() === '') {
      // 전체 선택
      selectedParts = parts;
    } else {
      selectedParts = input
        .split(',')
        .map(v => parts[parseInt(v.trim(), 10) - 1])
        .filter(Boolean);
    }

    if (selectedParts.length === 0) {
      console.log('❌ Part 선택 오류');
      rl.close();
      return;
    }

    // Part 이름 치환
    selectedParts = selectedParts.map(p => partRenameMap[p] || p);

    const sizes = [...new Set(
      styleData.map(d => d['Style Size'])
    )].sort((a, b) => a - b);

    // HTML 생성
    let html = `<style>
table.GeneratedTable {
  width: 100%;
  background-color: #ffffff;
  border-collapse: collapse;
  border-width: 0px;
  border-color: #ffffff;
  border-style: solid;
  color: #000000;
}
table.GeneratedTable td,
table.GeneratedTable th {
  border-width: 0px;
  border-color: #ffffff;
  border-style: solid;
  padding: 3px;
  text-align: center;
}
table.GeneratedTable thead {
  background-color: #f5f5f5;
  font-weight: bold;
}
table.GeneratedTable td.co1 {
  font-weight: bold;
}
table.GeneratedTable td.f5 {
  background-color: #f5f5f5;
}
</style>

<table class='GeneratedTable'>
  <thead>
    <tr>
      <th>사이즈</th>
      ${selectedParts.map(p => `<th>${p}</th>`).join('\n      ')}
    </tr>
  </thead>
  <tbody>
`;

    sizes.forEach((size, index) => {
      const isGray = index % 2 === 1;
      html += `    <tr>
      <td class='${isGray ? 'f5 ' : ''}co1'>${size}</td>
`;
      selectedParts.forEach(part => {
        const item = styleData.find(
          d => (partRenameMap[d.Part] || d.Part) === part && d['Style Size'] == size
        );
        html += `      <td${isGray ? " class='f5'" : ''}>${item ? item['Spec size'] : ''}</td>
`;
      });
      html += `    </tr>
`;
    });

    html += `  </tbody>
</table>
`;

    // output 폴더 확인/생성
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const outputFile = path.join(outputDir, `${selectedStyle}.html`);
    fs.writeFileSync(outputFile, html);

    console.log(`\n✅ ${outputFile} 생성 완료`);
    rl.close();
  });
});