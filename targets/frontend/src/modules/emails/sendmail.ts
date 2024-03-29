import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export default function sendmail(mailOptions: Mail.Options) {
  const transport = nodemailer.createTransport({
    auth: {
      pass: process.env.SMTP_EMAIL_PASSWORD ?? "pass",
      user: process.env.SMTP_EMAIL_USER ?? "email",
    },
    host: process.env.SMTP_URL ?? "smtp.url",
    port: 587,
  });
  return transport.sendMail(mailOptions).finally(() => transport.close());
}
