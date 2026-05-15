import { Request, Response } from "express";
import { LoginGlobalAdmin, SignUpGlobalAdmin } from "./types.js";
import prisma from "../../../prisma.js";
import { checkPassword, hashPassword } from "../userAuth/utils.js";
import { generateGlobalAdminAccessToken, generateGlobalAdminRefreshToken } from "./utils.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GlobalAdminPayload } from "../../../middleware/types.js";

dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Controller for global admin signup
 */
const signupController = async (req: Request, res: Response): Promise<void> => {
    const globalAdmin: SignUpGlobalAdmin = req.body;

    try {
        if (!globalAdmin.username || !globalAdmin.password) {
            res.status(400).json({
                message: "Username and password are required"
            });
            return;
        }

        // Check if global admin with same username already exists
        const existingAdmin = await prisma.globaladmins.findFirst({
            where: {
                username: globalAdmin.username
            }
        });

        if (existingAdmin) {
            res.status(409).json({
                message: "Global admin with this username already exists"
            });
            return;
        }

        // Create global admin record with hashed password
        const newGlobalAdmin = await prisma.globaladmins.create({
            data: {
                username: globalAdmin.username,
                password: hashPassword(globalAdmin.password)
            }
        });

        // Generate tokens
        const accessToken = generateGlobalAdminAccessToken(newGlobalAdmin.id, newGlobalAdmin.username);
        const refreshToken = generateGlobalAdminRefreshToken(newGlobalAdmin.id, newGlobalAdmin.username);

        // Set cookies
        res.cookie('globaladminaccesstoken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        res.cookie('globaladminrefreshtoken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        res.status(201).json({
            message: "Global admin created successfully"
        });
        return;
    } catch (err) {
        console.error("Error in global admin signup:", err);
        res.status(500).json({
            message: "Internal server error"
        });
        return;
    }
};

/**
 * Controller for global admin login
 */
const loginController = async (req: Request, res: Response): Promise<void> => {
    const loginCredentials: LoginGlobalAdmin = req.body;

    try {
        if (!loginCredentials.username || !loginCredentials.password) {
            res.status(400).json({
                message: "Username and password are required"
            });
            return;
        }

        // Find global admin by username
        const adminRecord = await prisma.globaladmins.findFirst({
            where: {
                username: loginCredentials.username
            }
        });

        if (!adminRecord) {
            res.status(404).json({
                message: "Global admin not found"
            });
            return;
        }

        // Check password
        if (!checkPassword(adminRecord.password, loginCredentials.password)) {
            res.status(401).json({
                message: "Invalid password"
            });
            return;
        }

        // Generate tokens
        const accessToken = generateGlobalAdminAccessToken(adminRecord.id, adminRecord.username);
        const refreshToken = generateGlobalAdminRefreshToken(adminRecord.id, adminRecord.username);

        // Set cookies
        res.cookie('globaladminaccesstoken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        res.cookie('globaladminrefreshtoken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        res.status(200).json({
            message: "Global admin logged in successfully"
        });
        return;
    } catch (err) {
        console.error("Error in global admin login:", err);
        res.status(500).json({
            message: "Internal server error"
        });
        return;
    }
};

/**
 * Controller for global admin logout
 */
const logoutController = (req: Request, res: Response): void => {
    // Clear cookies
    res.clearCookie('globaladminaccesstoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });

    res.clearCookie('globaladminrefreshtoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });

    res.status(200).json({
        message: "Global admin logged out successfully"
    });
    return;
};

/**
 * Controller for getting a new access token
 */
const getNewAccessTokenController = (req: Request, res: Response): void => {
    try {
        const refreshToken = req.cookies?.globaladminrefreshtoken;

        if (!refreshToken) {
            res.status(401).json({
                message: "No refresh token provided"
            });
            return;
        }

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as GlobalAdminPayload;

        if (!payload.is_global_admin) {
            res.status(403).json({
                message: "Invalid token - not a global admin token"
            });
            return;
        }

        // Generate new tokens with username from payload
        const newAccessToken = generateGlobalAdminAccessToken(payload.id, payload.username);
        const newRefreshToken = generateGlobalAdminRefreshToken(payload.id, payload.username);

        res.cookie('globaladminaccesstoken', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        res.cookie('globaladminrefreshtoken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        res.status(200).json({
            message: "New access token generated"
        });
        return;
    } catch (err) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
        return;
    }
};

const checkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const accesstoken = req.cookies?.globaladminaccesstoken;
        const decoded = jwt.verify(accesstoken, JWT_SECRET) as GlobalAdminPayload;
        const username = decoded.username;
        const globalrecord = await prisma.globaladmins.findFirst({
            where: {
                username: username
            }
        });
        if (!username) {
            res.status(404).json({
                message: "No admin found"
            });
            return;
        }
        res.status(200).json({
            message: "Admin is authenticated"
        });
        return;
    } catch (err) {
        res.status(401).json({
            message: "Invalid token"
        });
        return;
    }
}

export { signupController, loginController, logoutController, getNewAccessTokenController, checkStatus};