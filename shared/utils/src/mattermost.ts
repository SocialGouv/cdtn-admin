import { logger } from "./logger";

export const sendMattermostMessage = async (
  webhookUrl: string,
  message: string,
  channel?: string
): Promise<boolean> => {
  if (!webhookUrl)
    throw new Error(
      "Impossible d'envoyer le message Mattermost : webhook non configuré."
    );
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      channel
        ? {
            text: message,
            channel,
          }
        : { text: message }
    ),
  };
  try {
    await fetch(webhookUrl, options);
  } catch (e: any) {
    logger.error("Erreur lors de l'envoi du message sur Mattermost");
    logger.error(e.message);
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
};
