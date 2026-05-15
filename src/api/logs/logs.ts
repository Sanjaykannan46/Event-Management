import express from 'express';
import { getAllLogs, getLogsByFile } from './controller.js';

const router = express.Router();

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get all logs from all log files
 *     description: Returns logs from all files with pagination and filtering
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs per page (default 100)
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter logs by level (info, error, warn, etc.)
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', getAllLogs);

/**
 * @swagger
 * /logs/{filename}:
 *   get:
 *     summary: Get logs from a specific file
 *     description: Returns logs from a specific file with pagination
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Log filename (e.g., all.log, errors.log)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs per page (default 100)
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *       404:
 *         description: Log file not found
 *       500:
 *         description: Server error
 */
router.get('/:filename', getLogsByFile);

export default router;