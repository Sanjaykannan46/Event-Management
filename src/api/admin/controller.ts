import { Request,Response } from "express";
import prisma from '../../prisma.js';
import fs from 'fs-extra';
import path from 'path';
import {
    Attendance,
    CreateEventDTO,
    PastEventData,
    PastEventsResponse,
    PrismaEvent,
    ClubMembers,
    EventDetailsResponse,
    ClubMemberDTO,
    GetClubMembersResponse,
    RemoveClubMemberResponse,
    UpdateEventPosterResponse
} from "./types.js";

const putAttendance = async (req:Request,res:Response) : Promise<void>=>{
    try{
        const attendance : Attendance = req.body;
        if (!attendance.event_id || !attendance.user_id || attendance.is_present === undefined) {
            res.status(400).json({
                message: "Required fields missing: event_id, user_id, and is_present are required"
            });
            return;
        }
        /* Prform validation*/
        const updatedAttendance = await prisma.teammembers.updateMany({
            where:{
                event_id: attendance.event_id,
                user_id: attendance.user_id
            },
            data:{
                is_present: attendance.is_present
            }
        })

        if (updatedAttendance.count==0){
            res.status(404).json({
                message : "No record found for matching event_id and user_id"
            });
            return;
        }
        res.status(200).json({
            message: "Attendance updated successfully for the given user_id and event_id"
        })
    }catch(error){
        res.status(500).json({
            message : "Internal server error while updating attendance",
            error : error
        });
    }
}

const createEventController = async (req: Request, res: Response): Promise<void> => {
    try {
        const EventDetails: CreateEventDTO = {
            name: req.body.name,
            about: req.body.about,
            date: req.body.date,
            event_type: req.body.event_type,
            event_category: req.body.event_category,
            min_no_member: Number(req.body.min_no_member),
            max_no_member: Number(req.body.max_no_member),
            club_id: req.admin_club_id,
            venue: req.body.venue,
            chief_guest: req.body.chief_guest,
            exp_expense: req.body.exp_expense ? Number(req.body.exp_expense) : null,
            tot_amt_allot_su: req.body.tot_amt_allot_su ? Number(req.body.tot_amt_allot_su) : null,
            tot_amt_spt_dor: req.body.tot_amt_spt_dor ? Number(req.body.tot_amt_spt_dor) : null,
            exp_no_aud: req.body.exp_no_aud ? Number(req.body.exp_no_aud) : null,
            faculty_obs_desig: req.body.faculty_obs_desig,
            faculty_obs_dept: req.body.faculty_obs_dept,
        };
        if (req.body.eventConvenors) {
            try {
                EventDetails.eventConvenors = JSON.parse(req.body.eventConvenors);
            } catch {
                EventDetails.eventConvenors = req.body.eventConvenors.split(',').map((s: string) => s.trim());
            }
        }
        if (
            !EventDetails.name ||
            !EventDetails.date ||
            !EventDetails.event_type ||
            !EventDetails.event_category ||
            !EventDetails.min_no_member ||
            !EventDetails.max_no_member ||
            !EventDetails.club_id ||
            !EventDetails.venue ||
            !EventDetails.about
        ) {
            res.status(400).json({ message: "Missing required fields." });
            return;
        }

        const existingEvent = await prisma.events.findFirst({
            where: {
                name: EventDetails.name,
                date: new Date(EventDetails.date),
                venue: EventDetails.venue,
            },
        });

        if (existingEvent) {
            res.status(409).json({ message: "Event already exists with the same name, date, and venue." });
            return;
        }

        if (EventDetails.eventConvenors && EventDetails.eventConvenors.length > 0) {
            const convenorRollnos = EventDetails.eventConvenors.slice(0, 3);

            const convenorUsers = await prisma.users.findMany({
                where: {
                    rollno: {
                        in: convenorRollnos.map((rollno: string) => rollno.toLowerCase())
                    }
                },
                select: {
                    id: true,
                    rollno: true
                }
            });

            const nonExistentRollnos = convenorRollnos.filter(
                (rollno: string) => !convenorUsers.some(user => user.rollno?.toLowerCase() === rollno.toLowerCase())
            );

            if (nonExistentRollnos.length > 0) {
                const message = `Event creation failed. The following users could not be added as convenors because they don't exist in the database: ${nonExistentRollnos.join(', ')}`;
                res.status(422).json({ message });
                return;
            }
        }
        let posterPath = null;
        if (req.file) {
            try {
                const uploadDir = 'uploads/posters';
                await fs.ensureDir(uploadDir);
                const fileExtension = req.file.originalname.split('.').pop() || req.file.mimetype.split('/').pop() || 'unknown';
                const fileName = `${EventDetails.name.replace(/\s+/g, '-').trim()+EventDetails.date}.${fileExtension.trim().toLowerCase()}`;
                const fullPath = path.join(uploadDir, fileName);
                await fs.writeFile(fullPath, req.file.buffer);
                posterPath = `${uploadDir}/${fileName}`;
            } catch (error) {
                console.error("Error saving poster file:", error);
                res.status(500).json({
                    message: "Failed to save poster image. Event not created."
                });
                return;
            }
        }
        const event = await prisma.events.create({
            data: {
                name: EventDetails.name,
                about: EventDetails.about,
                date: new Date(EventDetails.date),
                event_type: EventDetails.event_type,
                venue: EventDetails.venue,
                event_category: EventDetails.event_category,
                min_no_member: EventDetails.min_no_member,
                max_no_member: EventDetails.max_no_member,
                poster: posterPath,
                chief_guest: EventDetails.chief_guest || null,
                exp_expense: EventDetails.exp_expense || null,
                tot_amt_allot_su: EventDetails.tot_amt_allot_su || null,
                tot_amt_spt_dor: EventDetails.tot_amt_spt_dor || null,
                exp_no_aud: EventDetails.exp_no_aud || null,
                faculty_obs_desig: EventDetails.faculty_obs_desig || null,
                faculty_obs_dept: EventDetails.faculty_obs_dept || null
            },
        });

        await prisma.organizingclubs.create({
            data: {
                club_id: EventDetails.club_id,
                event_id: event.id,
            },
        });

        if (EventDetails.eventConvenors && EventDetails.eventConvenors.length > 0) {
            const convenorRollnos = EventDetails.eventConvenors;

            const convenorUsers = await prisma.users.findMany({
                where: {
                    rollno: {
                        in: convenorRollnos.map((rollno: string) => rollno.toLowerCase())
                    }
                },
                select: {
                    id: true,
                    rollno: true
                }
            });

            const nonMembers: string[] = [];
            const validConvenors: { id: number }[] = [];

            for (const user of convenorUsers) {
                const isMember = await prisma.clubmembers.findFirst({
                    where: {
                        user_id: user.id,
                        club_id: EventDetails.club_id
                    }
                });

                if (isMember) {
                    validConvenors.push({ id: user.id });
                } else {
                    nonMembers.push(user.rollno!);
                }
            }

            if (validConvenors.length > 0) {
                for (const user of validConvenors) {
                    await prisma.eventconvenors.create({
                        data: {
                            user_id: user.id,
                            event_id: event.id,
                            club_id: EventDetails.club_id
                        }
                    });
                }
            }

            if (nonMembers.length > 0) {
                const message = `Event created successfully, but the following users could not be added as convenors because they are not members of the club: ${nonMembers.join(', ')}`;
                res.status(207).json({ message });
                return;
            }
        }

        res.status(201).json({
            message: "Event created successfully.",
        });

    } catch (err: any) {
        console.error("Event creation error:", err);
        res.status(500).json({
            message: "Something went wrong.",
        });
    }
};

const getPastEventsByClubController = async (req: Request, res: Response): Promise<void> => {
    try {
      const club_id = req.admin_club_id

      if (!club_id) {
        res.status(400).json({ message: "Club ID is required." });
        return;
      }

      const today = new Date();

      const pastEvents = await prisma.events.findMany({
        where: {
          date: {
            lt: today,
          },
          organizingclubs: {
            some: {
              club_id: Number(club_id),
            },
          },
        },
        include: {
          eventconvenors: {
            include: {
              users: {
                select: {
                  name: true,
                  department: true,
                  yearofstudy: true,
                },
              },
            },
          },
          eventwinners: {
            include: {
              teams: {
                select: {
                  name: true,
                },
              },
            },
          },
          feedback: true,
          eventregistration: true,
          teammembers: true,
        },
      }) as PrismaEvent[];

      const formattedData: PastEventData[] = pastEvents.map(event => {
        const average_rating = event.feedback.length
          ? event.feedback.reduce((acc: number, f) => acc + (f.rating || 0), 0) / event.feedback.length
          : 0;


        const eventConvenors = event.eventconvenors.map((ec) => ({
          name: ec.users?.name || null,
          department: ec.users?.department || null,
          yearofstudy: ec.users?.yearofstudy || null,
        }));


        const eventWinners = event.eventwinners.map((w) => ({
          position: w.position,
          team_name: w.teams?.name || null,
        }));


        const total_attendance = event.teammembers.filter(member => member.is_present).length;

        return {
          name: event.name,
          about: event.about,
          date: event.date,
          event_type: event.event_type,
          event_category: event.event_category,
          eventConvenors,
          eventWinners,
          average_rating: Number(average_rating.toFixed(2)),
          total_registered_teams: event.eventregistration.length,
          total_attendance,
        };
      });

      const response: PastEventsResponse = {
        message: "Past events details retrieved successfully.",
        data: formattedData,
      };

      res.status(200).json(response);

    } catch (error) {
      console.error("Error fetching past events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

const fetchProfile = async (req: Request, res: Response): Promise<void> =>{
    try{
        const admin_id = req.admin_user_id;
        const club_id = req.admin_club_id;
        const adminDetails = await prisma.users.findFirst({
            where:{
                id: admin_id
            },
            select: {
                name: true,
                rollno: true,
            }
        });
        const clubDetails = await prisma.clubs.findFirst({
            where:{
                id: club_id
            },
            select:{
                id: true,
                name: true,
            }
        });
        if(!adminDetails || !clubDetails){
            res.status(301).json({
                message: "Admin or Club data not found"
            });
            return;
        }
        const responseData = {
            name: adminDetails.name,
            rollno: adminDetails.rollno,
            club: clubDetails.name,
        }
        res.status(200).json({
            message: "Admin profile fetched successfully",
            data: responseData
        });
        return;
    }catch(err){
        res.status(500).json({
            message: err
        });
    }
}

const addClubmembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const club_id = req.admin_club_id;
        const { members } = req.body as ClubMembers;

        if (!members || !Array.isArray(members) || members.length === 0) {
            res.status(400).json({
                message: "Members array is required and cannot be empty"
            });
            return;
        }

        let successCount = 0;
        const errorDetails = [] as Array<{rollno: string, status: string, message: string}>;

        for (const member of members) {
            if (!member.rollno) {
                errorDetails.push({
                    rollno: member.rollno || "undefined",
                    status: "failed",
                    message: "Roll number is required"
                });
                continue;
            }

            try {
                // Check if user exists
                const user = await prisma.users.findUnique({
                    where: {
                        rollno: member.rollno.toLowerCase()
                    }
                });

                if (!user) {
                    errorDetails.push({
                        rollno: member.rollno,
                        status: "failed",
                        message: "User not found"
                    });
                    continue;
                }

                // Check if user is already a member of this club
                const existingClubMember = await prisma.clubmembers.findFirst({
                    where: {
                        user_id: user.id,
                        club_id: club_id
                    }
                });

                if (existingClubMember) {
                    errorDetails.push({
                        rollno: member.rollno,
                        status: "skipped",
                        message: "User is already a member of this club"
                    });
                    continue;
                }

                // Add the user to the club
                await prisma.clubmembers.create({
                    data: {
                        user_id: user.id,
                        club_id: club_id,
                        role: member.role || "Member",
                        is_admin: false // Regular member, not an admin
                    }
                });

                successCount++;
            } catch (err) {
                errorDetails.push({
                    rollno: member.rollno,
                    status: "failed",
                    message: "Error processing this member"
                });
                console.error(`Error adding club member ${member.rollno}:`, err);
            }
        }

        // If there were only successful additions
        if (successCount > 0 && errorDetails.length === 0) {
            res.status(201).json({
                message: "Members added successfully"
            });
            return;
        }

        // If there were errors but also some successes
        if (successCount > 0 && errorDetails.length > 0) {
            res.status(207).json({
                message: `${successCount} members added successfully, but some issues were encountered`,
                errors: errorDetails
            });
            return;
        }

        // If there were only errors
        if (successCount === 0 && errorDetails.length > 0) {
            res.status(422).json({
                message: "Failed to add members",
                errors: errorDetails
            });
            return;
        }

        res.status(204).json({
            message: "No action taken"
        });
        return;
    } catch (err) {
        console.error("Error adding club members:", err);
        res.status(500).json({
            message: "Failed to add club members"
        });
        return;
    }
};

const getEventDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type } = req.query;
        const club_id = req.admin_club_id;

        if (!club_id) {
            res.status(400).json({ message: "Club ID is required" });
            return;
        }

        if (!type || !['ongoing', 'past', 'upcoming', 'present'].includes(type as string)) {
            res.status(400).json({ message: "Invalid event type. Type must be one of: ongoing, past, upcoming, present" });
            return;
        }

        const today = new Date();
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const tomorrowOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        let dateFilter = {};
        let eventType = type as string;


        if (eventType === 'present') {
            eventType = 'ongoing';
        }

        if (eventType === 'past') {
            dateFilter = { lt: todayOnly };
        } else if (eventType === 'ongoing') {
            dateFilter = {
                gte: todayOnly,
                lt: tomorrowOnly
            };
        } else if (eventType === 'upcoming') {
            dateFilter = { gte: tomorrowOnly };
        }

        const events = await prisma.events.findMany({
            where: {
                date: dateFilter,
                organizingclubs: {
                    some: {
                        club_id: Number(club_id)
                    }
                }
            },
            select: {
                id: true,
                name: true,
                about: true,
                date: true,
                venue: true,
                event_type: true,
                event_category: true,
                min_no_member:true,
                max_no_member:true
            }
        });

        let sortedEvents = [...events];
        if (eventType === 'past') {
            sortedEvents.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
        } else {
            sortedEvents.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
        }

        const response: EventDetailsResponse = {
            message: `${eventType} events fetched successfully for your club`,
            data: sortedEvents
        };

        res.status(200).json(response);

    } catch (error) {
        console.error(`Error fetching ${req.query.type} events:`, error);
        res.status(500).json({
            message: `Error fetching events`,
            error: error
        });
    }
};


const getclubmembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const club_id = req.admin_club_id;
        if (!club_id) {
            res.status(400).json({ message: "Club ID is required" });
            return;
        }
        const members = await prisma.clubmembers.findMany({
            where: { club_id: Number(club_id) },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        rollno: true,
                        department: true,
                        yearofstudy: true
                    }
                }
            }
        });
        if (members.length === 0) {
            res.status(404).json({ message: "No members found for this club" });
            return;
        }
        const formattedMembers: ClubMemberDTO[] = members.map(member => ({
            id: member.users.id,
            name: member.users.name,
            rollno: member.users.rollno,
            department: member.users.department,
            yearofstudy: member.users.yearofstudy,
            role: member.role || "Member"
        }));
        const response: GetClubMembersResponse = {
            message: "Club members fetched successfully",
            data: formattedMembers
        };
        res.status(200).json(response);
        return

    } catch (error) {
        console.error("Error fetching club members:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const removeClubMemberController = async (req: Request, res: Response): Promise<void> => {
    try {
        const club_id = req.admin_club_id;
        const { rollno } = req.body ;

        if (!rollno || typeof rollno !== 'string' || rollno.trim() === '') {
            res.status(400).json({
                message: "Roll number is required and cannot be empty"
            });
            return;
        }

        const normalizedRollno = rollno.toLowerCase().trim();

        // Check if user exists
        const user = await prisma.users.findUnique({
            where: {
                rollno: normalizedRollno
            },
            select: {
                id: true,
                rollno: true,
                name: true
            }
        });

        if (!user) {
            res.status(404).json({
                message: "User not found",
                errors: [{
                    rollno: rollno,
                    status: "failed",
                    message: "User with this roll number does not exist"
                }]
            });
            return;
        }

        // Check if user is a member of this club
        const existingClubMember = await prisma.clubmembers.findFirst({
            where: {
                user_id: user.id,
                club_id: club_id
            }
        });

        if (!existingClubMember) {
            res.status(404).json({
                message: "User is not a member of this club",
                errors: [{
                    rollno: rollno,
                    status: "failed",
                    message: "User is not a member of this club"
                }]
            });
            return;
        }

        // Check if user is an admin of this club
        if (existingClubMember.is_admin) {
            res.status(403).json({
                message: "Cannot remove club admin",
                errors: [{
                    rollno: rollno,
                    status: "failed",
                    message: "Cannot remove a club admin. Please revoke admin privileges first."
                }]
            });
            return;
        }
        // Check if user is a convenor for any ongoing/upcoming events
        const today = new Date();
        const futureEvents = await prisma.eventconvenors.findMany({
            where: {
                user_id: user.id,
                club_id: club_id,
                events: {
                    date: {
                        gte: today
                    }
                }
            },
            include: {
                events: {
                    select: {
                        name: true,
                        date: true
                    }
                }
            }
        });

        if (futureEvents.length > 0) {
            const eventNames = futureEvents.map(e => e.events.name).join(', ');
            res.status(409).json({
                message: "Cannot remove member who is a convenor for upcoming events",
                errors: [{
                    rollno: rollno,
                    status: "failed",
                    message: `User is a convenor for upcoming events: ${eventNames}. Please reassign convenor roles first.`
                }]
            });
            return;
        }

        // Remove the user from the club
        await prisma.clubmembers.delete({
            where: {
                id: existingClubMember.id
            }
        });

        const response: RemoveClubMemberResponse = {
            message: `Member ${user.name || user.rollno} removed from club successfully`
        };

        res.status(200).json(response);

    } catch (err) {
        console.error("Error removing club member:", err);
        res.status(500).json({
            message: "Failed to remove club member",
            errors: [{
                rollno: req.body.rollno || "unknown",
                status: "failed",
                message: "Internal server error"
            }]
        });
    }
};

const updateEventPosterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventId = Number(req.params.id);
        const club_id = req.admin_club_id;

        // Validate event ID
        if (!eventId || isNaN(eventId)) {
            res.status(400).json({ message: 'Invalid event ID' });
            return;
        }

        // Check if file is provided
        if (!req.file) {
            res.status(400).json({ message: 'No poster file provided' });
            return;
        }

        // Check if event exists and belongs to admin's club
        const existingEvent = await prisma.events.findFirst({
            where: {
                id: eventId,
                organizingclubs: {
                    some: {
                        club_id: club_id
                    }
                }
            },
            select: {
                id: true,
                name: true,
                date: true,
                poster: true
            }
        });

        if (!existingEvent) {
            res.status(404).json({ message: 'Event not found or you do not have permission to update this event' });
            return;
        }

        let newPosterPath = null;

        try {
            // Create upload directory if it doesn't exist
            const uploadDir = 'uploads/posters';
            await fs.ensureDir(uploadDir);

            // Generate new filename
            const fileExtension = req.file.originalname.split('.').pop() || req.file.mimetype.split('/').pop() || 'unknown';
            const fileName = `${existingEvent.name.replace(/\s+/g, '-').trim()}-${existingEvent.date.toISOString().split('T')[0]}.${fileExtension.trim().toLowerCase()}`;
            const fullPath = path.join(uploadDir, fileName);

            // Remove old poster file if it exists
            if (existingEvent.poster) {
                try {
                    const oldPosterPath = path.resolve(existingEvent.poster);
                    if (await fs.pathExists(oldPosterPath)) {
                        await fs.remove(oldPosterPath);
                        console.log(`Old poster file removed: ${oldPosterPath}`);
                    }
                } catch (fileError) {
                    console.warn('Could not remove old poster file:', fileError);
                    // Continue with upload even if old file removal fails
                }
            }

            // Save new poster file
            await fs.writeFile(fullPath, req.file.buffer);
            newPosterPath = `${uploadDir}/${fileName}`;

            // Update database with new poster path
            await prisma.events.update({
                where: { id: eventId },
                data: { poster: newPosterPath }
            });

            const response: UpdateEventPosterResponse = {
                message: 'Event poster updated successfully',
                posterPath: newPosterPath
            };

            res.status(200).json(response);

        } catch (fileError) {
            console.error("Error handling poster file:", fileError);
            res.status(500).json({
                message: "Failed to update poster image"
            });
            return;
        }

    } catch (error) {
        console.error('Error updating event poster:', error);
        res.status(500).json({ 
            message: 'Internal server error while updating event poster',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

export  {
    putAttendance,
    createEventController,
    getPastEventsByClubController,
    fetchProfile,
    addClubmembers,
    getEventDetails,
    getclubmembers,
    removeClubMemberController,
    updateEventPosterController
};