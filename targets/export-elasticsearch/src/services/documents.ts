import type { Documents } from "@shared/types";
import { DOCUMENT_SOURCE } from "@shared/types";
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

  async getDocumentsUpdatedGte(
    date: Date,
    source = [
      DOCUMENT_SOURCE.contributions,
      DOCUMENT_SOURCE.highlights,
      DOCUMENT_SOURCE.information,
      DOCUMENT_SOURCE.modeles_de_courriers,
      DOCUMENT_SOURCE.prequalified,
      DOCUMENT_SOURCE.themes,
      DOCUMENT_SOURCE.dossiers,
    ]
  ): Promise<Documents[]> {
    return this.documentsRepository.getDocumentsUpdatedGte(date, source);
  }
}
