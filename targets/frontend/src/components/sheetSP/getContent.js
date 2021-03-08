import { request } from "src/lib/request";

// order is important, the higher priority comes first
const sheetTypes = ["particuliers", "professionnels", "associations"];

export async function getContent(id) {
  for (const type of sheetTypes) {
    try {
      return request(
        `https://unpkg.com/@socialgouv/fiches-vdd@2.84.0/data/${type}/${id}.json`
      );
    } catch (error) {
      console.log(`fail fetching fiche sp ${type}/${id}`);
    }
  }
  return Promise.reject(`Impossible de récupérer la fiche sp ${id} `);
}
