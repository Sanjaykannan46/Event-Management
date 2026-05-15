import { Router } from "express";
import { signupController, loginController, logoutController, getNewAccessTokenController, checkStatus } from "./controller.js";

const globalAuthRouter = Router();

/**
 * @swagger
 * /auth/global/signup:
 *   post:
 *     tags: [GlobalAdmin]
 *     summary: Register a new global admin
 *     description: Creates a new global admin account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       201:
 *         description: Global admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Global admin created successfully"
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User not found
 *       409:
 *         description: User is already a global admin
 *       500:
 *         description: Internal server error
 */
globalAuthRouter.post('/signup', signupController);

/**
 * @swagger
 * /auth/global/login:
 *   post:
 *     tags: [GlobalAdmin]
 *     summary: Global admin login
 *     description: Authenticates a global admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: Global admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Global admin logged in successfully"
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid password
 *       403:
 *         description: User is not a global admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
globalAuthRouter.post('/login', loginController);

/**
 * @swagger
 * /auth/global/logout:
 *   post:
 *     tags: [GlobalAdmin]
 *     summary: Global admin logout
 *     description: Logs out a global admin by clearing their access and refresh tokens
 *     responses:
 *       200:
 *         description: Global admin logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Global admin logged out successfully"
 */
globalAuthRouter.post('/logout', logoutController);

/**
 * @swagger
 * /auth/global/getnewaccesstoken:
 *   get:
 *     tags: [GlobalAdmin]
 *     summary: Get new access token for global admin
 *     description: Generates a new access token using the existing refresh token
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "New access token generated"
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Invalid token - not a global admin token
 */
globalAuthRouter.get('/getnewaccesstoken', getNewAccessTokenController);

/**
 *
 * @swagger
 * /auth/global/status:
 *   get:
 *     tags: [GlobalAdmin]
 *     summary: Check global admin authentication status
 *     description: Verifies if the global admin is authenticated by validating the access token
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
 *         description: Invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid token
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No admin found
 */

globalAuthRouter.get('/status', checkStatus);

export default globalAuthRouter;