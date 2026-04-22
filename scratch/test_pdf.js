const PDFDoc = require('pdfkit');
const fs = require('fs');

const title = 'Test Report';
const columns = ['#', 'Donor', 'Medicine', 'Quantity', 'Unit', 'Status', 'Priority', 'Expiry', 'Created'];
const rows = [
  [1, 'John Doe', 'Paracetamol 500mg', 10, 'box', 'pending', 'high', '12/12/2026', '01/01/2026']
];

const doc = new PDFDoc({ margin: 40, size: 'A4', bufferPages: true });
doc.pipe(fs.createWriteStream('test_pdf.pdf'));

const usableWidth = doc.page.width - 80;

const getColumnWeight = (header) => {
  const lower = header.toLowerCase();
  if (lower === '#') return 0.5;
  if (lower.includes('qty') || lower.includes('quantity')) return 1.2;
  if (lower === 'unit') return 1;
  if (lower.includes('status')) return 1.5;
  if (lower.includes('priority')) return 1.2;
  if (lower.includes('date') || lower.includes('created') || lower.includes('expires') || lower.includes('at') || lower.includes('joined')) return 1.8;
  if (lower.includes('donor') || lower.includes('institution') || lower.includes('medicine') || lower.includes('email') || lower.includes('name')) return 3;
  return 1.5; 
};

const getAlign = (header) => {
  const lower = header.toLowerCase();
  if (lower === '#' || lower.includes('qty') || lower.includes('quantity')) return 'center';
  if (lower.includes('date') || lower.includes('created') || lower.includes('expires') || lower.includes('at') || lower.includes('joined')) return 'right';
  return 'left';
};

const weights = columns.map(getColumnWeight);
const aligns = columns.map(getAlign);
const totalWeight = weights.reduce((sum, w) => sum + w, 0);
const colWidths = weights.map(w => Math.floor(usableWidth * (w / totalWeight)));

console.log('Columns:', columns);
console.log('Weights:', weights);
console.log('Widths:', colWidths);

const rowHeight = 28;
const paddingY = 8;
const paddingX = 6;

const drawRow = (data, isHeader = false) => {
  const startX = 40;
  let   startY = doc.y;

  let currentX = startX;
  data.forEach((cell, i) => {
    const text = String(cell ?? '');
    
    // Check if width is valid
    const textWidth = colWidths[i] - (paddingX * 2);
    console.log(`Col ${i} (${columns[i]}): Total Width ${colWidths[i]}, Text Width ${textWidth}`);
    
    doc.text(text, currentX + paddingX, startY + paddingY, {
      width: textWidth > 0 ? textWidth : 1, // Prevent crash
      align: aligns[i],
      ellipsis: true,
      lineBreak: false,
    });
    currentX += colWidths[i];
  });

  doc.y = startY + rowHeight;
};

drawRow(columns, true);
drawRow(rows[0]);

doc.end();
