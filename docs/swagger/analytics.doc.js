/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: >
 *     Platform-wide analytics endpoints.
 *     **Restricted to admin and superadmin roles.**
 */

/* ══════════════════════════ SHARED QUERY PARAMS ═════════════════════════ */

/**
 * @swagger
 * components:
 *   parameters:
 *     periodParam:
 *       in: query
 *       name: period
 *       schema:
 *         type: string
 *         enum: [daily, weekly, monthly, yearly]
 *         default: monthly
 *       description: Grouping period for trend endpoints
 *     fromParam:
 *       in: query
 *       name: from
 *       schema:
 *         type: string
 *         format: date
 *       description: Start date (ISO 8601). Defaults to 6 months ago.
 *       example: "2025-10-01"
 *     toParam:
 *       in: query
 *       name: to
 *       schema:
 *         type: string
 *         format: date
 *       description: End date (ISO 8601). Defaults to today.
 *       example: "2026-04-17"
 *     limitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 12
 *       description: Maximum number of data-points returned
 */

/* ══════════════════════════ DONATION ANALYTICS ══════════════════════════ */

/**
 * @swagger
 * /api/v1/analytics/donations:
 *   get:
 *     summary: Donation analytics overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donation analytics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Donation analytics fetched
 *               data:
 *                 summary:
 *                   total: 120
 *                   delivered: 45
 *                   pending: 30
 *                   expired: 10
 *                   matched: 35
 *                   deliveryRate: "37.5%"
 *                 byStatus:
 *                   - _id: delivered
 *                     count: 45
 *                   - _id: pending
 *                     count: 30
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/donations/trends:
 *   get:
 *     summary: Donation count trends over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/periodParam'
 *       - $ref: '#/components/parameters/fromParam'
 *       - $ref: '#/components/parameters/toParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Donation trends fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Donation trends fetched
 *               data:
 *                 period: monthly
 *                 from: "2025-10-17T00:00:00.000Z"
 *                 to: "2026-04-17T00:00:00.000Z"
 *                 data:
 *                   - period: "2025-10"
 *                     count: 12
 *                   - period: "2025-11"
 *                     count: 18
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/donations/categories:
 *   get:
 *     summary: Donations grouped by medicine category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donation categories fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Donation categories fetched
 *               data:
 *                 data:
 *                   - category: Antibiotics
 *                     count: 34
 *                     totalQuantity: 210
 *                   - category: Uncategorized
 *                     count: 12
 *                     totalQuantity: 60
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/* ══════════════════════════ INSTITUTION ANALYTICS ═══════════════════════ */

/**
 * @swagger
 * /api/v1/analytics/institutions:
 *   get:
 *     summary: Institution analytics overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Institution analytics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Institution analytics fetched
 *               data:
 *                 summary:
 *                   total: 25
 *                   active: 20
 *                   inactive: 5
 *                   verified: 18
 *                 byActivity:
 *                   - status: active
 *                     count: 20
 *                   - status: inactive
 *                     count: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/institutions/types:
 *   get:
 *     summary: Institutions grouped by type
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Institution types fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Institution types fetched
 *               data:
 *                 data:
 *                   - type: general
 *                     count: 25
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/institutions/performance:
 *   get:
 *     summary: Institution performance metrics (donations received, requests created/fulfilled)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Institution performance metrics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Institution performance metrics fetched
 *               data:
 *                 data:
 *                   - name: Cairo Medical Center
 *                     email: cmc@example.com
 *                     isActive: true
 *                     donationsReceived: 18
 *                     requestsCreated: 12
 *                     fulfilledRequests: 9
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/* ══════════════════════════ REQUEST ANALYTICS ═══════════════════════════ */

/**
 * @swagger
 * /api/v1/analytics/requests:
 *   get:
 *     summary: Request analytics overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request analytics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Request analytics fetched
 *               data:
 *                 summary:
 *                   total: 80
 *                   open: 30
 *                   fulfilled: 25
 *                   partial: 15
 *                   cancelled: 5
 *                   expired: 5
 *                   fulfilledRate: "31.3%"
 *                 byStatus:
 *                   - _id: open
 *                     count: 30
 *                 byPriority:
 *                   - _id: high
 *                     count: 20
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/requests/trends:
 *   get:
 *     summary: Request count trends over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/periodParam'
 *       - $ref: '#/components/parameters/fromParam'
 *       - $ref: '#/components/parameters/toParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Request trends fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Request trends fetched
 *               data:
 *                 period: monthly
 *                 from: "2025-10-17T00:00:00.000Z"
 *                 to: "2026-04-17T00:00:00.000Z"
 *                 data:
 *                   - period: "2025-10"
 *                     count: 8
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/requests/fulfillment:
 *   get:
 *     summary: Request fulfillment rates
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request fulfillment rates fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Request fulfillment rates fetched
 *               data:
 *                 total: 80
 *                 fullyFulfilled: 25
 *                 partiallyFulfilled: 15
 *                 unfulfilled: 30
 *                 avgFulfillmentPct: 48.3
 *                 fullFulfillmentRate: 31.3
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/* ══════════════════════════ MATCHING ANALYTICS ══════════════════════════ */

/**
 * @swagger
 * /api/v1/analytics/matching:
 *   get:
 *     summary: Matching analytics overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matching analytics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Matching analytics fetched
 *               data:
 *                 total: 120
 *                 matched: 80
 *                 delivered: 45
 *                 unmatched: 40
 *                 matchRate: 66.7
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/matching/success-rate:
 *   get:
 *     summary: Match success rate (delivered vs rejected after matching)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matching success rate fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Matching success rate fetched
 *               data:
 *                 overall:
 *                   totalMatched: 80
 *                   successfullyDelivered: 45
 *                   rejectedByInstitution: 10
 *                   successRate: 56.3
 *                 byStatus:
 *                   - _id: delivered
 *                     count: 45
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/matching/efficiency:
 *   get:
 *     summary: Matching efficiency – average time from donation creation to first match
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matching efficiency metrics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Matching efficiency metrics fetched
 *               data:
 *                 efficiency:
 *                   avgHours: 36.5
 *                   minHours: 0.5
 *                   maxHours: 720.0
 *                   totalMatched: 80
 *                 distribution:
 *                   - _id: 0
 *                     count: 12
 *                   - _id: 24
 *                     count: 28
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/* ══════════════════════════ USER ANALYTICS ══════════════════════════════ */

/**
 * @swagger
 * /api/v1/analytics/users:
 *   get:
 *     summary: User analytics overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: User analytics fetched
 *               data:
 *                 summary:
 *                   total: 500
 *                   active: 460
 *                   inactive: 40
 *                   verified: 420
 *                   locked: 3
 *                 byRole:
 *                   - _id: donor
 *                     count: 450
 *                   - _id: institution
 *                     count: 25
 *                   - _id: admin
 *                     count: 24
 *                   - _id: superadmin
 *                     count: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/users/growth:
 *   get:
 *     summary: User registrations over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/periodParam'
 *       - $ref: '#/components/parameters/fromParam'
 *       - $ref: '#/components/parameters/toParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: User growth data fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: User growth data fetched
 *               data:
 *                 period: monthly
 *                 from: "2025-10-17T00:00:00.000Z"
 *                 to: "2026-04-17T00:00:00.000Z"
 *                 data:
 *                   - period: "2025-10"
 *                     total: 42
 *                     donors: 38
 *                     institutions: 4
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/v1/analytics/users/engagement:
 *   get:
 *     summary: User engagement metrics (active this week/month, never logged in)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User engagement metrics fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: User engagement metrics fetched
 *               data:
 *                 engagement:
 *                   total: 500
 *                   activeThisWeek: 120
 *                   activeThisMonth: 310
 *                   neverLoggedIn: 45
 *                 loginStats:
 *                   lastLogin: "2026-04-17T08:30:00.000Z"
 *                   firstLogin: "2024-01-05T10:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: No access token provided or token is invalid
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             status: fail
 *             message: No access token provided
 *             timestamp: "2026-04-17T12:00:00.000Z"
 *     Forbidden:
 *       description: Authenticated user does not have the required role
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             status: fail
 *             message: Access denied
 *             timestamp: "2026-04-17T12:00:00.000Z"
 */
