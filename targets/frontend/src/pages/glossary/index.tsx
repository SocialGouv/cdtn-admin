import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IoMdAdd, IoMdSync, IoMdCloseCircleOutline } from "react-icons/io";
import { Button, IconButton } from "src/components/button";
import { TermList } from "src/components/glossary/TermList";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { useDebouncedState } from "src/hooks/";
import {
  Box,
  CircularProgress,
  InputLabel as Label,
  TextField,
} from "@mui/material";
import { useQuery } from "urql";
import { theme } from "../../theme";

const getGlossaryQuery = `
  query getGlossary {
    glossary(order_by: {term: asc}) {
      id
      slug
      term
    }
  }
`;

const context = { additionalTypenames: ["glossary"] };

function getTermsByLetter(glossary = []) {
  const letterA = "A".charCodeAt(0);
  const alphabet = Array.from({ length: 26 }, (_, index) =>
    String.fromCharCode(letterA + index)
  );
  return alphabet.map((letter) => ({
    letter,
    terms: glossary.filter(
      ({ slug }: any) => slug.substring(0, 1).toUpperCase() === letter
    ),
  }));
}

export function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [displayedTerms, setDisplayedTerms, setDebouncedDisplayedTerms] =
    useDebouncedState(undefined, 200);
  const [isSearching, setSearching] = useState(false);
  const [{ fetching: isFetching, data: { glossary = [] } = {} }] = useQuery({
    context,
    query: getGlossaryQuery,
  });

  useEffect(() => {
    // prevent loader at first display of page
    if (!displayedTerms && !search) return setDisplayedTerms(glossary);
    setSearching(true);
    setDebouncedDisplayedTerms(
      glossary.filter((entry: any) =>
        entry.term.toLowerCase().includes(search.toLowerCase().trim())
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glossary, search, setDisplayedTerms, setDebouncedDisplayedTerms]);

  useEffect(() => {
    setSearching(false);
  }, [displayedTerms]);

  const termsByLetters = useMemo(
    () => getTermsByLetter(displayedTerms),
    [displayedTerms]
  );

  return (
    <Layout title={`Glossaire`}>
      <Stack>
        {isFetching ? (
          <CircularProgress />
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <AddATermButton />
              <SynchronizeButton />
            </Box>
            <ul
              style={{
                alignItems: "center",
                display: "flex",
                flex: "1 1 auto",
                flexWrap: "wrap",
                listStyleType: "none",
                padding: 0,
              }}
            >
              {termsByLetters.map(({ letter, terms }) => (
                <li key={`letter-${letter}`}>
                  {terms.length > 0 ? (
                    <a
                      href={`#ancre-${letter}`}
                      className="fr-text--bold fr-m-2v fr-text--lg"
                    >
                      {letter}
                    </a>
                  ) : (
                    <p className="fr-m-2v fr-text--lg">{letter}</p>
                  )}
                </li>
              ))}
            </ul>
            <form
              style={{
                alignItems: "center",
                justifyContent: "flex-start",
                display: "flex",
              }}
            >
              <Label
                htmlFor={"search"}
                style={{
                  display: "inline-block",
                  fontSize: "medium",
                  marginRight: theme.space.small,
                  width: "auto",
                }}
              >
                Rechercher un terme
              </Label>
              <TextField
                id="search"
                name="search"
                placeholder="renseignez le terme que vous cherchez ici"
                style={{ width: "450px" }}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={search}
              />
              {search.length > 0 && (
                <IconButton
                  type="button"
                  onClick={() => {
                    setSearch("");
                  }}
                >
                  <IoMdCloseCircleOutline />
                </IconButton>
              )}
            </form>
            {isSearching ? (
              <CircularProgress />
            ) : displayedTerms?.length ? (
              <TermList termsByLetters={termsByLetters} />
            ) : (
              <h2>Aucun terme trouvé</h2>
            )}
          </>
        )}
      </Stack>
    </Layout>
  );
}

export default GlossaryPage;

const AddATermButton = () => (
  <Link href="/glossary/edit" passHref style={{ textDecoration: "none" }}>
    <Button size="small">
      <IoMdAdd style={{ height: "1rem", width: "1rem", marginRight: "2px" }} />
      Ajouter un terme
    </Button>
  </Link>
);

const SynchronizeButton = () => {
  const onClick = async () => {
    const result = await fetch(`/api/glossary`, {
      method: "POST",
    });

    const resultJson = await result.json();

    if (!result.ok) {
      alert(`Un problème est survenu, l'erreur est : ${resultJson.message}`);
      return;
    }
    alert("Le lexique est en cours de synchronisation");
  };
  return (
    <Button
      size="small"
      variant="outlined"
      color="primary"
      style={{ marginLeft: "1rem" }}
      onClick={onClick}
    >
      <IoMdSync style={{ height: "1rem", marginRight: "2px", width: "1rem" }} />
      Synchroniser le lexique
    </Button>
  );
};
