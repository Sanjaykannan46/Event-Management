import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const USER_EMAIL = process.env.USER_EMAIL!;

const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD!;

const sendSecurityCodeEmail = (to: string, code: string) =>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: USER_EMAIL,
            pass: EMAIL_APP_PASSWORD
        },
    });

    const mailOtions = {
        from: USER_EMAIL,
        to: to,
        subject: "EMS Password Recovery",
        text: `Your password recovery code is: ${code}`
    }

    transporter.sendMail(mailOtions, (err, info)=>{
        if(err){
            console.log(err.message);
        }
        else{
            console.log(info.response);
        }
    });
}

const sendEmailVerificationCode = (to: string, code: string) =>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: USER_EMAIL,
            pass: EMAIL_APP_PASSWORD
        },
    });

    const mailOtions = {
        from: USER_EMAIL,
        to: to,
        subject: "EMS Email Verification",
        text: `Your email verification code is: ${code}`
    }
    console.log("Sending email to: ", to);
    transporter.sendMail(mailOtions, (err, info)=>{
        if(err){
            console.log("EMail " ,err.message);
        }
        else{
            console.log(info.response);
        }
    });
}


const sendInvitation = ({to,user_email,user_name,event_name,team_name}:
    {to: string,user_name:string,user_email:string, event_name: string,team_name:string}) =>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: USER_EMAIL,
            pass: EMAIL_APP_PASSWORD
        },
    });

    const mailOtions = {
        from: USER_EMAIL,
        to: to,
        subject: `Team invitation from ${user_email}`,
        text: `You have been inivited by ${user_name} - ${user_email} from the Team - ${team_name} to The Event - ${event_name}.
        Check The ems_portal to accept or reject invitation`
    }

    transporter.sendMail(mailOtions, (err, info)=>{
        if(err){
            console.log(err.message);
        }
        else{
            console.log(info.response);
        }
    });
}


export {sendSecurityCodeEmail, sendEmailVerificationCode,sendInvitation}