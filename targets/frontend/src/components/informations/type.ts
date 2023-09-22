export type Reference = {
  id?: string;
  url: string;
  type: string;
  title: string;
  order?: number;
  __typename?: string;
};

export type File = {
  id?: string;
  url: string;
  altText: string;
  size: string;
  __typename?: string;
};

export type Document = {
  cdtnId: string;
  source: string;
  title: string;
  slug: string;
  __typename?: string;
};

export type InformationContentBlockContent = {
  document: Document;
  __typename?: string;
};

export type InformationContentBlock = {
  id?: string;
  content: string;
  order?: number;
  type: string;
  file?: File;
  img?: File;
  contentDisplayMode?: string;
  contents: InformationContentBlockContent[];
  __typename?: string;
};

export type InformationContent = {
  id?: string;
  name?: string;
  title: string;
  referenceLabel?: string;
  order?: number;
  blocks: InformationContentBlock[];
  references: Reference[];
  __typename?: string;
};

export type Information = {
  id?: string;
  cdtnId?: string;
  description?: string;
  intro?: string;
  metaDescription?: string;
  metaTitle?: string;
  referenceLabel?: string;
  sectionDisplayMode?: string;
  title: string;
  updatedAt: string;
  contents: InformationContent[];
  references: Reference[];
  __typename?: string;
};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type PartialInformation = DeepPartial<Information>;
