import { NextRequest, NextResponse } from 'next/server';

/**
 * PNG Export API Route
 * Client-side canvas.toDataURL is preferred, but this route
 * provides server-side export if needed
 */

export async function POST(request: NextRequest) {
  try {
    const { canvasDataURL, filename = 'incident-snapshot' } = await request.json();

    if (!canvasDataURL) {
      return NextResponse.json(
        { error: 'Missing canvasDataURL' },
        { status: 400 }
      );
    }

    // Extract base64 data
    const base64Data = canvasDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}.png"`,
        'Content-Length': buffer.length.toString()
      }
    });
  } catch (error) {
    console.error('PNG export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}
