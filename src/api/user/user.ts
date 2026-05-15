/**
 * @swagger
 * /user/fetchTeamMembersOfEvent:
 *   post:
 *     tags: [User]
 *     summary: Fetch team members of a particular event for the current user
 *     description: Returns the team ID and members for the current user and event. If not registered, returns a not registered message.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FetchTeamMembersRequest'
 *     responses:
 *       200:
 *         description: Team members fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FetchTeamMembersResponse'
 *       404:
 *         description: Not registered
 *       400:
 *         description: event_id is required
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     FetchTeamMembersRequest:
 *       type: object
 *       required:
 *         - event_id
 *       properties:
 *         event_id:
 *           type: integer
 *           description: The event ID
 *           example: 12
 *     TeamMemberInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: johndoe@example.com
 *         rollno:
 *           type: string
 *           example: 22CSR045
 *         department:
 *           type: string
 *           example: CSE - AIML
 *         yearofstudy:
 *           type: integer
 *           example: 2
 *     FetchTeamMembersResponse:
 *       type: object
 *       properties:
 *         team_id:
 *           type: integer
 *           example: 5
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TeamMemberInfo'
 */

/**
 * @swagger
 * /user/removeTeamMember:
 *   post:
 *     tags: [User]
 *     summary: Remove a team member from a team for a given event
 *     description: Removes a team member by user ID and event ID. Only allowed for authorized users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveTeamMemberRequest'
 *     responses:
 *       200:
 *         description: Team member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoveTeamMemberResponse'
 *       404:
 *         description: Team member not found
 *       400:
 *         description: event_id and user_id are required
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     RemoveTeamMemberRequest:
 *       type: object
 *       required:
 *         - event_id
 *         - user_id
 *       properties:
 *         event_id:
 *           type: integer
 *           description: The event ID
 *           example: 12
 *         user_id:
 *           type: integer
 *           description: The user ID to remove
 *           example: 101
 *     RemoveTeamMemberResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Team member removed successfully
 */

/**
 * @swagger
 * /user/getUserIdByRollNo:
 *   post:
 *     tags: [User]
 *     summary: Get user ID by roll number
 *     description: Returns the user ID for a given roll number if the user exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetUserIdByRollNoRequest'
 *     responses:
 *       200:
 *         description: User ID found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUserIdByRollNoResponse'
 *       400:
 *         description: rollno is required and must be a string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     GetUserIdByRollNoRequest:
 *       type: object
 *       required:
 *         - rollno
 *       properties:
 *         rollno:
 *           type: string
 *           description: The roll number of the user
 *           example: 22CSR045
 *     GetUserIdByRollNoResponse:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The user ID
 *           example: 101
 */
import { Router } from 'express';
import {
    acceptTeamInviteController,
    feedbackController,
    rejectTeamInviteController,
    fetchMembersController,
    RegisterController,
    fetchInvitations,
    fetchProfile,
    getPastEventsController,
    getOngoingEventsController,
    sendTeamInvitation,
    getUpcomingEventsController,
    getRegisteredEvents,
    updateProfile,
    getUserIdByRollNoController,
    fetchTeamMembersOfEventController,
    removeTeamMemberController
} from './controller.js';
import { userAuthMiddleware } from '../../middleware/authMiddleware.js';


const userRouter = Router();
userRouter.post('/register', userAuthMiddleware, RegisterController);
userRouter.post('/sendTeamInvitaion',userAuthMiddleware, sendTeamInvitation);
userRouter.post('/acceptTeamInvite', userAuthMiddleware, acceptTeamInviteController);
userRouter.get('/membershipDetails', userAuthMiddleware, fetchMembersController);
userRouter.post('/rejectTeamInvite', userAuthMiddleware, rejectTeamInviteController);
userRouter.get('/fetch/invitations', userAuthMiddleware, fetchInvitations);
userRouter.get('/fetch/profile', userAuthMiddleware, fetchProfile);
userRouter.post('/update/profile', userAuthMiddleware, updateProfile);
userRouter.get('/registeredevents',userAuthMiddleware, getRegisteredEvents)
userRouter.post('/feedback', userAuthMiddleware, feedbackController);

// Route to get user ID by roll number
userRouter.post('/getUserIdByRollNo', userAuthMiddleware, getUserIdByRollNoController);

// Route to fetch team members of a particular event for the current user
userRouter.post('/fetchTeamMembersOfEvent', userAuthMiddleware, fetchTeamMembersOfEventController);

// Route to remove a team member by user ID and event ID
userRouter.post('/removeTeamMember', userAuthMiddleware, removeTeamMemberController);

// Removed '/events' POST route that was using fetchAllEventsController

// Specialized event routes
userRouter.get('/events/past', getPastEventsController);
userRouter.get('/events/ongoing', getOngoingEventsController);
userRouter.get('/events/upcoming', getUpcomingEventsController);

export default userRouter;


/**
 * @swagger
 * /user/register:
 *   post:
 *     tags: [User]
 *     summary: Register for an event
 *     description: Registers the authenticated user for an event. If the event is a solo event, the team name is automatically set to the user's roll number. Otherwise, the user must provide a team name.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventRegistration'
 *     responses:
 *       201:
 *         description: Event Registration Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event Registration Successful
 *       400:
 *         description: User roll number is null in database
 *       404:
 *         description: Event or User not found
 *       500:
 *         description: Failed to register for event
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EventRegistration:
 *       type: object
 *       required:
 *         - event_id
 *         - teamName
 *       properties:
 *         event_id:
 *           type: integer
 *           description: ID of the event
 *           example: 12
 *         teamName:
 *           type: string
 *           description: Name of the team (ignored for solo events)
 *           example: "Team Debuggers"
 */


/**
 * @swagger
 * /user/acceptTeamInvite:
 *   post:
 *     tags: [User]
 *     summary: Accept a team invitation
 *     description: Allows a user to accept a team invitation for a specific event. If the user is already in a team, their team will be updated. Invitation will be deleted after acceptance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamInvite'
 *     responses:
 *       200:
 *         description: Team invite accepted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team invite accepted.
 *       400:
 *         description: Required fields missing or team is already full
 *       404:
 *         description: Event, Team, or Invitation not found
 *       500:
 *         description: Internal server error while accepting team invite
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TeamInvite:
 *       type: object
 *       required:
 *         - from_team_id
 *         - to_user_id
 *         - event_id
 *       properties:
 *         from_team_id:
 *           type: integer
 *           description: ID of the team sending the invite
 *           example: 25
 *         to_user_id:
 *           type: integer
 *           description: ID of the user receiving the invite
 *           example: 105
 *         event_id:
 *           type: integer
 *           description: ID of the event
 *           example: 7
 */



/**
 * @swagger
 * /user/membershipDetails:
 *   get:
 *     tags: [User]
 *     summary: Get membership details of a user
 *     description: Fetches all the clubs a user is a member of, along with the user's role in each club.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 101
 *     responses:
 *       200:
 *         description: Membership details fetched successfully or no clubs found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched club members
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MembershipDetails'
 *       400:
 *         description: Requires user_id in the request body
 *       500:
 *         description: Internal server error while fetching membership details
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MembershipDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID of the club
 *           example: 3
 *         role:
 *           type: string
 *           description: Role of the user in the club (nullable)
 *           example: "President"
 *         name:
 *           type: string
 *           description: Name of the club
 *           example: "Coding Club"
 */

/**
 * @swagger
 * /user/rejectTeamInvite:
 *   post:
 *     tags: [User]
 *     summary: Reject a team invitation
 *     description: Rejects a team invitation for a specific event by deleting the invitation record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamInvite'
 *     responses:
 *       200:
 *         description: Team invite rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team invite rejected.
 *       400:
 *         description: Required fields missing (from_team_id, to_user_id, and event_id)
 *       404:
 *         description: Team invite not found
 *       500:
 *         description: Internal server error while rejecting team invite
 */

/**
 * @swagger
 * /user/fetch/invitations:
 *   get:
 *     tags: [User]
 *     summary: Fetch all invitations received by the logged-in user
 *     description: Retrieves a list of team invitations sent to the current user, including event name, inviter name, and team name.
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invitations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvitationDetails'
 *       500:
 *         description: Internal server error while fetching invitations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InvitationDetails:
 *       type: object
 *       properties:
 *         event_id:
 *           type: integer
 *           description: ID of the event
 *           example: 5
 *         event_name:
 *           type: string
 *           description: Name of the event
 *           example: Code Carnival
 *         from_user_name:
 *           type: string
 *           description: Name of the user who sent the invitation
 *           example: Alice Johnson
 *         teamName:
 *           type: string
 *           description: Name of the team that sent the invitation
 *           example: Debug Ninjas
 */

/**
 * @swagger
 * /user/fetch/profile:
 *   get:
 *     tags: [User]
 *     summary: Fetch profile of the logged-in user
 *     description: Retrieves the complete profile of the currently authenticated user.
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile Fetched successfully
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Error while fetching user profile
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         rollno:
 *           type: string
 *           example: 22CSR045
 *         department:
 *           type: string
 *           example: CSE - AIML
 *         email:
 *           type: string
 *           example: johndoe@example.com
 *         phoneno:
 *           type: integer
 *           example: 9876543210
 *         yearofstudy:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /user/feedback:
 *   post:
 *     tags: [User]
 *     summary: Submit feedback for an event
 *     description: Allows a user to submit textual feedback and a rating for a specific event.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackInput'
 *     responses:
 *       201:
 *         description: Feedback saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback saved successfully
 *       500:
 *         description: Error while saving feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FeedbackInput:
 *       type: object
 *       required:
 *         - event_id
 *         - feedback
 *         - rating
 *       properties:
 *         event_id:
 *           type: integer
 *           example: 101
 *         feedback:
 *           type: string
 *           example: The event was well organized and engaging.
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *           example: 4.5
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EventListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 42
 *         name:
 *           type: string
 *           example: Code Carnival
 *         about:
 *           type: string
 *           example: A 24-hour coding competition
 *         date:
 *           type: string
 *           format: date
 *           example: 2025-05-15
 *         venue:
 *           type: string
 *           example: Main Auditorium
 *         event_type:
 *           type: string
 *           example: Technical
 *         event_category:
 *           type: string
 *           example: Team
 *         min_no_member:
 *           type: integer
 *           example: 2
 *         max_no_member:
 *           type: integer
 *           example: 4
 *         club_name:
 *           type: string
 *           example: Coding Club
 *         status:
 *           type: string
 *           enum: [past, ongoing, upcoming]
 *           example: upcoming
 */

/**
 * @swagger
 * /user/events/past:
 *   get:
 *     tags: [User]
 *     summary: Fetch all past events
 *     description: Retrieves all events with dates before the current date, sorted by most recent first.
 *     responses:
 *       200:
 *         description: Past events fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Past events fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EventListItem'
 *       500:
 *         description: Error while fetching past events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching past events
 */

/**
 * @swagger
 * /user/events/ongoing:
 *   get:
 *     tags: [User]
 *     summary: Fetch all ongoing events
 *     description: Retrieves all events happening on the current date, sorted chronologically.
 *     responses:
 *       200:
 *         description: Ongoing events fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ongoing events fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EventListItem'
 *       500:
 *         description: Error while fetching ongoing events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching ongoing events
 */

/**
 * @swagger
 * /user/events/upcoming:
 *   get:
 *     tags: [User]
 *     summary: Fetch all upcoming events
 *     description: Retrieves all events with dates after the current date, sorted chronologically.
 *     responses:
 *       200:
 *         description: Upcoming events fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upcoming events fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EventListItem'
 *       500:
 *         description: Error while fetching upcoming events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching upcoming events
 */


/**
 * @swagger
 * /user/sendTeamInvitaion:
 *   post:
 *     tags: [User]
 *     summary: Send a team invitation
 *     description: Allows a team member to invite another user to join their team for a specific event.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from_team_id
 *               - to_user_id
 *               - event_id
 *             properties:
 *               from_team_id:
 *                 type: integer
 *                 example: 12
 *               to_user_id:
 *                 type: integer
 *                 example: 45
 *               event_id:
 *                 type: integer
 *                 example: 8
 *     responses:
 *       201:
 *         description: Team invitation has been sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team invitation has been sent
 *       400:
 *         description: Missing details, unauthorized team access, or team is full
 *       404:
 *         description: Event, Team, or User not found
 *       500:
 *         description: Error has occurred while sending team invitation
 */

/**
 * @swagger
 * /user/registeredevents:
 *   get:
 *     tags: [User]
 *     summary: Get all events the user has registered for
 *     description: Fetches all the events in which the authenticated user is registered along with their team details and members.
 *     responses:
 *       200:
 *         description: Registered Events fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registered Events fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team_id:
 *                         type: integer
 *                         example: 2
 *                       team_name:
 *                         type: string
 *                         example: Team Alpha
 *                       event:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           name:
 *                             type: string
 *                             example: Innovation Expo
 *                           about:
 *                             type: string
 *                             example: A showcase of student projects and innovations.
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-05-29T00:00:00.000Z
 *                           event_type:
 *                             type: string
 *                             example: Exhibition
 *                           venue:
 *                             type: string
 *                             example: Main Hall
 *                           event_category:
 *                             type: string
 *                             example: Technical
 *                           chief_guest:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           max_no_member:
 *                             type: integer
 *                             example: 5
 *                           min_no_member:
 *                             type: integer
 *                             example: 2
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 101
 *                             name:
 *                               type: string
 *                               example: Student One
 *                             email:
 *                               type: string
 *                               format: email
 *                               example: student1@example.com
 *                             rollno:
 *                               type: string
 *                               example: 20CS001
 *                             department:
 *                               type: string
 *                               example: Computer Science
 *                             yearofstudy:
 *                               type: integer
 *                               example: 2
 *       500:
 *         description: Error fetching registered events
 */
