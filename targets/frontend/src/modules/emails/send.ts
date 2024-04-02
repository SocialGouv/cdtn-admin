import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export default function sendMail(mailOptions: Mail.Options) {
  if (
    !process.env.SMTP_EMAIL_USER ||
    !process.env.SMTP_EMAIL_PASSWORD ||
    !process.env.SMTP_URL
  ) {
    throw new Error(
      "SMTP_EMAIL_USER, SMTP_EMAIL_PASSWORD and SMTP_URL must be set"
    );
  }
  const transport = nodemailer.createTransport({
    auth: {
      pass: process.env.SMTP_EMAIL_PASSWORD,
      user: process.env.SMTP_EMAIL_USER,
    },
    host: process.env.SMTP_URL,
    port: 587,
  });
  return transport.sendMail(mailOptions).finally(() => transport.close());
}
