/**
 * @swagger
 * /api/v1/search/donations:
 *   get:
 *     summary: Search approved and available donations
 *     description: |
 *       Allows **institutions, admins** and **super admin** to search for donations using medicine name,
 *       generic name, or manufacturer.
 *
 *       - Supports **partial search (regex)**
 *       - Returns only donations with status: `approved` or `available`
 *       - Excludes soft-deleted donations
 *       - Uses medicine collection as a search index layer
 *
 *       If no search query is provided, it returns all approved donations.
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search keyword (medicine name, generic name, or manufacturer)
 *         example: panadol
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Donations fetched successfully
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
 *                   example: Approved donations fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     donations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied (institution or admin only)
 *       500:
 *         description: Server error
 */