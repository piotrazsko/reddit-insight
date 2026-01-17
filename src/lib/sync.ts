import { prisma } from './db';
import { RedditSource } from './sources/reddit';
import { DataSource } from './types';

// Default sources if none exist
const DEFAULT_SUBREDDITS = ['VibeCoding', 'Cursor', 'LocalLLaMA'];

async function ensureDefaults() {
  const count = await prisma.source.count();
  if (count === 0) {
    console.log('Seeding default sources...');
    for (const sub of DEFAULT_SUBREDDITS) {
      await prisma.source.create({
        data: {
          type: 'reddit',
          name: sub,
        },
      });
    }
  }
}

export async function syncAllSources() {
  await ensureDefaults();

  const sources = await prisma.source.findMany({
    where: { active: true },
  });

  let totalNew = 0;

  for (const sourceRecord of sources) {
    let fetcher: DataSource | null = null;

    if (sourceRecord.type === 'reddit') {
      fetcher = new RedditSource(sourceRecord.name);
    }

    if (!fetcher) continue;

    const posts = await fetcher.fetchRecent(20);

    for (const post of posts) {
      // Upsert to avoid duplicates
      // We use upsert to update score/comments if changed
      try {
        await prisma.post.upsert({
          where: {
            sourceId_externalId: {
              sourceId: sourceRecord.id,
              externalId: post.externalId,
            },
          },
          update: {
            score: post.score,
            content: post.content, // Content might change (edit)
          },
          create: {
            sourceId: sourceRecord.id,
            externalId: post.externalId,
            title: post.title,
            content: post.content,
            url: post.url,
            permalink: post.permalink,
            author: post.author,
            score: post.score,
            postedAt: post.postedAt,
          },
        });
        totalNew++;
      } catch (e) {
        console.error(`Failed to save post ${post.externalId}:`, e);
      }
    }
  }

  return { totalNew };
}
