import { IncomingForm } from "formidable";
import { deleteBlob, getContainerBlobs, uploadBlob } from "src/lib/azure";

async function endPoint(req, res) {
  // TODO: ACL
  const { container, path } = req.query;
  if (req.method === "POST") {
    const form = new IncomingForm({ multiples: true });

    const done = () => res.status(200).json({ success: false }).end();

    let wait = 1; // expect at least a close event
    form.onPart = async function (part) {
      wait++;
      await uploadBlob(container, part);
      if (!--wait) done();
    };
    form.on("end", () => {
      if (!--wait) done();
    });
    form.parse(req, (err) => {
      if (err) {
        res.json({ success: false });
        return;
      }
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
