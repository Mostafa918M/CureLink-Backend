/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications
 *     description: Retrieve a paginated list of user's notifications.
 *     tags: [Notifications]
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
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Get single notification
 *     description: Retrieve a specific notification by ID.
 *     tags: [Notifications]
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
 *         description: Notification fetched successfully
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Mark a single notification as read.
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Mark all user notifications as read.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     description: Retrieve the count of unread notifications.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications count
 */

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Soft delete a notification (Admin only).
 *     tags: [Notifications]
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
 *         description: Notification deleted successfully
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/v1/notifications/{userID}:
 *   delete:
 *     summary: Delete all notifications for a user
 *     description: Soft delete all notifications for a specific user (Admin only).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications deleted successfully
 */

/**
 * @swagger
 * /api/v1/notifications/deleted:
 *   get:
 *     summary: Get deleted notifications
 *     description: Retrieve all deleted notifications (Admin only).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted notifications fetched successfully
 */

/**
 * @swagger
 * /api/v1/notifications/restore/{id}:
 *   patch:
 *     summary: Restore notification
 *     description: Restore a deleted notification (Admin/SuperAdmin).
 *     tags: [Notifications]
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
 *         description: Notification restored successfully
 *       404:
 *         description: Notification not found
 */