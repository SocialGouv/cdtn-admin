import { ChallengerFormula } from "@shared/utils/build/src/challenger.utils";
import { Editor } from "@tiptap/react";

export interface DetectedAmount {
  id: number;
  rawText: string;
  from: number;
  to: number;
  contextBefore: string;
  contextAfter: string;
  parsedValue: number | null;
  formula: ChallengerFormula | "";
  parameter: string;
  alreadyChallenged: boolean;
}

// € is mandatory; optional thousands separator (any whitespace except line breaks);
// 1–4 decimal places. Accepts regular space, NBSP (U+00A0), narrow NBSP (U+202F),
// thin space (U+2009), etc. — Intl.NumberFormat output varies across engines.
function makeAmountRegex() {
  return /\d+(?:[^\S\r\n]\d{3})*(?:,\d{1,4})?[^\S\r\n]*€/g;
}

const CONTEXT_CHARS = 50;

export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/€/g, "").replace(/\s+/g, "").replace(/,/g, ".");
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

export function detectAmountsInRange(
  editor: Editor,
  from: number,
  to: number
): DetectedAmount[] {
  const challengerMarkType = editor.schema.marks.challenger;
  const doc = editor.state.doc;

  // Build a flat text across all text nodes in [from, to], with "\n" inserted
  // between non-contiguous text nodes (e.g. across table cells or paragraph
  // boundaries). Each flat-char tracks its source doc position so regex matches
  // map back to ProseMirror positions. Flat-text also handles text nodes split
  // by inline marks (bold, italic, existing challenger spans) — the regex sees
  // the whole amount even when it crosses internal mark boundaries.
  let flatText = "";
  const charToPos: number[] = [];
  let lastTextEnd = -1;

  doc.nodesBetween(from, to, (node, nodePos) => {
    if (!node.isText) return;
    if (lastTextEnd !== -1 && nodePos > lastTextEnd) {
      flatText += "\n";
      charToPos.push(lastTextEnd);
    }
    const text = node.text ?? "";
    for (let i = 0; i < text.length; i++) {
      const pos = nodePos + i;
      if (pos < from || pos >= to) continue;
      flatText += text[i];
      charToPos.push(pos);
    }
    lastTextEnd = nodePos + text.length;
  });

  const amounts: DetectedAmount[] = [];
  const regex = makeAmountRegex();
  let match: RegExpExecArray | null;
  let id = 0;
  while ((match = regex.exec(flatText)) !== null) {
    const startCharIdx = match.index;
    const endCharIdx = startCharIdx + match[0].length;
    if (endCharIdx > charToPos.length) continue;

    const matchStart = charToPos[startCharIdx];
    const matchEnd = charToPos[endCharIdx - 1] + 1;

    const alreadyChallenged = challengerMarkType
      ? doc.rangeHasMark(matchStart, matchEnd, challengerMarkType)
      : false;

    const ctxBeforeStart = Math.max(0, startCharIdx - CONTEXT_CHARS);
    const ctxAfterEnd = Math.min(flatText.length, endCharIdx + CONTEXT_CHARS);
    const contextBefore = flatText
      .slice(ctxBeforeStart, startCharIdx)
      .replace(/\n+/g, " ");
    const contextAfter = flatText
      .slice(endCharIdx, ctxAfterEnd)
      .replace(/\n+/g, " ");

    amounts.push({
      id: id++,
      rawText: match[0],
      from: matchStart,
      to: matchEnd,
      contextBefore,
      contextAfter,
      parsedValue: parseAmount(match[0]),
      formula: "",
      parameter: "",
      alreadyChallenged,
    });
  }

  return amounts;
}

export function applyAmountsToEditor(
  editor: Editor,
  amounts: DetectedAmount[]
): void {
  const toApply = amounts.filter(
    (a) => a.formula && a.parsedValue !== null && !a.alreadyChallenged
  );
  if (toApply.length === 0) return;

  const markType = editor.schema.marks.challenger;
  if (!markType) return;

  const { tr } = editor.state;
  toApply.forEach((a) => {
    const mark = markType.create({
      formula: a.formula,
      parameter: a.parameter || null,
    });
    tr.addMark(a.from, a.to, mark);
  });
  editor.view.dispatch(tr);
}
