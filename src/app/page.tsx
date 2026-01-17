import ActionButtons from '@/components/ActionButtons';
import { prisma } from '@/lib/db';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const postsCount = await prisma.post.count();
  const reportsCount = await prisma.report.count();
  const sourcesCount = await prisma.source.count();

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { postedAt: 'desc' },
    include: { source: true },
  });

  const latestReport = await prisma.report.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-zinc-500 mt-2">
            Overview of your trend analysis pipeline
          </p>
        </div>
        <ActionButtons />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Tracked Sources" value={sourcesCount} />
        <StatCard label="Posts Collected" value={postsCount} />
        <StatCard label="Insights Generated" value={reportsCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-semibold text-zinc-200">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                        {post.source.name}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.postedAt).toLocaleDateString()}</span>
                    </div>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-medium text-zinc-200 group-hover:text-blue-400 transition-colors line-clamp-2"
                    >
                      {post.title}
                    </a>
                  </div>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <p className="text-zinc-500 italic">No posts yet. Try syncing data.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">Latest Insight</h2>
          {latestReport ? (
            <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-white">{latestReport.title}</h3>
                <Link
                  href={`/reports/${latestReport.id}`}
                  className="text-xs text-blue-400 hover:underline"
                >
                  View Full Report
                </Link>
              </div>
              <div className="prose prose-invert prose-sm line-clamp-[10]">
                {/* We'll just show raw text preview here, full markdown in detail view */}
                {latestReport.summary}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500">
              No reports generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="text-zinc-500 text-sm font-medium">{label}</div>
      <div className="text-3xl font-bold text-white mt-2">{value}</div>
    </div>
  );
}
