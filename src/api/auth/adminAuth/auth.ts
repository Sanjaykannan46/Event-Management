import { Router } from "express";
import { checkStatus, getNewAccessTokenController, loginController, logoutController } from "./controller.js";

const adminAuthRouter = Router();

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     tags: ['AdminAuth']
 *     summary: Admin login to the system
 *     description: Authenticates a club admin using their roll number, club ID, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rollno
 *               - club_id
 *               - password
 *             properties:
 *               rollno:
 *                 type: string
 *                 description: Roll number of the admin
 *               club_id:
 *                 type: integer
 *                 description: ID of the club for which admin access is requested
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin logged in successfully
 *       400:
 *         description: Invalid request - User not found, admin not found, or user is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       401:
 *         description: Authentication failed - Wrong password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Wrong password
 *       500:
 *         description: Server error
 */

adminAuthRouter.post('/login', loginController);

/**
 * @swagger
 * /auth/admin/logout:
 *   post:
 *     tags: [AdminAuth]
 *     summary: Admin logout
 *     description: Logs out admin
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
 *                   example: "Admin logged out successfully"
 *       401:
 *         description: Invalid credentials
 */

adminAuthRouter.post('/logout', logoutController);

/**
 * @swagger
 * /auth/admin/getnewaccesstoken:
 *   get:
 *     tags: [AdminAuth]
 *     summary: Get new access token
 *     description: Generates new access and refresh tokens using the existing refresh token in cookies
 *     responses:
 *       200:
 *         description: New access token generated successfully
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
 *                   example: "Invalid token"
 */

adminAuthRouter.get('/getnewaccesstoken', getNewAccessTokenController);

/**
 * @swagger
 * /auth/admin/status:
 *   get:
 *     tags: [AdminAuth]
 *     summary: Check admin authentication status
 *     description: Verifies if the current user is authenticated as an admin using the admin access token in cookies
 *     responses:
 *       200:
 *         description: Admin is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin is authenticated
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid token
 *       403:
 *         description: User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No admin found
 *     security:
 *       - cookieAuth: []
 */

adminAuthRouter.get('/status', checkStatus);

export default adminAuthRouter;