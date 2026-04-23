import { DocumentsRepository } from "src/modules/documents";
import { ContributionRepository } from "src/modules/contribution";
import { NotFoundError } from "../../../lib/api";

export class QuestionsService {
  private readonly documentsRepository: DocumentsRepository;
  private readonly contributionRepository: ContributionRepository;

  constructor(
    documentsRepository: DocumentsRepository,
    contributionRepository: ContributionRepository
  ) {
    this.documentsRepository = documentsRepository;
    this.contributionRepository = contributionRepository;
  }

  public async updateDocuments(questionId: string): Promise<number> {
    const question =
      await this.contributionRepository.fetchQuestion(questionId);

    if (!question) {
      throw new NotFoundError({
        message: `No question found with id ${questionId}`,
        name: "NOT_FOUND",
        cause: null,
      });
    }

    const documents =
      await this.documentsRepository.fetchContributionDocumentsByQuestionIndex(
        question.order
      );

    if (!documents || documents.length === 0) {
      throw new NotFoundError({
        message: `No documents found for question with id ${questionId}`,
        name: "NOT_FOUND",
        cause: null,
      });
    }

    const newDocuments = documents.map((document) => ({
      ...document,
      title: question.content,
      document: {
        ...document.document,
        seoTitle: question.seo_title ?? question.content,
        questionName: question.content,
      },
    }));

    for (const document of newDocuments) {
      await this.documentsRepository.update(document);
    }

    return newDocuments.length;
  }
}
