import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-12 pb-12 w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-white tracking-tight mb-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <div className="mb-6 mt-12">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-[#333] flex-1 max-w-[40px]"></div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#666]" {...props} />
                <div className="h-px bg-[#333] flex-1"></div>
              </div>
            </div>
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold text-white mb-4 mt-8" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-sm sm:text-base text-[#a0a0a0] leading-relaxed mb-6" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="space-y-2 mb-6 ml-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="flex items-start gap-2 text-sm text-[#a0a0a0]" {...props}>
               <div className="w-1.5 h-1.5 rounded-full bg-[#333] mt-1.5 shrink-0"></div>
               <div>{props.children}</div>
            </li>
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-white" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-[#22d3ee] hover:underline transition-all" {...props} />
          ),
          hr: () => (
            <div className="h-px bg-[#2c2c2c] w-full my-8"></div>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-[#34d399] bg-[#34d399]/5 px-4 py-3 rounded-r-lg my-6 text-[#a0a0a0] italic" {...props} />
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="bg-[#000] border border-[#2c2c2c] rounded-lg p-0 mb-6 overflow-hidden">
                <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#2c2c2c] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-[#666]">{match[1]}</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                  </div>
                </div>
                <div className="p-4 overflow-x-auto text-[13px]">
                   <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus as any}
                    customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code className="bg-[#1a1a1a] text-[#c678dd] px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
