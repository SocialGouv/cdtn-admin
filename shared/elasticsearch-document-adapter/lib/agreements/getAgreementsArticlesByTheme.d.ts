import { KaliBlockByIdccResult, KaliArticlesByIdResult, ArticleByTheme } from "@shared/types";
export declare function getArticleNumberWithPath(path?: string): string;
export declare function getArticleIds(result: KaliBlockByIdccResult): string[];
export declare function generateArticleByTheme(kaliBlock: KaliBlockByIdccResult, kaliArticle: KaliArticlesByIdResult): ArticleByTheme[];
export default function getAgreementsArticlesByTheme(idccNumber: number): Promise<ArticleByTheme[]>;
