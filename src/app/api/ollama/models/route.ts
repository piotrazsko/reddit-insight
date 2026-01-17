import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || 'http://localhost:11434';

  try {
    const res = await fetch(`${url}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout to avoid hanging if the user provides a bad URL
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch models from Ollama' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return NextResponse.json({ error: 'Could not connect to Ollama' }, { status: 500 });
  }
}
