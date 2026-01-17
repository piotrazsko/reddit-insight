import axios from 'axios';
import * as cheerio from 'cheerio';
import { DataSource, PostItem } from '../types';

export class RedditSource implements DataSource {
  name: string;
  fetchKey: string;

  constructor(subreddit: string) {
    this.name = `r/${subreddit}`;
    this.fetchKey = subreddit;
  }

  async fetchRecent(limit: number = 20): Promise<PostItem[]> {
    console.log(`[RedditSource] Fetching ${this.name} (RSS)...`);
    try {
      // Use RSS as JSON is often blocked without auth
      const url = `https://www.reddit.com/r/${this.fetchKey}/new.rss`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TrendPulse/1.0)',
        },
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items: PostItem[] = [];

      $('entry').each((_, element) => {
        if (items.length >= limit) return;
        
        const entry = $(element);
        const title = entry.find('title').text();
        const contentHtml = entry.find('content').text();
        const published = entry.find('published').text();
        const link = entry.find('link').attr('href') || '';
        const id = entry.find('id').text();
        const author = entry.find('author > name').text();

        // Parse content: RSS usually has a table with image, we want text.
        // Or sometimes it's just HTML. We'll strip tags for the "content" field.
        const $content = cheerio.load(contentHtml);
        const textContent = $content.text().trim();

        items.push({
          sourceName: this.name,
          externalId: id,
          title: title,
          content: textContent,
          url: link,
          permalink: link,
          author: author,
          score: 0, // RSS doesn't give score, default to 0
          postedAt: new Date(published),
        });
      });

      console.log(`[RedditSource] Parsed ${items.length} items from RSS`);
      return items;
    } catch (error) {
      console.error(`[RedditSource] Error fetching ${this.name}:`, error instanceof Error ? error.message : String(error));
      return [];
    }
  }
}
