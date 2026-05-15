import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_TOKEN_EXPIRY_MINUTES = process.env.JWT_TOKEN_EXPIRY_MINUTES!;
const JWT_REFRESH_TOKEN_EXPIRY_MINUTES = process.env.JWT_REFRESH_TOKEN_EXPIRY_MINUTES!;

/**
 * Generates an access token for global admin
 * @param id global admin id
 * @param username global admin username
 * @returns JWT token
 */
const generateGlobalAdminAccessToken = (id: number, username: string) => {
    const token = jwt.sign({
            id: id,
            username: username,
            is_global_admin: true
        },
        JWT_SECRET,
        {
            expiresIn: 60 * parseInt(JWT_TOKEN_EXPIRY_MINUTES)
        }
    );
    return token;
}

/**
 * Generates a refresh token for global admin
 * @param id global admin id
 * @param username global admin username
 * @returns JWT refresh token
 */
const generateGlobalAdminRefreshToken = (id: number, username: string) => {
    const token = jwt.sign(
        {
            id: id,
            username: username,
            is_global_admin: true
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn: 60 * parseInt(JWT_REFRESH_TOKEN_EXPIRY_MINUTES)
        }
    );
    return token;
}

export { generateGlobalAdminAccessToken, generateGlobalAdminRefreshToken }