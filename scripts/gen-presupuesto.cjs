const PDFDocument = require('pdfkit');
const fs = require('fs');

const PETROL = '#16524E', AMBER = '#E8A33D', INK = '#1F2A2A', LIGHT = '#6b736b';
const SAND = '#F4EDE3', SANDBG = '#F8F4EC', BORDER = '#d9d2c5';

const doc = new PDFDocument({ size: 'A4', margins: { top: 48, bottom: 48, left: 40, right: 40 } });
doc.pipe(fs.createWriteStream('/tmp/presupuesto.pdf'));

const L = 40, R = 555; // límites de contenido
const C1 = 40, W1 = 105, C2 = 150, W2 = 305, C3 = 460, W3 = 95;

function sectionTitle(t) {
  doc.moveDown(0.6);
  const y = doc.y;
  doc.fillColor(PETROL).font('Helvetica-Bold').fontSize(13).text(t, L, y);
  doc.moveTo(L, doc.y + 2).lineTo(R, doc.y + 2).lineWidth(2).strokeColor(AMBER).stroke();
  doc.moveDown(0.5);
}

// Dibuja una fila. cols: [{text,x,w,align,bold,color,size}]; opts: {fill, textColor}
function row(cols, opts = {}) {
  const pad = 6;
  const sizeOf = (c) => c.size || 10;
  // medir altura
  let h = 0;
  for (const c of cols) {
    doc.font(c.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(sizeOf(c));
    h = Math.max(h, doc.heightOfString(c.text, { width: c.w - 6, align: c.align || 'left' }));
  }
  const rowH = h + pad * 2;
  if (doc.y + rowH > doc.page.height - 48) doc.addPage();
  const y = doc.y;
  if (opts.fill) doc.rect(L, y, R - L, rowH).fill(opts.fill);
  for (const c of cols) {
    doc.font(c.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(sizeOf(c))
      .fillColor(c.color || opts.textColor || INK)
      .text(c.text, c.x + 3, y + pad, { width: c.w - 6, align: c.align || 'left' });
  }
  doc.moveTo(L, y + rowH).lineTo(R, y + rowH).lineWidth(0.5).strokeColor(BORDER).stroke();
  doc.y = y + rowH;
}

function headerRow(labels) {
  row(labels.map((l) => ({ ...l, bold: true, color: SAND })), { fill: PETROL });
}

// ---------- Cabecera ----------
doc.font('Helvetica-Bold').fontSize(21);
doc.fillColor(PETROL).text('POR', L, 48, { continued: true });
doc.fillColor(AMBER).text('2', { continued: true });
doc.fillColor(PETROL).text('DUROS');
doc.font('Helvetica').fontSize(10).fillColor(LIGHT).text('Precio transparente. Sin sorpresas.');

doc.moveDown(1);
doc.font('Helvetica-Bold').fontSize(17).fillColor(PETROL).text('Presupuesto — Web "Eje Fisioterapia"');
doc.font('Helvetica').fontSize(9.5).fillColor(LIGHT).text('Cliente: Clínica de fisioterapia   ·   Fecha: 13/06/2026   ·   Ref: v1.0');

// ---------- 1) Desarrollo ----------
sectionTitle('1) Desarrollo (pago único)');
headerRow([
  { text: 'Concepto', x: C1, w: W1 },
  { text: 'Qué incluye', x: C2, w: W2 },
  { text: 'Precio', x: C3, w: W3, align: 'right' },
]);
const dev = [
  ['App a medida', 'Web app de reservas: web pública (inicio, servicios, tarifas, método, contacto), reserva online con disponibilidad real, galería de pautas, mapa y emails transaccionales (confirmación, recordatorios, contacto) con diseño de marca.', '1.297 €'],
  ['Panel de contenido (Admin)', 'Gestión de agenda y citas, pacientes (alta/edición/baja), bonos, servicios, biblioteca de ejercicios y recordatorios/emails.', '+197 €'],
  ['Login / Registro', 'Acceso de administración + área de paciente por enlace (sin contraseña): ver citas, bonos y pautas, y cancelar/reprogramar.', '+147 €'],
  ['SEO básico', 'Metadatos, Open Graph (compartir en redes), favicon de marca y estructura semántica.', '+97 €'],
  ['Alojamiento + mant. Pro — 1er año', 'Hosting gestionado, monitorización, soporte prioritario y cambios de contenido durante 12 meses (valor 588 €).', 'Incluido'],
];
dev.forEach(([a, b, c], i) => row([
  { text: a, x: C1, w: W1, bold: true },
  { text: b, x: C2, w: W2 },
  { text: c, x: C3, w: W3, align: 'right', bold: true },
], i === 4 ? { fill: '#FBF3DF' } : {}));
row([
  { text: 'Subtotal desarrollo (con 1er año Pro incluido)', x: C1, w: W1 + 10 + W2, bold: true, color: SAND },
  { text: '1.738 €', x: C3, w: W3, align: 'right', bold: true, color: SAND, size: 11 },
], { fill: PETROL });
doc.moveDown(0.4);
doc.font('Helvetica-Bold').fontSize(10.5).fillColor(PETROL).text('IVA (21%): 365 €   →   Total con IVA: 2.103 €', L);

// ---------- 2) A partir del 2º año ----------
sectionTitle('2) A partir del 2º año');
headerRow([
  { text: 'Plan', x: C1, w: W1 },
  { text: 'Incluye', x: C2, w: W2 },
  { text: 'Precio', x: C3, w: W3, align: 'right' },
]);
[
  ['Pro (recomendado)', 'Alojamiento + monitorización + soporte prioritario + cambios de contenido y evolutivos menores.', '49 €/mes'],
  ['Básico', 'Alojamiento + monitorización + pequeños ajustes.', '29 €/mes'],
  ['Sin mantenimiento', 'Te quedas la web tal cual.', '0 €'],
].forEach(([a, b, c]) => row([
  { text: a, x: C1, w: W1, bold: true },
  { text: b, x: C2, w: W2 },
  { text: c, x: C3, w: W3, align: 'right', bold: true },
]));

// ---------- 3) Ampliaciones ----------
sectionTitle('3) Ampliaciones para una v2 (opcionales)');
headerRow([
  { text: 'Extra', x: C1, w: W1 + 10 + W2 },
  { text: 'Precio', x: C3, w: W3, align: 'right' },
]);
[
  ['Pagos online (cobro de citas/bonos)', '+197 €'],
  ['Analytics (métricas de visitas)', '+47 €'],
  ['Multidioma', '+147 €'],
].forEach(([a, c]) => row([
  { text: a, x: C1, w: W1 + 10 + W2, bold: true },
  { text: c, x: C3, w: W3, align: 'right', bold: true },
]));

// ---------- Condiciones ----------
sectionTitle('Condiciones');
doc.font('Helvetica').fontSize(10).fillColor(INK);
const conds = [
  'Garantía 15 días: si no quedas satisfecho, te devolvemos el dinero. Sin preguntas.',
  'Primer año de alojamiento y mantenimiento Pro incluido. Desde el 2º año, 49 €/mes (o el plan que elijas).',
  'Entrega: proyecto a medida (orientativo 2–3 semanas).',
  'Pago: 50% al inicio / 50% a la entrega.',
  'Precios sin IVA salvo donde se indica.',
];
conds.forEach((c) => doc.fillColor(INK).text('•  ' + c, L, doc.y, { width: R - L }).moveDown(0.2));

// ---------- Resumen ----------
doc.moveDown(0.6);
const rh = 50;
if (doc.y + rh > doc.page.height - 48) doc.addPage();
const ry = doc.y;
doc.rect(L, ry, R - L, rh).fill(PETROL);
doc.font('Helvetica-Bold').fontSize(11).fillColor(SAND)
  .text('Resumen: ', L + 14, ry + 14, { continued: true })
  .fillColor(AMBER).text('1.738 €', { continued: true })
  .fillColor(SAND).text(' (desarrollo, 1er año Pro incluido) · desde el 2º año 49 €/mes · IVA incl. 2.103 €', { width: R - L - 28 });

doc.end();
console.log('PDF generado en /tmp/presupuesto.pdf');
