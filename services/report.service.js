// services/report.service.js
'use strict';

const fs      = require('fs');
const path    = require('path');
const PDFDoc  = require('pdfkit');
const ExcelJS = require('exceljs');

const Donation = require('../models/donation.model');
const Request  = require('../models/request.model');
const User     = require('../models/user.model');
const Report   = require('../models/report.model');
const ApiError = require('../utils/apiError');

/* ─────────────────────────────────────────────────────────
   Directory where generated files are stored
───────────────────────────────────────────────────────── */
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/* ─────────────────────────────────────────────────────────
   Internal helpers
───────────────────────────────────────────────────────── */

/**
 * Build a simple PDF from table data using pdfkit.
 * @param {string}   title   - Report heading
 * @param {string[]} columns - Column header labels
 * @param {Array}    rows    - Array of plain-values arrays (one per row)
 * @returns {Promise<Buffer>}
 */
function buildPDF(title, columns, rows) {
  return new Promise((resolve, reject) => {
    // `bufferPages: true` is needed to draw footers on all pages at the end
    const doc    = new PDFDoc({ margin: 40, size: 'A4', bufferPages: true });
    const chunks = [];

    doc.on('data',  chunk => chunks.push(chunk));
    doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
    doc.on('error', err   => reject(err));

    /* ── Header ── */
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
       .text(`Generated: ${new Date().toUTCString()}`, { align: 'center' });
    doc.moveDown(1.5).fillColor('#000000');

    /* ── Column Config ── */
    const usableWidth = doc.page.width - 80;
    
    // Dynamic weight distribution
    const getColumnWeight = (header) => {
      const lower = header.toLowerCase();
      if (lower === '#') return 0.8;
      if (lower.includes('qty') || lower.includes('quantity')) return 1.6;
      if (lower === 'unit') return 1.2;
      if (lower.includes('status')) return 1.6;
      if (lower.includes('priority')) return 1.4;
      if (lower.includes('date') || lower.includes('created') || lower.includes('expires') || lower.includes('at') || lower.includes('joined')) return 2.0;
      if (lower.includes('donor') || lower.includes('institution') || lower.includes('medicine') || lower.includes('email') || lower.includes('name')) return 2.8;
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

    /* ── Table Row Drawer ── */
    const rowHeight = 28;
    const paddingY = 8;
    const paddingX = 4; // reduced from 6 to give text more inner breathing room

    const drawRow = (data, isHeader = false) => {
      const startX = 40;
      let   startY = doc.y;

      // Draw background
      if (isHeader) {
        doc.rect(startX, startY, usableWidth, rowHeight).fill('#2c3e50');
      }

      // Draw horizontal subtle border for data rows
      if (!isHeader) {
        doc.moveTo(startX, startY + rowHeight)
           .lineTo(startX + usableWidth, startY + rowHeight)
           .strokeColor('#e0e0e0').lineWidth(0.5).stroke();
      }

      // Setup Text Options
      if (isHeader) {
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      } else {
        doc.fillColor('#333333').fontSize(8).font('Helvetica');
      }

      // Draw Cells
      let currentX = startX;
      data.forEach((cell, i) => {
        const text = String(cell ?? '');
        doc.text(text, currentX + paddingX, startY + paddingY, {
          width: colWidths[i] - (paddingX * 2),
          align: aligns[i],
          ellipsis: true,
          lineBreak: false,
        });
        currentX += colWidths[i];
      });

      doc.y = startY + rowHeight;
    };

    // Table Header
    drawRow(columns, true);

    // Table Rows
    rows.forEach((row, idx) => {
      // Pagination check (keep 80px for bottom margin/footer)
      if (doc.y > doc.page.height - 80) { 
        doc.addPage(); 
        drawRow(columns, true); // redraw header on new page
      }
      
      // Zebra striping
      if (idx % 2 === 0) {
        doc.rect(40, doc.y, usableWidth, rowHeight).fill('#fafafa');
      }
      
      drawRow(row);
    });

    /* ── Footer ── */
    // Add page footer tracking by looping through all pages
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      // Top divider line for footer
      doc.moveTo(40, doc.page.height - 40)
         .lineTo(doc.page.width - 40, doc.page.height - 40)
         .strokeColor('#e0e0e0').lineWidth(0.5).stroke();
         
      // Text
      doc.fontSize(8).fillColor('#666666').font('Helvetica');
      doc.text(
        `CureLink — ${title} | ${rows.length} record(s) | Page ${i + 1} of ${range.count}`,
        40, 
        doc.page.height - 30, 
        { align: 'right', width: usableWidth }
      );
    }

    doc.end();
  });
}

/**
 * Build an Excel workbook from table data.
 * @returns {Promise<Buffer>}
 */
async function buildExcel(title, columns, rows) {
  const workbook  = new ExcelJS.Workbook();
  workbook.creator = 'CureLink';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.substring(0, 31)); // max 31 chars

  /* Title row */
  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell       = sheet.getCell('A1');
  titleCell.value       = title;
  titleCell.font        = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleCell.fill        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
  titleCell.alignment   = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  /* Sub-title row (generated date) */
  sheet.mergeCells(2, 1, 2, columns.length);
  const subCell       = sheet.getCell('A2');
  subCell.value       = `Generated: ${new Date().toUTCString()}`;
  subCell.font        = { italic: true, size: 9, color: { argb: 'FF666666' } };
  subCell.alignment   = { horizontal: 'center' };
  sheet.getRow(2).height = 18;

  /* Column headers */
  const headerRow = sheet.getRow(3);
  columns.forEach((col, i) => {
    const cell    = headerRow.getCell(i + 1);
    cell.value    = col;
    cell.font     = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill     = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border   = { bottom: { style: 'thin', color: { argb: 'FF2C3E50' } } };
  });
  headerRow.height = 22;

  /* Auto column width based on header */
  sheet.columns = columns.map((col, i) => ({
    key:   `col${i}`,
    width: Math.max(col.length + 4, 14),
  }));

  /* Data rows */
  rows.forEach((row, rowIdx) => {
    const sheetRow  = sheet.getRow(rowIdx + 4);
    const fillColor = rowIdx % 2 === 0 ? 'FFFAFAFA' : 'FFFFFFFF';
    row.forEach((cell, colIdx) => {
      const c   = sheetRow.getCell(colIdx + 1);
      c.value   = cell ?? '';
      c.fill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      c.border  = { bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } } };
      c.alignment = { vertical: 'middle' };
    });
    sheetRow.height = 18;
  });

  return workbook.xlsx.writeBuffer();
}

/**
 * Save a buffer to disk and return the full path.
 */
function saveFile(buffer, fileName) {
  const filePath = path.join(REPORTS_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Build the file name from type + format.
 */
function buildFileName(type, format) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${type}_${ts}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
}

/**
 * Build date-range match filter for MongoDB.
 */
function dateRangeFilter(field, startDate, endDate) {
  const filter = {};
  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) filter[field].$gte = new Date(startDate);
    if (endDate)   filter[field].$lte = new Date(endDate);
  }
  return filter;
}

/**
 * Orchestrate: aggregate → build file → save → persist record → return report doc.
 */
async function orchestrate({ type, format, title, filters, columns, rows, userId }) {
  const fileName = buildFileName(type, format);
  let   buffer;

  if (format === 'pdf') {
    buffer = await buildPDF(title, columns, rows);
  } else {
    buffer = await buildExcel(title, columns, rows);
  }

  const filePath = saveFile(buffer, fileName);

  const report = await Report.create({
    title,
    type,
    format,
    filters,
    filePath,
    fileName,
    fileSize: buffer.length,
    generatedBy: userId,
    status: 'ready',
  });

  return report;
}

/* ─────────────────────────────────────────────────────────
   Public API
───────────────────────────────────────────────────────── */

/**
 * Generate a donation report.
 */
exports.generateDonationReport = async ({ format, startDate, endDate, status }, userId) => {
  const match = {
    deletedAt: { $exists: false },
    ...dateRangeFilter('createdAt', startDate, endDate),
  };
  if (status) match.status = status;

  const donations = await Donation.find(match)
    .populate('donor',    'firstName lastName email')
    .populate('medicine', 'name strength dosageForm')
    .sort({ createdAt: -1 })
    .lean();

  const columns = ['#', 'Donor', 'Medicine', 'Quantity', 'Unit', 'Status', 'Priority', 'Expiry', 'Created'];
  const rows    = donations.map((d, i) => [
    i + 1,
    d.donor   ? `${d.donor.firstName} ${d.donor.lastName}` : 'N/A',
    d.medicine ? `${d.medicine.name} ${d.medicine.strength ?? ''}`.trim() : 'N/A',
    d.quantity?.amount ?? '',
    d.quantity?.unit   ?? '',
    d.status,
    d.priority,
    d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : '',
    new Date(d.createdAt).toLocaleDateString(),
  ]);

  return orchestrate({
    type:    'donations',
    format,
    title:   'Donation Report',
    filters: { startDate, endDate, status },
    columns,
    rows,
    userId,
  });
};

/**
 * Generate an institution report.
 */
exports.generateInstitutionReport = async ({ format, startDate, endDate }, userId) => {
  const institutionMatch = { role: 'institution' };
  if (startDate || endDate) {
    institutionMatch.createdAt = {};
    if (startDate) institutionMatch.createdAt.$gte = new Date(startDate);
    if (endDate)   institutionMatch.createdAt.$lte = new Date(endDate);
  }

  const institutions = await User.find(institutionMatch)
    .select('firstName lastName email phone isVerified isActive createdAt')
    .sort({ createdAt: -1 })
    .lean();

  /* Attach donation count for each institution */
  const ids = institutions.map(i => i._id);
  const donationCounts = await Donation.aggregate([
    { $match: { matchedInstitution: { $in: ids } } },
    { $group: { _id: '$matchedInstitution', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(donationCounts.map(d => [d._id.toString(), d.count]));

  const columns = ['#', 'Name', 'Email', 'Phone', 'Verified', 'Active', 'Donations Received', 'Joined'];
  const rows    = institutions.map((inst, i) => [
    i + 1,
    `${inst.firstName} ${inst.lastName}`,
    inst.email,
    inst.phone,
    inst.isVerified ? 'Yes' : 'No',
    inst.isActive   ? 'Yes' : 'No',
    countMap[inst._id.toString()] ?? 0,
    new Date(inst.createdAt).toLocaleDateString(),
  ]);

  return orchestrate({
    type:    'institutions',
    format,
    title:   'Institution Report',
    filters: { startDate, endDate },
    columns,
    rows,
    userId,
  });
};

/**
 * Generate a request report.
 */
exports.generateRequestReport = async ({ format, startDate, endDate, status, priority }, userId) => {
  const match = { ...dateRangeFilter('createdAt', startDate, endDate) };
  if (status)   match.status   = status;
  if (priority) match.priority = priority;

  const requests = await Request.find(match)
    .populate('institution', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  const columns = ['#', 'Institution', 'Medicine', 'Qty Required', 'Qty Fulfilled', 'Priority', 'Status', 'Expires', 'Created'];
  const rows    = requests.map((r, i) => [
    i + 1,
    r.institution ? `${r.institution.firstName} ${r.institution.lastName}` : 'N/A',
    r.medicineName,
    `${r.requiredQuantity?.amount ?? ''} ${r.requiredQuantity?.unit ?? ''}`.trim(),
    r.fulfilledQuantity ?? 0,
    r.priority,
    r.status,
    r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : '',
    new Date(r.createdAt).toLocaleDateString(),
  ]);

  return orchestrate({
    type:    'requests',
    format,
    title:   'Request Report',
    filters: { startDate, endDate, status, priority },
    columns,
    rows,
    userId,
  });
};

/**
 * Generate a matching report.
 */
exports.generateMatchingReport = async ({ format, startDate, endDate }, userId) => {
  const match = {
    status:    { $in: ['matched', 'approved', 'delivered'] },
    deletedAt: { $exists: false },
    ...dateRangeFilter('matchedAt', startDate, endDate),
  };

  const donations = await Donation.find(match)
    .populate('donor',              'firstName lastName email')
    .populate('medicine',           'name strength')
    .populate('matchedInstitution', 'firstName lastName email')
    .sort({ matchedAt: -1 })
    .lean();

  const columns = ['#', 'Donor', 'Medicine', 'Qty', 'Unit', 'Institution', 'Status', 'Matched At', 'Delivered At'];
  const rows    = donations.map((d, i) => [
    i + 1,
    d.donor              ? `${d.donor.firstName} ${d.donor.lastName}` : 'N/A',
    d.medicine           ? `${d.medicine.name} ${d.medicine.strength ?? ''}`.trim() : 'N/A',
    d.quantity?.amount   ?? '',
    d.quantity?.unit     ?? '',
    d.matchedInstitution ? `${d.matchedInstitution.firstName} ${d.matchedInstitution.lastName}` : 'N/A',
    d.status,
    d.matchedAt  ? new Date(d.matchedAt).toLocaleDateString() : '',
    d.delivery?.deliveredAt ? new Date(d.delivery.deliveredAt).toLocaleDateString() : '',
  ]);

  return orchestrate({
    type:    'matching',
    format,
    title:   'Matching Report',
    filters: { startDate, endDate },
    columns,
    rows,
    userId,
  });
};

/**
 * Generate a monthly summary report.
 */
exports.generateMonthlySummaryReport = async ({ format, year, month }, userId) => {
  const now          = new Date();
  const targetYear   = year  ? parseInt(year,  10) : now.getFullYear();
  const targetMonth  = month ? parseInt(month, 10) : now.getMonth() + 1; // 1-based

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate   = new Date(targetYear, targetMonth,     0, 23, 59, 59); // last day of month

  const [donationStats, requestStats, userStats, matchStats] = await Promise.all([
    /* Donations: count & breakdown by status */
    Donation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, deletedAt: { $exists: false } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    /* Requests: count & breakdown by status */
    Request.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    /* New users: count by role */
    User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),

    /* Matches (matched + delivered) */
    Donation.countDocuments({
      status:    { $in: ['matched', 'delivered'] },
      matchedAt: { $gte: startDate, $lte: endDate },
    }),
  ]);

  const monthLabel = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  const title      = `Monthly Summary — ${monthLabel}`;

  /* Build a combined summary table */
  const columns = ['Category', 'Sub-category', 'Count'];
  const rows    = [
    ...donationStats.map(s => ['Donations', s._id, s.count]),
    ...requestStats.map(s  => ['Requests',  s._id, s.count]),
    ...userStats.map(s     => ['New Users', s._id, s.count]),
    ['Matches', 'matched/delivered', matchStats],
  ];

  return orchestrate({
    type:    'monthly_summary',
    format,
    title,
    filters: { year: targetYear, month: targetMonth },
    columns,
    rows,
    userId,
  });
};

/**
 * List reports with optional filters + pagination.
 */
exports.listReports = async ({ page = 1, limit = 10, type, format } = {}) => {
  const filter = {};
  if (type)   filter.type   = type;
  if (format) filter.format = format;

  const skip  = (page - 1) * limit;
  const total = await Report.countDocuments(filter);
  const reports = await Report.find(filter)
    .populate('generatedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Find one report by id.
 */
exports.getReportById = async (id) => {
  const report = await Report.findById(id).populate('generatedBy', 'firstName lastName email').lean();
  if (!report) throw new ApiError('Report not found', 404);
  return report;
};

/**
 * Delete report record + file from disk.
 */
exports.deleteReport = async (id) => {
  const report = await Report.findById(id);
  if (!report) throw new ApiError('Report not found', 404);

  /* Remove file if it still exists */
  try {
    if (fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }
  } catch (err) {
    /* Non-fatal: file may have been removed manually */
  }

  await report.deleteOne();
};
