/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Medicine donation management
 */

/**
 * @swagger
 * /api/v1/donations:
 *   get:
 *     summary: Get all donations (Admin/Institution only)
 *     description: Retrieve a paginated list of all donations. Access is restricted to admins, superadmins, and institutions.
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Donations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DonationsListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin/Institution only)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/donations/{id}:
 *   get:
 *     summary: Get a single donation by ID (Admin/Institution only)
 *     description: Retrieve detailed information about a specific donation. Access is restricted to admins, superadmins, and institutions.
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The donation ID
 *     responses:
 *       200:
 *         description: Donation fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DonationResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin/Institution only)
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/donations:
 *   post:
 *     summary: Create a new donation (Donor only)
 *     description: Create a new medicine donation by uploading images. AI will extract data from the images.
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               quantityAmount:
 *                 type: integer
 *               quantityUnit:
 *                 type: string
 *                 enum: [box, bottle, strip, unit]
 *               batchNumber:
 *                 type: string
 *               conditionNotes:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Donation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DonationResponse'
 *       400:
 *         description: Validation error or AI extraction failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
