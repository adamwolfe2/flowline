/**
 * Minimal, injection-safe markdown parser for landing-page `TextProps.body`.
 *
 * WHY THIS EXISTS
 * ---------------
 * `TextProps.body` is author-supplied markdown rendered on a PUBLIC page. There
 * is no markdown parser and no HTML sanitizer in this project's dependencies,
 * and we deliberately do not add one for this surface. Rather than pair an
 * ad-hoc regex converter with `dangerouslySetInnerHTML` (the classic XSS foot-
 * gun), this parser emits a small AST of plain data. `TextBlock.tsx` turns that
 * AST into React elements, so every author-supplied character is rendered as a
 * React text child and escaped by React itself. No HTML string is ever built,
 * so there is no injection surface at all — `<script>alert(1)</script>` in the
 * body renders as literal, inert text.
 *
 * SUPPORTED SYNTAX (exhaustive — everything else is literal text)
 * --------------------------------------------------------------
 *   **bold**          -> <strong>
 *   *italic*          -> <em>
 *   single newline    -> <br>
 *   blank line(s)     -> paragraph break
 *
 * DELIBERATELY NOT SUPPORTED
 * --------------------------
 * Links, images, headings, lists, blockquotes, tables, inline code, code
 * fences, HTML passthrough, and escaping via backslash. Such source renders
 * verbatim (e.g. `[text](url)` shows the brackets). Links and images are the
 * notable omissions: both carry their own injection surface (`javascript:`
 * URLs, SSRF-ish remote loads) and the builder exposes dedicated Button and
 * Image blocks for those intents. If richer markdown is ever needed, add a
 * vetted parser + sanitizer (e.g. marked + DOMPurify) rather than growing this
 * file — it is intentionally not a general-purpose markdown implementation.
 */

/** An inline fragment within a paragraph. */
export type InlineNode =
  | { kind: "text"; value: string }
  | { kind: "bold"; children: InlineNode[] }
  | { kind: "italic"; children: InlineNode[] }
  | { kind: "break" };

/** A top-level block. Paragraphs are the only block kind this parser emits. */
export interface MarkdownParagraph {
  kind: "paragraph";
  children: InlineNode[];
}

const BOLD_MARKER = "**";

/**
 * Finds the index of the closing `*` for an italic run, skipping over `**`
 * pairs so `*outer **inner** outer*` closes on the final single star.
 * Returns -1 when there is no closing star.
 */
function findClosingItalic(text: string, from: number): number {
  for (let i = from; i < text.length; i++) {
    if (text[i] !== "*") continue;
    // A `**` here is a bold marker, not our closing delimiter — step over both.
    if (text[i + 1] === "*") {
      i++;
      continue;
    }
    return i;
  }
  return -1;
}

/**
 * Parses the inline content of a single paragraph.
 * Recursion always operates on a strictly shorter slice, so it terminates.
 */
function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer.length > 0) {
      nodes.push({ kind: "text", value: buffer });
      buffer = "";
    }
  };

  while (i < text.length) {
    const char = text[i];

    if (char === "\n") {
      flush();
      nodes.push({ kind: "break" });
      i += 1;
      continue;
    }

    // Bold is matched before italic so `**` is never mistaken for two `*`.
    if (text.startsWith(BOLD_MARKER, i)) {
      const close = text.indexOf(BOLD_MARKER, i + 2);
      if (close > i + 2) {
        flush();
        nodes.push({ kind: "bold", children: parseInline(text.slice(i + 2, close)) });
        i = close + 2;
        continue;
      }
      // Unmatched or empty (`****`) — emit the marker as literal text.
      buffer += BOLD_MARKER;
      i += 2;
      continue;
    }

    if (char === "*") {
      const close = findClosingItalic(text, i + 1);
      if (close > i + 1) {
        flush();
        nodes.push({ kind: "italic", children: parseInline(text.slice(i + 1, close)) });
        i = close + 1;
        continue;
      }
      // Unmatched or empty (`**` already handled above) — literal star.
      buffer += "*";
      i += 1;
      continue;
    }

    buffer += char;
    i += 1;
  }

  flush();
  return nodes;
}

/**
 * Parses a markdown string into paragraphs of inline nodes.
 * Returns an empty array for empty/whitespace-only input.
 */
export function parseMarkdown(source: string): MarkdownParagraph[] {
  if (!source) return [];

  // Normalise line endings so \r\n and \r behave like \n.
  const normalised = source.replace(/\r\n?/g, "\n").trim();
  if (!normalised) return [];

  return normalised
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => ({ kind: "paragraph" as const, children: parseInline(chunk) }));
}
