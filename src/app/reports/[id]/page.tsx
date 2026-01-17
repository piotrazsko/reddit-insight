import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import { PageHeader } from '@/components/PageHeader';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage(props: Props) {
  const params = await props.params;
  const report = await prisma.report.findUnique({
    where: { id: params.id },
  });

  if (!report) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-zinc-800 pb-6">
        <PageHeader
          title={report.title}
          description={`Generated on ${new Date(report.createdAt).toLocaleString()}`}
        />
      </div>

      <article className="prose prose-invert prose-lg max-w-none space-y-8 [&>ul]:space-y-4 [&>h1]:text-blue-400">
        <Markdown
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 no-underline hover:underline ml-1 font-medium"
              />
            ),
            li: ({ ...props }) => (
              <li {...props} className="leading-relaxed text-zinc-300 mb-4" />
            ),
            p: ({ ...props }) => (
              <p {...props} className="leading-relaxed text-zinc-300 mb-6" />
            ),
          }}
        >
          {report.summary}
        </Markdown>
      </article>
    </div>
  );
}
