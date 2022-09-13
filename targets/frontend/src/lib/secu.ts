import formidable from "formidable";

export const isUploadFileSafe = (stream: formidable.Part): Promise<boolean> => {
  return new Promise((resolve) => {
    if (stream.mimetype !== "image/svg+xml") resolve(true);
    stream.on("error", (err) => {
      console.error("[storage]", err);
      resolve(false);
    });

    let allChunks = "";
    stream.on("data", (chunk) => {
      allChunks += chunk.toString();
    });
    stream.on("end", () => {
      if (allChunks === "" || allChunks.includes("</script>")) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
