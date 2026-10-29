import { News } from "./type";

export function getNewsPublicationErrors(news: News): string[] {
  if (!news.imageFile) {
    return [];
  }
  const errors: string[] = [];
  if (!news.imageAlt?.trim()) {
    errors.push("Le texte alternatif de l'image doit être renseigné");
  }
  if (!news.imageLicense) {
    errors.push("Les droits d'utilisation de l'image doivent être renseignés");
  }
  if (news.imageLicense === "source" && !news.imageAuthor?.trim()) {
    errors.push("L'auteur ou la source de l'image doit être renseigné");
  }
  return errors;
}
