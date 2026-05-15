import {Request, Response} from 'express'
import prisma from '../../prisma.js';
import { WinnerDetails,DeleteWinners,UpdateEventDto, RegistrationData } from './types.js';
import fs from 'fs-extra';
import path from 'path';

const updateEventController = async (req: Request, res: Response) : Promise<void>=> {
    const eventId = Number(req.params.id);
    const updates: UpdateEventDto = req.body;

    try {
      const updatedEvent = await prisma.events.update({
        where: { id: eventId },
        data: updates,
      });

      res.status(201).json({message : 'Event Updated successfully'});
    } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).json({ error: 'Failed to update event.' });
    }
  };

const updateEventcontroller = async (req: Request, res: Response): Promise<void> => {
    const eventId = Number(req.params.id);
    const updates = req.body;

    try {
        // Validate eventId
        if (!eventId || isNaN(eventId)) {
            res.status(400).json({ error: 'Invalid event ID' });
            return;
        }

        // Check if event exists and get club_id
        const existingEvent = await prisma.events.findUnique({
            where: { id: eventId },
            include: {
                organizingclubs: {
                    select: {
                        club_id: true
                    }
                }
            }
        });

        if (!existingEvent) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const club_id = existingEvent.organizingclubs[0]?.club_id;
        if (!club_id) {
            res.status(400).json({ error: 'Club information not found for this event' });
            return;
        }

        // Handle eventConvenors separately if it's being updated
        if (updates.eventConvenors !== undefined) {
            let convenorRollnos: string[] = [];
            
            // Parse eventConvenors from request
            if (Array.isArray(updates.eventConvenors)) {
                convenorRollnos = updates.eventConvenors;
            } else if (typeof updates.eventConvenors === 'string') {
                try {
                    convenorRollnos = JSON.parse(updates.eventConvenors);
                } catch {
                    convenorRollnos = updates.eventConvenors.split(',').map((s: string) => s.trim());
                }
            }

            // Validate convenors exist in database
            if (convenorRollnos.length > 0) {
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
                    const message = `Update failed. The following users don't exist in the database: ${nonExistentRollnos.join(', ')}`;
                    res.status(422).json({ message });
                    return;
                }

                // Check club membership and separate valid/invalid convenors
                const nonMembers: string[] = [];
                const validConvenors: { id: number }[] = [];

                for (const user of convenorUsers) {
                    const isMember = await prisma.clubmembers.findFirst({
                        where: {
                            user_id: user.id,
                            club_id: club_id
                        }
                    });

                    if (isMember) {
                        validConvenors.push({ id: user.id });
                    } else {
                        nonMembers.push(user.rollno!);
                    }
                }

                // Delete existing convenors for this event
                await prisma.eventconvenors.deleteMany({
                    where: {
                        event_id: eventId,
                        club_id: club_id
                    }
                });

                // Add new valid convenors
                if (validConvenors.length > 0) {
                    for (const user of validConvenors) {
                        await prisma.eventconvenors.create({
                            data: {
                                user_id: user.id,
                                event_id: eventId,
                                club_id: club_id
                            }
                        });
                    }
                }

                // If some convenors are not club members, return partial success
                if (nonMembers.length > 0) {
                    const message = `Event convenors updated, but the following users could not be added as convenors because they are not members of the club: ${nonMembers.join(', ')}`;
                    res.status(207).json({ message });
                    return;
                }
            } else {
                // If empty array, remove all convenors
                    res.status(400).json({ 
                        message: "Cannot remove all convenors. An event must have at least one convenor." 
                    });
                    return;

            }

            // Remove eventConvenors from updates object since we handled it separately
            delete updates.eventConvenors;
        }

        // Prepare data for updating other fields
        let dataToUpdate: any = {};
        
        // Handle regular field updates
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && updates[key] !== null) {
                // Convert number fields
                if (['min_no_member', 'max_no_member', 'exp_expense', 'tot_amt_allot_su', 'tot_amt_spt_dor', 'exp_no_aud'].includes(key)) {
                    dataToUpdate[key] = Number(updates[key]);
                } 
                // Convert date field
                else if (key === 'date') {
                    dataToUpdate[key] = new Date(updates[key]);
                } 
                // Handle other fields as strings
                else {
                    dataToUpdate[key] = updates[key];
                }
            }
        });

        // Update the event if there are fields to update
        if (Object.keys(dataToUpdate).length > 0) {
            await prisma.events.update({
                where: { id: eventId },
                data: dataToUpdate,
            });
        }

        console.log(`Event ${eventId} updated successfully:`, JSON.stringify(updates, null, 2));

        res.status(200).json({
            message: 'Event updated successfully'
        });

    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Failed to update event.' });
    }
};

const AddingWinnerController = async (req: Request, res: Response) : Promise<void>=> {
    const Winner: WinnerDetails = req.body;
    const {event_id,team_id,position}= Winner;
    if(!event_id || !team_id || !position){
        res.status(400).json({
            message: "Requires all fields"
        })
        return;
    }
    try{
        const check = await prisma.eventwinners.count({
            where:{
                team_id:team_id,
                event_id:event_id
            }
        });
        if(check>0){
            res.status(201).json({
                message:"Winners already added"
            });
            return;
        }
        const addedWinners= await prisma.eventwinners.create({
            data:{
                event_id: event_id,
                team_id: team_id,
                position: position
            }
        })
        res.status(201).json({
            message: "Winners added successfully",
            data: addedWinners
        })
    }catch(err){
        res.status(500).json({
            message:err
        })
    }
}

const removeWinnerController = async (req:Request,res:Response) : Promise<void>=>{
    const to_del:DeleteWinners = req.body;
    if (!to_del.event_id || !to_del.position){
        res.status(400).json({
            message:"Missing some request fields"
        })
    }
    try{
        const data = await prisma.eventwinners.findFirst({
            where:{
                event_id:to_del.event_id,
                position:to_del.position
            }
        })
        if(!data){
            res.status(400).json({
                message:"The position is already empty"
            })
            return;
        }
        const del = await prisma.eventwinners.deleteMany({
            where:{
                event_id:to_del.event_id,
                position:to_del.position
            }
        });
        res.status(200).json({
            message:"Winners deleted succesfully"
        })

    }catch(err){
        res.status(500).json({
            message:err
        })
    }

}

const getEventDetails = async (req: Request, res: Response): Promise<void> =>{
    try{
        const id: number = parseInt(<any>req.query.id);
        const eventRecord = await prisma.events.findFirst({
            where:{
                id: id
            }
        });
        if(!eventRecord){
            res.status(301).json({
                message: "Event not found"
            });
            return;
        }
        else{
            const convernorDetails = await prisma.eventconvenors.findMany({
                where:{
                    event_id: id
                },
                include:{
                    users: true
                }
            });
            const convenor: String[] = [];
            convernorDetails.map((c)=>{
                convenor.push(c.users.rollno!);
            });
            res.status(200).json({ message:"Fetched Event detials successfully",data:{
                name: eventRecord.name,
                date: eventRecord.date,
                venue: eventRecord.venue,
                event_type: eventRecord.event_type,
                event_category: eventRecord.event_category,
                about: eventRecord.about,
                chief_guest: eventRecord.chief_guest,
                tot_amt_allot_su: eventRecord.tot_amt_allot_su,
                tot_amt_spt_dor: eventRecord.tot_amt_spt_dor,
                exp_expense: eventRecord.exp_expense,
                epx_no_aud: eventRecord.exp_no_aud,
                faculty_obs_dept: eventRecord.faculty_obs_dept,
                faculty_obs_desig: eventRecord.faculty_obs_desig,
                min_no_member: eventRecord.min_no_member,
                max_no_member: eventRecord.max_no_member,
                eventConvenors: convernorDetails?convenor:[]
        }});
            return;
        }
    }catch(err){
        res.status(500).json({
            message: "Issue in fetching event details"
        });
        return;
    }
}

const getEventPoster = async (req: Request, res: Response): Promise<void> =>{
    try{
        const id: number = parseInt(<any>req.query.id);
        const event = await prisma.events.findFirst({
            where:{
                id: id
            },
            select:{
                poster: true
            }
        });

        if(!event){
            res.status(404).json({
                message: "Event not found"
            });
            return;
        }

        if(!event.poster){
            res.status(404).json({
                message: "No poster available for this event"
            });
            return;
        }
        const posterPath = path.resolve(event.poster);
        if (await fs.pathExists(posterPath)) {
            const image = await fs.readFile(posterPath);
            let contentType = 'image/png';
            if (posterPath.endsWith('.jpg') || posterPath.endsWith('.jpeg')) {
                contentType = 'image/jpeg';
            }
            res.status(200)
              .setHeader('Content-Type', contentType)
              .send(image);
        } else {
            res.status(404).json({
                message: "Poster file not found on server"
            });
        }
        return;
    }catch(err){
        console.error("Error fetching event poster:", err);
        res.status(500).json({
            message: "Issue in fetching event poster"
        });
        return;
    }
}

const getAllRegistrations = async (req: Request, res: Response): Promise<void> =>{
    try{
        const eventId = Number(req.params.event_id) || null;
        if(!eventId){
            res.status(400).json({
                message: "Invalid Event Id"
            });
            return;
        }
        const registrations = await prisma.eventregistration.findMany({
            where: {
              event_id: eventId,
            },
            include: {
              teams: {
                include: {
                  teammembers: {
                    select: {
                      is_present: true,
                      users: {
                        select: {
                          name: true,
                          rollno: true,
                          department: true,
                          yearofstudy: true,
                          id: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        if(registrations.length == 0){
            res.status(200).json({
                message: "No registrations for this event"
            });
            return;
        }
        const filteredRegistrationsData: RegistrationData[] = []
        registrations.map((registration)=>{
            filteredRegistrationsData.push(
                {
                    team_id: registration.team_id,
                    team_name: registration.teams.name,
                    members: registration.teams.teammembers.map((teammember)=>(
                        { ...teammember.users , is_present: teammember.is_present, }
                    ))
                }
            )
        });
        res.status(200).json({
            message: "Fetched event registrations",
            data: filteredRegistrationsData
        });
        return;
    }catch(err){
        res.status(500).json({
            message: "Issue in fetching event registrations"
        });
        return;
    }
}

const getFeedback = async(req:Request,res:Response) => {
    try {
        const {event_id} = req.params;
        const event = await prisma.events.findUnique({
            where:{ id : Number(event_id) }
        })
        if(!event) { res.status(404).json({message:`Event with ${event_id} is not Found`});return; }
        const rawfeedback = await prisma.feedback.findMany({
            where:{event_id : Number(event_id)},
            include:{
                users: true
            }
        })

        const feedbacks = rawfeedback.map(feedback => ({
            ...feedback,
            users: {
              ...feedback.users,
              password: undefined,
              phoneno:undefined
            },
          }));
        res.status(200).json({message:"Fetched feedback successfully",data:feedbacks})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Error While fetching Feedback"})
    }
}

const getWinners = async(req:Request,res:Response) => {
    try {
        const {event_id} = req.params;
        const event = await prisma.events.findUnique({
            where:{ id : Number(event_id) }
        })
        if(!event) { res.status(404).json({message:`Event with ${event_id} is not Found`});return; }
        const Winners = await prisma.eventwinners.findMany({
            where: { event_id : Number(event_id) },
            include: {
                teams : { include : { teammembers : { include : {
                    users : { select : {
                        id : true,name:true,email:true,
                        rollno: true,department:true,
                        yearofstudy: true
                    } }
                } } } }
            }
        })

        res.status(200).json({message:"Winner fetched Successfully",data:Winners})

    } catch (error) {
        res.status(500).json({message:"Winner fetched failed"})
    }
}

export {updateEventcontroller,AddingWinnerController,removeWinnerController, getEventDetails, getEventPoster, getAllRegistrations,
    getFeedback,getWinners
};