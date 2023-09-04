import { ContributionRepository } from "../../repository";
import { Status } from "../../../../components/contributions";
import { InvalidQueryError, NotFoundError } from "../../../ApiErrors";

export class PublishAnswerService {
  private readonly contributionRepository: ContributionRepository;

  constructor(repository: ContributionRepository) {
    this.contributionRepository = repository;
  }

  public async execute(id: string, userId: string): Promise<string> {
    const answer = await this.contributionRepository.fetchAnswer(id);
    if (!answer) {
      throw new NotFoundError({
        message: `Answer not found with id ${id}`,
        name: "ANSWER_NOT_FOUND",
        cause: null,
      });
    }
    if (answer.status !== Status.VALIDATED) {
      throw new InvalidQueryError(
        "Publication is forbidden if answer is not validated",
        null
      );
    }
    // TODO Map data in json and populate DocumentData info
    const document = {
      initialId: answer.id,
      document: "{}",
      slug: "",
      text: "",
      title: "",
      metaDescription: "",
    };
    const cdtnId = await this.contributionRepository.publish(
      answer.id,
      document
    );

    return cdtnId;
  }
}
