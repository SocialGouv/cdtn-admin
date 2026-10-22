import { print } from "graphql";
import {
  buildMutationVariables,
  contributionAnswerUpdateMutation,
  MutationProps,
} from "../answer.mutation";

const declaredVariables = (query: string): string[] =>
  Array.from(query.matchAll(/\$(\w+):/g)).map((match) => match[1]);

describe("buildMutationVariables", () => {
  const props: MutationProps = {
    id: "answer-1",
    contentType: "ANSWER",
    description: "desc",
    content: "<p>contenu</p>",
    contentServicePublicCdtnId: undefined,
    messageBlockGenericNoCDT: undefined,
    introduction: undefined,
    selectedCdtReferenceUrls: ["https://legi/L3141-1", "https://autre"],
    kaliReferences: [],
    legiReferences: [],
    otherReferences: [],
    cdtnReferences: [],
    infographics: [],
    displayDate: "2026-10-22",
    status: "REDACTING",
    userId: "user-1",
  };

  it("n'envoie que des variables déclarées dans la mutation (Hasura refuse les autres)", () => {
    const variables = Object.keys(buildMutationVariables(props));
    const declared = declaredVariables(print(contributionAnswerUpdateMutation));
    const unexpected = variables.filter((name) => !declared.includes(name));
    expect(unexpected).toEqual([]);
  });

  it("transforme les URL cochées en lignes à insérer et ne les envoie pas telles quelles", () => {
    const variables = buildMutationVariables(props);
    expect(variables).not.toHaveProperty("selectedCdtReferenceUrls");
    expect(variables.selectedCdtReferences).toEqual([
      { answer_id: "answer-1", reference_url: "https://legi/L3141-1" },
      { answer_id: "answer-1", reference_url: "https://autre" },
    ]);
  });

  it("envoie une sélection vide quand il n'y a rien de coché", () => {
    const variables = buildMutationVariables({
      ...props,
      selectedCdtReferenceUrls: undefined,
    });
    expect(variables.selectedCdtReferences).toEqual([]);
  });
});
