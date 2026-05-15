import {Request, Response} from 'express';
import prisma from '../../prisma.js';
import { ClubData } from './types.js';

const getClubs = async (req: Request, res: Response): Promise<void> =>{
    try{
        const clubs = await prisma.clubs.findMany();
        if(!clubs){
            res.status(301).json({
                message: "No clubs found!"
            });
            return;
        }
        else{
            const club_data: ClubData[] = [];
            clubs.map((club)=>{
                club_data.push({
                    id: club.id,
                    name: club.name!
                });
            });
            res.status(200).json({
                message: "Club data fetched successfully",
                data: club_data
            });
            return;
        }
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}

export {getClubs};