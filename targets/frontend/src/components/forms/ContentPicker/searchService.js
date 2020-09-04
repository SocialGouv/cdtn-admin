import debounce from "debounce-promise";
import memoizee from "memoizee";

const API_URL =
  "https://api-master-code-travail.dev.fabrique.social.gouv.fr/api/v1";

const getSuggestions = debounce((value) => {
  const url = `${API_URL}/search?q=${encodeURIComponent(
    value
  )}&skipSavedResults=true`;
  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Un problème est survenu.");
    })
    .then((data) => {
      data.documents.forEach((document) => (document.category = "document"));
      return [
        {
          suggestions: data.documents,
          title: "Documents",
        },
        { suggestions: data.articles, title: "Articles" },
        { suggestions: data.themes, title: "Thèmes" },
      ];
    });
}, 500);

const memoizedGetSuggestion = memoizee(getSuggestions, {
  length: 2,
  promise: true,
});

export { memoizedGetSuggestion as getSuggestions };
