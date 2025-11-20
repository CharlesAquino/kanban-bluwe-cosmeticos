import { NextRequest, NextResponse } from 'next/server';
import { callLlama, LlamaMessage } from '@/lib/llama-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages as LlamaMessage[] | undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: messages array is required' },
        { status: 400 }
      );
    }

    const result = await callLlama(messages);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
