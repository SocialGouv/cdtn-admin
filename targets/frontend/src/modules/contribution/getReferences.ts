import { ContributionRef, ContributionsAnswers } from "@shared/types";
import { generateKaliRef, generateLegiRef } from "@shared/utils";

export function getReferences(answer: ContributionsAnswers): ContributionRef[] {
  let kaliReferences: ContributionRef[] = [];
  if (answer.agreement) {
    kaliReferences = answer.kali_references.map((ref) => ({
      title: ref.label,
      url: generateKaliRef(ref.kali_article.id, answer.agreement.kali_id),
    }));
  }

  const legiReferences: ContributionRef[] = answer.legi_references.map(
    (ref) => ({
      title: `Article ${ref.legi_article.label} du code du travail`,
      url: generateLegiRef(ref.legi_article.label),
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
