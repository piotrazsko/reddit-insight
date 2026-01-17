import { NextResponse } from 'next/server';
import { syncAllSources } from '@/lib/sync';

export async function POST() {
  try {
    const result = await syncAllSources();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
