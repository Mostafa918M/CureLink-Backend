/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Medication request management for institutions
 */

// ─────────────────────────────────────────────────────────────
//  POST /api/v1/requests  — Create a new medication request
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/requests:
 *   post:
 *     summary: Create a medication request
 *     description: |
 *       Allows an **institution** to open a new request for a specific medicine.
 *       Fields `status`, `fulfilledQuantity`, and `matchedDonations` are
 *       controlled by the system and are stripped if provided.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRequestInput'
 *           example:
 *             medicineName: Panadol
 *             strength: 500mg
 *             dosageForm: tablet
 *             requiredQuantity:
 *               amount: 10
 *               unit: box
 *             priority: high
 *             expiresAt: "2027-06-01"
 *             notes: Needed for the pediatric ward
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestResponse'
 *       400:
 *         description: Validation error (missing fields, past expiry date, invalid enum, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingName:
 *                 summary: Missing medicine name
 *                 value:
 *                   status: fail
 *                   message: Medicine name is required
 *               pastExpiry:
 *                 summary: Expiry date in the past
 *                 value:
 *                   status: fail
 *                   message: Expiry date must be in the future
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied — institutions only
 *       500:
 *         description: Server error
 */

// ─────────────────────────────────────────────────────────────
//  GET /api/v1/requests  — List requests
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/requests:
 *   get:
 *     summary: List medication requests
 *     description: |
 *       Returns a paginated list of requests.
 *       - **Institution**: sees only its own requests
 *       - **Donor / Admin / Superadmin**: sees all requests
 *
 *       Supports filtering by `status`, `priority`, and full-text search on `medicineName`.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Results per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, partially_fulfilled, fulfilled, cancelled, expired]
 *         description: Filter by request status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: medicineName
 *         schema:
 *           type: string
 *         description: Full-text search on medicine name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: "Sort field. Prefix with `-` for descending (e.g. `-createdAt`)"
 *     responses:
 *       200:
 *         description: Requests fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestsListResponse'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */

// ─────────────────────────────────────────────────────────────
//  GET /api/v1/requests/statistics  — Aggregated statistics
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/requests/statistics:
 *   get:
 *     summary: Get request statistics
 *     description: |
 *       Returns aggregated statistics.
 *       - **Institution**: scoped to its own requests
 *       - **Admin / Superadmin**: platform-wide aggregation
 *
 *       Returns a summary with fulfilled rate, breakdown by status, and breakdown by priority.
 *
 *       > ⚠️ This route must be called before `GET /api/v1/requests/{id}` to avoid route conflicts.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestStatisticsResponse'
 *             example:
 *               status: success
 *               message: Statistics fetched
 *               data:
 *                 summary:
 *                   total: 25
 *                   open: 10
 *                   fulfilled: 8
 *                   partiallyFulfilled: 4
 *                   cancelled: 3
 *                   fulfilledRate: "32%"
 *                 byStatus:
 *                   - _id: open
 *                     count: 10
 *                   - _id: fulfilled
 *                     count: 8
 *                 byPriority:
 *                   - _id: high
 *                     count: 12
 *                   - _id: urgent
 *                     count: 5
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */

// ─────────────────────────────────────────────────────────────
//  GET /api/v1/requests/:id  — Get a single request
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/requests/{id}:
 *   get:
 *     summary: Get a single request by ID
 *     description: |
 *       Returns full details of a request including populated institution info and matched donations.
 *       - **Institution**: can only view its own requests
 *       - **Admin / Superadmin / Donor**: can view any request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the request
 *         example: 665abc123def4567890abcde
 *     responses:
 *       200:
 *         description: Request fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestResponse'
 *       400:
 *         description: Invalid request ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: fail
 *               message: Invalid request ID format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this request
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 *
 *   patch:
 *     summary: Update a medication request
 *     description: |
 *       Updates an **open** request. Only the owning institution may update.
 *       - **Blocked** if status is not `open` (e.g. already `partially_fulfilled`)
 *       - Fields `institution`, `status`, `fulfilledQuantity`, and `matchedDonations` are **read-only** and will be stripped
 *       - All body fields are optional
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRequestInput'
 *           example:
 *             priority: urgent
 *             notes: Situation escalated, very urgent now
 *             requiredQuantity:
 *               amount: 20
 *               unit: box
 *     responses:
 *       200:
 *         description: Request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestResponse'
 *       400:
 *         description: |
 *           Validation error **or** request is no longer in `open` status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notOpen:
 *                 summary: Status guard failed
 *                 value:
 *                   status: fail
 *                   message: Cannot update a request after matching has started
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this request
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Cancel a medication request
 *     description: |
 *       Soft-cancels a request by setting its status to `cancelled`.
 *       The document is **not deleted** — it is preserved for audit purposes.
 *       - Only the owning institution may cancel
 *       - Already `cancelled` or `fulfilled` requests cannot be cancelled again
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the request
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: success
 *               message: Request cancelled
 *       400:
 *         description: Request is already cancelled or fulfilled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyCancelled:
 *                 summary: Already cancelled
 *                 value:
 *                   status: fail
 *                   message: Request is already cancelled
 *               alreadyFulfilled:
 *                 summary: Already fulfilled
 *                 value:
 *                   status: fail
 *                   message: Request is already fulfilled
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to cancel this request
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */

// ─────────────────────────────────────────────────────────────
//  GET /api/v1/requests/:id/matches  — Get matched donations
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/requests/{id}/matches:
 *   get:
 *     summary: Get donations matched to a request
 *     description: |
 *       Finds **available** donations whose medicine name matches the request's `medicineName`.
 *       The matching algorithm:
 *       1. Resolves medicine IDs by regex on `name` (and `dosageForm` if specified)
 *       2. Queries donations by `medicine $in` those IDs + matching `quantity.unit`
 *
 *       Returns an empty array (not an error) when no donations match.
 *       Results are paginated.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the request
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
 *           maximum: 100
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Matches found (may be an empty list)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestMatchesResponse'
 *       400:
 *         description: Invalid request ID format
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
