export const fetchAllContributions = `
query GetQuestionsWithAnswers {
  questions: contrib_questions(order_by: {index: asc}) {
    id
    index
    title: value
    answers(where: {state: {_eq: "published"}}) {
      id
      markdown: value
      references: answers_references {
        title: value
        url
        dila_id
        dila_cid
        dila_container_id
        category
      }
      agreement {
        idcc
        name
        parent_id
      }
    }
  }
}
`;
