/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: High-level overview and insights for platform administrators
 *
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         activeDonations:
 *           type: integer
 *         openRequests:
 *           type: integer
 *         successfulMatches:
 *           type: integer
 *
 *     ActivityItem:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: NEW_USER
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *
 *     SystemSummary:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *           properties:
 *             currentMonth:
 *               type: integer
 *             growth:
 *               type: number
 *         donations:
 *           type: object
 *           properties:
 *             currentMonth:
 *               type: integer
 *             growth:
 *               type: number
 *         requests:
 *           type: object
 *           properties:
 *             currentMonth:
 *               type: integer
 *             growth:
 *               type: number
 *
 *     AlertItem:
 *       type: object
 *       properties:
 *         level:
 *           type: string
 *           enum: [info, warning, critical]
 *         type:
 *           type: string
 *         message:
 *           type: string
 *         referenceId:
 *           type: string
 *
 * @swagger
 * /api/v1/admin/dashboard/stats:
 *   get:
 *     summary: Get top-level dashboard statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/admin/dashboard/recent-activity:
 *   get:
 *     summary: Get recent user and system activity
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityItem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/admin/dashboard/summary:
 *   get:
 *     summary: Get period-over-period system summary
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SystemSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/admin/dashboard/alerts:
 *   get:
 *     summary: Get system alerts requiring admin attention
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AlertItem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
