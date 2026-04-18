// services/report.service.test.js
'use strict';

const mongoose     = require('mongoose');
const fs           = require('fs');
const path         = require('path');
const ExcelJS      = require('exceljs');
const PDFDoc       = require('pdfkit');

const reportService = require('./report.service');
const Donation      = require('../models/donation.model');
const Request       = require('../models/request.model');
const User          = require('../models/user.model');
const Report        = require('../models/report.model');

jest.mock('../models/donation.model');
jest.mock('../models/request.model');
jest.mock('../models/user.model');
jest.mock('../models/report.model');
jest.mock('fs');
jest.mock('pdfkit');
jest.mock('exceljs');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');

describe('Report Service', () => {
  let mockUserId;

  beforeEach(() => {
    mockUserId = new mongoose.Types.ObjectId().toString();
    jest.clearAllMocks();

    /* Ensure Reports dir check doesn't throw */
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue(undefined);

    /* Mock PDFDoc */
    const mockPdfDoc = {
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'end') cb();
      }),
      addPage: jest.fn(),
      fontSize: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      fill: jest.fn().mockReturnThis(),
      moveTo: jest.fn().mockReturnThis(),
      lineTo: jest.fn().mockReturnThis(),
      strokeColor: jest.fn().mockReturnThis(),
      lineWidth: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      end: jest.fn(),
      page: { width: 600, height: 800 },
      y: 100,
    };
    PDFDoc.mockImplementation(() => mockPdfDoc);

    /* Mock Buffer.concat to prevent errors */
    jest.spyOn(Buffer, 'concat').mockReturnValue(Buffer.from('mock pdf'));

    /* Mock ExcelJS */
    const mockSheet = {
      mergeCells: jest.fn(),
      getCell: jest.fn().mockReturnValue({}),
      getRow: jest.fn().mockReturnValue({ getCell: jest.fn().mockReturnValue({}) }),
    };
    const mockWorkbook = {
      addWorksheet: jest.fn().mockReturnValue(mockSheet),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock excel')),
      },
    };
    ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

    /* Mock Report Model */
    Report.create.mockResolvedValue({ _id: 'reportId123', status: 'ready' });
  });

  describe('generateDonationReport', () => {
    it('generates a PDF report and saves DB record', async () => {
      Donation.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: '1', status: 'pending', createdAt: new Date() },
        ]),
      });

      const filters = { format: 'pdf', status: 'pending' };
      const report = await reportService.generateDonationReport(filters, mockUserId);

      expect(Donation.find).toHaveBeenCalledWith({
        deletedAt: { $exists: false },
        status: 'pending',
      });
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalledWith(
        expect.objectContaining({ format: 'pdf', type: 'donations' })
      );
      expect(report).toBeDefined();
    });
  });

  describe('generateInstitutionReport', () => {
    it('generates an Excel report correctly', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: mockUserId, firstName: 'Inst', role: 'institution', createdAt: new Date() },
        ]),
      });

      Donation.aggregate.mockResolvedValue([{ _id: mockUserId, count: 5 }]);

      const filters = { format: 'excel' };
      const report = await reportService.generateInstitutionReport(filters, mockUserId);

      expect(User.find).toHaveBeenCalledWith({ role: 'institution' });
      expect(Donation.aggregate).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(Report.create).toHaveBeenCalledWith(
        expect.objectContaining({ format: 'excel', type: 'institutions' })
      );
      expect(report).toBeDefined();
    });
  });

  describe('deleteReport', () => {
    it('deletes the report from DB and unlinks the file', async () => {
      const mockReport = {
        _id: 'report1',
        filePath: '/reports/mock.pdf',
        deleteOne: jest.fn(),
      };
      Report.findById.mockResolvedValue(mockReport);
      fs.existsSync.mockReturnValue(true);

      await reportService.deleteReport('report1');

      expect(Report.findById).toHaveBeenCalledWith('report1');
      expect(fs.unlinkSync).toHaveBeenCalledWith('/reports/mock.pdf');
      expect(mockReport.deleteOne).toHaveBeenCalled();
    });

    it('does not throw if file already deleted', async () => {
      const mockReport = {
        _id: 'report2',
        filePath: '/reports/missing.pdf',
        deleteOne: jest.fn(),
      };
      Report.findById.mockResolvedValue(mockReport);
      fs.existsSync.mockReturnValue(false); // file absent

      await expect(reportService.deleteReport('report2')).resolves.not.toThrow();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockReport.deleteOne).toHaveBeenCalled();
    });

    it('throws ApiError 404 if record not found', async () => {
      Report.findById.mockResolvedValue(null);
      await expect(reportService.deleteReport('badId')).rejects.toThrow('Report not found');
    });
  });
});
