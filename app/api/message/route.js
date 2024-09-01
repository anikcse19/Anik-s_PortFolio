import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Configure your SMTP server details
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Send to user's email
      subject: `Thank You Mr/Mrs. ${name}!`,
      text: "I am glad to know that you are interested in my Projects. SO , thank you so much. Keep with me",
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Respond with success
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);

    // Respond with error
    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 }
    );
  }
}
