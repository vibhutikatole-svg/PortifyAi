const NL = '\x0A';

function createValidPdfBuffer(contentString) {
  const rawLines = contentString.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const lines = rawLines.length > 0 ? rawLines : [contentString];
  const cleanLines = lines.map(l => l.replace(/[()]/g, ''));
  const stream = 'BT /F1 12 Tf 14 TL 72 712 Td ' + cleanLines.map(l => '(' + l + ') \'').join(' ') + ' ET';

  const body = [
    '%PDF-1.4' + NL,
    '1 0 obj' + NL + '<< /Type /Catalog /Pages 2 0 R >>' + NL + 'endobj' + NL,
    '2 0 obj' + NL + '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' + NL + 'endobj' + NL,
    '3 0 obj' + NL + '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>' + NL + 'endobj' + NL,
    '4 0 obj' + NL + '<< /Length ' + stream.length + ' >>' + NL + 'stream' + NL + stream + NL + 'endstream' + NL + 'endobj' + NL,
    '5 0 obj' + NL + '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' + NL + 'endobj' + NL,
  ];

  let xref = 'xref' + NL + '0 6' + NL + '0000000000 65535 f ' + NL;
  let pos = body[0].length;
  for (let i = 1; i < body.length; i++) {
    xref += String(pos).padStart(10, '0') + ' 00000 n ' + NL;
    pos += body[i].length;
  }
  const startxref = pos;
  const trailer = 'trailer' + NL + '<< /Size 6 /Root 1 0 R >>' + NL + 'startxref' + NL + startxref + NL + '%%EOF';

  return Buffer.from(body.join('') + xref + trailer, 'latin1');
}

function createScannedPdfBuffer() {
  const body = [
    '%PDF-1.4' + NL,
    '1 0 obj' + NL + '<< /Type /Catalog /Pages 2 0 R >>' + NL + 'endobj' + NL,
    '2 0 obj' + NL + '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' + NL + 'endobj' + NL,
    '3 0 obj' + NL + '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>' + NL + 'endobj' + NL,
    '4 0 obj' + NL + '<< /Length 0 >>' + NL + 'stream' + NL + NL + 'endstream' + NL + 'endobj' + NL,
    '5 0 obj' + NL + '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' + NL + 'endobj' + NL,
  ];

  let xref = 'xref' + NL + '0 6' + NL + '0000000000 65535 f ' + NL;
  let pos = body[0].length;
  for (let i = 1; i < body.length; i++) {
    xref += String(pos).padStart(10, '0') + ' 00000 n ' + NL;
    pos += body[i].length;
  }
  const startxref = pos;
  const trailer = 'trailer' + NL + '<< /Size 6 /Root 1 0 R >>' + NL + 'startxref' + NL + startxref + NL + '%%EOF';

  return Buffer.from(body.join('') + xref + trailer, 'latin1');
}

module.exports = {
  createValidPdfBuffer,
  createScannedPdfBuffer,
};

