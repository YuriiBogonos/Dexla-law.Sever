import nodemailer from "nodemailer";
import "dotenv/config";
import { SendMailProps } from "../types/sendMailProps";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async ({ email, subject, html }: SendMailProps) => {
  try {
    await transporter.sendMail({
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.log("Unable to send mail");
  }
};

export const emailService = {
  sendMail,
};
