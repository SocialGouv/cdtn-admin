import { ACCOUNT_MAIL_SENDER } from "src/config";
import sendmail from "./sendmail";

export function sendLostPasswordEmail(email: string, secret_token: string) {
  const activateUrl = `${
    process.env.NEXTAUTH_URL ?? `http://localhost:3001`
  }/change_password?token=${secret_token}`;
  const subject = "Réinitialisation de votre mot de passe";
  const text = `
    Bonjour,

    Une demande pour réinitialiser votre de mot de passe est en cours.
    Vous pouvez suivre ce lien : ${activateUrl} pour valider la demande.

    Si vous n'êtes pas à l'origine de cette demande, pas de soucis,
    ne tenez pas compte de de message.

    L'équipe CDTN
`;

  var mailOptions = {
    from: ACCOUNT_MAIL_SENDER,
    subject,
    text,
    to: email,
  };

  return sendmail(mailOptions);
}
