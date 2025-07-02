import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export default function sendMail(mailOptions: Mail.Options) {
  if (
    !process.env.SMTP_EMAIL_USER ||
    !process.env.SMTP_EMAIL_PASSWORD ||
    !process.env.SMTP_URL
  ) {
    console.error(
      "SMTP_EMAIL_USER, SMTP_EMAIL_PASSWORD and SMTP_URL must be set"
    );
    return Promise.resolve();
  }
  const transport = nodemailer.createTransport({
    auth: {
      pass: process.env.SMTP_EMAIL_PASSWORD,
      user: process.env.SMTP_EMAIL_USER,
    },
    host: process.env.SMTP_URL,
    port: 587,
    secure: false,
    requireTLS: true,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });
  return transport.sendMail(mailOptions).finally(() => transport.close());
}
