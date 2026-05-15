import { Request, Response } from "express";
import { LoginAdmin } from "./types.js";
import prisma from "../../../prisma.js";
import { checkPassword} from "../userAuth/utils.js";
import { generateAdminAccessToken, generateAdminRefreshToken } from "./util.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AdminPayload } from "../../../middleware/types.js";

dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

const loginController = async (req: Request, res: Response): Promise<void> =>{
    const loginCredintials: LoginAdmin = req.body;
    try{
        const userRecord = await prisma.users.findFirst({
            where:{
                rollno: loginCredintials.rollno.toLowerCase()
            }
        });
        if(!userRecord){
            res.status(400).json({
                message: "User not found"
            });
            return;
        }
        const adminRecord = await prisma.clubmembers.findFirst({
            where:{
                user_id: userRecord.id,
                club_id: loginCredintials.club_id
            }
        });
        if(!adminRecord){
            res.status(400).json({
                message: "Admin not found"
            });
            return;
        }
        if(adminRecord.is_admin && adminRecord.is_admin === true){
            if(checkPassword(userRecord.password!, loginCredintials.password)){
                const accesstoken = generateAdminAccessToken(userRecord.id, loginCredintials.club_id);
                const refreshtoken = generateAdminRefreshToken(userRecord.id, loginCredintials.club_id);
                res.cookie('adminaccesstoken', accesstoken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                });
                res.cookie('adminrefreshtoken', refreshtoken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                });
                res.status(200).json({
                    message: "Admin logged in successfully"
                });
                return;
            }
            else{
                res.status(401).json({
                    message: "Wrong password"
                });
                return;
            }
        }
        else{
            res.status(400).json({
                message: "You are not an admin"
            });
            return;
        }
    }
    catch(err){
        res.status(500).json({
            message: err
        });
        return;
    }
}

const logoutController = (req: Request, res: Response): void =>{
    res.clearCookie('adminaccesstoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.clearCookie('adminrefreshtoken',{
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.status(200).json({
        message: "Admin logged out successfully"
    });
    return;
}

const getNewAccessTokenController = (req: Request, res: Response): void =>{
    try{
        const refreshtoken = req.cookies?.adminrefreshtoken;
        const payload = jwt.verify(refreshtoken, JWT_REFRESH_SECRET) as AdminPayload;
        const id = payload.id;
        const club_id = payload.club_id;
        const newadminaccesstoken = generateAdminAccessToken(id, club_id);
        const newadminrefreshtoken = generateAdminRefreshToken(id, club_id);
        res.cookie('adminaccesstoken', newadminaccesstoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        res.cookie('adminrefreshtoken', newadminrefreshtoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        res.status(200).json({
            message: "New access token generated"
        });
        return;
    }
    catch(err){
        res.status(401).json({
            message: err
        });
        return;
    }
}

const checkStatus = async (req: Request, res: Response): Promise<void> =>{
    try{
        const token = req.cookies?.adminaccesstoken;
        const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
        const id = decoded.id
        const club_id = decoded.club_id;
        const adminRecord = await prisma.clubmembers.findFirst({
            where:{
                user_id: id,
                club_id: club_id
            }
        });
        if(!adminRecord){
            res.status(403).json({
                message: "No admin found"
            });
            return;
        }
        res.status(200).json({
            message:"Admin is authenticated"
        });
        return;
    }catch(err){
        res.status(401).json({
            message: "Invalid token"
        });
        return;
    }
}



export {loginController, logoutController, getNewAccessTokenController, checkStatus}