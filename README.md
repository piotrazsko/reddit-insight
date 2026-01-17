# Trend Pulse

A specialized AI-powered tool for tracking tools, trends, and sentiments on Reddit.
Built with Next.js, LangChain, Prisma, and Reddit API.

## Features

- 📊 **Dashboard**: View key metrics and recent posts.
- 🤖 **AI Insights**: Summarize daily trends using LangChain & OpenAI.
- 🔌 **Pluggable Sources**: Easily add support for Hacker News or other platforms.
- 🐳 **Dockerized**: Ready for development and production.
- 🌓 **Premium UI**: Modern Dark Mode interface with Tailwind CSS.

## Getting Started (Docker)

### Prerequisites

- Docker & Docker Compose
- OpenAI API Key

### Running for Development

1. Create a `.env` file (if not exists) and add your OpenAI Key:
   ```bash
   DATABASE_URL="file:/app/db/dev.db"
   OPENAI_API_KEY="sk-..."
   ```

2. Start the container:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

3. Open [http://localhost:3000](http://localhost:3000).

### Running for Production

```bash
docker-compose up --build -d
```

## Manual Setup (Without Docker)

1. `npm install`
2. `npx prisma generate`
3. `npx prisma migrate dev --name init`
4. `npm run dev`

## Usage

1. **Sync Data**: Click "Sync Data" on the dashboard to fetch latest posts from configured subreddits.
2. **Generate Insight**: Click "Generate Insight" to use AI to summarize the last 24h of activity.
3. **View Reports**: Browse past AI-generated reports in the "Reports" tab.

## Configuration

Subreddits are currently configured in `src/lib/sync.ts`.
Default: `VibeCoding`, `Cursor`, `LocalLLaMA`.
