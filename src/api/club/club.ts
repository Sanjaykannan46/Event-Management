import { Router } from "express";
import { getClubs } from "./controller.js";

const club_router = Router();

/**
 * @swagger
 * /club/getclubs:
 *   get:
 *     tags: [Club]
 *     summary: Get all clubs
 *     description: Retrieves a list of all clubs with their IDs and names
 *     responses:
 *       200:
 *         description: Successfully retrieved clubs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Club data fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *       301:
 *         description: No clubs found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No clubs found!
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

club_router.get("/getclubs", getClubs);

export default club_router;