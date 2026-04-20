/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User profile management (view, update, avatar, password, sessions)
 */

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the currently authenticated user's profile.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     summary: Update user profile
 *     description: Update user email or phone (or avatar if provided).
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: No valid fields provided for update
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/upload-avatar:
 *   post:
 *     summary: Upload profile picture
 *     description: Upload or replace user avatar image.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User picture created successfully
 *       400:
 *         description: No file uploaded
 */

/**
 * @swagger
 * /api/v1/users/avatar:
 *   delete:
 *     summary: Delete profile picture
 *     description: Remove user's avatar image.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User picture deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/change-password:
 *   patch:
 *     summary: Change password
 *     description: Change current user password and revoke all active sessions.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "OldPass123"
 *               newPassword:
 *                 type: string
 *                 example: "NewPass123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Wrong password
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: Retrieve all active login sessions for current user.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions fetched successfully
 *       404:
 *         description: Session not found
 */

/**
 * @swagger
 * /api/v1/users/sessions/{id}:
 *   delete:
 *     summary: Revoke specific session
 *     description: Delete a single active session by ID.
 *     tags: [User Profile]
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
 *         description: Session deleted successfully
 *       404:
 *         description: Session not found
 */

/**
 * @swagger
 * /api/v1/users/sessions:
 *   delete:
 *     summary: Revoke all sessions
 *     description: Logout user from all devices by revoking all sessions.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions deleted successfully
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
 *                   example: sessions deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 */