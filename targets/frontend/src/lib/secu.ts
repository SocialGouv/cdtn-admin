import formidable from "formidable";

export const isUploadFileSafe = (stream: formidable.Part): Promise<boolean> => {
  return new Promise((resolve) => {
    if (stream.mimetype !== "image/svg+xml") resolve(true);
    stream.on("error", (err) => {
      console.error("[storage]", err);
      resolve(false);
    });

    let previousChunk = "";
    let isSafe = true;
    stream.on("data", (chunk) => {
      const currentChunk = previousChunk + chunk.toString();
      previousChunk = chunk.toString();
      if (currentChunk.includes("</script>")) {
        isSafe = false;
      }
    });
    stream.on("end", () => {
      resolve(isSafe);
    });
  });
};
