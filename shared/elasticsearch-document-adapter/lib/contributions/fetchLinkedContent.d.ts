export interface LinkedContentLight {
    cdtnId: string;
    title: string;
    slug: string;
    description: string | null;
    source: string;
}
export declare function fetchLinkedContent(cdtnId: string, questionIndex: number, idcc: string): Promise<LinkedContentLight>;
