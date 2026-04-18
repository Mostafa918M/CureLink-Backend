/**
 * @swagger
 * components:
 *   schemas:
 *     ReportGenerateInput:
 *       type: object
 *       required: [format]
 *       properties:
 *         format:
 *           type: string
 *           enum: [pdf, excel]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           description: Relevant item status
 *         priority:
 *           type: string
 *
 *     ReportMonthlySummaryInput:
 *       type: object
 *       required: [format]
 *       properties:
 *         format:
 *           type: string
 *           enum: [pdf, excel]
 *         year:
 *           type: integer
 *           example: 2026
 *         month:
 *           type: integer
 *           example: 4
 *
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         type:
 *           type: string
 *           enum: [donations, institutions, requests, matching, monthly_summary]
 *         format:
 *           type: string
 *           enum: [pdf, excel]
 *         filters:
 *           type: object
 *         fileName:
 *           type: string
 *         fileSize:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [processing, ready, failed]
 *         generatedBy:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ReportResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Report'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ReportListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             reports:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   - name: Reports
 *     description: Admins report generation and management endpoints
 *
 * /api/v1/reports/donations:
 *   post:
 *     summary: Generate a donation report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportGenerateInput'
 *     responses:
 *       201:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *
 * /api/v1/reports/institutions:
 *   post:
 *     summary: Generate an institution report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportGenerateInput'
 *     responses:
 *       201:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *
 * /api/v1/reports/requests:
 *   post:
 *     summary: Generate a request report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportGenerateInput'
 *     responses:
 *       201:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *
 * /api/v1/reports/matching:
 *   post:
 *     summary: Generate a matching activity report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportGenerateInput'
 *     responses:
 *       201:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *
 * /api/v1/reports/monthly-summary:
 *   post:
 *     summary: Generate a monthly aggregate summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportMonthlySummaryInput'
 *     responses:
 *       201:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *
 * /api/v1/reports:
 *   get:
 *     summary: List generated reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportListResponse'
 *
 * /api/v1/reports/{id}:
 *   get:
 *     summary: Download generated report file
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *
 *   delete:
 *     summary: Delete a report document (DB and disk)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
