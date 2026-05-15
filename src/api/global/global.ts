import { Router } from "express";
import { addClubAdminController, createClubController} from "./controller.js";

const globalRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     globalAdminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for global admin authentication
 *   schemas:
 *     CreateClubDTO:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Coding Club"
 *         about:
 *           type: string
 *           example: "A club for programming enthusiasts"
 *     AddClubAdminDTO:
 *       type: object
 *       required:
 *         - rollno
 *         - club_id
 *       properties:
 *         rollno:
 *           type: string
 *           example: "23N206"
 *         club_id:
 *           type: integer
 *           example: 1
 *         role:
 *           type: string
 *           example: "President"
 */

/**
 * @swagger
 * /global/createclub:
 *   post:
 *     tags: [GlobalAdmin]
 *     summary: Create a new club
 *     description: Creates a new club in the system (Global admin only)
 *     security:
 *       - globalAdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClubDTO'
 *     responses:
 *       201:
 *         description: Club created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Club created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Coding Club"
 *                     about:
 *                       type: string
 *                       example: "A club for programming enthusiasts"
 *       400:
 *         description: Club name is required
 *       401:
 *         description: Unauthorized - Only global admins can create clubs
 *       409:
 *         description: Club with this name already exists
 *       500:
 *         description: Server error
 */
globalRouter.post('/createclub', createClubController);

/**
 * @swagger
 * /global/addadmin:
 *   post:
 *     tags: [GlobalAdmin]
 *     summary: Add a club administrator
 *     description: Assigns a user as an administrator for a specific club (Global admin only)
 *     security:
 *       - globalAdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddClubAdminDTO'
 *     responses:
 *       201:
 *         description: Club admin added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Club admin added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     club_id:
 *                       type: integer
 *                       example: 1
 *                     role:
 *                       type: string
 *                       example: "President"
 *                     is_admin:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: User ID and Club ID are required
 *       401:
 *         description: Unauthorized - Only global admins can add club admins
 *       404:
 *         description: User or club not found
 *       409:
 *         description: User is already an admin of this club
 *       500:
 *         description: Server error
 */
globalRouter.post('/addadmin', addClubAdminController);


export default globalRouter;