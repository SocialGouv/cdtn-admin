import fs from "fs";
import { join } from "path";

import { DocumentElasticWithSource } from "@socialgouv/cdtn-types";

import { context } from "../context";

const DEFAULT_LINKS_FILE = "./dataset/fiches_service_public_links.json";

// One entry per candidate in a source document's `links` array -- a subset
// of the analysis pipeline's full export (see
// analysis/src/analysis/l2/recommend_links.py:to_links_json), renamed to
// this codebase's document-field conventions (cdtnId/slug/source/title
// rather than candidate_id/candidate_slug/...). The facet-overlap/
// similarity detail behind `confidence`/`score` stays in the source JSON
// file on disk for editorial review, not duplicated onto the live
// document.
//
// A discriminated union, not one flat shape: a document candidate points
// at a real page (cdtnId/slug/source); an l2 candidate points at a theme,
// which isn't a page with its own slug -- its `l2`/`l1` pair is how a
// consumer builds a theme-page link instead (``/themes/{l1}#{l2}``).
export type RecommendedLink = DocumentLink | ThemeLink;

export interface DocumentLink {
  type: "document";
  cdtnId: string;
  slug: string;
  source: string;
  title: string;
  confidence: string;
  score: number;
  rank: number;
}

export interface ThemeLink {
  type: "l2";
  l2: string;
  l1: string;
  title: string;
  confidence: string;
  score: number;
  rank: number;
}

interface RawLinksFileCandidate {
  candidate_type: "document" | "l2";
  candidate_id: string;
  candidate_slug: string | null;
  candidate_source: string | null;
  candidate_label: string;
  candidate_l2: string | null;
  candidate_l1: string | null;
  confidence: string;
  combined_score: number;
  combined_rank: number;
}

interface RawLinksFileEntry {
  source_doc_id: string;
  links: RawLinksFileCandidate[];
}

function loadRawLinksFile(): RawLinksFileEntry[] {
  const linksFile = context.get("linksFile") || DEFAULT_LINKS_FILE;
  const raw = fs.readFileSync(join(process.cwd(), linksFile), "utf-8");
  return JSON.parse(raw);
}

function toRecommendedLinks(
  candidates: RawLinksFileCandidate[]
): RecommendedLink[] {
  return candidates
    .map((c): RecommendedLink | null => {
      if (
        c.candidate_type === "document" &&
        c.candidate_slug !== null &&
        c.candidate_source !== null
      ) {
        return {
          type: "document",
          cdtnId: c.candidate_id,
          slug: c.candidate_slug,
          source: c.candidate_source,
          title: c.candidate_label,
          confidence: c.confidence,
          score: c.combined_score,
          rank: c.combined_rank,
        };
      }
      const l2 = c.candidate_l2 ?? c.candidate_id;
      if (c.candidate_type === "l2" && c.candidate_l1 !== null) {
        return {
          type: "l2",
          l2,
          l1: c.candidate_l1,
          title: c.candidate_label,
          confidence: c.confidence,
          score: c.combined_score,
          rank: c.combined_rank,
        };
      }
      return null;
    })
    .filter((link): link is RecommendedLink => link !== null);
}

/**
 * Attaches each fiche_service_public document's recommended cross-links
 * (from the L2 pipeline's static export, `dataset/fiches_service_public_links.json`
 * by default -- override via `context.set("linksFile", ...)`, same pattern
 * as `populateSuggestions`' `suggestFile`) as a new `links` field. Both
 * candidate types are kept (see `RecommendedLink`) -- a consumer that only
 * wants document-to-document links can filter on `type === "document"`
 * itself.
 *
 * A document with no entry in the file gets `links: []` rather than being
 * left unset -- so a consumer doesn't need to treat "field missing" and
 * "field empty" as two different things.
 */
export function populateLinks<T>(
  documents: DocumentElasticWithSource<T>[]
): DocumentElasticWithSource<T & { links: RecommendedLink[] }>[] {
  const rawEntries = loadRawLinksFile();
  const linksByDocId = new Map<string, RecommendedLink[]>(
    rawEntries.map((entry) => [
      entry.source_doc_id,
      toRecommendedLinks(entry.links),
    ])
  );

  return documents.map((doc) => ({
    ...doc,
    links: linksByDocId.get(doc.cdtnId) ?? [],
  }));
}
