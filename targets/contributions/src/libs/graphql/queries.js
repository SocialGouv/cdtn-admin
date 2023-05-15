export const getAgreements = {
  query: `
query GetAgreements($id: uuid, $name: String) {
  contrib_agreements(order_by: {idcc: asc}, where: {id: {_eq: $id}, name: {_ilike: $name}}) {
    created_at
    id
    idcc
    name
    parent_id
    updated_at
  }
}
`,
  key: "contrib_agreements",
};

export const getQuestions = {
  query: `
query GetQuestions($id: uuid, $value: String) {
  contrib_questions(order_by: {index: asc}, where: {id: {_eq: $id}, value: {_ilike: $value}}) {
    id
    created_at
    index
    updated_at
    value
  }
}
`,
  key: "contrib_questions",
};

export const getAnswers = {
  query: `
query GetAnswers {
  contrib_answers {
    agreement_id
    created_at
    generic_reference
    id
    parent_id
    prevalue
    question_id
    state
    updated_at
    user_id
    value
  }
}`,
  key: "contrib_answers",
};

// TODO Some issues with the order by : order_by: {question: {index: asc}, agreement: {idcc: asc}},
export const getAnswersWithFilters = {
  query: `
query GetAnswsers($isGeneric: Boolean!, $states: [String!]!, $agreements: [uuid!], $questions: [uuid!], $query: String, $limit: Int!, $offset: Int!) {
  contrib_answers_aggregate(where: {agreement_id: {_is_null: $isGeneric, _in: $agreements}, state: {_in: $states}, question_id: {_in: $questions}, question: {value: {_ilike: $query}}, prevalue: {_ilike: $query}, value: {_ilike: $query}}) {
    aggregate {
      totalCount: count
    }
  }
  contrib_answers(where: {agreement_id: {_is_null: $isGeneric, _in: $agreements}, state: {_in: $states}, question_id: {_in: $questions}, question: {value: {_ilike: $query}}, prevalue: {_ilike: $query}, value: {_ilike: $query}}, limit: $limit, offset: $offset) {
    agreement_id
    agreement: agreement {
      idcc
      name
    }
    created_at
    generic_reference
    id
    parent_id
    prevalue
    question_id
    question: question {
      index
      value
    }
    state
    updated_at
    user_id
    value
    references: answers_references {
      answer_id
      category
      created_at
      dila_cid
      dila_container_id
      dila_id
      id
      updated_at
      url
      value
    }
  }
}
`,
  key: "contrib_answers",
};

export const getAnswer = {
  query: `
query GetAnswer($id: uuid!) {
  contrib_answers_by_pk(id: $id) {
    id
    value
    created_at
    updated_at
    parent_id
    question_id
    agreement_id
    user_id
    generic_reference
    state
    prevalue
    agreement {
      idcc
      name
    }
    question {
      index
      value
    }
    references: answers_references(order_by: { category: asc, value: asc }) {
      id
      category
      value
      url
      created_at
      updated_at
      answer_id
      dila_id
      dila_cid
      dila_container_id

    }
  }
}
`,
  key: "contrib_answers_by_pk",
};

export const getAnswerComments = {
  query: `
query GetAnswerComments($id: uuid!) {
  contrib_answers_comments(order_by: {created_at: asc}, where: {answer_id: {_eq: $id}}) {
    answer_id
    created_at
    id
    is_private
    updated_at
    user_id
    value
  }
}
`,
  key: "contrib_answers_comments",
};

export const getLocations = {
  query: `
query GetLocations {
  contrib_locations {
    created_at
    id
    name
    updated_at
  }
}
`,
  key: "contrib_locations",
};

export const getAnswerReferences = {
  query: `
query GetAnswerReferences($answer_id: uuid!) {
  contrib_answers_references(where: {answer_id: {_eq: $answer_id}}) {
    answer_id
    category
    created_at
    dila_cid
    dila_container_id
    dila_id
    id
    updated_at
    url
    value
  }
}
`,
  key: "contrib_answers_references",
};

export const getLocationStats = {
  query: `
query GetLocationStats {
  contrib_locations {
    id
    name
    created_at
    updated_at
    agreements: locations_agreements {
      agreement {
        idcc
        id
        name
        parent_id
      }
    }
  }
}
`,
  key: "contrib_locations",
};

export const getAnswerStats = {
  query: `
query GetAnswersStats($agreement_id: uuid!) {
  contrib_answers(where: {agreement_id: {_eq: $agreement_id}}) {
    id
    value
    created_at
    updated_at
    parent_id
    question_id
    agreement_id
    user_id
    generic_reference
    state
    prevalue
    agreement {
      id
      name
      idcc
      created_at
      updated_at
      parent_id
    }
  }
}
`,
  key: "contrib_answers",
};
