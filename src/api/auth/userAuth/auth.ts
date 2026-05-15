import { Router} from 'express';
import { loginController,
    signupController,
    logoutController,
    generateSecurityCodeController,
    verifySecurityCodeController,
    resetpasswordController,
    getNewAccessTokenController,
    generateEmailCodeController,
    checkStatus
} from './controller.js';

import { userAuthMiddleware } from '../../../middleware/authMiddleware.js';

const userAuthRouter = Router();

/**
 * @swagger
 * /auth/user/signup:
 *   post:
 *     tags: [UserAuth]
 *     summary: Register a new user
 *     description: Creates a new user account after verifying the email code sent to the institutional email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rollno
 *               - password
 *               - department
 *               - phoneno
 *               - yearofstudy
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "johndoe"
 *               rollno:
 *                 type: string
 *                 example: "23N206"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *               department:
 *                 type: string
 *                 example: "CSE AI ML"
 *               phoneno:
 *                 type: string
 *                 example: "1234567890"
 *               yearofstudy:
 *                 type: integer
 *                 example: 2
 *               code:
 *                 type: string
 *                 description: Email verification code sent to institutional email
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: User signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User signed up successfully"
 *       400:
 *         description: Bad request (missing fields, invalid phone, or code mismatch)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Require all fields"
 *       409:
 *         description: Conflict (user or phone already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already exists"
 *       410:
 *         description: Email verification code expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verification code expired"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
userAuthRouter.post('/signup', signupController);

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     tags: [UserAuth]
 *     summary: User login
 *     description: Logs in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollno:
 *                 type: string
 *                 example: "23N206"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully"
 *       401:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User does not exists"
 */
userAuthRouter.post('/login', loginController);

/**
 * @swagger
 * /auth/user/logout:
 *   post:
 *     tags: [UserAuth]
 *     summary: User logout
 *     description: Logs out a user
 *
 *     responses:
 *       200:
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mesage:
 *                   type: string
 *                   example: "User logged out successfully"
 *       401:
 *         description: Invalid credentials
 */

userAuthRouter.post('/logout', logoutController);

/**
 * @swagger
 * /auth/user/generatecode:
 *   post:
 *     tags: [UserAuth]
 *     summary: Generate security code
 *     description: Generates a security code for password reset and sends it to user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollno:
 *                 type: string
 *                 example: "23N206"
 *     responses:
 *       200:
 *         description: Security code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Security Code Created"
 *       401:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User does not exist"
 *       500:
 *         description: Server error
 */
userAuthRouter.post('/generatecode', generateSecurityCodeController);

/**
 * @swagger
 * /auth/user/verifycode:
 *   post:
 *     tags: [UserAuth]
 *     summary: Verify security code
 *     description: Verifies the security code provided by the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollno:
 *                 type: string
 *                 example: "23N206"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Security code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Security Codes matched"
 *                 token:
 *                   type: string
 *                   example: "rhnhflndopnboje5oiuoeirwnneoihgo"
 *       400:
 *         description: Security code doesn't match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Security codes not matched"
 *       401:
 *         description: User or security code not found
 */
userAuthRouter.post('/verifycode', verifySecurityCodeController);

/**
 * @swagger
 * /auth/user/resetpassword:
 *   post:
 *     tags: [UserAuth]
 *     summary: Reset user password
 *     description: Resets the password for a user after verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollno:
 *                 type: string
 *                 example: "23N206"
 *               password:
 *                 type: string
 *                 example: "newSecurePassword"
 *               token:
 *                 type: string
 *                 example: "rhnhflndopnboje5oiuoeirwnneoihgo"
 *
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       401:
 *         description: User doesn't exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User does not exists"
 *       500:
 *         description: Server error
 */
userAuthRouter.post('/resetpassword', resetpasswordController);

/**
 * @swagger
 * /auth/user/getnewaccesstoken:
 *   get:
 *     tags: [UserAuth]
 *     summary: Get new access token
 *     description: Generates a new access token and refresh token using the existing refresh token in cookies
 *     responses:
 *       200:
 *         description: New tokens generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "New access token generated"
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired refresh token"
 */

userAuthRouter.get('/getnewaccesstoken', getNewAccessTokenController);

/**
 * @swagger
 * /auth/user/generateemailcode:
 *   post:
 *     tags: [UserAuth]
 *     summary: Generate email verification code
 *     description: Generates and sends an email verification code to the user's institutional email for signup verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rollno:
 *                 type: string
 *                 example: "23N206"
 *     responses:
 *       201:
 *         description: Email verification code created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verification code created"
 *       400:
 *         description: Roll no required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Roll no required"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already exists"
 *       500:
 *         description: Server error
 */
userAuthRouter.post('/generateemailcode', generateEmailCodeController);
userAuthRouter.get('/status', userAuthMiddleware,checkStatus);
export default userAuthRouter;
