import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {AdminPayload, UserPayload, GlobalAdminPayload} from "./types.js";
import {get_club_id} from "../api/event/utils.js";
import prisma from "../prisma.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

const userAuthMiddleware = (req: Request, res: Response, next: NextFunction): void =>{
    try{
        const token = req.cookies?.accesstoken;
        if(!token){
            res.status(401).json({
                message: "No token provided"
            })
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user_id = decoded.id;
        next();
    }
    catch(err){
        res.status(401).json({
            message: 'Invalid Token'
        })
        return;
    }
}

const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
    try{
        const token = req.cookies?.adminaccesstoken;
        console.log("auth triggered")
        if(!token){
            res.status(401).json({
                message: "No token provided"
            });
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
        req.admin_user_id = decoded.id;
        req.admin_club_id = decoded.club_id;
        let {event_id}=req.body;
        if(event_id){
        const club_id = await get_club_id(event_id); 
        if(req.admin_club_id !== club_id){
            res.status(401).json({
                message: "You cannot access other clubs"
            });
            return;
        }
    }
        next();
    }
    catch(err){
        res.status(401).json({
            message: "Invalid Token"
        });
    }
}

const globalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.globaladminaccesstoken;
        if(!token){
            res.status(401).json({
                message: "No token provided"
            });
            return;
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as GlobalAdminPayload;
        
        if(!decoded.is_global_admin){
            res.status(403).json({
                message: "Not authorized as global admin"
            });
            return;
        }
        
     
        const globalAdminRecord = await prisma.globaladmins.findUnique({
            where: {
                id: decoded.id
            }
        });
        
        if (!globalAdminRecord) {
            res.status(403).json({
                message: "Invalid global admin credentials"
            });
            return;
        }
        
        req.global_admin_id = decoded.id;
        next();
    }
    catch(err){
        res.status(401).json({
            message: "Invalid Token"
        });
    }
}

export {userAuthMiddleware, adminAuthMiddleware, globalAuthMiddleware}