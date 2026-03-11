import { sendMattermostMessage as sendMessage } from "@shared/utils";

export const sendMattermostMessage = async (
  message: string,
  channel?: string
): Promise<boolean> => {
  const webhookUrl = process.env.MATTERMOST_WEBHOOK as string;
  if (!webhookUrl) return Promise.resolve(false);
  return await sendMessage(webhookUrl, message, channel);
};
