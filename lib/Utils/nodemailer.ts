import nodemailer, { Transporter } from "nodemailer";

const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Gmailuser,
    pass: process.env.Gmailpassword,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: process.env.Gmailuser,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    // console.error("Error sending email:", error);
    throw error;
  }
};
