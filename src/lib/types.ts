export interface PostItem {
  sourceName: string; // e.g., "r/VibeCoding"
  externalId: string;
  title: string;
  content: string;
  url: string;
  permalink: string;
  author: string;
  score: number;
  postedAt: Date;
}

export interface DataSource {
  name: string;
  fetchKey: string; // e.g. "subreddit_name"
  fetchRecent(limit?: number): Promise<PostItem[]>;
}
