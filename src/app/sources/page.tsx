import { prisma } from '@/lib/db';
import SourcesClient from './components/SourcesClient';

export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return <SourcesClient initialSources={sources} />;
}
