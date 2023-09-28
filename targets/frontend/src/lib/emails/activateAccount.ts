import sendmail from "./sendmail";

const BASE_URL = process.env.FRONTEND_HOST || `http://localhost:3000`;

export function sendActivateAccountEmail(email: string, secret_token: string) {
  const subject = "Activation de votre compte";
  const activateUrl = `${BASE_URL}/change_password?token=${secret_token}&activate=1`; // todo: dynamic hostname
  const text = `Bonjour,
  Vous pouvez activer votre compte ${email} afin d'accéder à
  l'outil d'administration du cdtn en suivant ce lien : ${activateUrl}

  L'equipe veille CDTN
  `;

  const mailOptions = {
    from: process.env.ACCOUNT_MAIL_SENDER,
    subject,
    text,
    to: email,
  };

  return sendmail(mailOptions);
}
