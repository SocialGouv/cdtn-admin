import { logger } from "@shared/utils";

export const sendMattermostMessage = async (
  message: string,
  channel?: string
): Promise<boolean> => {
  const webhookUrl = process.env.MATTERMOST_WEBHOOK;
  if (!webhookUrl) return Promise.resolve(false);
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
