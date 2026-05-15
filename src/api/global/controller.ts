import { Request, Response } from "express";
import prisma from "../../prisma.js";
import { AddClubAdminDTO, CreateClubDTO } from "./types.js";



export const createClubController = async (req: Request, res: Response): Promise<void> => {
    try {
        const clubData: CreateClubDTO = req.body;

        if (!clubData.name) {
            res.status(400).json({
                message: "Club name is required"
            });
            return;
        }

        const existingClub = await prisma.clubs.findFirst({
            where: {
                name: clubData.name
            }
        });

        if (existingClub) {
            res.status(409).json({
                message: "Club with this name already exists"
            });
            return;
        }

        const newClub = await prisma.clubs.create({
            data: {
                name: clubData.name,
                about: clubData.about || null
            }
        });

        res.status(201).json({
            message: "Club created successfully"

        });
        return;
    } catch (err) {
        console.error("Error creating club:", err);
        res.status(500).json({
            message: "Failed to create club"
        });
        return;
    }
};

export const addClubAdminController = async (req: Request, res: Response): Promise<void> => {
    try {
        const adminData: AddClubAdminDTO = req.body;

        if (!adminData.rollno || !adminData.club_id) {
            res.status(400).json({
                message: "User ID and Club ID are required"
            });
            return;
        }


        const user = await prisma.users.findUnique({
            where: {
                rollno: adminData.rollno.toLowerCase()
            }
        });

        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }


        const club = await prisma.clubs.findUnique({
            where: {
                id: adminData.club_id
            }
        });

        if (!club) {
            res.status(404).json({
                message: "Club not found"
            });
            return;
        }


        const existingClubMember = await prisma.clubmembers.findFirst({
            where: {
                user_id: user.id,
                club_id: adminData.club_id
            }
        });

        if (existingClubMember) {

            if (!existingClubMember.is_admin) {
                const updatedMember = await prisma.clubmembers.update({
                    where: {
                        id: existingClubMember.id
                    },
                    data: {
                        is_admin: true,
                        role: adminData.role || existingClubMember.role
                    }
                });

                res.status(200).json({
                    message: "User promoted to club admin successfully",

                });
                return;
            } else {
                res.status(409).json({
                    message: "User is already an admin of this club"
                });
                return;
            }
        }


        const newClubAdmin = await prisma.clubmembers.create({
            data: {
                user_id: user.id,
                club_id: adminData.club_id,
                role: adminData.role || "Admin",
                is_admin: true
            }
        });

        res.status(201).json({
            message: "Club admin added successfully"


        });
        return;
    } catch (err) {
        console.error("Error adding club admin:", err);
        res.status(500).json({
            message: "Failed to add club admin"
        });
        return;
    }
};