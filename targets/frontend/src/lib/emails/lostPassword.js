import sendmail from "./sendmail";

export function sendLostPasswordEmail(email, secret_token) {
  const activateUrl = `${
    process.env.FRONTEND_HOST
      ? `https://${process.env.FRONTEND_HOST}`
      : `http://localhost:3001`
  }/change_password?token=${secret_token}`; // todo: dynamic hostname
  const subject = "Réinitialisation de votre mot de passe";
  const text = `
Bonjour,
Une demande pour réinitialiser votre de mot de passe est en cours.
Vous pouvez suivre ce lien : ${activateUrl} pour valider la demande.

Si vous n'etes pas à l'origine de cette demande, pas de soucis,
ne tenez pas compte de de message.

L'equipe veille CDTN
`;

  var mailOptions = {
    from: process.env.ACCOUNT_MAIL_SENDER,
    subject,
    text,
    to: email,
  };

  return sendmail(mailOptions);
}
