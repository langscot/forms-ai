import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TurndownService from 'turndown';
import Heading from './Heading';
import Paragraph from './Paragraph';
import AnchorLink from './AnchorLink';
import InsetText from './InsetText';

function createTurndown(): TurndownService {
  const td = new TurndownService({ headingStyle: 'atx' });
  // Drop images entirely per user preference
  td.addRule('dropImages', {
    filter: ['img', 'figure', 'picture', 'source'],
    replacement: () => '',
  });
  // Preserve strong/emphasis/lists etc.
  return td;
}

export default function MarkdownBlock({ html, markdown, className, id }: { html?: string; markdown?: string; className?: string; id?: string }) {
  const md = useMemo(() => {
    if (markdown) return markdown;
    if (!html) return '';
    const td = createTurndown();
    return td.turndown(html);
  }, [html, markdown]);

  return (
    <div className={className} id={id}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Drop images entirely when rendering markdown
          img: () => null,
          h1: ({ children }) => <Heading level={1}>{children}</Heading>,
          h2: ({ children }) => <Heading level={2}>{children}</Heading>,
          h3: ({ children }) => <Heading level={3}>{children}</Heading>,
          h4: ({ children }) => <Heading level={4}>{children}</Heading>,
          h5: ({ children }) => <Heading level={5}>{children}</Heading>,
          p: ({ children }) => <Paragraph>{children}</Paragraph>,
          a: ({ href = '#', children }) => <AnchorLink href={href}>{children}</AnchorLink>,
          blockquote: ({ children }) => <InsetText>{children}</InsetText>,
          ul: ({ children }) => <ul className="govuk-list govuk-list--bullet">{children}</ul>,
          ol: ({ children }) => <ol className="govuk-list govuk-list--number">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          hr: () => <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />,
          table: ({ children }) => <table className="govuk-table">{children}</table>,
          thead: ({ children }) => <thead className="govuk-table__head">{children}</thead>,
          tbody: ({ children }) => <tbody className="govuk-table__body">{children}</tbody>,
          tr: ({ children }) => <tr className="govuk-table__row">{children}</tr>,
          th: ({ children }) => <th className="govuk-table__header">{children}</th>,
          td: ({ children }) => <td className="govuk-table__cell">{children}</td>,
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}


