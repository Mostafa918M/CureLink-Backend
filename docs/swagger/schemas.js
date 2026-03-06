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
 */
