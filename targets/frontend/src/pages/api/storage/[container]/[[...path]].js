import { IncomingForm } from "formidable";
import { deleteBlob, getContainerBlobs, uploadBlob } from "src/lib/azure";

async function endPoint(req, res) {
  // TODO: ACL
  const { container, path } = req.query;
  if (req.method === "POST") {
    const form = new IncomingForm({ multiples: true });

    // wait for all parts to be uploaded
    return new Promise((resolve) => {
      form.onPart = function (part) {
        uploadBlob(container, part).then(() => {
          if (form.ended) {
            res.json({ success: true });
            resolve();
          }
        });
      };
      form.parse(req, (err) => {
        if (err) {
          res.json({ success: false });
        }
      });
    });
  } else if (req.method === "DELETE") {
    if (path) {
      await deleteBlob(container, path);
    }
    res.json({
      success: true,
    });
  } else if (req.method === "GET") {
    res.json(await getContainerBlobs(container));
  }
}

export default endPoint;

// prevent uploads corruption
export const config = {
  api: {
    bodyParser: false,
  },
};
