import { prisma } from '@/lib/db';
import Link from 'next/link';
import { DeleteReportButton } from '@/components/DeleteReportButton';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-zinc-500 mt-2">Archive of AI-generated insights</p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="group relative block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all hover:bg-zinc-800/50"
          >
            <div className="flex justify-between items-start">
              <Link href={`/reports/${report.id}`} className="flex-1">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                        {report.title}
                    </h2>
                    <span className="text-sm text-zinc-500 mr-8">
                        {new Date(report.createdAt).toLocaleString()}
                    </span>
                </div>
                <p className="text-zinc-400 line-clamp-2 text-sm">
                 {report.summary}
                </p>
              </Link>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteReportButton id={report.id} />
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <p className="text-zinc-500">No reports found.</p>
        )}
      </div>
    </div>
  );
}
