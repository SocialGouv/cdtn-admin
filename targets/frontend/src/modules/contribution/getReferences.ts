import { ContributionRef, ContributionsAnswers } from "@shared/types";
import { generateKaliRef, generateLegiRef } from "@shared/utils";

export function getReferences(answer: ContributionsAnswers): ContributionRef[] {
  let kaliReferences: ContributionRef[] = [];
  if (answer.agreement) {
    kaliReferences = answer.kali_references.map((ref) => ({
      title: ref.kali_article.label,
      url: generateKaliRef(ref.kali_article.id, answer.agreement.kaliId),
    }));
  }

  const legiReferences: ContributionRef[] = answer.legi_references.map(
    (ref) => ({
      title: ref.legi_article.label,
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
