/**
 * @swagger
 * tags:
 *   name: Institutions
 *   description: Public and institution-specific routes
 */

/**
 * @swagger
 * /api/v1/institutions:
 *   get:
 *     summary: Get verified institutions for public
 *     description: Retrieve a list of verified institutions.
 *     tags: [Institutions]
 *     responses:
 *       200:
 *         description: Institutions fetched successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/institutions/{id}:
 *   get:
 *     summary: Get institution details for public
 *     description: Retrieve details of a specific verified institution.
 *     tags: [Institutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The institution ID
 *     responses:
 *       200:
 *         description: Institution fetched successfully
 *       404:
 *         description: Institution not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/institutions/register:
 *   post:
 *     summary: Register institution profile
 *     description: Setup institution profile with details and logo. Required role is 'institution'.
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *               institutionName:
 *                 type: string
 *               address:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Institution registered successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/institutions/profile:
 *   get:
 *     summary: Get own institution profile
 *     description: Retrieve the currently logged-in institution's profile.
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update institution profile
 *     description: Update specific details of the institution profile including logo.
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *               institutionName:
 *                 type: string
 *               address:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/institutions/documents:
 *   get:
 *     summary: Get institution verification documents
 *     description: Retrieve documents uploaded for verification.
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 *   post:
 *     summary: Upload verification documents
 *     description: Upload documents required for institution verification.
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
