import { GraphQLApi } from "../libs/GraphQLApi";
import { createAnswer, createQuestion } from "../libs/graphql";

export const addQuestion = async (index, value) => {
  const api = new GraphQLApi();
  const { id: questionId } = await api.create(createQuestion, { index, value });

  const agreements = await api.fetchAll("/agreements");

  return Promise.all(
    agreements
      .map((agreement) =>
        api.create(createAnswer, {
          agreement_id: agreement.id,
          generic_reference: null,
          parent_id: null,
          prevalue: "",
          question_id: questionId,
          state: "draft",
          user_id: null,
          value: "",
        })
      )
      .concat(
        api.create(createAnswer, {
          agreement_id: null,
          generic_reference: null,
          parent_id: null,
          prevalue: "",
          question_id: questionId,
          state: "draft",
          user_id: null,
          value: "",
        })
      )
  );
};
