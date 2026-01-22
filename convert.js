const XLSX = require('xlsx');
const fs = require('fs');

// 엑셀 파일 경로 설정
const filePath = 'data.xlsx';  // 엑셀 파일 경로를 입력하세요

// 엑셀 파일 읽기
const workbook = XLSX.readFile(filePath);

// 첫 번째 시트 가져오기
const sheetName = workbook.SheetNames[0];  // 첫 번째 시트를 선택
const sheet = workbook.Sheets[sheetName];

// JSON 형식으로 변환
const jsonData = XLSX.utils.sheet_to_json(sheet);

// JSON 파일로 저장
fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));  // data.json으로 저장

console.log('엑셀 파일을 JSON으로 변환하여 data.json에 저장했습니다.');
