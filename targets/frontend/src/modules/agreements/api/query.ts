import { gql } from "urql";
import { Agreement } from "../type";

export const agreementQuery = gql`
  query MyQuery($id: bpchar!) {
    agreement: agreement_agreements_by_pk(id: $id) {
      id
      isSupported
      kali_id
      legifranceUrl
      name
      rootText
      shortName
      synonyms
      updatedAt
      workerNumber
      publicationDate
    }
  }
`;

export type AgreementRequest = {
  id: string;
};

export type AgreementResponse = {
  agreement: Agreement;
};
