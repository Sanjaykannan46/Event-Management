import { Router} from 'express';

import {updateEventcontroller,AddingWinnerController,removeWinnerController, getEventDetails, getEventPoster, getAllRegistrations,getWinners,getFeedback} from './controller.js';
import { adminAuthMiddleware } from '../../middleware/authMiddleware.js';
const eventRouter = Router();



eventRouter.post('/addWinners', adminAuthMiddleware, AddingWinnerController);
eventRouter.post('/removeWinners', adminAuthMiddleware, removeWinnerController);
eventRouter.get('/eventdetails',getEventDetails);
eventRouter.get('/eventposter', getEventPoster);
eventRouter.get('/allregistration/:event_id',  adminAuthMiddleware, getAllRegistrations);

eventRouter.get('/winners/:event_id', adminAuthMiddleware, getWinners)
eventRouter.get('/feedback/:event_id', adminAuthMiddleware, getFeedback)
eventRouter.put('/:id', adminAuthMiddleware, updateEventcontroller);
export default eventRouter;


/**
 * @swagger
 * /addWinners:
 *   post:
 *     summary: Add a winning team for an event
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *               - team_id
 *               - position
 *             properties:
 *               event_id:
 *                 type: integer
 *                 example: 5
 *               team_id:
 *                 type: integer
 *                 example: 3
 *               position:
 *                 type: integer
 *                 description: Position secured (e.g. 1 for first place)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Winners added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Winners added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     event_id:
 *                       type: integer
 *                     team_id:
 *                       type: integer
 *                     position:
 *                       type: integer
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Requires all fields
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /removeWinner:
 *   post:
 *     summary: Remove a winner from a specific position in an event
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *               - position
 *             properties:
 *               event_id:
 *                 type: integer
 *                 example: 5
 *               position:
 *                 type: integer
 *                 description: Position to remove (e.g. 1 for first place)
 *                 example: 1
 *     responses:
 *       204:
 *         description: Winner deleted successfully
 *       400:
 *         description: Missing some request fields or position already empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The position is already empty
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /updateEvent/{id}:
 *   patch:
 *     summary: Update an existing event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hackathon 2025
 *               about:
 *                 type: string
 *                 example: A national-level 24-hour hackathon.
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-06-15T09:00:00Z
 *               event_type:
 *                 type: string
 *                 example: Technical
 *               event_category:
 *                 type: string
 *                 example: Team
 *               min_no_member:
 *                 type: integer
 *                 example: 2
 *               max_no_member:
 *                 type: integer
 *                 example: 5
 *               venue:
 *                 type: string
 *                 example: Main Auditorium
 *     responses:
 *       201:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event Updated successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to update event
 */

/**
 * @swagger
 * /event/eventdetails:
 *   get:
 *     summary: Get detailed information of a specific event
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to fetch
 *     responses:
 *       200:
 *         description: Event details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 venue:
 *                   type: string
 *                 event_type:
 *                   type: string
 *                 event_category:
 *                   type: string
 *                 about:
 *                   type: string
 *                 chief_guest:
 *                   type: string
 *                 tot_amt_allot_su:
 *                   type: number
 *                 tot_amt_spt_dor:
 *                   type: number
 *                 exp_expense:
 *                   type: number
 *                 exp_no_aud:
 *                   type: number
 *                 faculty_obs_dept:
 *                   type: string
 *                 faculty_obs_desig:
 *                   type: string
 *                 min_no_member:
 *                   type: integer
 *                 max_no_member:
 *                   type: integer
 *                 eventConvenors:
 *                   type: array
 *                   items:
 *                     type: string
 *       301:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /event/eventposter:
 *   get:
 *     summary: Get the poster image for a specific event
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to fetch the poster for
 *     responses:
 *       200:
 *         description: Event poster image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Event not found or poster not available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No poster available for this event
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issue in fetching event poster
 */

/**
 * @swagger
 * /event/allregistration:
 *   get:
 *     summary: Get all registrations for a specific event
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to fetch registrations for
 *     responses:
 *       200:
 *         description: Event registrations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched event registrations
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team_name:
 *                         type: string
 *                         example: Team Innovators
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: John Doe
 *                             rollno:
 *                               type: string
 *                               example: B190632CS
 *                             department:
 *                               type: string
 *                               example: CSE
 *                             yearofstudy:
 *                               type: integer
 *                               example: 3
 *       301:
 *         description: No registrations found for this event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No registrations for this event
 *       400:
 *         description: Invalid event ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid Event Id
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issue in fetching event registrations
 */
