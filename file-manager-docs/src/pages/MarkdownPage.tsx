import React from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { docsContent } from '../content/docs';

interface MarkdownPageProps {
  id: keyof typeof docsContent;
}

export default function MarkdownPage({ id }: MarkdownPageProps) {
  const content = docsContent[id];

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto w-full p-12 text-[#a0a0a0]">
        <h1 className="text-2xl font-bold text-white mb-4">404 - Document Not Found</h1>
        <p>The documentation page you are looking for does not exist.</p>
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
}
