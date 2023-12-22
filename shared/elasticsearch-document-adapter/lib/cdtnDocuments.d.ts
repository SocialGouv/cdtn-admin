import { Breadcrumbs, OldContributionElasticDocument } from "@shared/types";
/**
 * Find duplicate slugs
 * @param {iterable} allDocuments is an iterable generator
 */
export declare function getDuplicateSlugs(allDocuments: any): Promise<any>;
export declare function cdtnDocumentsGen(): AsyncGenerator<{
    documents: {
        contents: import("@shared/types").BaseContentPart[];
        intro: string;
        date: string;
        section_display_mode?: import("@shared/types").SectionDisplayMode | undefined;
        dismissalProcess?: boolean | undefined;
        references?: import("@shared/types").EditoralContentReferenceBloc[] | undefined;
        description: string;
    }[];
    source: "information";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "modeles_de_courriers";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "outils";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "external";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "dossiers";
} | {
    documents: (import("@shared/types").ContributionElasticDocument | OldContributionElasticDocument)[];
    source: "contributions";
} | {
    documents: import("@shared/types").AgreementGenerated[];
    source: "conventions_collectives";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "fiches_service_public";
} | {
    documents: {
        sections: any[];
        id: string;
        cdtnId: string;
        breadcrumbs: Breadcrumbs[];
        title: string;
        slug: string;
        source: string;
        text: string;
        isPublished: boolean;
        excludeFromSearch: boolean;
        metaDescription: string;
        refs: import("./types/Glossary").DocumentRef[];
        date: string;
        description: string;
        intro: string;
        url: string;
    }[];
    source: "page_fiche_ministere_travail";
} | {
    documents: any[];
    source: "fiches_ministere_travail";
} | {
    documents: any;
    source: "themes";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "highlights";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "prequalified";
} | {
    documents: {
        data: import("./types").Glossary;
        source: "glossary";
    }[];
    source: "glossary";
} | {
    documents: import("./types/Glossary").DocumentElastic[];
    source: "code_du_travail";
} | {
    documents: {
        data: {};
        source: "versions";
    }[];
    source: "versions";
}, void, unknown>;
