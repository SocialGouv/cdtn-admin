import { URL_EXPORT } from "src/pages/api/export";

export const getGlossaryContent = async (content: string): Promise<string> => {
  const resultProcess = await fetch(URL_EXPORT + "/glossary", {
    body: JSON.stringify({
      content,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error on glossary! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
      throw new Error(`Error on glossary! ${error}`);
    });
  return resultProcess.result;
};
