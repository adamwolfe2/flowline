import { Fragment, type ReactNode } from "react";
import type { LandingBlock } from "@/types";
import { parseMarkdown, type InlineNode } from "./markdown";

type TextBlockData = Extract<LandingBlock, { type: "text" }>;

/**
 * Renders the parsed markdown AST as React elements.
 *
 * Every author-supplied string lands here as a React text child, which React
 * escapes. No HTML string is constructed and `dangerouslySetInnerHTML` is never
 * used, so `TextProps.body` has no injection surface. See markdown.ts for the
 * supported syntax and its (deliberate) limits.
 */
function renderInline(nodes: InlineNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case "text":
        return <Fragment key={index}>{node.value}</Fragment>;
      case "bold":
        return (
          <strong key={index} className="font-semibold text-[#0A0A0A]">
            {renderInline(node.children)}
          </strong>
        );
      case "italic":
        return (
          <em key={index} className="italic">
            {renderInline(node.children)}
          </em>
        );
      case "break":
        return <br key={index} />;
      default: {
        const _never: never = node;
        void _never;
        return null;
      }
    }
  });
}

/** Server component. */
export function TextBlock({ block }: { block: TextBlockData }) {
  const { heading, body } = block.props;
  const paragraphs = parseMarkdown(body);

  return (
    <section id={block.id} className="w-full py-6 text-center sm:py-8">
      <div className="mx-auto max-w-2xl">
        {heading && (
          <h2
            className="mb-3 text-xl font-bold text-[#0A0A0A] sm:text-2xl"
            style={{ fontFamily: "var(--landing-font-heading)" }}
          >
            {heading}
          </h2>
        )}

        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="mb-4 text-sm leading-relaxed text-[#374151] last:mb-0 sm:text-base"
          >
            {renderInline(paragraph.children)}
          </p>
        ))}
      </div>
    </section>
  );
}
