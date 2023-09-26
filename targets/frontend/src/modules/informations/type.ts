export type Reference = {
  id?: string;
  url: string;
  type: string;
  title: string;
  order?: number;
};

export type File = {
  id?: string;
  url: string;
  altText: string;
  size: string;
};

export type Document = {
  cdtnId: string;
  source: string;
  title: string;
  slug: string;
};

export type InformationContentBlockContent = {
  document: Document;
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
};

export type InformationContent = {
  id?: string;
  name?: string;
  title: string;
  referenceLabel?: string;
  order?: number;
  blocks: InformationContentBlock[];
  references: Reference[];
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
  dismissalProcess: boolean;
  title: string;
  updatedAt: string;
  contents: InformationContent[];
  references: Reference[];
};
