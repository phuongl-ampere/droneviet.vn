import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownDocumentProps {
  content: string;
  className?: string;
}

export function MarkdownDocument({
  content,
  className,
}: MarkdownDocumentProps) {
  return (
    <div
      className={`text-[1.05rem] leading-8 text-slate-700 ${className ?? ""}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-10 text-3xl font-semibold leading-tight text-[#10232A] first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 text-2xl font-semibold leading-tight text-[#10232A]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 text-xl font-semibold leading-tight text-[#10232A]">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mt-6 first:mt-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mt-6 list-disc space-y-2 pl-6 marker:text-[#007F75]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-6 list-decimal space-y-2 pl-6 marker:text-[#007F75]">
              {children}
            </ol>
          ),
          a: ({ children, href }) => (
            <a
              className="font-semibold text-[#006D66] underline decoration-[#00A99B]/50 underline-offset-4 hover:text-[#10232A]"
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-2 border-[#00A99B] pl-5 text-slate-600">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[#E8EFEC] px-1.5 py-0.5 text-[0.9em] text-[#10232A]">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
