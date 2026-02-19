export async function streamToBuffer(
  readableStream: NodeJS.ReadableStream | undefined
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (!readableStream) {
      reject(new Error("No readable stream provided"));
      return;
    }
    const chunks: Buffer[] = [];
    readableStream.on(
      "data",
      (data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      }
    );
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks as unknown as Uint8Array[]));
    });
    readableStream.on("error", reject);
  });
}
