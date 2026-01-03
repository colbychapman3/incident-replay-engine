import { NextRequest, NextResponse } from 'next/server';
import { createDevToken } from '@/lib/auth';

/**
 * Development-only endpoint to generate test JWT tokens
 * DO NOT USE IN PRODUCTION
 *
 * Usage:
 * POST /api/auth/dev-token
 * Returns: { token: "eyJhbGciOiJIUzI1..." }
 */

export async function POST(request: NextRequest) {
  // CRITICAL: Only available in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const token = createDevToken();

    return NextResponse.json({
      token,
      user: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Dev User',
        role: 'admin'
      },
      expiresIn: '7d',
      usage: 'Add to Authorization header: Bearer ' + token
    });
  } catch (error) {
    console.error('Dev token generation error:', error);
    return NextResponse.json(
      { error: 'Token generation failed' },
      { status: 500 }
    );
  }
}
