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
 *     summary: Get only approved donations (Institution)
 *     description: Retrieve a paginated list of all approved donations and show it in browse page. Access is restricted to institutions,admin and super admin.

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

/**
 * @swagger
 * /api/v1/donations/{id}:
 *   patch:
 *     summary: Update a donation by ID
 *     description: Update donation details. Upload images if required.
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
 *     requestBody:
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
 *               conditionNotes:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Donation updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a donation by ID
 *     description: Remove a specific donation.
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
 *         description: Donation deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/donations/my-donations:
 *   get:
 *     summary: Get the authenticated donor's own donations
 *     description: >
 *       Returns a paginated list of all donations submitted by the currently
 *       authenticated donor. Supports optional filtering by donation status.
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, delivered, cancelled]
 *         description: Filter donations by status
 *     responses:
 *       200:
 *         description: Donor's donations fetched successfully
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
 *                   example: Your donations fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     donations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Donation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 1
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Server error
 */
