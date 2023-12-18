import type { EditorialContentDoc } from "@shared/types";
import type { AddGlossaryReturnFn } from "./glossary";
export declare function markdownTransform(addGlossary: AddGlossaryReturnFn, documents: EditorialContentDoc[]): {
    contents: import("@shared/types").BaseContentPart[];
    intro: string;
    date: string;
    section_display_mode?: import("@shared/types").SectionDisplayMode | undefined;
    dismissalProcess?: boolean | undefined;
    references?: import("@shared/types").EditoralContentReferenceBloc[] | undefined;
    description: string;
}[];
