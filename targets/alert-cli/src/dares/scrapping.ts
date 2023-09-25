import axios from "axios";

export const extractXlsxFromUrl = async (url: string) => {
  const response = await axios.get(url);
  const html = response.data;
  const regex = /href="([^"]*\.xlsx)"/g;
  const match = regex.exec(html);
  if (!match) {
    throw new Error("No xlsx file found");
  }
  return match[1];
};
