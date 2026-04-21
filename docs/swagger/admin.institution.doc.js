/**
 * @swagger
 * tags:
 *   name: Admin-Institutions
 *   description: Institution management by admins
 */

/**
 * @swagger
 * /api/v1/admin/institutions:
 *   get:
 *     summary: Get all institutions
 *     description: Retrieve a list of all institutions. Access restricted to superadmin.
 *     tags: [Admin-Institutions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Institutions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/admin/institutions/pending:
 *   get:
 *     summary: Get pending institutions
 *     description: Retrieve a list of institutions pending verification.
 *     tags: [Admin-Institutions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending institutions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/admin/institutions/{id}:
 *   get:
 *     summary: Get institution details
 *     description: Retrieve detailed information about a specific institution.
 *     tags: [Admin-Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The institution ID
 *     responses:
 *       200:
 *         description: Institution details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Institution not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/admin/institutions/{id}/verify:
 *   patch:
 *     summary: Verify an institution
 *     description: Mark an institution as verified.
 *     tags: [Admin-Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The institution ID
 *     responses:
 *       200:
 *         description: Institution verified successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Institution not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/admin/institutions/{id}/reject:
 *   patch:
 *     summary: Reject an institution
 *     description: Reject an institution's verification request.
 *     tags: [Admin-Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The institution ID
 *     responses:
 *       200:
 *         description: Institution rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Institution not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/admin/institutions/documents/{insId}:
 *   get:
 *     summary: Get institution documents (Admin)
 *     description: Retrieve all documents for a specific institution. Accessible only by admin and superadmin.
 *     tags: [Admin-Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: insId
 *         required: true
 *         schema:
 *           type: string
 *         description: The institution ID
 *     responses:
 *       200:
 *         description: Institution documents fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Institution documents fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     institutionName:
 *                       type: string
 *                     institutionDocs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           file:
 *                             type: string
 *                           type:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     allIsUploaded:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Institution or documents not found
 *       500:
 *         description: Server error
 */
