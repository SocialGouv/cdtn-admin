export const createAgreement = {
  query: `
mutation CreateAgreement($idcc: bpchar!, $name: String!, $parent_id: uuid) {
  insert_contrib_agreements_one(object: {idcc: $idcc, name: $name, parent_id: $parent_id}) {
    id
  }
}
`,
  key: "insert_contrib_agreements_one",
};

export const updateAgreement = {
  query: `
mutation UpdateAgreement($id: uuid!, $idcc: bpchar, $name: String, $parent_id: uuid) {
  update_contrib_agreements(where: {id: {_eq:$id}}, _set: {idcc: $idcc, name: $name, parent_id: $parent_id}) {
    returning {
      id
      created_at
      idcc
      name
      parent_id
      updated_at
    }
  }
}
`,
  key: "update_contrib_agreements",
};

export const createQuestion = {
  query: `
mutation CreateQuestion($index: Int!, $value: String!) {
  insert_contrib_questions_one(object: {index: $index, value: $value}) {
    created_at
    id
    index
    updated_at
    value
  }
}
`,
  key: "insert_contrib_questions_one",
};

export const updateQuestion = {
  query: `
mutation UpdateQuestion($id: uuid!, $index: Int, $value: String) {
  update_contrib_questions(where: {id: {_eq:$id}}, _set: {index: $index, value: $value}) {
    returning {
      created_at
      id
      index
      updated_at
      value
    }
  }
}
`,
  key: "update_contrib_questions",
};

export const createAnswer = {
  query: `
mutation CreateAnswer($agreement_id: uuid, $generic_reference: String, $parent_id: uuid, $prevalue: String, $question_id: uuid!, $state: String!, $user_id: uuid, $value: String!) {
  insert_contrib_answers_one(object: {agreement_id: $agreement_id, generic_reference: $generic_reference, parent_id: $parent_id, prevalue: $prevalue, question_id: $question_id, state: $state, user_id: $user_id, value: $value}) {
    id
  }
}
`,
  key: "insert_contrib_answers_one",
};

export const deleteAnswersReferences = {
  query: `
mutation DeleteAnswersReferences($ids: [uuid!]!) {
  delete_contrib_answers_references(where: {id: {_in: $ids}}) {
    returning {
      id
    }
  }
}
`,
  key: "delete_contrib_answers_references",
};

export const updateAnswersStates = {
  query: `
mutation UpdateAnswers($data: contrib_answers_set_input, $ids: [uuid!]!) {
  update_contrib_answers(_set: $data, where: {id: {_in: $ids}}) {
    returning {
      agreement_id
    }
  }
}
`,
  key: "update_contrib_answers",
};

export const createAnswerReference = {
  query: `
mutation CreateAnswerReference($category: String, $dila_cid: String, $dila_container_id: String, $dila_id: String, $answer_id: uuid!, $url: String, $value: String) {
  insert_contrib_answers_references_one(object: {category: $category, dila_cid: $dila_cid, dila_container_id: $dila_container_id, dila_id: $dila_id, answer_id: $answer_id, url: $url, value: $value}) {
    id
  }
}
`,
  key: "insert_contrib_answers_references_one",
};

export const createAnswerReferences = {
  query: `
mutation CreateAnswerReference($data: [contrib_answers_references_insert_input!]!) {
  insert_contrib_answers_references(objects: $data) {
    returning {
      id
    }
  }
}
`,
  key: "insert_contrib_answers_references",
};

export const updateAnswerReference = {
  query: `
mutation UpdateAnswerReference($id: uuid!, $data: contrib_answers_references_set_input!) {
  update_contrib_answers_references_by_pk(pk_columns: {id: $id}, _set: $data) {
    id
  }
}
`,
  key: "update_contrib_answers_references_by_pk",
};

export const deleteAnswerReference = {
  query: `
mutation CreateAnswerReference($ids: [uuid!]!) {
  delete_contrib_answers_references(where: {id: {_in: $ids}}) {
    returning {
      id
    }
  }
}
`,
  key: "delete_contrib_answers_references",
};

export const deleteAnswerComments = {
  query: `
mutation DeleteAnswerComments($ids: [Int!]!) {
  delete_contrib_answers_comments(where: {id: {_in: $ids}}) {
    returning {
      id
    }
  }
}
`,
  key: "delete_contrib_answers_comments",
};

export const createAnswerComment = {
  query: `
mutation CreateAnswerComments($data: contrib_answers_comments_insert_input!) {
  insert_contrib_answers_comments_one(object: $data) {
    id
  }
}
`,
  key: "insert_contrib_answers_comments_one",
};
