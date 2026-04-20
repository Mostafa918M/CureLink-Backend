/**
 * @swagger
 * tags:
 *   name: Admin Donations
 *   description: Administrative medicine donation management
 */

/**
 * @swagger
 * /api/v1/admin/donations:
 *   get:
 *     summary: List all donations
 *     description: Retrieve a paginated list of all donations with optional filters. Access restricted to admins.
 *     tags: [Admin Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: medicineId
 *         schema:
 *           type: string
 *       - in: query
 *         name: donorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/v1/admin/donations/pending:
 *   get:
 *     summary: Get pending review queue
 *     description: Retrieve donations with 'pending' or 'admin_review' status.
 *     tags: [Admin Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /api/v1/admin/donations/{id}/approve:
 *   patch:
 *     summary: Approve donation
 *     description: Mark a donation as available for institutions.
 *     tags: [Admin Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Approved
 */

/**
 * @swagger
 * /api/v1/admin/donations/{id}/reject:
 *   patch:
 *     summary: Reject donation
 *     description: Mark a donation as rejected. Reason in notes is mandatory.
 *     tags: [Admin Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rejected
 */

/**
 * @swagger
 * /api/v1/admin/donations/{id}/status:
 *   patch:
 *     summary: Change donation status
 *     description: Manually change the status of a donation.
 *     tags: [Admin Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /api/v1/admin/donations/{id}:
 *   delete:
 *     summary: Delete donation
 *     description: Permanently remove a donation record.
 *     tags: [Admin Donations]
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
 *         description: Deleted
 */

/**
 * @swagger
 * /api/v1/admin/donations/expiring:
 *   get:
 *     summary: Get donations expiring soon
 *     description: Retrieve donations approaching their expiry date.
 *     tags: [Admin Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /api/v1/admin/donations/export:
 *   post:
 *     summary: Export donations data
 *     description: Generate and download a CSV file of donation records.
 *     tags: [Admin Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: CSV file content
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
