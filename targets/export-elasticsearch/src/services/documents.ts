import type { Documents } from "@shared/types";
import { inject, injectable } from "inversify";

import { DocumentsRepository } from "../repositories";
import { getName, name } from "../utils";

@injectable()
@name("DocumentsService")
export class DocumentsService {
  constructor(
    @inject(getName(DocumentsRepository))
    private readonly documentsRepository: DocumentsRepository
  ) {}

  async getDocumentsUpdatedGte(date: Date): Promise<Documents[]> {
    return this.documentsRepository.getDocumentsUpdatedGte(date);
  }
}
