import sendmail from "./sendmail";

export function sendPasswordChangeConfirmEmail(email) {
  const subject = "Modification du mot de passe de votre compte";
  const text = `Bonjour,
  Votre mot de passe a bien été modifié pour votre compte.

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
