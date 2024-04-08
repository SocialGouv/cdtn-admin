import { ACCOUNT_MAIL_SENDER, BASE_URL } from "src/config";
import sendMail from "./send";

export function sendActivateAccountEmail(email: string, secret_token: string) {
  const activateUrl = `${BASE_URL}/change_password?token=${secret_token}`;

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

  return sendMail(mailOptions);
}
