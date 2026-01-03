import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { ExportPNGSchema, safeValidateRequest } from '@/lib/validation';

/**
 * PNG Export API Route
 * Client-side canvas.toDataURL is preferred, but this route
 * provides server-side export if needed
 * Requires: JWT authentication + input validation
 */

export async function POST(request: NextRequest) {
  try {
    // Authentication required
    const user = await getAuthUser(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = safeValidateRequest(ExportPNGSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const { canvasDataURL, filename } = validation.data;

    // Extract base64 data
    const base64Data = canvasDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Sanitize filename (validation already ensures alphanumeric + hyphens/underscores)
    const safeFilename = filename || 'incident-snapshot';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${safeFilename}.png"`,
        'Content-Length': buffer.length.toString()
      }
    });
  } catch (error) {
    // Authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    // Other errors (sanitize in production)
    console.error('PNG export error:', error);
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Export failed' },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Export failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
}
