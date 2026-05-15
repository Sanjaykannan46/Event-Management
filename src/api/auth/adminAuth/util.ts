import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_TOKEN_EXPIRY_MINUTES = process.env.JWT_TOKEN_EXPIRY_MINUTES!;
const JWT_REFRESH_TOKEN_EXPIRY_MINUTES = process.env.JWT_REFRESH_TOKEN_EXPIRY_MINUTES!;

const generateAdminAccessToken = (id: number, club_id: number, )=>{
    const token = jwt.sign({
            id: id,
            club_id: club_id
        },
        JWT_SECRET,
        {
            expiresIn: 60*parseInt(JWT_TOKEN_EXPIRY_MINUTES)
        }
    );
    return token;
}

const generateAdminRefreshToken = (id: number, club_id: number)=>{
    const token = jwt.sign(
        {
            id: id,
            club_id: club_id
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn: 60*parseInt(JWT_REFRESH_TOKEN_EXPIRY_MINUTES)
        }
    );
    return token;
}

export {generateAdminAccessToken, generateAdminRefreshToken}