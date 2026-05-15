import {genSaltSync, hashSync, compareSync } from 'bcrypt-ts';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_TOKEN_EXPIRY_MINUTES = process.env.JWT_TOKEN_EXPIRY_MINUTES!;
const JWT_REFRESH_TOKEN_EXPIRY_MINUTES = process.env.JWT_REFRESH_TOKEN_EXPIRY_MINUTES!;

const validatePhoneNumber = (phoneno: bigint)=>{
    if(phoneno.toString().length == 10){
        return true;
    }
    return false;
}

const generateEmail = (rollno: string)=>{
    let email = rollno.toLowerCase().trimEnd().concat("@psgtech.ac.in");
    return email;
}

const hashPassword = (password: string)=>{
    const salt = genSaltSync(10);
    const hashpassword = hashSync(password, salt);
    return hashpassword
}

const generateAccessToken = (id: number)=>{
    const token = jwt.sign(
        {
            id: id
        },
        JWT_SECRET,
        {
            expiresIn: 60*parseInt(JWT_TOKEN_EXPIRY_MINUTES)
        }
    );
    return token;
}

//login util

const checkPassword = (hashpassword: string, password: string)=>{
    return compareSync(password, hashpassword);
}

//reset password util

const generateSecurityCode = ()=>{
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const length = 3;
    let code = '';
    for(let i=0; i<length; i++){
        code += alphabets[Math.floor(Math.random()*alphabets.length)] + numbers[Math.floor(Math.random()*numbers.length)]
    }
    return code;
}

const generateSecurityToken = (code: string)=>{
    const securityToken = jwt.sign(
        {
            code: code
        },
        JWT_SECRET,
        {
            expiresIn: 60*3
        }
    );
    return securityToken;
}

//common util

const generateRefreshToken = (id:  number)=>{
    const token = jwt.sign(
        {
            id: id
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn: 60*parseInt(JWT_REFRESH_TOKEN_EXPIRY_MINUTES)
        }
    );
    return token;
}

export {validatePhoneNumber, generateEmail, generateAccessToken, hashPassword, checkPassword, generateSecurityCode, generateRefreshToken, generateSecurityToken}
