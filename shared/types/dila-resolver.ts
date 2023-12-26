export interface ArticlePayload {
  executionTime: number;
  dereferenced: boolean;
  article: Article;
}

export interface Article {
  id: string;
  idTexte: string | null;
  type?: string;
  texte: string;
  texteHtml: string;
  num: string;
  origine: string;
  nature: string;
  versionArticle: string;
  etat: string;
  dateDebut: number;
  dateFin: number;
  dateDebutExtension: number;
  dateFinExtension: number;
  inap: string | null;
  ordre: number;
  context: Context;
  cid: string;
  cidTexte: string | null;
  sectionParentCid: string;
  sectionParentId: string;
  sectionParentTitre: string;
  fullSectionsTitre: string;
  refInjection: string;
  idTechInjection: string;
  idEli: string | null;
  idEliAlias: string | null;
  calipsos: string[] | null;
  textTitles: TextTitle[];
  nota?: string;
  notaHtml?: string;
  activitePro: string[];
  numeroBrochure: string[];
  numeroBo: string | null;
  conteneurs: Conteneur[];
  lienModifications: LienModification[];
  lienCitations: LienCitation[];
  lienConcordes: LienConcorde[];
  lienAutres: Lien[] | null;
  articleVersions: ArticleVersion[];
  computedNums: string[];
  versionPrecedente?: string;
  conditionDiffere: string | null;
  historique?: string;
  surtitre: string | null;
  renvoi: string | null;
}

export interface Lien {
  data: string;
  id: string;
  libelle: string;
  lien: string;
}
export interface Context {
  titresTM: TitresTm[];
  nombreVersionParent: number;
  longeurChemin: number;
  titreTxt: TitreTxt[];
}

export interface TitresTm {
  debut: string;
  fin: string;
  titre: string;
  xPath: string;
  cid: string;
  id: string;
  etat: string;
}

export interface TitreTxt {
  debut: string;
  fin: string;
  titre: string;
  xPath: string;
  cid: string;
  id: string;
  etat: string;
}

export interface TextTitle {
  id: string;
  titre: string;
  titreLong: string;
  etat: string;
  dateDebut: number;
  dateFin: number;
  cid: string;
  datePubli: number;
  datePubliComputed: string | null;
  dateTexte: number;
  dateTexteComputed?: number;
  nature: string;
  nor: string;
  num: string;
  numParution: string;
  originePubli: string;
  appliGeo?: string;
  codesNomenclatures: string[];
  visas: string | null;
  nota: string | null;
  notice: string | null;
  travauxPreparatoires: string | null;
  signataires: string | null;
  dossiersLegislatifs: unknown[] | null;
  ancienId: string | null;
}

export interface Conteneur {
  cid: string;
  datePubli: number;
  etat: string;
  nature: string;
  num: string;
  numero: string;
  titre: string;
}

export interface LienModification {
  textCid: string;
  textTitle: string;
  linkType: string;
  linkOrientation: string;
  articleNum: string;
  articleId: string;
  natureText: string;
  datePubliTexte?: string;
  dateSignaTexte?: string;
  dateDebutCible?: string;
}

export interface LienCitation {
  textCid: string;
  textTitle: string;
  linkType: string;
  linkOrientation: string;
  articleNum: string;
  articleId: string;
  natureText: string;
  date: number;
  parentCid: string | null;
  numTexte: string;
  datePubli?: number;
  dateDebut?: number;
}

export interface LienConcorde {
  textCid: string;
  textTitle: string;
  linkType: string;
  linkOrientation: string;
  articleNum: string;
  articleId: string;
  natureText: string;
}

export interface ArticleVersion {
  id: string;
  etat: string;
  version: string;
  dateDebut: number;
  dateFin: number;
  numero: string | null;
  ordre: number | null;
}
