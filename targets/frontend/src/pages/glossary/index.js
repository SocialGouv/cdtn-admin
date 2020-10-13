/** @jsx jsx  */
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { IoMdAdd, IoMdCloseCircleOutline } from "react-icons/io";
import { Button, IconButton } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useDebouncedState } from "src/hooks/";
import { useUser } from "src/hooks/useUser";
import { Flex, Input, jsx, Label, Spinner } from "theme-ui";
import { useQuery } from "urql";

const getGlossaryQuery = `
  query getGlossary {
    glossary(order_by: {term: asc}) {
      term
      id
    }
  }
`;

const context = { additionalTypenames: ["glossary"] };

export function GlossaryPage() {
  const { isAdmin } = useUser();
  const [search, setSearch] = useState("");
  const [
    displayedTerms,
    setDisplayedTerms,
    setDebouncedDisplayedTerms,
  ] = useDebouncedState(undefined);
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
      glossary.filter((entry) =>
        entry.term.toLowerCase().includes(search.toLowerCase().trim())
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glossary, search, setDisplayedTerms, setDebouncedDisplayedTerms]);

  useEffect(() => {
    setSearching(false);
  }, [displayedTerms]);

  const termsByLetters = useMemo(() => getTermsByLetter(displayedTerms), [
    displayedTerms,
  ]);

  return (
    <Layout title={`Glossaire`}>
      {isFetching ? (
        <Spinner />
      ) : (
        <>
          {isAdmin && (
            <Flex sx={{ justifyContent: "flex-end" }}>
              <AddATermButton />
            </Flex>
          )}
          <ul
            sx={{
              display: "flex",
              flex: "1 1 auto",
              flexWrap: "wrap",
              listStyleType: "none",
              m: 0,
              p: 0,
            }}
          >
            {termsByLetters.map(({ letter, terms }) => (
              <li key={`letter-${letter}`} sx={{ fontSize: "large" }}>
                {terms.length > 0 ? (
                  <a
                    href={`#ancre-${letter}`}
                    sx={{ padding: "xxsmall", ...linkStyles }}
                  >
                    {letter}
                  </a>
                ) : (
                  <span sx={{ color: "muted", padding: "xxsmall" }}>
                    {letter}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <form
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <Label
              htmlFor={"search"}
              sx={{
                display: "inline-block",
                fontSize: "medium",
                mr: "small",
                width: "auto",
              }}
            >
              Rechercher un terme
            </Label>
            <Input
              id="search"
              name="search"
              placeholder="renseignez le terme que vous cherchez ici"
              sx={{ maxWidth: "400px" }}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search}
            />
            {search.length > 0 && (
              <IconButton
                type="button"
                sx={{ color: "text" }}
                onClick={() => {
                  setSearch("");
                }}
              >
                <IoMdCloseCircleOutline />
              </IconButton>
            )}
          </form>
          {isSearching ? (
            <Spinner />
          ) : displayedTerms?.length ? (
            <ListTerms termsByLetters={termsByLetters} />
          ) : (
            <h2>Aucun terme trouvé</h2>
          )}
          {isAdmin && !search && !isSearching && (
            <div>
              <AddATermButton />
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(GlossaryPage));

const AddATermButton = () => (
  <Link href="/glossary/edit" passHref>
    <Button as="a" size="small">
      <IoMdAdd sx={{ height: "2rem", mr: "xxsmall", width: "2rem" }} />
      Ajouter un terme
    </Button>
  </Link>
);

function getTermsByLetter(glossary = []) {
  const letterA = "A".charCodeAt(0);
  const alphabet = Array.from({ length: 26 }, (_, index) =>
    String.fromCharCode(letterA + index)
  );
  return alphabet.map((letter) => ({
    letter,
    terms: glossary.filter(({ term }) => term[0].toUpperCase() === letter),
  }));
}

const ListTerms = React.memo(({ termsByLetters = [] }) => (
  <Flex sx={{ flexWrap: "wrap", gap: "xsmall", justifyContent: "stretch" }}>
    {termsByLetters.map(
      ({ letter, terms }) =>
        terms.length > 0 && (
          <div
            key={letter}
            sx={{
              border: "2px solid",
              borderColor: "neutral",
              borderRadius: "small",
              flex: "1 0 auto",
              p: "xsmall",
            }}
          >
            <h2 id={`ancre-${letter}`} sx={{ fontSize: "xlarge", mt: 0 }}>
              {letter}
            </h2>
            <ul sx={{ listStyleType: "none", m: 0, p: 0 }}>
              {terms.map(({ term, id }) => (
                <li key={id}>
                  <Link
                    href="/glossary/edit/[id]"
                    as={`/glossary/edit/${id}`}
                    passHref
                  >
                    {/* eslint-disable-next-line */}
                          <a
                      sx={{
                        display: "block",
                        p: "0.2rem 0",
                        ...linkStyles,
                      }}
                    >
                      {term}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
    )}
  </Flex>
));

const linkStyles = {
  ":hover": {
    color: "primary",
  },
  ":visited": {
    color: "text",
  },
  color: "text",
};
