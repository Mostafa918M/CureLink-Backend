/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The unique identifier of the user
 *         firstName:
 *           type: string
 *           description: First name of the user
 *         lastName:
 *           type: string
 *           description: Last name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the user
 *         phone:
 *           type: string
 *           description: Phone number of the user
 *         role:
 *           type: string
 *           enum: [donor, admin, superadmin, institution]
 *           default: donor
 *         isVerified:
 *           type: boolean
 *           default: false
 *
 *     RegisterInput:
 *       type: object
 *       required: [firstName, lastName, email, password, phone]
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (unique)
 *         password:
 *           type: string
 *           format: password
 *           description: User's account password
 *         phone:
 *           type: string
 *           description: User's phone number
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: User registered successfully
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     VerifyEmailInput:
 *       type: object
 *       required: [email, otp]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         otp:
 *           type: string
 *           description: 6-digit verification code sent to email
 *           example: "123456"
 *
 *     ResendVerificationInput:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *
 *     VerifyEmailResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Email verified successfully
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     Medicine:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         strength:
 *           type: string
 *         dosageForm:
 *           type: string
 *           enum: [tablet, capsule, syrup, injection, cream, drops, other]
 *         category:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *
 *     Donation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         donor:
 *           oneOf:
 *             - type: string
 *             - $ref: '#/components/schemas/User'
 *         medicine:
 *           oneOf:
 *             - type: string
 *             - $ref: '#/components/schemas/Medicine'
 *         quantity:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             unit:
 *               type: string
 *               enum: [box, bottle, strip, unit]
 *         expiryDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [pending, admin_review, available, matched, approved_by_institution, delivered, rejected, expired, cancelled]
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     DonationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Donation'
 *
 *     DonationsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             donations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 pages:
 *                   type: number
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of documents matching the filter
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *         pages:
 *           type: integer
 *           description: Total number of pages
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: fail
 *         message:
 *           type: string
 *           example: Request not found
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     MatchedDonation:
 *       type: object
 *       description: A donation that has been linked to this request
 *       properties:
 *         donation:
 *           oneOf:
 *             - type: string
 *               description: Donation ObjectId (not populated)
 *             - $ref: '#/components/schemas/Donation'
 *         matchedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the match was recorded
 *
 *     Request:
 *       type: object
 *       description: A medication request created by an institution
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: 665abc123def4567890abcde
 *         institution:
 *           oneOf:
 *             - type: string
 *               description: Institution User ObjectId
 *             - $ref: '#/components/schemas/User'
 *         medicineName:
 *           type: string
 *           description: Name of the required medicine
 *           example: Panadol
 *         strength:
 *           type: string
 *           description: Dosage strength (e.g. 500mg)
 *           example: 500mg
 *         dosageForm:
 *           type: string
 *           enum: [tablet, capsule, syrup, injection, cream, drops, other]
 *           example: tablet
 *         requiredQuantity:
 *           type: object
 *           properties:
 *             amount:
 *               type: integer
 *               minimum: 1
 *               example: 10
 *             unit:
 *               type: string
 *               enum: [box, bottle, strip, unit]
 *               example: box
 *         fulfilledQuantity:
 *           type: integer
 *           description: How many units have been fulfilled so far (system-managed)
 *           default: 0
 *           example: 3
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           example: high
 *         status:
 *           type: string
 *           enum: [open, partially_fulfilled, fulfilled, cancelled, expired]
 *           default: open
 *           example: open
 *         notes:
 *           type: string
 *           description: Optional free-text notes about the request
 *           example: Needed for the pediatric ward
 *         expiresAt:
 *           type: string
 *           format: date
 *           description: Date after which the request is considered expired
 *           example: "2027-06-01"
 *         matchedDonations:
 *           type: array
 *           description: Donations that have been linked to this request
 *           items:
 *             $ref: '#/components/schemas/MatchedDonation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateRequestInput:
 *       type: object
 *       required:
 *         - medicineName
 *         - requiredQuantity
 *         - expiresAt
 *       properties:
 *         medicineName:
 *           type: string
 *           minLength: 2
 *           description: Name of the medicine being requested
 *           example: Panadol
 *         strength:
 *           type: string
 *           description: Dosage strength (optional)
 *           example: 500mg
 *         dosageForm:
 *           type: string
 *           enum: [tablet, capsule, syrup, injection, cream, drops, other]
 *           example: tablet
 *         requiredQuantity:
 *           type: object
 *           required: [amount, unit]
 *           properties:
 *             amount:
 *               type: integer
 *               minimum: 1
 *               example: 10
 *             unit:
 *               type: string
 *               enum: [box, bottle, strip, unit]
 *               example: box
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           example: high
 *         expiresAt:
 *           type: string
 *           format: date
 *           description: Must be a future date (ISO 8601)
 *           example: "2027-06-01"
 *         notes:
 *           type: string
 *           description: Optional notes about the request
 *           example: Needed for the pediatric ward
 *
 *     UpdateRequestInput:
 *       type: object
 *       description: |
 *         All fields are optional. Fields `institution`, `status`,
 *         `fulfilledQuantity`, and `matchedDonations` are read-only and
 *         will be stripped if provided.
 *       properties:
 *         medicineName:
 *           type: string
 *           minLength: 2
 *           example: Panadol Extra
 *         strength:
 *           type: string
 *           example: 1000mg
 *         dosageForm:
 *           type: string
 *           enum: [tablet, capsule, syrup, injection, cream, drops, other]
 *         requiredQuantity:
 *           type: object
 *           properties:
 *             amount:
 *               type: integer
 *               minimum: 1
 *               example: 20
 *             unit:
 *               type: string
 *               enum: [box, bottle, strip, unit]
 *               example: box
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: urgent
 *         expiresAt:
 *           type: string
 *           format: date
 *           description: Must be a future date
 *           example: "2028-01-01"
 *         notes:
 *           type: string
 *           example: Situation escalated, very urgent now
 *
 *     RequestResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Request created
 *         data:
 *           $ref: '#/components/schemas/Request'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     RequestsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Requests fetched
 *         data:
 *           type: object
 *           properties:
 *             requests:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     RequestStatisticsResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Statistics fetched
 *         data:
 *           type: object
 *           properties:
 *             summary:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 open:
 *                   type: integer
 *                   example: 10
 *                 fulfilled:
 *                   type: integer
 *                   example: 8
 *                 partiallyFulfilled:
 *                   type: integer
 *                   example: 4
 *                 cancelled:
 *                   type: integer
 *                   example: 3
 *                 fulfilledRate:
 *                   type: string
 *                   description: Percentage of fully fulfilled requests
 *                   example: "32%"
 *             byStatus:
 *               type: array
 *               description: Count of requests grouped by status
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Status value
 *                     example: open
 *                   count:
 *                     type: integer
 *                     example: 10
 *             byPriority:
 *               type: array
 *               description: Count of requests grouped by priority
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Priority value
 *                     example: high
 *                   count:
 *                     type: integer
 *                     example: 12
 *
 *     RequestMatchesResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Matches found
 *         data:
 *           type: object
 *           properties:
 *             request:
 *               type: object
 *               description: Summary of the originating request
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 665abc123def4567890abcde
 *                 medicineName:
 *                   type: string
 *                   example: Panadol
 *                 requiredQuantity:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: integer
 *                       example: 10
 *                     unit:
 *                       type: string
 *                       example: box
 *                 fulfilledQuantity:
 *                   type: integer
 *                   example: 0
 *             donations:
 *               type: array
 *               description: Available donations whose medicine matches the request
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *
 *     Notification:
 *       type: object
 *       description: User notification object
 *       properties:
 *         _id:
 *           type: string
 *           description: Notification ID
 *         user:
 *           oneOf:
 *             - type: string
 *               description: User ObjectId
 *             - $ref: '#/components/schemas/User'
 *         title:
 *           type: string
 *           description: Notification title
 *         type:
 *           type: string
 *           description: Notification type (linked to template)
 *         message:
 *           type: string
 *           description: Notification message content
 *         isRead:
 *           type: boolean
 *           description: Whether notification is read
 *           default: false
 *         isDeleted:
 *           type: boolean
 *           description: Soft delete flag
 *           default: false
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         deletedBy:
 *           oneOf:
 *             - type: string
 *             - $ref: '#/components/schemas/User'
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     NotificationTemplate:
 *       type: object
 *       description: Template used to generate notifications
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           description: Unique notification type
 *         title:
 *           type: string
 *         message:
 *           type: string
 *           description: Template message with placeholders like {{name}}
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     NotificationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Notification fetched successfully
 *         data:
 *           $ref: '#/components/schemas/Notification'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     NotificationsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Notifications fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     UnreadCountResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Unread notifications count
 *         data:
 *           type: object
 *           properties:
 *             unreadCount:
 *               type: integer
 *               example: 5
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     DeleteNotificationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Notification deleted successfully
 *         data:
 *           $ref: '#/components/schemas/Notification'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     RestoreNotificationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Notification restored successfully
 *         data:
 *           $ref: '#/components/schemas/Notification'
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: User profile fetched successfully
 *         data:
 *           $ref: '#/components/schemas/User'
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         phone:
 *           type: string
 *           example: "01012345678"
 *
 *     UploadAvatarResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: User picture created successfully
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: https://cloudinary.com/image.jpg
 *             public_id:
 *               type: string
 *               example: user/picture/abc123
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ChangePasswordInput:
 *       type: object
 *       required: [oldPassword, newPassword]
 *       properties:
 *         oldPassword:
 *           type: string
 *           example: OldPass123
 *         newPassword:
 *           type: string
 *           example: NewPass123
 *
 *     ForgotPasswordInput:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's registered email address
 *
 *     VerifyResetOTPInput:
 *       type: object
 *       required: [email, otp]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         otp:
 *           type: string
 *           description: 6-digit password reset OTP
 *           example: "123456"
 *
 *     ResetPasswordInput:
 *       type: object
 *       required: [email, otp, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         otp:
 *           type: string
 *           description: 6-digit password reset OTP
 *           example: "123456"
 *         password:
 *           type: string
 *           format: password
 *           description: New password (min 8 characters)
 *
 *     Session:
 *       type: object
 *       description: Represents a refresh token session
 *       properties:
 *         _id:
 *           type: string
 *           description: Refresh token document ID
 *
 *         hashToken:
 *           type: string
 *           description: Hashed refresh token value
 *
 *         user:
 *           type: string
 *           description: User ID
 *
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *         createdByIp:
 *           type: string
 *           nullable: true
 *
 *         expiresAt:
 *           type: string
 *           format: date-time
 *
 *         revokedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *         revokedByIp:
 *           type: string
 *           nullable: true
 *
 *         replacedByToken:
 *           type: string
 *           nullable: true
 *
 *         isActive:
 *           type: boolean
 *
 *         isExpired:
 *           type: boolean
 *           description: Virtual field (expiresAt < now)
 *
 *         isValid:
 *           type: boolean
 *           description: Virtual field (active + not expired + not revoked)
 *
 *     SessionsResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *
 *         message:
 *           type: string
 *           example: sessions fetched successfully
 *
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Session'
 *
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     DeleteSessionsResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *
 *         message:
 *           type: string
 *           example: sessions deleted successfully
 *
 *         data:
 *           type: object
 *           properties:
 *             modifiedCount:
 *               type: integer
 *               example: 3
 *
 *         timestamp:
 *           type: string
 *           format: date-time
 */
