import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.NODE_ENV !== "development",
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
} as SMTPTransport.Options);




type SendEmailDto = {
  senders: Mail.Address,
  receipients: Mail.Address[],
  subject: string,
  message: string
}

export const sendEmail = async (dto: SendEmailDto) => {
  const { senders, receipients, subject, message } = dto

  return await transporter.sendMail({
    from: senders,
    to: receipients,
    subject,
    html: message,
    text: message
  })
}