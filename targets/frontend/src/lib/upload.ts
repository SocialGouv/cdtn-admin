const URL_EXPORT = process.env.URL_EXPORT ?? "http://localhost:8787";

export const getApiAllFiles = async () => {
  //TODO: a faire, il faut voir comment lister tous les documents
};

export const deleteApiFile = async (key: string) => {
  return fetch(`${URL_EXPORT}/upload?key=${key}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const uploadApiFiles = async (key: string, data: string) => {
  try {
    await fetch(`${URL_EXPORT}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data, key }),
    });
  } catch (err) {
    console.log("Error", err);
    throw new Error("Error while uploading the file to azure");
  }
};
