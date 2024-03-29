import { ACCOUNT_MAIL_SENDER } from "src/config";
import sendmail from "./sendmail";

export function sendActivateAccountEmail(email: string, secret_token: string) {
  const activateUrl = `${
    process.env.NEXTAUTH_URL ?? `http://localhost:3001`
  }/change_password?token=${secret_token}`;

  const subject = "Activation de votre compte";

  const text = `
    Bonjour,
    
    Vous pouvez activer votre compte ${email} afin d'accéder à
    l'outil d'administration en suivant ce lien : ${activateUrl}

    L'équipe CDTN
  `;

  const mailOptions = {
    from: ACCOUNT_MAIL_SENDER,
    subject,
    text,
    to: email,
  };

  return sendmail(mailOptions);
}
