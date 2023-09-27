export const fetchAllContributions = `
query MyQuery {
  contribution_questions(where: {answers: {statuses: {status: {_eq: "PUBLISHED"}}}}, order_by: {order: asc}) {
    id
    content
    message {
      content
    }
    order
    answers(where: {statuses: {status: {_eq: "REDACTED"}}}) {
      agreement {
        id
        kali_id
        name
      }
      agreement_id
      content
      contentType: content_type
      kali_references {
        ...contribution_answer_kali_referencesFragment
        title: label
      }
      cdtn_references {
        ...contribution_answer_cdtn_referencesFragment
      }
      legi_references {
        ...contribution_answer_legi_referencesFragment
      }
      other_references {
        title: label
        url
      }
      url_sp
      updated_at
    }
  }
}

fragment documentsFragment on documents {
  title
  url: slug
  category: source
}

fragment legi_articlesFragment on legi_articles {
  title: label
}

fragment contribution_answer_legi_referencesFragment on contribution_answer_legi_references {
  legi_article {
    ...legi_articlesFragment
  }
}

fragment contribution_answer_cdtn_referencesFragment on contribution_answer_cdtn_references {
  document {
    ...documentsFragment
  }
}

fragment contribution_answer_kali_referencesFragment on contribution_answer_kali_references {
  kali_article {
    id
  }
}
`;
