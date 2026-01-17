import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
  return NextResponse.json(sources);
}

export async function POST(request: Request) {
  try {
    const { name, type = 'reddit' } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const source = await prisma.source.create({
      data: {
        name,
        type,
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Delete associated posts first (cascade usually handles this but being explicit is safe)
    await prisma.post.deleteMany({
      where: { sourceId: id },
    });

    await prisma.source.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
