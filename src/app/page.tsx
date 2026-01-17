import ActionButtons from '@/components/ActionButtons';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/EmptyState';
import { LatestInsight } from '@/components/LatestInsight';

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
      <PageHeader
        title="Dashboard"
        description="Overview of your trend analysis pipeline"
        action={<ActionButtons />}
        gradient
      />

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
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                url={post.url}
                permalink={post.permalink}
                postedAt={post.postedAt}
                sourceName={post.source.name}
              />
            ))}
            {recentPosts.length === 0 && (
              <EmptyState message="No posts yet. Try syncing data." />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">Latest Insight</h2>
          <LatestInsight report={latestReport} />
        </div>
      </div>
    </div>
  );
}
