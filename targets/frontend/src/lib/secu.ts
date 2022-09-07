import formidable from "formidable";

export const isUploadFileSafe = (stream: formidable.Part): Promise<boolean> => {
  return new Promise((resolve) => {
    if (stream.mimetype !== "image/svg+xml") resolve(true);
    stream.on("error", (err) => {
      console.error("[storage]", err);
      resolve(false);
    });
    let isSafe = true;
    stream.on("data", (chunk) => {
      const svgText = chunk.toString();
      if (!svgText || svgText.includes("</script>")) {
        isSafe = false;
      }
    });
    stream.on("end", () => {
      resolve(isSafe);
    });
  });
};
