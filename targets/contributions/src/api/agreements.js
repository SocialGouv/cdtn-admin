import { GraphQLApi } from "../libs/GraphQLApi";
import { createAgreement, createAnswer } from "../libs/graphql";

export const addAgreement = async (name, idcc, parent_id) => {
  const api = new GraphQLApi();
  const result = await api.create(
    createAgreement,
    parent_id ? { idcc, name, parent_id } : { idcc, name }
  );

  const questions = await api.fetchAll("/questions");

  return Promise.all(
    questions.map((question) =>
      api.create(createAnswer, {
        agreement_id: result.id,
        generic_reference: null,
        parent_id: null,
        prevalue: "",
        question_id: question.id,
        state: "draft",
        user_id: null,
        value: "",
      })
    )
  );
};
