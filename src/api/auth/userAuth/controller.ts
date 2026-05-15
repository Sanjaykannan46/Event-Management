import {Request, Response} from 'express'
import { SignUpUser, LoginUser } from './types';
import prisma from '../../../prisma.js';
import { validatePhoneNumber, generateEmail, generateAccessToken, hashPassword, checkPassword, generateSecurityCode, generateRefreshToken, generateSecurityToken } from './utils.js';
import { sendEmailVerificationCode, sendSecurityCodeEmail } from '../../../mailer/sendMail.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { SecurityCodePayload, UserPayload } from '../../../middleware/types';

dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

const signupController = async (req: Request, res: Response): Promise<void> =>{
    const user: SignUpUser = req.body;
    try{
        if(!user.name || !user.rollno || !user.password || !user.department || !user.phoneno || !user.yearofstudy){
            res.status(400).json({
                message: "Require all fields"
            })
            return;
        }
        if(!user.code){
            res.status(400).json({
                message: "Email verification code required"
            });
            return;
        }
        let olduser = await prisma.users.findFirst({
            where:{
                rollno: user.rollno.toLowerCase()
            }
        });
        if(olduser){
            res.status(409).json({
                message: "User already exists"
            });
            return;
        }
        if(!validatePhoneNumber(user.phoneno)){
            res.status(400).json({
                message: "Phone number must contain 10 digits"
            })
            return;
        }
        olduser = await prisma.users.findFirst({
            where:{
                phoneno: user.phoneno
            }
        });
        if(olduser){
            res.status(409).json({
                message: "Phone number already exists"
            });
            return;
        }
        user.email = generateEmail(user.rollno);
        const email_code_record = await prisma.emailverification.findFirst({
            where: {
                rollno: user.rollno.toLowerCase()
            }
        });
        if(!email_code_record){
            res.status(410).json({
                message: "Email verification code expired"
            });
            return;
        }
        if(email_code_record.code !== user.code){
            res.status(400).json({
                message: "Email verification codes not matched"
            });
            return;
        }
        const new_user = await prisma.users.create({
            data: {
                name : user.name,
                rollno: user.rollno.toLowerCase(),
                password: hashPassword(user.password),
                department: user.department,
                email: user.email,
                phoneno: user.phoneno,
                yearofstudy: user.yearofstudy
            }
        })
        const accesstoken = generateAccessToken(new_user.id);
        const refreshtoken = generateRefreshToken(new_user.id);
        res.cookie('accesstoken', accesstoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.cookie('refreshtoken', refreshtoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(201).json({
            id: new_user.id,
            name: new_user.name,
            rollno: new_user.rollno,
            department: new_user.department,
            email: new_user.email,
            phoneno: `${new_user.phoneno}`,
            yearofstudy:  new_user.yearofstudy
        });
        return;
    }
    catch(err){
        res.status(500).json({
            message: err
        })
        return;
    }
}

const loginController = async (req: Request, res: Response): Promise<void> =>{
    const user: LoginUser = req.body;
    try{
        if (!user?.rollno || !user?.password) {
            res.status(400).json({ message: "Roll no and password are required" });
            return;
        }
        const users = await prisma.users.findFirst({
            where: {
                rollno: user.rollno.toLowerCase()
            }
        })
        if(!users){
            res.status(404).json({
                message: "User does not exists"
            })
            return;
        }
        if(!checkPassword(users.password!, user.password)){
            res.status(401).json({
                message: "Wrong password"
            })
            return;
        }
        const accesstoken = generateAccessToken(users.id);
        const refreshtoken = generateRefreshToken(users.id);
        res.cookie('accesstoken', accesstoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.cookie('refreshtoken', refreshtoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(200).json({
            id: users.id,
            name: users.name,
            rollno: users.rollno,
            department: users.department,
            email: users.email,
            phoneno: `${users.phoneno}`,
            yearofstudy:  users.yearofstudy
        })
        return;
    }
    catch(err: any){
        console.error("Signup Error:", err);
        res.status(500).json({
            message: err.message || "Something went wrong"
        });
        return;
    }

}

const logoutController = (req: Request, res: Response): void =>{
    try{
        res.clearCookie('accesstoken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.clearCookie('refreshtoken',{
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(200).json({
            message: "User logged out successfully"
        });
        return;
    }catch(err){
        res.status(500).json({
            message: err
        });
        return;
    }
}

const generateSecurityCodeController = async (req: Request, res: Response): Promise<void> =>{
    const {rollno} = req.body;
    try{
        const user = await prisma.users.findFirst({
            where:{
                rollno: rollno.toLowerCase()
            }
        });
        if(!user){
            res.status(404).json({
                message: "User does not exist"
            })
            return;
        }
        const user_id = user.id;
        const code = generateSecurityCode();
        const userSecurityRecord = await prisma.usersecuritycode.findFirst({
            where:{
                user_id: user_id
            }
        });
        if(!userSecurityRecord){
            const newSecurityRecord = await prisma.usersecuritycode.create({
                data:{
                    user_id: user_id,
                    code: code
                }
            });
        }
        else{
            await prisma.usersecuritycode.update({
                where:{
                    user_id: user_id
                },
                data:{
                    code: code
                }
            });
        }
        const user_email = user.email;
        sendSecurityCodeEmail(user_email!, code);
        res.status(201).json({
            message: "Security Code Created"
        });
        return;
    }
    catch(err){
        res.status(500).json({
            message: err
        });
        return;
    }
}

const verifySecurityCodeController = async (req: Request, res: Response): Promise<void> =>{
    const {rollno, code} = req.body;
    const userRecord = await prisma.users.findFirst({
        where: {
            rollno: rollno.toLowerCase()
        }
    });
    if(!userRecord){
        res.status(404).json({
            message: "User does not exists"
        });
        return;
    }
    const user_id = userRecord.id;
    const securityRecord = await prisma.usersecuritycode.findFirst({
        where:{
            user_id: user_id
        }
    });
    if(!securityRecord){
        res.status(404).json({
            message: "Security code not found"
        });
        return;
    }
    if(code === securityRecord?.code){
        res.status(200).json({
            message: "Security Codes matched",
            token: generateSecurityToken(code)
        });
        return;
    }
    else{
        res.status(400).json({
            message: "Security codes not matched"
        });
        return;
    }
}

const resetpasswordController = async (req: Request, res: Response): Promise<void> =>{
    const {rollno, password, token} = req.body;
    try{
        if(!token){
            res.status(401).json({
                message: "No Security Token provided"
            });
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as SecurityCodePayload;
        const code = decoded.code;
        const securityCodeRecord = await prisma.usersecuritycode.findFirst({
            where:{
                code: code
            }
        });
        if(!securityCodeRecord){
            res.status(401).json({
                message: "Unauthorized access"
            });
            return;
        }
        const userRecord = await prisma.users.findFirst({
            where: {
                rollno: rollno.toLowerCase()
            }
        });
        if(!userRecord){
            res.status(404).json({
                message: "User does not exists"
            });
            return;
        }
        const user_id = userRecord.id;
        const hashpassword = hashPassword(password);
        await prisma.users.update({
            where:{
                id: user_id
            },
            data:{
                password: hashpassword
            }
        });
        res.status(200).json({
            message: "Password reset successfully"
        });
        return;

    }
    catch(err){
        res.status(500).json({
            message: err
        });
        return;
    }
}

const getNewAccessTokenController = (req: Request, res: Response): void =>{
    try{
        const refreshtoken = req.cookies.refreshtoken;
        const payload = jwt.verify(refreshtoken, JWT_REFRESH_SECRET) as UserPayload;
        const user_id = payload.id;
        const accesstoken = generateAccessToken(user_id);
        const newrefreshtoken = generateRefreshToken(user_id);
        res.cookie('accesstoken', accesstoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.cookie('refreshtoken', newrefreshtoken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.status(200).json({
            message: "New access token generated",
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

const generateEmailCodeController = async (req: Request, res: Response): Promise<void> =>{
    try{
        const {rollno} = req.body;
        if(!rollno){
            res.status(400).json({
                message: "Roll no required"
            });
            return;
        }
        const user_record = await prisma.users.findFirst({
            where:{
                rollno: rollno.toLowerCase()
            }
        });
        if(user_record){
            res.status(409).json({
                message: "User already exists"
            });
            return;
        }
        const code = generateSecurityCode();
        const email = generateEmail(rollno);
        await prisma.emailverification.create({
            data:{
                rollno: rollno.toLowerCase(),
                code: code
            }
        });
        sendEmailVerificationCode(email, code);
        res.status(201).json({
            message: "Email verification code created"
        });
        return;
    }catch(err){
        res.status(500).json({
            message: err
        });
    }
}

const checkStatus = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.accesstoken;
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    const user_id = decoded.id;
    const user_record = await prisma.users.findFirst({
        where: {
            id: user_id
        }
    });
    if(!user_record){
        res.status(403).json({
            message: "No user found"
        });
        return;
    }
    res.status(200).json({
        id: user_record.id,
        name: user_record.name,
        rollno: user_record.rollno,
        department: user_record.department,
        email: user_record.email,
        phoneno: `${user_record.phoneno}`,
        yearofstudy:  user_record.yearofstudy
    });
    return;
}

export {signupController, 
    loginController, 
    logoutController, 
    generateSecurityCodeController, 
    verifySecurityCodeController, 
    resetpasswordController, 
    getNewAccessTokenController, 
    generateEmailCodeController,
    checkStatus
};