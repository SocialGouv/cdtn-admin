import { ContributionRef, ContributionsAnswers } from "@shared/types";

export function getReferences(answer: ContributionsAnswers): ContributionRef[] {
  const kaliReferences: ContributionRef[] = answer.kali_references.map(
    (ref) => ({
      title: ref.kali_article.label ?? "",
      url: generateKaliRef(answer.agreement.id, ref.kali_article.id),
    })
  );

  const legiReferences: ContributionRef[] = answer.legi_references.map(
    (ref) => ({
      title: ref.legi_article.label ?? "",
      url: ref.legi_article.label
        ? generateLegiRef(ref.legi_article.label)
        : "",
    })
  );

  const otherReferences: ContributionRef[] = answer.other_references.map(
    (ref) => ({
      title: ref.label,
      url: ref.url,
    })
  );

  return [...kaliReferences, ...legiReferences, ...otherReferences];
}
