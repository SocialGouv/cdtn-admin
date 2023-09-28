import nodemailer from "nodemailer";

export default function sendmail(mailOptions) {
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
